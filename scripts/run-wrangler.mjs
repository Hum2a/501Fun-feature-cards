#!/usr/bin/env node
/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Run wrangler with `.env` loaded so CLOUDFLARE_API_TOKEN is used instead of
// an interactive OAuth session from `wrangler login`.
//
// Usage:
//   node scripts/run-wrangler.mjs deploy --config worker/wrangler.toml --env production
//   npm run deploy:worker

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadDotEnv, ROOT } from './load-env.mjs';

loadDotEnv();

const token = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

if (!token || !accountId) {
  console.error(
    'Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID.\n' +
      'Add them to .env (see .env.example) or export them in your shell.\n' +
      'Wrangler OAuth from `wrangler login` is not used by this wrapper.',
  );
  process.exit(1);
}

const wranglerBin = join(
  ROOT,
  'node_modules',
  'wrangler',
  'bin',
  'wrangler.js',
);

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/run-wrangler.mjs <wrangler-args...>');
  process.exit(1);
}

const result = spawnSync(process.execPath, [wranglerBin, ...args], {
  cwd: ROOT,
  stdio: 'inherit',
  env: {
    ...process.env,
    CLOUDFLARE_API_TOKEN: token,
    CLOUDFLARE_ACCOUNT_ID: accountId,
  },
});

process.exit(result.status ?? 1);
