#!/usr/bin/env node
/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Bundle-size budget check: prints gzip + brotli sizes of the built bundles
// and fails if the ESM bundle exceeds the budget.

import { readFileSync, existsSync } from 'node:fs';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const BUDGET_GZIP_BYTES = 25 * 1024; // 25 KiB gzipped for the ESM bundle

const bundles = [
  { label: 'ESM  (feature-cards.js)', file: 'dist/feature-cards.js', budget: true },
  {
    label: 'IIFE (feature-cards.iife.js)',
    file: 'dist/feature-cards.iife.js',
    budget: false,
  },
];

const fmt = (bytes) => `${(bytes / 1024).toFixed(2)} KiB`;
const green = (s) => `\u001B[32m${s}\u001B[0m`;
const red = (s) => `\u001B[31m${s}\u001B[0m`;

let failed = false;
console.log('\nBundle sizes:\n');

for (const bundle of bundles) {
  const path = join(ROOT, bundle.file);
  if (!existsSync(path)) {
    console.error(red(`  missing ${bundle.file} — run \`npm run build\` first`));
    failed = true;
    continue;
  }
  const raw = readFileSync(path);
  const gzip = gzipSync(raw, { level: 9 }).length;
  const brotli = brotliCompressSync(raw).length;
  const overBudget = bundle.budget && gzip > BUDGET_GZIP_BYTES;
  const status = bundle.budget
    ? overBudget
      ? red(`OVER ${fmt(BUDGET_GZIP_BYTES)} budget`)
      : green(`within ${fmt(BUDGET_GZIP_BYTES)} budget`)
    : '';
  console.log(
    `  ${bundle.label.padEnd(30)} raw ${fmt(raw.length).padStart(10)}   gzip ${fmt(gzip).padStart(10)}   brotli ${fmt(brotli).padStart(10)}   ${status}`,
  );
  if (overBudget) {
    failed = true;
  }
}

console.log('');
process.exit(failed ? 1 : 0);
