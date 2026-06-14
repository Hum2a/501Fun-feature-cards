#!/usr/bin/env node
/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Print SRI integrity hashes for the IIFE bundle (CDN embed documentation).
//
// Usage: npm run sri  (after build:lib)

import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const file = join(ROOT, 'dist', 'feature-cards.iife.js');

if (!existsSync(file)) {
  console.error('Missing dist/feature-cards.iife.js — run npm run build:lib first.');
  process.exit(1);
}

const bytes = readFileSync(file);
const hash = createHash('sha384').update(bytes).digest('base64');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

console.log(`@techystuff/feature-cards@${pkg.version} IIFE SRI (sha384):\n`);
console.log(`  integrity="sha384-${hash}"`);
console.log('\nExample embed:\n');
console.log(
  `<script\n  src="https://cdn.jsdelivr.net/npm/@techystuff/feature-cards@${pkg.version}/dist/feature-cards.iife.js"\n  integrity="sha384-${hash}"\n  crossorigin="anonymous"\n></script>`,
);
