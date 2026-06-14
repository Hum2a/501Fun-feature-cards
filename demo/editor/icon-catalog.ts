/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/** Curated Lucide icons for the demo card editor — see https://lucide.dev/ */

export interface LucideIconOption {
  /** Lucide icon id (kebab-case filename without .svg) */
  id: string;
  /** Human label in the picker */
  label: string;
  /** Public URL served from demo/public/icons/lucide/ */
  src: string;
}

const lucideSrc = (id: string): string => `/icons/lucide/${id}.svg`;

/** Icons copied by scripts/sync-lucide-icons.mjs — keep lists in sync. */
export const LUCIDE_ICON_CATALOG: LucideIconOption[] = [
  { id: 'users', label: 'Users', src: lucideSrc('users') },
  { id: 'hand-heart', label: 'Hand heart', src: lucideSrc('hand-heart') },
  { id: 'party-popper', label: 'Party', src: lucideSrc('party-popper') },
  { id: 'globe-2', label: 'Globe', src: lucideSrc('globe-2') },
  { id: 'map-pin', label: 'Map pin', src: lucideSrc('map-pin') },
  { id: 'target', label: 'Target', src: lucideSrc('target') },
  { id: 'trophy', label: 'Trophy', src: lucideSrc('trophy') },
  { id: 'star', label: 'Star', src: lucideSrc('star') },
  { id: 'heart', label: 'Heart', src: lucideSrc('heart') },
  { id: 'trending-up', label: 'Trending up', src: lucideSrc('trending-up') },
  { id: 'bar-chart-3', label: 'Bar chart', src: lucideSrc('bar-chart-3') },
  { id: 'sparkles', label: 'Sparkles', src: lucideSrc('sparkles') },
  { id: 'circle-dollar-sign', label: 'Dollar', src: lucideSrc('circle-dollar-sign') },
  { id: 'zap', label: 'Zap', src: lucideSrc('zap') },
  { id: 'beer', label: 'Beer', src: lucideSrc('beer') },
  { id: 'smile', label: 'Smile', src: lucideSrc('smile') },
];

export const DEFAULT_LUCIDE_ICON = LUCIDE_ICON_CATALOG[0]!;

/** Map legacy custom SVG paths to Lucide equivalents. */
const LEGACY_ICON_SRC: Record<string, string> = {
  '/icons/clap.svg': lucideSrc('users'),
  '/icons/globe.svg': lucideSrc('globe-2'),
  '/icons/dart.svg': lucideSrc('target'),
};

/** Normalise stored or pasted icon URLs to the current Lucide catalog. */
export function resolveIconSrc(src: string | undefined): string {
  if (!src) {
    return DEFAULT_LUCIDE_ICON.src;
  }
  const migrated = LEGACY_ICON_SRC[src] ?? src;
  const known = LUCIDE_ICON_CATALOG.find((icon) => icon.src === migrated);
  return known?.src ?? DEFAULT_LUCIDE_ICON.src;
}

export function findIconBySrc(src: string): LucideIconOption | undefined {
  const resolved = resolveIconSrc(src);
  return LUCIDE_ICON_CATALOG.find((icon) => icon.src === resolved);
}
