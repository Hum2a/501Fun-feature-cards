/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import { z } from 'zod';

/** Direction of a statistic's trend, used for screen-reader context. */
export const trendSchema = z.enum(['up', 'down', 'flat']);

/** A headline statistic shown prominently on a card (e.g. "97%"). */
export const figureSchema = z.object({
  /** Display value, e.g. "97%" or "1.2M". */
  value: z.string().min(1),
  /** Human label giving the value meaning, e.g. "customer satisfaction". */
  label: z.string().min(1),
  /** Optional trend direction announced to assistive tech. */
  trend: trendSchema.optional(),
});

/**
 * Card media: either an image (src + alt) or a named icon.
 * An empty `alt` marks the image as decorative.
 */
export const mediaSchema = z.union([
  z.object({
    src: z.string().min(1),
    alt: z.string(),
  }),
  z.object({
    icon: z.string().min(1),
  }),
]);

/** Call-to-action link. The whole card becomes this link's target. */
export const ctaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  /** Overrides the computed accessible name when the label lacks context. */
  ariaLabel: z.string().optional(),
});

/** The canonical card shape every CMS adapter normalises into. */
export const cardSchema = z.object({
  /** Stable unique id, used for keyed rendering and click events. */
  id: z.string().min(1),
  /** Small kicker text above the title. */
  eyebrow: z.string().optional(),
  /** Card title; rendered as a heading. */
  title: z.string().min(1),
  /** Supporting copy. */
  description: z.string().optional(),
  /** Headline statistic. */
  figure: figureSchema.optional(),
  /** Image or icon. */
  media: mediaSchema.optional(),
  /** Link target for the card. */
  cta: ctaSchema.optional(),
  /** Named theme token set, e.g. "brand-blue". */
  theme: z.string().optional(),
});

/** Top-level payload consumed by `<feature-cards>`. */
export const featureCardsDataSchema = z.object({
  /** Optional section heading rendered above the cards. */
  heading: z.string().optional(),
  cards: z.array(cardSchema).min(1),
});

export type Trend = z.infer<typeof trendSchema>;
export type Figure = z.infer<typeof figureSchema>;
export type Media = z.infer<typeof mediaSchema>;
export type Cta = z.infer<typeof ctaSchema>;
export type Card = z.infer<typeof cardSchema>;
export type FeatureCardsData = z.infer<typeof featureCardsDataSchema>;

/** One flattened validation problem from {@link safeParseFeatureCardsData}. */
export interface ValidationIssue {
  /** JSON-path-ish location of the problem, e.g. "cards.0.title". */
  path: string;
  message: string;
}

/** Discriminated result type: typed data on success, issue list on failure. */
export type ParseResult =
  | { ok: true; data: FeatureCardsData }
  | { ok: false; issues: ValidationIssue[] };

/**
 * Validate unknown input against the canonical schema.
 * Never throws — returns a structured issue list instead.
 */
export function safeParseFeatureCardsData(input: unknown): ParseResult {
  const result = featureCardsDataSchema.safeParse(input);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  return {
    ok: false,
    issues: result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  };
}
