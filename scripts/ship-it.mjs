#!/usr/bin/env node
/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Run the full `check` gate; celebrate only on a completely green run.

import { spawnSync } from 'node:child_process';

const result = spawnSync('npm', ['run', 'check'], {
  stdio: 'inherit',
  shell: true,
});

if (result.status !== 0) {
  console.log('\n\u001B[31mNot shipping that. Fix the red and try again.\u001B[0m\n');
  process.exit(result.status ?? 1);
}

if (!process.env.CI) {
  console.log(`\u001B[38;5;208m
           /\\
          /  \\
         |    |
         | 🚀 |
         |    |
        /| || |\\
       /_|_||_|_\\
         /_/\\_\\
  \u001B[0m\u001B[1m  All green. SHIP IT.\u001B[0m
`);
}
