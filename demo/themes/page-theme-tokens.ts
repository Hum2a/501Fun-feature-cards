/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/** Canonical page-theme identifier (matches `data-page-theme` on `<html>`). */
export type PageThemeId =
  | 'corporate-daydream'
  | 'pager-duty-noir'
  | 'sepia-substack'
  | 'vaporwave-investor-deck'
  | 'forest-gump-enterprise'
  | 'bubblegum-saas-pitch'
  | 'terminal-green-envy'
  | 'sunset-linkedin-post'
  | 'coffee-shop-minimalist'
  | 'discord-mod-at-3am'
  | 'government-portal-chic'
  | 'high-contrast-parental-controls';

/** Metadata for a demo page theme — colours live in `page-themes.css`. */
export interface PageThemeMeta {
  id: PageThemeId;
  /** Parody display name shown in the theme picker. */
  parodyName: string;
  /** One-line joke subtitle for the picker. */
  tagline: string;
  colorScheme: 'light' | 'dark';
}

/** localStorage key — keep in sync with the inline FOUC guard in `index.html`. */
export const PAGE_THEME_STORAGE_KEY = 'fc-page-theme';

/** Default when nothing is stored and system preference is light. */
export const DEFAULT_LIGHT_THEME: PageThemeId = 'corporate-daydream';

/** Default when nothing is stored and system preference is dark. */
export const DEFAULT_DARK_THEME: PageThemeId = 'pager-duty-noir';

/**
 * Registry of demo page themes. Adding a theme requires:
 * 1. An entry here
 * 2. A `[data-page-theme='…']` block in `page-themes.css`
 * 3. An `<option>` in `index.html` (or dynamic options from this list)
 */
export const PAGE_THEMES: readonly PageThemeMeta[] = [
  {
    id: 'corporate-daydream',
    parodyName: 'Corporate Daydream™',
    tagline: 'Light mode, but make it a quarterly review',
    colorScheme: 'light',
  },
  {
    id: 'pager-duty-noir',
    parodyName: 'Pager Duty Noir',
    tagline: 'Dark mode for on-call heroes and villains',
    colorScheme: 'dark',
  },
  {
    id: 'sepia-substack',
    parodyName: "Sepia Substack Writer's Loft",
    tagline: 'Thought leadership, warm filter included',
    colorScheme: 'light',
  },
  {
    id: 'vaporwave-investor-deck',
    parodyName: 'Vaporwave Investor Deck',
    tagline: "Series A, but it's 1987 and nothing is real",
    colorScheme: 'dark',
  },
  {
    id: 'forest-gump-enterprise',
    parodyName: 'Forest Gump Enterprise Edition',
    tagline: 'Life is like a box of green OKRs',
    colorScheme: 'dark',
  },
  {
    id: 'bubblegum-saas-pitch',
    parodyName: 'Bubblegum SaaS Pitch Deck',
    tagline: 'Disrupting synergy with millennial pink',
    colorScheme: 'light',
  },
  {
    id: 'terminal-green-envy',
    parodyName: 'Terminal Green Envy',
    tagline: 'sudo make me a sandwich ( monospace optional )',
    colorScheme: 'dark',
  },
  {
    id: 'sunset-linkedin-post',
    parodyName: 'Sunset LinkedIn Thought Leadership',
    tagline: "Agree? Here's my journey in orange gradient",
    colorScheme: 'light',
  },
  {
    id: 'coffee-shop-minimalist',
    parodyName: 'Coffee Shop Minimalist (No WiFi)',
    tagline: 'Beige walls, oat milk, no outlet near you',
    colorScheme: 'light',
  },
  {
    id: 'discord-mod-at-3am',
    parodyName: 'Discord Mod at 3am',
    tagline: 'Blurple fatigue and questionable permissions',
    colorScheme: 'dark',
  },
  {
    id: 'government-portal-chic',
    parodyName: 'Government Portal Chic',
    tagline: 'Please wait. Your theme is important to us.',
    colorScheme: 'light',
  },
  {
    id: 'high-contrast-parental-controls',
    parodyName: 'High-Contrast Parental Controls',
    tagline: 'Because someone turned accessibility up to eleven',
    colorScheme: 'dark',
  },
] as const;

/** Resolve stored or system-default theme id. */
export function resolveInitialPageTheme(): PageThemeId {
  if (typeof window === 'undefined') {
    return DEFAULT_LIGHT_THEME;
  }

  const stored = localStorage.getItem(PAGE_THEME_STORAGE_KEY);
  if (stored && PAGE_THEMES.some((theme) => theme.id === stored)) {
    return stored as PageThemeId;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? DEFAULT_DARK_THEME
    : DEFAULT_LIGHT_THEME;
}

/** Apply a theme to the document root. */
export function applyPageTheme(id: PageThemeId): void {
  document.documentElement.dataset.pageTheme = id;
  localStorage.setItem(PAGE_THEME_STORAGE_KEY, id);

  const meta = PAGE_THEMES.find((theme) => theme.id === id);
  if (meta) {
    document.documentElement.style.colorScheme = meta.colorScheme;
  }
}
