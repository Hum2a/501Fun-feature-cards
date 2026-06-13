#!/usr/bin/env node
/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Cross-platform launcher for scripts/release.sh.
// On Windows, prefers Git Bash; on Linux/macOS uses system bash.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const RELEASE_SH = join(ROOT, 'scripts', 'release.sh');

/** @returns {string | null} */
function findBash() {
  const candidates =
    process.platform === 'win32'
      ? [
          process.env.PROGRAMFILES &&
            join(process.env.PROGRAMFILES, 'Git', 'bin', 'bash.exe'),
          process.env['ProgramFiles(x86)'] &&
            join(process.env['ProgramFiles(x86)'], 'Git', 'bin', 'bash.exe'),
          process.env.LOCALAPPDATA &&
            join(process.env.LOCALAPPDATA, 'Programs', 'Git', 'bin', 'bash.exe'),
          'bash.exe',
          'bash',
        ].filter(Boolean)
      : ['bash', '/bin/bash', '/usr/bin/bash'];

  for (const candidate of candidates) {
    if (candidate.includes('/') || candidate.includes('\\')) {
      if (!existsSync(candidate)) continue;
    }
    const probe = spawnSync(candidate, ['--version'], { stdio: 'ignore' });
    if (probe.status === 0) return candidate;
  }
  return null;
}

const bash = findBash();
if (!bash) {
  console.error(
    'Could not find bash. Install Git for Windows (Git Bash) or run scripts/release.sh directly.',
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const result = spawnSync(bash, [RELEASE_SH, ...args], {
  cwd: ROOT,
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
