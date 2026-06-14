#!/usr/bin/env node
/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Fail if custom-elements.json drifts from generate-cem.mjs output.

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(ROOT, 'custom-elements.json');
const before = readFileSync(manifestPath, 'utf8');

execSync('node scripts/generate-cem.mjs', { cwd: ROOT, stdio: 'pipe' });

const after = readFileSync(manifestPath, 'utf8');
if (before !== after) {
  console.error(
    'custom-elements.json is out of date — run: npm run build:lib (or npm run cem)',
  );
  process.exit(1);
}

console.log('custom-elements.json matches generator output');
