#!/usr/bin/env node
/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Attach a custom domain to the Cloudflare Pages project via API.
// Wrangler has no `pages domain add` command — this replaces it.
//
// Usage:
//   CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... node scripts/attach-pages-domain.mjs
//   npm run deploy:domain

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

/** Load root `.env` into process.env when vars are not already set. */
function loadDotEnv() {
  const path = join(ROOT, '.env');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

const site = JSON.parse(readFileSync(join(ROOT, 'config/site.json'), 'utf8'));
const dryRun = process.argv.includes('--dry-run');

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
const project = site.pagesProject;
const domain = site.host;

if (!accountId || !token) {
  console.error(
    'Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN.\n' +
      'Set them in .env or your shell before running this script.',
  );
  process.exit(1);
}

const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${project}/domains`;

if (dryRun) {
  console.log(`[dry-run] POST ${url}`);
  console.log(`          body: { "name": "${domain}" }`);
  process.exit(0);
}

const response = await fetch(url, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name: domain }),
});

const payload = await response.json();

if (payload.success) {
  const status = payload.result?.status ?? 'submitted';
  console.log(`Attached ${domain} to Pages project "${project}" (${status}).`);
  process.exit(0);
}

const message = (payload.errors ?? [])
  .map((e) => e.message ?? String(e.code))
  .join('; ');

if (/already|duplicate|exists/i.test(message)) {
  console.log(`Domain ${domain} is already on project "${project}" — OK.`);
  process.exit(0);
}

console.error(`Failed to attach ${domain}:\n${JSON.stringify(payload, null, 2)}`);
process.exit(1);
