/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import { defineFeatureCards } from './feature-cards.js';

export { FeatureCardsElement, defineFeatureCards } from './feature-cards.js';
export { createFeatureCards } from './create-feature-cards.js';
export type { CreateFeatureCardsOptions } from './create-feature-cards.js';
export { buildProblemDetail } from './errors.js';
export type { FeatureCardsErrorDetail, ProblemDetail } from './errors.js';
export {
  cardAppearanceSchema,
  cardLayoutSchema,
  cardSchema,
  ctaSchema,
  featureCardsDataSchema,
  figureSchema,
  mediaSchema,
  resolveCardLayout,
  safeParseFeatureCardsData,
  trendSchema,
} from './schema.js';
export type {
  Card,
  CardAppearance,
  CardLayout,
  Cta,
  FeatureCardsData,
  Figure,
  Media,
  ParseResult,
  Trend,
  ValidationIssue,
} from './schema.js';
export { getAdapter } from './adapters/index.js';
export type { Adapter, AdapterName } from './adapters/index.js';
export {
  CANARY_UUID,
  PROVENANCE,
  PROVENANCE_NOTICE,
  ZERO_WIDTH_SIGNATURE,
  decodeZeroWidth,
} from './watermark.js';

// Importing the package registers the element (guarded against doubles).
defineFeatureCards();
