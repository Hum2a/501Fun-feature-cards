#!/usr/bin/env node
/**
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Build the library and verify npm pack contents before publish.
 */
import { execSync } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

/** @param {string} cmd */
function runCapture(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
}

/** @param {string} cmd */
function run(cmd) {
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

const FORBIDDEN_PREFIXES = [
  'package/dist/demo/',
  'package/demo/',
  'package/tests/',
  'package/worker/',
  'package/scripts/',
  'package/.github/',
];

const REQUIRED = [
  'package/package.json',
  'package/LICENSE',
  'package/NOTICE',
  'package/COPYRIGHT',
  'package/COMMERCIAL-LICENSING.md',
  'package/dist/feature-cards.js',
  'package/dist/feature-cards.iife.js',
  'package/dist/types/index.d.ts',
  'package/custom-elements.json',
];

const skipBuild = process.argv.includes('--skip-build');

if (!skipBuild) {
  console.log('pack-verify: cleaning and building library…');
  run('node scripts/clean.mjs');
  run('npm run build:lib');
} else {
  console.log('pack-verify: skipping clean/build (--skip-build)…');
}

console.log('pack-verify: creating tarball…');
const tgz = runCapture('npm pack --silent');
const tarball = join(ROOT, tgz);

if (!existsSync(tarball)) {
  console.error(`Error: expected tarball at ${tgz}`);
  process.exit(1);
}

let listing;
try {
  listing = runCapture(`tar -tzf "${tarball}"`);
} catch (error) {
  unlinkSync(tarball);
  throw error;
}

const paths = listing.split(/\r?\n/).filter(Boolean);
unlinkSync(tarball);

const errors = [];

for (const prefix of FORBIDDEN_PREFIXES) {
  const hit = paths.find((path) => path.startsWith(prefix));
  if (hit) {
    errors.push(`Forbidden path in tarball: ${hit}`);
  }
}

for (const required of REQUIRED) {
  if (!paths.includes(required)) {
    errors.push(`Missing required path: ${required}`);
  }
}

if (errors.length > 0) {
  console.error('npm pack verification failed:\n');
  for (const error of errors) {
    console.error(`  • ${error}`);
  }
  process.exit(1);
}

console.log(`npm pack verification passed (${paths.length} paths, library-only).`);
