#!/usr/bin/env node
/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Cross-platform clean: removes build/test artefacts.

import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

for (const dir of ['dist', 'coverage', 'playwright-report', 'test-results']) {
  rmSync(join(ROOT, dir), { recursive: true, force: true });
}
console.log('cleaned: dist, coverage, playwright-report, test-results');
