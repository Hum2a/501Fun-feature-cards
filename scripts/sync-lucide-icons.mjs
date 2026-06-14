#!/usr/bin/env node
/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/** Copy curated Lucide SVGs from lucide-static into demo/public for the card editor. */

import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SOURCE = join(ROOT, 'node_modules', 'lucide-static', 'icons');
const TARGET = join(ROOT, 'demo', 'public', 'icons', 'lucide');

/** Keep in sync with demo/editor/icon-catalog.ts */
const ICON_IDS = [
  'users',
  'hand-heart',
  'party-popper',
  'globe-2',
  'map-pin',
  'target',
  'trophy',
  'star',
  'heart',
  'trending-up',
  'bar-chart-3',
  'sparkles',
  'circle-dollar-sign',
  'zap',
  'beer',
  'smile',
];

if (!existsSync(SOURCE)) {
  console.error('lucide-static is not installed. Run: npm install');
  process.exit(1);
}

mkdirSync(TARGET, { recursive: true });

let copied = 0;
for (const id of ICON_IDS) {
  const from = join(SOURCE, `${id}.svg`);
  const to = join(TARGET, `${id}.svg`);
  if (!existsSync(from)) {
    console.error(`Missing Lucide icon: ${id}.svg`);
    process.exit(1);
  }
  copyFileSync(from, to);
  copied += 1;
}

writeFileSync(
  join(TARGET, 'ATTRIBUTION.md'),
  `# Lucide icons (demo only)

Icons in this folder are copied from [Lucide](https://lucide.dev/) via the
\`lucide-static\` npm package (ISC licence).

Regenerate after changing the catalog:

\`\`\`sh
npm run icons:sync
\`\`\`

Curated set: ${ICON_IDS.join(', ')}.
`,
);

console.log(`Synced ${copied} Lucide icon(s) → demo/public/icons/lucide/`);
