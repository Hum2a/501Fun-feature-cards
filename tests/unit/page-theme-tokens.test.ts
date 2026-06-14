/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_DARK_THEME,
  DEFAULT_LIGHT_THEME,
  PAGE_THEME_STORAGE_KEY,
  PAGE_THEMES,
  applyPageTheme,
  resolveInitialPageTheme,
  type PageThemeId,
} from '../../demo/themes/page-theme-tokens.js';

describe('page theme tokens', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-page-theme');
    document.documentElement.style.colorScheme = '';
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('registers twelve parody themes with unique ids', () => {
    expect(PAGE_THEMES).toHaveLength(12);
    const ids = PAGE_THEMES.map((theme) => theme.id);
    expect(new Set(ids).size).toBe(12);
  });

  it('resolveInitialPageTheme returns stored theme when valid', () => {
    localStorage.setItem(PAGE_THEME_STORAGE_KEY, 'sepia-substack');
    expect(resolveInitialPageTheme()).toBe('sepia-substack');
  });

  it('resolveInitialPageTheme falls back to light default', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }) as MediaQueryList);
    expect(resolveInitialPageTheme()).toBe(DEFAULT_LIGHT_THEME);
  });

  it('resolveInitialPageTheme falls back to dark default', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
    expect(resolveInitialPageTheme()).toBe(DEFAULT_DARK_THEME);
  });

  it('applyPageTheme sets data attribute, storage, and color-scheme', () => {
    const id: PageThemeId = 'terminal-green-envy';
    applyPageTheme(id);
    expect(document.documentElement.dataset.pageTheme).toBe(id);
    expect(localStorage.getItem(PAGE_THEME_STORAGE_KEY)).toBe(id);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
});
