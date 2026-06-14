/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import type { Card, FeatureCardsData } from '../schema.js';

/** Minimal slice of a Sanity GROQ query response we consume. */
interface SanityDoc {
  _id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  stat?: { value?: string; label?: string; trend?: 'up' | 'down' | 'flat' };
  image?: { asset?: { url?: string }; alt?: string };
  cta?: { label?: string; href?: string };
  theme?: string;
}

interface SanityResponse {
  result?: SanityDoc[];
}

/**
 * Map a Sanity HTTP API (GROQ) response onto the canonical schema. Assumes a
 * query that projects `image{asset->{url}, alt}` — the usual pattern.
 */
export function toFeatureCardsData(payload: unknown): FeatureCardsData {
  const docs = ((payload as SanityResponse)?.result ?? []) as SanityDoc[];

  const cards: Card[] = docs.map((doc, index) => ({
    id: doc._id ?? `sanity-${index + 1}`,
    title: doc.title ?? '',
    ...(doc.eyebrow ? { eyebrow: doc.eyebrow } : {}),
    ...(doc.description ? { description: doc.description } : {}),
    ...(doc.stat?.value && doc.stat?.label
      ? {
          figure: {
            value: doc.stat.value,
            label: doc.stat.label,
            ...(doc.stat.trend ? { trend: doc.stat.trend } : {}),
          },
        }
      : {}),
    ...(doc.image?.asset?.url
      ? { media: { src: doc.image.asset.url, alt: doc.image.alt ?? '' } }
      : {}),
    ...(doc.cta?.label && doc.cta?.href
      ? { cta: { label: doc.cta.label, href: doc.cta.href } }
      : {}),
    ...(doc.theme ? { theme: doc.theme } : {}),
  }));

  return { cards };
}
