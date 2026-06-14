#!/usr/bin/env node
/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Pretty repo stats in a boxed table: files, LOC by type, tests, bundle size.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SKIP = new Set([
  'node_modules',
  'dist',
  'coverage',
  '.git',
  'playwright-report',
  'test-results',
  '.wrangler',
]);

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

const byExt = new Map();
let testCount = 0;
let fileCount = 0;

for (const file of walk(ROOT)) {
  fileCount += 1;
  const ext = extname(file) || '(none)';
  const lines = readFileSync(file, 'utf8').split('\n').length;
  byExt.set(ext, (byExt.get(ext) ?? 0) + lines);
  if (/\.(test|spec)\.[cm]?ts$/.test(file)) {
    const source = readFileSync(file, 'utf8');
    testCount += (source.match(/\bit\(|\btest\(/g) ?? []).length;
  }
}

const bundle = join(ROOT, 'dist', 'feature-cards.js');
const bundleSize = existsSync(bundle)
  ? `${(gzipSync(readFileSync(bundle), { level: 9 }).length / 1024).toFixed(2)} KiB gzip`
  : 'not built';

let lastCommit = 'no commits yet';
try {
  lastCommit = execSync('git log -1 --format="%h %s"', {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'ignore'],
  })
    .toString()
    .trim();
} catch {
  // Fresh repo — keep the default label.
}

const rows = [
  ['Files', String(fileCount)],
  ...[...byExt.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([ext, loc]) => [`LOC ${ext}`, String(loc)]),
  ['Tests', String(testCount)],
  ['Bundle (ESM)', bundleSize],
  ['Last commit', lastCommit],
];

const keyWidth = Math.max(...rows.map(([k]) => k.length));
const valWidth = Math.max(...rows.map(([, v]) => v.length));
const line = `+${'-'.repeat(keyWidth + 2)}+${'-'.repeat(valWidth + 2)}+`;

console.log(`\n${line}`);
for (const [key, value] of rows) {
  console.log(`| ${key.padEnd(keyWidth)} | ${value.padEnd(valWidth)} |`);
}
console.log(`${line}\n`);
