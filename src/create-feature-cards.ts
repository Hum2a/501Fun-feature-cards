/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import { defineFeatureCards, type FeatureCardsElement } from './feature-cards.js';
import type { AdapterName } from './adapters/index.js';
import type { Card, FeatureCardsData } from './schema.js';
import type { FeatureCardsErrorDetail } from './errors.js';

/** Options for {@link createFeatureCards}. */
export interface CreateFeatureCardsOptions {
  /** CSS selector or element to mount into. */
  target: string | HTMLElement;
  /** Remote JSON endpoint (see `src` attribute). */
  src?: string;
  /** CMS adapter name (see `adapter` attribute). */
  adapter?: AdapterName;
  /** Inline validated data (highest precedence). */
  data?: FeatureCardsData;
  /** Section heading override. */
  heading?: string;
  /** Section heading level, 1–6. */
  headingLevel?: number;
  /** Cap grid columns, 1–6. */
  columns?: number;
  /** Named theme token set. */
  theme?: string;
  /** Fired after a successful render. */
  onReady?: (detail: { count: number }) => void;
  /** Fired when validation or fetching fails. */
  onError?: (detail: FeatureCardsErrorDetail) => void;
  /** Fired when a card link is activated. */
  onCardClick?: (detail: { id: string; card: Card }) => void;
}

/**
 * Imperatively mount a `<feature-cards>` instance — useful for WordPress
 * themes, static HTML embeds, and non-SPA hosts.
 */
export function createFeatureCards(
  options: CreateFeatureCardsOptions,
): FeatureCardsElement {
  defineFeatureCards();

  const host =
    typeof options.target === 'string'
      ? document.querySelector<HTMLElement>(options.target)
      : options.target;

  if (!host) {
    throw new Error(
      typeof options.target === 'string'
        ? `createFeatureCards: no element matched "${options.target}"`
        : 'createFeatureCards: target element is null',
    );
  }

  const el = document.createElement('feature-cards') as FeatureCardsElement;

  if (options.src) {
    el.setAttribute('src', options.src);
  }
  if (options.adapter) {
    el.setAttribute('adapter', options.adapter);
  }
  if (options.heading) {
    el.setAttribute('heading', options.heading);
  }
  if (options.headingLevel !== undefined) {
    el.setAttribute('heading-level', String(options.headingLevel));
  }
  if (options.columns !== undefined) {
    el.setAttribute('columns', String(options.columns));
  }
  if (options.theme) {
    el.setAttribute('theme', options.theme);
  }

  if (options.onReady) {
    el.addEventListener('featurecards:ready', (event) => {
      options.onReady?.((event as CustomEvent<{ count: number }>).detail);
    });
  }
  if (options.onError) {
    el.addEventListener('featurecards:error', (event) => {
      options.onError?.((event as CustomEvent<FeatureCardsErrorDetail>).detail);
    });
  }
  if (options.onCardClick) {
    el.addEventListener('featurecards:cardclick', (event) => {
      options.onCardClick?.((event as CustomEvent<{ id: string; card: Card }>).detail);
    });
  }

  host.append(el);

  if (options.data !== undefined) {
    el.data = options.data;
  }

  return el;
}
