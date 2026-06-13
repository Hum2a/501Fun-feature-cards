/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import { describe, expect, it } from 'vitest';
import { resolveCardLayout, safeParseFeatureCardsData } from '@src/schema.js';
import cardsFixture from './fixtures/cards.json';

describe('schema', () => {
  it('accepts a fully-populated valid payload', () => {
    const result = safeParseFeatureCardsData(cardsFixture);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.cards).toHaveLength(3);
      expect(result.data.heading).toBe('Why teams choose us');
      expect(result.data.cards[0]?.figure?.trend).toBe('up');
    }
  });

  it('accepts the icon variant of media', () => {
    const result = safeParseFeatureCardsData({
      cards: [{ id: 'a', title: 'T', media: { icon: '★' } }],
    });
    expect(result.ok).toBe(true);
  });

  it('accepts an empty alt (decorative image)', () => {
    const result = safeParseFeatureCardsData({
      cards: [{ id: 'a', title: 'T', media: { src: '/x.png', alt: '' } }],
    });
    expect(result.ok).toBe(true);
  });

  it('rejects a standard-layout card without a title', () => {
    const result = safeParseFeatureCardsData({
      cards: [{ id: 'a', layout: 'standard', description: 'no title' }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((issue) => issue.path === 'cards.0.title')).toBe(true);
    }
  });

  it('accepts a stat-layout card without title when figure is complete', () => {
    const result = safeParseFeatureCardsData({
      cards: [
        {
          id: 'stat-1',
          layout: 'stat',
          eyebrow: 'More than',
          figure: { value: '50', label: 'countries' },
          media: { src: '/icons/lucide/globe-2.svg', alt: '' },
        },
      ],
    });
    expect(result.ok).toBe(true);
  });

  it('rejects a stat-layout card without figure or title', () => {
    const result = safeParseFeatureCardsData({
      cards: [{ id: 'a', layout: 'stat', eyebrow: 'Only top' }],
    });
    expect(result.ok).toBe(false);
  });

  describe('resolveCardLayout', () => {
    it('prefers explicit layout', () => {
      expect(
        resolveCardLayout({ id: 'a', layout: 'stat', title: 'Has title' }),
      ).toBe('stat');
    });

    it('infers stat when figure exists without title or description', () => {
      expect(
        resolveCardLayout({
          id: 'a',
          figure: { value: '50', label: 'countries' },
        }),
      ).toBe('stat');
    });

    it('defaults to standard for title-led cards', () => {
      expect(resolveCardLayout({ id: 'a', title: 'Marketing card' })).toBe('standard');
    });
  });

  it('rejects an empty cards array', () => {
    const result = safeParseFeatureCardsData({ cards: [] });
    expect(result.ok).toBe(false);
  });

  it('rejects media with src but no alt', () => {
    const result = safeParseFeatureCardsData({
      cards: [{ id: 'a', title: 'T', media: { src: '/x.png' } }],
    });
    expect(result.ok).toBe(false);
  });

  it.each([null, undefined, 42, 'nope', [], {}])(
    'never throws on garbage input %#',
    (input) => {
      expect(() => safeParseFeatureCardsData(input)).not.toThrow();
      expect(safeParseFeatureCardsData(input).ok).toBe(false);
    },
  );
});
