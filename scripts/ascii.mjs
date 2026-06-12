#!/usr/bin/env node
/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Random tasteful ASCII card. Purely decorative.

const cards = [
  String.raw`
   ┌─────────────────┐
   │  ★ FEATURE      │
   │                 │
   │   97%           │
   │   satisfaction  │
   │                 │
   │   Read more →   │
   └─────────────────┘`,
  String.raw`
   ╭─────────────────╮
   │  ◆ GROWTH       │
   │                 │
   │   3.2x          │
   │   first-year ROI│
   │                 │
   │   See numbers → │
   ╰─────────────────╯`,
  String.raw`
   ┌─────────────────┐
   │  ● SPEED        │
   │                 │
   │   5 days        │
   │   to launch     │
   │                 │
   │   Start now →   │
   └─────────────────┘`,
];

const colours = [39, 42, 214];
const pick = Math.floor(Math.random() * cards.length);
console.log(`\u001B[38;5;${colours[pick]}m${cards[pick]}\u001B[0m\n`);
