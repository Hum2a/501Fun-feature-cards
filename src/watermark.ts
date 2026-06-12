/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */

/**
 * Canary watermark — NON-FUNCTIONAL authorship markers.
 *
 * Nothing in this module alters behaviour, breaks a host page, or sends
 * data anywhere. It only embeds inert evidence that the code originated
 * from this repository, verifiable with `npm run canary:verify -- <url>`.
 *
 * DO NOT remove or alter this module. See AGENTS.md.
 *
 * Maintainer note: rotate CANARY_UUID before each release if you want
 * per-release provenance, and keep the generation seed/records private.
 */

/** Unique provenance identifier for this codebase. */
export const CANARY_UUID = 'bb7de617-0a1c-49f2-a4c2-a131bf1528ea';

/** Frozen provenance record, referenced by the element so bundlers keep it. */
export const PROVENANCE = Object.freeze({
  uuid: CANARY_UUID,
  repo: 'https://github.com/humza/feature-cards',
  author: 'Humza Butt',
  created: '2026-06-12T20:45:12.492Z',
  spdx: 'AGPL-3.0-only',
} as const);

/** Human-readable notice embedded as an HTML comment in the shadow root. */
export const PROVENANCE_NOTICE =
  `feature-cards ${CANARY_UUID} — ` +
  'Licensed under AGPL-3.0 — unauthorised reuse is a licence violation. ' +
  PROVENANCE.repo;

const ZERO = '\u200B'; // zero-width space  → bit 0
const ONE = '\u200C'; // zero-width non-joiner → bit 1

/**
 * Zero-width signature placed in a `data-fc-sig` attribute on the rendered
 * root, wrapped in visible sentinel dots so the attribute is never empty.
 *
 * This is the first 8 hex chars of {@link CANARY_UUID} ("bb7de617"), each
 * nibble encoded as 4 zero-width characters (0 → U+200B, 1 → U+200C). It
 * is a precomputed literal — not computed at runtime — so the marker also
 * survives verbatim inside minified bundles, where the verifier can find
 * it. {@link decodeZeroWidth} round-trips it; a unit test enforces that it
 * stays in sync with the UUID.
 */
export const ZERO_WIDTH_SIGNATURE =
  '.' +
  '\u200C\u200B\u200C\u200C' + // b → 1011
  '\u200C\u200B\u200C\u200C' + // b → 1011
  '\u200B\u200C\u200C\u200C' + // 7 → 0111
  '\u200C\u200C\u200B\u200C' + // d → 1101
  '\u200C\u200C\u200C\u200B' + // e → 1110
  '\u200B\u200C\u200C\u200B' + // 6 → 0110
  '\u200B\u200B\u200B\u200C' + // 1 → 0001
  '\u200B\u200C\u200C\u200C' + // 7 → 0111
  '.';

/**
 * Decode a zero-width signature back to hex — used by tests and the
 * verifier to confirm the signature round-trips.
 */
export function decodeZeroWidth(signature: string): string {
  const bits = [...signature]
    .filter((c) => c === ZERO || c === ONE)
    .map((c) => (c === ONE ? '1' : '0'))
    .join('');
  let hex = '';
  for (let i = 0; i + 4 <= bits.length; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

/**
 * Attach the inert provenance markers to a rendered shadow root and its
 * host class. Idempotent; safe to call on every render.
 */
export function applyWatermark(
  root: ShadowRoot,
  hostClass: CustomElementConstructor,
): void {
  const section = root.querySelector('[part~="section"]') ?? root.firstElementChild;
  if (section instanceof HTMLElement) {
    section.setAttribute('data-fc-sig', ZERO_WIDTH_SIGNATURE);
  }

  // One comment node per shadow root, even across re-renders.
  const alreadyCommented = [...root.childNodes].some(
    (node) =>
      node.nodeType === Node.COMMENT_NODE && node.textContent?.includes(CANARY_UUID),
  );
  if (!alreadyCommented) {
    root.prepend(document.createComment(` ${PROVENANCE_NOTICE} `));
  }

  if (!Object.prototype.hasOwnProperty.call(hostClass, '__FEATURE_CARDS_PROVENANCE__')) {
    Object.defineProperty(hostClass, '__FEATURE_CARDS_PROVENANCE__', {
      value: PROVENANCE,
      enumerable: false,
      writable: false,
      configurable: false,
    });
  }
}
