#!/usr/bin/env node
/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Run the unit tests; on success, ANSI confetti. Never runs the party in CI.

import { spawnSync } from 'node:child_process';

const result = spawnSync('npm', ['run', 'test:unit'], {
  stdio: 'inherit',
  shell: true,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

if (process.env.CI) {
  process.exit(0);
}

const glyphs = ['*', 'o', '+', '.', '✦', '✸'];
const colours = [196, 208, 220, 46, 51, 201];
const width = Math.min(process.stdout.columns ?? 60, 70);

let frame = 0;
const timer = setInterval(() => {
  let line = '';
  for (let i = 0; i < width; i += 1) {
    if (Math.random() < 0.18) {
      const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
      const colour = colours[Math.floor(Math.random() * colours.length)];
      line += `\u001B[38;5;${colour}m${glyph}\u001B[0m`;
    } else {
      line += ' ';
    }
  }
  console.log(line);
  frame += 1;
  if (frame >= 12) {
    clearInterval(timer);
    console.log('\n\u001B[1m  Tests green — party earned. 🎉\u001B[0m\n');
  }
}, 90);
