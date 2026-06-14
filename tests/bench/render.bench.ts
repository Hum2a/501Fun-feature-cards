/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { bench, describe, expect } from 'vitest';
import { defineFeatureCards, type FeatureCardsElement } from '@src/feature-cards.js';
import type { FeatureCardsData } from '@src/schema.js';

function buildData(count: number): FeatureCardsData {
  return {
    cards: Array.from({ length: count }, (_, i) => ({
      id: `card-${i}`,
      title: `Card ${i}`,
      description: 'Benchmark card copy.',
      cta: { label: 'Learn more', href: `#${i}` },
    })),
  };
}

describe('render benchmark', () => {
  bench(
    'render 100 cards',
    async () => {
      defineFeatureCards();
      const el = document.createElement('feature-cards') as FeatureCardsElement;
      document.body.append(el);
      el.data = buildData(100);
      await new Promise((r) => requestAnimationFrame(r));
      expect(el.shadowRoot?.querySelectorAll('.card').length).toBe(100);
      el.remove();
    },
    { time: 800 },
  );
});
