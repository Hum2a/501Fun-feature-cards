/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';
import { buildProblemDetail } from '@src/errors.js';

describe('buildProblemDetail', () => {
  it('builds validation problem details', () => {
    const problem = buildProblemDetail([{ path: 'cards.0.title', message: 'Required' }]);
    expect(problem.type).toContain('validation-failed');
    expect(problem.title).toBe('Invalid card data');
    expect(problem.issues).toHaveLength(1);
  });

  it('builds fetch problem details with status', () => {
    const problem = buildProblemDetail(
      [{ path: 'src', message: 'request failed with HTTP 404' }],
      { status: 404, instance: 'https://cms.example/api/cards' },
    );
    expect(problem.type).toContain('fetch-failed');
    expect(problem.status).toBe(404);
    expect(problem.instance).toBe('https://cms.example/api/cards');
  });
});
