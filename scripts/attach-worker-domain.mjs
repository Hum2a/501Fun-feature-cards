#!/usr/bin/env node
/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Attach a Worker custom domain via the account-level Domains API.
// Wrangler route binding needs Zone → Workers Routes → Edit; this endpoint
// only needs Account → Workers Scripts → Edit (same as script upload).
//
// Usage:
//   CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... node scripts/attach-worker-domain.mjs
//   npm run deploy:worker:domain

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadDotEnv, ROOT } from './load-env.mjs';

loadDotEnv();

const site = JSON.parse(readFileSync(join(ROOT, 'config/site.json'), 'utf8'));
const dryRun = process.argv.includes('--dry-run');

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
const hostname = site.cmsHost;
const service = site.workerName;
const zoneId = site.zoneId;
const zoneName = site.zone;

if (!accountId || !token) {
  console.error(
    'Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN.\n' +
      'Set them in .env or your shell before running this script.',
  );
  process.exit(1);
}

if (!hostname || !service) {
  console.error('config/site.json must define cmsHost and workerName.');
  process.exit(1);
}

const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/domains`;
const body = {
  hostname,
  service,
  environment: 'production',
  ...(zoneId ? { zone_id: zoneId } : {}),
  ...(zoneName ? { zone_name: zoneName } : {}),
};

if (dryRun) {
  console.log(`[dry-run] PUT ${url}`);
  console.log(`          body: ${JSON.stringify(body)}`);
  process.exit(0);
}

const response = await fetch(url, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

const payload = await response.json();

if (payload.success) {
  const status = payload.result?.hostname ?? hostname;
  console.log(`Attached Worker "${service}" to ${status}.`);
  process.exit(0);
}

const message = (payload.errors ?? [])
  .map((e) => e.message ?? String(e.code))
  .join('; ');

if (/already|duplicate|exists/i.test(message)) {
  console.log(`Worker domain ${hostname} is already attached — OK.`);
  process.exit(0);
}

console.error(`Failed to attach ${hostname}:\n${JSON.stringify(payload, null, 2)}`);
process.exit(1);
