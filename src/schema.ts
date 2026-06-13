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

/**
 * Visual tuning for a single card — maps to `--fc-*` overrides and transforms.
 * Used by the demo editor and CMS fields for the 501-style stat module.
 */
export const cardAppearanceSchema = z.object({
  background: z.string().min(1).optional(),
  foreground: z.string().min(1).optional(),
  accent: z.string().min(1).optional(),
  /** Rotation in degrees (-180 to 180). */
  rotateDeg: z.number().min(-180).max(180).optional(),
  /** Uniform scale (0.5–2). */
  scale: z.number().min(0.5).max(2).optional(),
  minHeight: z.string().min(1).optional(),
  borderWidth: z.string().min(1).optional(),
  borderColor: z.string().min(1).optional(),
  borderRadius: z.string().min(1).optional(),
  topFontSize: z.string().min(1).optional(),
  middleFontSize: z.string().min(1).optional(),
  bottomFontSize: z.string().min(1).optional(),
  mediaMaxHeight: z.string().min(1).optional(),
  fontFamily: z.string().min(1).optional(),
});

/** Card layout — `stat` matches the 501 landing-page coloured stat cards. */
export const cardLayoutSchema = z.enum(['standard', 'stat']);

/** The canonical card shape every CMS adapter normalises into. */
export const cardSchema = z
  .object({
    /** Stable unique id, used for keyed rendering and click events. */
    id: z.string().min(1),
    /**
     * `standard` — title-led marketing card.
     * `stat` — 501-style module: top text, hero figure, bottom text, bottom media.
     */
    layout: cardLayoutSchema.optional(),
    /** Top text in stat layout (maps to “More than”, “Find us in”, …). */
    eyebrow: z.string().optional(),
    /** Card title; optional in stat layout when figure value + label are set. */
    title: z.string().min(1).optional(),
    /** Supporting copy (standard layout). */
    description: z.string().optional(),
    /** Middle + bottom text in stat layout (`value` + `label`). */
    figure: figureSchema.optional(),
    /** Icon or image — anchored to the card foot in stat layout. */
    media: mediaSchema.optional(),
    /** Link target for the card. */
    cta: ctaSchema.optional(),
    /** Named theme token set, e.g. "brand-blue" or "501-green". */
    theme: z.string().optional(),
    /** Per-card colours, size, rotation, and typography overrides. */
    appearance: cardAppearanceSchema.optional(),
  })
  .superRefine((card, ctx) => {
    const layout = card.layout ?? (card.figure ? 'stat' : 'standard');
    const hasTitle = Boolean(card.title?.length);
    const hasStatCopy = Boolean(card.figure?.value && card.figure?.label);
    if (layout === 'standard' && !hasTitle) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Standard layout cards require title',
        path: ['title'],
      });
    }
    if (layout === 'stat' && !hasTitle && !hasStatCopy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Stat layout needs figure.value + figure.label or a title',
        path: ['figure'],
      });
    }
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
export type CardAppearance = z.infer<typeof cardAppearanceSchema>;
export type CardLayout = z.infer<typeof cardLayoutSchema>;
export type Card = z.infer<typeof cardSchema>;
export type FeatureCardsData = z.infer<typeof featureCardsDataSchema>;

/** Resolved layout for rendering (explicit or inferred from data). */
export function resolveCardLayout(card: Card): CardLayout {
  if (card.layout) {
    return card.layout;
  }
  if (card.figure && !card.title && !card.description) {
    return 'stat';
  }
  if (card.figure && card.eyebrow && !card.description) {
    return 'stat';
  }
  return 'standard';
}

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
