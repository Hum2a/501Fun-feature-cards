#!/usr/bin/env node
/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Attach a custom domain to the Cloudflare Pages project and ensure DNS.
// Wrangler has no `pages domain add` command — this replaces it.
//
// Usage:
//   CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... node scripts/attach-pages-domain.mjs
//   npm run deploy:domain

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadDotEnv, ROOT } from './load-env.mjs';

loadDotEnv();

const site = JSON.parse(readFileSync(join(ROOT, 'config/site.json'), 'utf8'));
const dryRun = process.argv.includes('--dry-run');

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
const project = site.pagesProject;
const domain = site.host;
const zoneId = site.zoneId;
const zoneName = site.zone;
const pagesTarget = site.pagesSubdomain ?? `${project}.pages.dev`;

if (!accountId || !token) {
  console.error(
    'Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN.\n' +
      'Set them in .env or your shell before running this script.',
  );
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

function recordLabel(name) {
  return name.endsWith(`.${zoneName}`) ? name.slice(0, -(zoneName.length + 1)) : name;
}

async function cfJson(url, init) {
  const response = await fetch(url, { ...init, headers: { ...headers, ...init?.headers } });
  return response.json();
}

async function attachPagesDomain() {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${project}/domains`;

  if (dryRun) {
    console.log(`[dry-run] POST ${url}`);
    console.log(`          body: { "name": "${domain}" }`);
    return { ok: true, already: false };
  }

  const payload = await cfJson(url, {
    method: 'POST',
    body: JSON.stringify({ name: domain }),
  });

  if (payload.success) {
    const status = payload.result?.status ?? 'submitted';
    console.log(`Attached ${domain} to Pages project "${project}" (${status}).`);
    return { ok: true, already: false };
  }

  const message = (payload.errors ?? [])
    .map((e) => e.message ?? String(e.code))
    .join('; ');

  if (/already|duplicate|exists/i.test(message)) {
    console.log(`Domain ${domain} is already on project "${project}" — OK.`);
    return { ok: true, already: true };
  }

  console.error(`Failed to attach ${domain}:\n${JSON.stringify(payload, null, 2)}`);
  return { ok: false };
}

async function ensurePagesCname() {
  if (!zoneId) {
    console.warn('config/site.json has no zoneId — skipping automatic DNS.');
    return { ok: false, manual: true };
  }

  const recordName = recordLabel(domain);
  const listUrl =
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records` +
    `?type=CNAME&name=${encodeURIComponent(domain)}`;

  if (dryRun) {
    console.log(`[dry-run] GET ${listUrl}`);
    console.log(
      `[dry-run] POST .../dns_records body: { type: "CNAME", name: "${recordName}", content: "${pagesTarget}", proxied: true }`,
    );
    return { ok: true };
  }

  const existing = await cfJson(listUrl);
  if (!existing.success) {
    const message = (existing.errors ?? [])
      .map((e) => e.message ?? String(e.code))
      .join('; ');
    console.warn(`Could not list DNS records (${message}).`);
    return { ok: false, manual: true };
  }

  const match = (existing.result ?? []).find(
    (r) => r.content === pagesTarget || r.content === `${pagesTarget}.`,
  );
  if (match) {
    console.log(`DNS CNAME ${domain} → ${pagesTarget} already exists.`);
    return { ok: true };
  }

  const createUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
  const created = await cfJson(createUrl, {
    method: 'POST',
    body: JSON.stringify({
      type: 'CNAME',
      name: recordName,
      content: pagesTarget,
      proxied: true,
    }),
  });

  if (created.success) {
    console.log(`Created DNS CNAME ${domain} → ${pagesTarget} (proxied).`);
    return { ok: true };
  }

  const message = (created.errors ?? [])
    .map((e) => e.message ?? String(e.code))
    .join('; ');
  console.warn(`Could not create DNS CNAME (${message}).`);
  return { ok: false, manual: true };
}

function printManualDns() {
  console.log('\nAdd this record manually in Cloudflare DNS for humza-butt.space:\n');
  console.log(`  Type:    CNAME`);
  console.log(`  Name:    ${recordLabel(domain)}`);
  console.log(`  Target:  ${pagesTarget}`);
  console.log(`  Proxy:   Proxied (orange cloud)\n`);
  console.log('Then wait a few minutes and re-run: npm run deploy:domain\n');
}

const attached = await attachPagesDomain();
if (!attached.ok) {
  process.exit(1);
}

const dns = await ensurePagesCname();
if (dns.manual) {
  printManualDns();
  process.exit(dns.ok ? 0 : 0);
}

console.log(`Pages custom domain should become active once DNS and TLS finish provisioning.`);
