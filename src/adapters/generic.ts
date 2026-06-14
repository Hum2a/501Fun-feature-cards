/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import type { FeatureCardsData } from '../schema.js';

/**
 * Identity/normalising adapter for payloads that already (roughly) match the
 * canonical shape. It tolerates a bare array of cards and fills in missing
 * ids so hand-written JSON stays ergonomic. Validation happens downstream in
 * the component via the Zod schema — adapters only reshape.
 */
export function toFeatureCardsData(payload: unknown): FeatureCardsData {
  const raw = payload as Record<string, unknown> | unknown[];

  // Accept either { heading?, cards: [...] } or a bare array of cards.
  const cards = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as Record<string, unknown>).cards)
      ? ((raw as Record<string, unknown>).cards as unknown[])
      : [];

  const heading = Array.isArray(raw)
    ? undefined
    : typeof (raw as Record<string, unknown>).heading === 'string'
      ? ((raw as Record<string, unknown>).heading as string)
      : undefined;

  const normalised = cards.map((card, index) => {
    const c = (card ?? {}) as Record<string, unknown>;
    return {
      ...c,
      id: typeof c.id === 'string' && c.id.length > 0 ? c.id : `card-${index + 1}`,
    };
  });

  return {
    ...(heading !== undefined ? { heading } : {}),
    cards: normalised,
  } as FeatureCardsData;
}
