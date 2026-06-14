/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import type { Card, FeatureCardsData } from '../schema.js';

/** Minimal slice of a Contentful Delivery API response we consume. */
interface ContentfulEntry {
  sys?: { id?: string };
  fields?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    statValue?: string;
    statLabel?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    theme?: string;
    image?: {
      fields?: {
        file?: { url?: string };
        description?: string;
      };
    };
  };
}

interface ContentfulResponse {
  items?: ContentfulEntry[];
}

/**
 * Map a Contentful Delivery API collection response onto the canonical
 * schema. Contentful serves protocol-relative asset URLs, so we prefix
 * `https:` when needed.
 */
export function toFeatureCardsData(payload: unknown): FeatureCardsData {
  const items = ((payload as ContentfulResponse)?.items ?? []) as ContentfulEntry[];

  const cards: Card[] = items.map((entry, index) => {
    const fields = entry.fields ?? {};
    const imageUrl = fields.image?.fields?.file?.url;
    const src = imageUrl?.startsWith('//') ? `https:${imageUrl}` : imageUrl;
    return {
      id: entry.sys?.id ?? `contentful-${index + 1}`,
      title: fields.title ?? '',
      ...(fields.eyebrow ? { eyebrow: fields.eyebrow } : {}),
      ...(fields.description ? { description: fields.description } : {}),
      ...(fields.statValue && fields.statLabel
        ? { figure: { value: fields.statValue, label: fields.statLabel } }
        : {}),
      ...(src ? { media: { src, alt: fields.image?.fields?.description ?? '' } } : {}),
      ...(fields.ctaLabel && fields.ctaUrl
        ? { cta: { label: fields.ctaLabel, href: fields.ctaUrl } }
        : {}),
      ...(fields.theme ? { theme: fields.theme } : {}),
    };
  });

  return { cards };
}
