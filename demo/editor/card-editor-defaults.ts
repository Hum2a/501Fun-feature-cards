/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Card, FeatureCardsData } from '@src/schema.js';
import { DEFAULT_LUCIDE_ICON } from './icon-catalog.js';

/** Default 501-style stat cards matching the landing-page reference design. */
export const DEFAULT_501_CARDS: FeatureCardsData = {
  heading: 'Feature cards module',
  cards: [
    {
      id: 'guests',
      layout: 'stat',
      eyebrow: 'More than',
      figure: { value: '12,000,000', label: 'delighted guests' },
      media: { src: '/icons/lucide/users.svg', alt: '' },
      theme: '501-green',
      appearance: {
        background: '#c6f135',
        foreground: '#0a0a0a',
        minHeight: '18rem',
        mediaMaxHeight: '7.5rem',
        rotateDeg: 0,
        scale: 1,
      },
    },
    {
      id: 'countries',
      layout: 'stat',
      eyebrow: 'Find us in',
      figure: { value: '50', label: 'countries' },
      media: { src: '/icons/lucide/globe-2.svg', alt: '' },
      theme: '501-magenta',
      appearance: {
        background: '#e91e8c',
        foreground: '#0a0a0a',
        minHeight: '18rem',
        mediaMaxHeight: '7.5rem',
        rotateDeg: 0,
        scale: 1,
      },
    },
    {
      id: 'darts',
      layout: 'stat',
      eyebrow: 'Over',
      figure: { value: '800,000,000', label: 'darts thrown' },
      media: { src: '/icons/lucide/target.svg', alt: '' },
      theme: '501-blue',
      appearance: {
        background: '#29b6f6',
        foreground: '#0a0a0a',
        minHeight: '18rem',
        mediaMaxHeight: '7.5rem',
        rotateDeg: 0,
        scale: 1,
      },
    },
  ],
};

export const EDITOR_STORAGE_KEY = 'fc-card-editor-data';

export function cloneCards(data: FeatureCardsData): FeatureCardsData {
  return structuredClone(data);
}

export function createBlankCard(index: number): Card {
  return {
    id: `card-${Date.now()}-${index}`,
    layout: 'stat',
    eyebrow: 'Top text',
    figure: { value: '100', label: 'bottom text' },
    media: { src: DEFAULT_LUCIDE_ICON.src, alt: '' },
    theme: '501-green',
    appearance: {
      background: '#c6f135',
      foreground: '#0a0a0a',
      minHeight: '18rem',
      mediaMaxHeight: '7.5rem',
      rotateDeg: 0,
      scale: 1,
    },
  };
}
