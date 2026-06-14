/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import type { ValidationIssue } from './schema.js';

/** RFC 7807-style problem detail for structured error reporting. */
export interface ProblemDetail {
  /** URI identifying the problem type. */
  type: string;
  /** Short human-readable summary. */
  title: string;
  /** HTTP status when the error originated from a fetch. */
  status?: number;
  /** Human-readable explanation specific to this occurrence. */
  detail?: string;
  /** URI identifying this specific occurrence. */
  instance?: string;
  /** Flattened validation issues from the canonical schema. */
  issues: ValidationIssue[];
}

const PROBLEM_BASE = 'https://501fun.humza-butt.space/problems';

/**
 * Build an RFC 7807-style problem object from validation issues.
 *
 * @param issues - Flattened schema validation or fetch errors.
 * @param context - Optional HTTP status and instance URI.
 */
export function buildProblemDetail(
  issues: ValidationIssue[],
  context: { status?: number; instance?: string; title?: string } = {},
): ProblemDetail {
  const first = issues[0];
  const isFetch = first?.path === 'src';
  return {
    type: isFetch ? `${PROBLEM_BASE}/fetch-failed` : `${PROBLEM_BASE}/validation-failed`,
    title: context.title ?? (isFetch ? 'Failed to load card data' : 'Invalid card data'),
    issues,
    ...(context.status !== undefined ? { status: context.status } : {}),
    ...(first?.message ? { detail: first.message } : {}),
    ...(context.instance ? { instance: context.instance } : {}),
  };
}

/** Detail payload on the `featurecards:error` custom event. */
export interface FeatureCardsErrorDetail {
  issues: ValidationIssue[];
  problem: ProblemDetail;
}
