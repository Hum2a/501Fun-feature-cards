/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  crossfadeThemeHint,
  enableThemeAnimation,
  flashThemeTransition,
  prefersReducedMotion,
  pulseThemeSelect,
} from '../../demo/motion/page-motion.js';

function stubReducedMotion(reduced: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion') && reduced,
        media: query,
      }) as MediaQueryList,
  );
}

describe('page motion helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-motion');
    document.body.replaceChildren();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('prefersReducedMotion reflects matchMedia', () => {
    stubReducedMotion(true);
    expect(prefersReducedMotion()).toBe(true);
    stubReducedMotion(false);
    expect(prefersReducedMotion()).toBe(false);
  });

  it('flashThemeTransition adds overlay class when motion allowed', () => {
    stubReducedMotion(false);
    flashThemeTransition();
    expect(document.documentElement.classList.contains('theme-transitioning')).toBe(true);
    vi.advanceTimersByTime(720);
    expect(document.documentElement.classList.contains('theme-transitioning')).toBe(
      false,
    );
  });

  it('flashThemeTransition is a no-op under reduced motion', () => {
    stubReducedMotion(true);
    flashThemeTransition();
    expect(document.documentElement.classList.contains('theme-transitioning')).toBe(
      false,
    );
  });

  it('crossfadeThemeHint updates text immediately when reduced motion', () => {
    stubReducedMotion(true);
    const hint = document.createElement('p');
    crossfadeThemeHint(hint, 'New tagline', 'light');
    expect(hint.textContent).toBe('New tagline');
    expect(hint.dataset.colorScheme).toBe('light');
  });

  it('pulseThemeSelect toggles switching class when motion allowed', () => {
    stubReducedMotion(false);
    const select = document.createElement('select');
    document.body.append(select);
    pulseThemeSelect(select);
    expect(select.classList.contains('theme-select-switching')).toBe(true);
    vi.advanceTimersByTime(720);
    expect(select.classList.contains('theme-select-switching')).toBe(false);
  });

  it('enableThemeAnimation skips theme-animate under reduced motion', () => {
    stubReducedMotion(true);
    enableThemeAnimation();
    vi.runAllTimers();
    expect(document.documentElement.classList.contains('theme-animate')).toBe(false);
  });
});
