/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { featureCardsDataSchema } from '@src/schema.js';

describe('schema fuzz', () => {
  it('accepts generated valid payloads', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 24 }),
            title: fc.string({ minLength: 1, maxLength: 80 }),
          }),
          { minLength: 1, maxLength: 6 },
        ),
        (cards) => {
          const result = featureCardsDataSchema.safeParse({ cards });
          expect(result.success).toBe(true);
        },
      ),
    );
  });

  it('rejects payloads with empty card ids', () => {
    fc.assert(
      fc.property(fc.constant({ cards: [{ id: '', title: 'x' }] }), (payload) => {
        expect(featureCardsDataSchema.safeParse(payload).success).toBe(false);
      }),
    );
  });
});
