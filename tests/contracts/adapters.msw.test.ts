/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { getAdapter } from '@src/adapters/index.js';
import { featureCardsDataSchema } from '@src/schema.js';

const FIXTURES = join(
  dirname(dirname(fileURLToPath(import.meta.url))),
  'unit',
  'fixtures',
);

function load(name: string): unknown {
  return JSON.parse(readFileSync(join(FIXTURES, name), 'utf8'));
}

const server = setupServer();

describe('adapter contract tests (MSW)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  for (const [adapterName, fixture] of [
    ['wordpress', 'wordpress.json'],
    ['contentful', 'contentful.json'],
    ['sanity', 'sanity.json'],
  ] as const) {
    it(`${adapterName} adapter normalises recorded CMS payload`, async () => {
      const payload = load(fixture);
      server.use(
        http.get(`https://cms.test/${adapterName}`, () =>
          HttpResponse.json(payload as Record<string, unknown>),
        ),
      );

      const response = await fetch(`https://cms.test/${adapterName}`);
      const raw: unknown = await response.json();
      const adapted = getAdapter(adapterName)(raw);
      const parsed = featureCardsDataSchema.safeParse(adapted);

      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.cards.length).toBeGreaterThan(0);
      }
    });
  }
});
