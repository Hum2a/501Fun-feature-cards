#!/usr/bin/env node
/**
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Fail CI when first-party source files lack the standard AGPL copyright header.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();

const SCAN_DIRS = ['src', 'demo', 'scripts', 'worker', 'tests'];

const ROOT_CONFIGS = [
  'vitest.config.ts',
  'playwright.config.ts',
  'vite.config.ts',
  'vite.demo.config.ts',
  'vite.react.config.ts',
];

const EXTENSIONS = new Set(['.ts', '.tsx', '.mjs', '.css']);

const SKIP_DIR = new Set(['node_modules', 'dist', 'public', 'api']);

const REQUIRED = [
  'Copyright © 2026 Humza Butt',
  'SPDX-License-Identifier: AGPL-3.0-only',
];

/** @param {string} dir */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(ROOT, full).replace(/\\/g, '/');
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (SKIP_DIR.has(entry)) continue;
      walk(full, out);
      continue;
    }
    const ext = entry.slice(entry.lastIndexOf('.'));
    if (!EXTENSIONS.has(ext)) continue;
    out.push(rel);
  }
  return out;
}

/** @param {string} rel */
function checkFile(rel) {
  const text = readFileSync(join(ROOT, rel), 'utf8');
  const missing = REQUIRED.filter((needle) => !text.includes(needle));
  return missing;
}

const files = [
  ...SCAN_DIRS.flatMap((dir) => walk(join(ROOT, dir))),
  ...ROOT_CONFIGS.filter((file) => {
    try {
      statSync(join(ROOT, file));
      return true;
    } catch {
      return false;
    }
  }),
];

const failures = files
  .map((rel) => ({ rel, missing: checkFile(rel) }))
  .filter(({ missing }) => missing.length > 0);

if (failures.length > 0) {
  console.error('Licence header check failed.\n');
  for (const { rel, missing } of failures) {
    console.error(`  ${rel}`);
    for (const line of missing) {
      console.error(`    missing: ${line}`);
    }
  }
  console.error(
    `\n${failures.length} file(s) missing required AGPL headers. See .cursor/rules/10-code-style.mdc`,
  );
  process.exit(1);
}

console.log(`Licence headers OK (${files.length} files checked).`);
