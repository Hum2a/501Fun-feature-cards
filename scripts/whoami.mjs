#!/usr/bin/env node
/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Print the project provenance with a little flair.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const watermark = readFileSync(join(ROOT, 'src', 'watermark.ts'), 'utf8');
const uuid = watermark.match(/CANARY_UUID = '([0-9a-f-]{36})'/)?.[1] ?? 'unknown';

const c = (n, s) => `\u001B[38;5;${n}m${s}\u001B[0m`;

console.log(`
  ${c(44, '┌──────────────────────────────────────────────┐')}
  ${c(44, '│')}  ${c(15, pkg.name)} ${c(8, `v${pkg.version}`)}
  ${c(44, '│')}  ${c(8, 'author ')} ${c(15, 'Humza Butt')}
  ${c(44, '│')}  ${c(8, 'licence')} ${c(214, pkg.license)}
  ${c(44, '│')}  ${c(8, 'repo   ')} ${c(39, pkg.repository.url.replace(/^git\+|\.git$/g, ''))}
  ${c(44, '│')}  ${c(8, 'canary ')} ${c(42, uuid)}
  ${c(44, '└──────────────────────────────────────────────┘')}
`);
