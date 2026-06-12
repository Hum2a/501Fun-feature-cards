/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import { describe, expect, it } from 'vitest';
import {
  contentful,
  generic,
  getAdapter,
  sanity,
  wordpress,
} from '@src/adapters/index.js';
import { safeParseFeatureCardsData } from '@src/schema.js';
import genericFixture from './fixtures/generic.json';
import wordpressFixture from './fixtures/wordpress.json';
import contentfulFixture from './fixtures/contentful.json';
import sanityFixture from './fixtures/sanity.json';

describe('generic adapter', () => {
  it('converts its fixture into valid FeatureCardsData', () => {
    const result = safeParseFeatureCardsData(generic(genericFixture));
    expect(result.ok).toBe(true);
  });

  it('fills missing ids with stable fallbacks and keeps explicit ones', () => {
    const data = generic(genericFixture);
    expect(data.cards[0]?.id).toBe('card-1');
    expect(data.cards[1]?.id).toBe('explicit-id');
  });

  it('preserves the heading', () => {
    expect(generic(genericFixture).heading).toBe('Generic payload');
  });

  it('accepts a bare array of cards', () => {
    const data = generic([{ title: 'Bare', cta: { label: 'Go', href: '/go' } }]);
    expect(data.cards).toHaveLength(1);
    expect(data.heading).toBeUndefined();
    expect(safeParseFeatureCardsData(data).ok).toBe(true);
  });

  it('produces an (invalid) empty card list from non-card input', () => {
    const data = generic({ unexpected: true });
    expect(data.cards).toHaveLength(0);
    expect(safeParseFeatureCardsData(data).ok).toBe(false);
  });

  it('ignores a non-string heading', () => {
    const data = generic({ heading: 42, cards: [{ title: 'T' }] });
    expect(data.heading).toBeUndefined();
  });

  it('tolerates null entries in the card array', () => {
    const data = generic([null, { title: 'After null' }]);
    expect(data.cards[0]?.id).toBe('card-1');
    expect(data.cards[1]?.id).toBe('card-2');
  });
});

describe('wordpress adapter', () => {
  it('converts its fixture into valid FeatureCardsData', () => {
    const result = safeParseFeatureCardsData(wordpress(wordpressFixture));
    expect(result.ok).toBe(true);
  });

  it('strips HTML and entities from rendered fields', () => {
    const data = wordpress(wordpressFixture);
    expect(data.cards[0]?.title).toBe('Why quality matters');
    expect(data.cards[0]?.description).not.toContain('<p>');
  });

  it('maps featured media, ACF stats, and theme', () => {
    const card = wordpress(wordpressFixture).cards[0];
    expect(card?.media).toEqual({
      src: 'https://example.com/wp-content/uploads/quality.jpg',
      alt: 'Inspector reviewing a checklist',
    });
    expect(card?.figure).toEqual({ value: '99.9%', label: 'defect-free deliveries' });
    expect(card?.theme).toBe('brand-blue');
  });

  it('handles posts without media or ACF fields', () => {
    const card = wordpress(wordpressFixture).cards[1];
    expect(card?.media).toBeUndefined();
    expect(card?.figure).toBeUndefined();
    expect(card?.cta?.href).toBe('https://example.com/shipping-speed/');
  });

  it('returns an empty card list for non-array payloads', () => {
    expect(wordpress({ not: 'an array' }).cards).toHaveLength(0);
  });

  it('defaults missing titles, ids, and alt text', () => {
    const data = wordpress([
      {
        _embedded: { 'wp:featuredmedia': [{ source_url: 'https://x.test/i.jpg' }] },
      },
    ]);
    expect(data.cards[0]?.id).toBe('wp-1');
    expect(data.cards[0]?.title).toBe('');
    expect(data.cards[0]?.media).toEqual({ src: 'https://x.test/i.jpg', alt: '' });
  });
});

describe('contentful adapter', () => {
  it('converts its fixture into valid FeatureCardsData', () => {
    const result = safeParseFeatureCardsData(contentful(contentfulFixture));
    expect(result.ok).toBe(true);
  });

  it('prefixes protocol-relative asset URLs with https:', () => {
    const card = contentful(contentfulFixture).cards[0];
    expect(card?.media).toMatchObject({
      src: 'https://images.ctfassets.net/space/platform.png',
    });
  });

  it('handles entries with only required fields', () => {
    const card = contentful(contentfulFixture).cards[1];
    expect(card?.title).toBe('Editors love it');
    expect(card?.media).toBeUndefined();
    expect(card?.figure).toBeUndefined();
  });

  it('returns an empty card list when items are missing', () => {
    expect(contentful({}).cards).toHaveLength(0);
    expect(contentful(null).cards).toHaveLength(0);
  });

  it('leaves absolute asset URLs untouched', () => {
    const data = contentful({
      items: [
        {
          fields: {
            title: 'Absolute',
            image: { fields: { file: { url: 'https://cdn.test/pic.png' } } },
          },
        },
      ],
    });
    expect(data.cards[0]?.media).toEqual({ src: 'https://cdn.test/pic.png', alt: '' });
    expect(data.cards[0]?.id).toBe('contentful-1');
  });
});

describe('sanity adapter', () => {
  it('converts its fixture into valid FeatureCardsData', () => {
    const result = safeParseFeatureCardsData(sanity(sanityFixture));
    expect(result.ok).toBe(true);
  });

  it('maps stats including trend', () => {
    const card = sanity(sanityFixture).cards[0];
    expect(card?.figure).toEqual({
      value: '99.99%',
      label: 'uptime last 12 months',
      trend: 'up',
    });
  });

  it('maps image asset URLs and alt text', () => {
    const card = sanity(sanityFixture).cards[0];
    expect(card?.media).toEqual({
      src: 'https://cdn.sanity.io/images/space/uptime.png',
      alt: 'Status dashboard showing all systems operational',
    });
  });

  it('returns an empty card list when result is missing', () => {
    expect(sanity({}).cards).toHaveLength(0);
  });

  it('maps stats without a trend and defaults ids', () => {
    const data = sanity({
      result: [{ title: 'No trend', stat: { value: '1', label: 'thing' } }],
    });
    expect(data.cards[0]?.figure).toEqual({ value: '1', label: 'thing' });
    expect(data.cards[0]?.id).toBe('sanity-1');
  });
});

describe('getAdapter registry', () => {
  it('returns the named adapter', () => {
    expect(getAdapter('wordpress')).toBe(wordpress);
    expect(getAdapter('contentful')).toBe(contentful);
    expect(getAdapter('sanity')).toBe(sanity);
    expect(getAdapter('generic')).toBe(generic);
  });

  it('falls back to generic for unknown or missing names', () => {
    expect(getAdapter('unknown-cms')).toBe(generic);
    expect(getAdapter(null)).toBe(generic);
    expect(getAdapter(undefined)).toBe(generic);
  });
});
