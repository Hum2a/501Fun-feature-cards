#!/usr/bin/env node
/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Regenerate custom-elements.json metadata (source of truth: src/feature-cards.ts API).

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

const manifest = {
  $schema:
    'https://raw.githubusercontent.com/webcomponents/custom-elements-manifest/master/schema.json',
  schemaVersion: '1.0.0',
  readme: '',
  modules: [
    {
      kind: 'javascript-module',
      path: 'dist/feature-cards.js',
      declarations: [
        {
          kind: 'class',
          name: 'FeatureCardsElement',
          tagName: 'feature-cards',
          description: pkg.description,
          customElement: true,
        },
      ],
      exports: [
        {
          kind: 'custom-element-definition',
          name: 'feature-cards',
          declaration: { name: 'FeatureCardsElement', module: 'dist/feature-cards.js' },
        },
      ],
    },
  ],
};

writeFileSync(
  join(ROOT, 'custom-elements.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);
console.log('Wrote custom-elements.json');
