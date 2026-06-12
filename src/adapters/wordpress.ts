/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import type { Card, FeatureCardsData } from '../schema.js';

/** Minimal slice of the WordPress REST API post shape we consume. */
interface WpPost {
  id: number;
  link?: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url?: string;
      alt_text?: string;
    }>;
  };
  acf?: {
    eyebrow?: string;
    stat_value?: string;
    stat_label?: string;
    theme?: string;
  };
}

/** Strip HTML tags that WordPress embeds in `*.rendered` strings. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Map a WordPress REST `/wp/v2/posts?_embed` response onto the canonical
 * schema. This is intentionally small: new CMSs plug in by writing one of
 * these ~40-line mappers, nothing else changes.
 */
export function toFeatureCardsData(payload: unknown): FeatureCardsData {
  const posts = (Array.isArray(payload) ? payload : []) as WpPost[];

  const cards: Card[] = posts.map((post, index) => {
    const media = post._embedded?.['wp:featuredmedia']?.[0];
    const title = stripHtml(post.title?.rendered ?? '');
    return {
      id: String(post.id ?? `wp-${index + 1}`),
      title,
      ...(post.acf?.eyebrow ? { eyebrow: post.acf.eyebrow } : {}),
      ...(post.excerpt?.rendered
        ? { description: stripHtml(post.excerpt.rendered) }
        : {}),
      ...(post.acf?.stat_value && post.acf?.stat_label
        ? { figure: { value: post.acf.stat_value, label: post.acf.stat_label } }
        : {}),
      ...(media?.source_url
        ? { media: { src: media.source_url, alt: media.alt_text ?? '' } }
        : {}),
      ...(post.link ? { cta: { label: title, href: post.link } } : {}),
      ...(post.acf?.theme ? { theme: post.acf.theme } : {}),
    };
  });

  return { cards };
}
