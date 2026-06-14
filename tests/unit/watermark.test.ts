/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import { describe, expect, it } from 'vitest';
import {
  CANARY_UUID,
  PROVENANCE,
  PROVENANCE_NOTICE,
  ZERO_WIDTH_SIGNATURE,
  decodeZeroWidth,
} from '@src/watermark.js';

describe('watermark', () => {
  it('provenance record is frozen and complete', () => {
    expect(Object.isFrozen(PROVENANCE)).toBe(true);
    expect(PROVENANCE.uuid).toBe(CANARY_UUID);
    expect(PROVENANCE.spdx).toBe('AGPL-3.0-only');
    expect(PROVENANCE.author).toBe('Humza Butt');
  });

  it('zero-width signature round-trips to the first 8 hex chars of the UUID', () => {
    const expected = CANARY_UUID.replaceAll('-', '').slice(0, 8);
    expect(decodeZeroWidth(ZERO_WIDTH_SIGNATURE)).toBe(expected);
  });

  it('zero-width signature contains no visible characters between sentinels', () => {
    const inner = ZERO_WIDTH_SIGNATURE.slice(1, -1);
    expect([...inner].every((c) => c === '\u200B' || c === '\u200C')).toBe(true);
  });

  it('notice names the licence and the UUID', () => {
    expect(PROVENANCE_NOTICE).toContain(CANARY_UUID);
    expect(PROVENANCE_NOTICE).toContain('AGPL-3.0');
  });
});
