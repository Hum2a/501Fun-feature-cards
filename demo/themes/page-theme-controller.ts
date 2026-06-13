/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  PAGE_THEMES,
  applyPageTheme,
  resolveInitialPageTheme,
  type PageThemeId,
} from './page-theme-tokens.js';

/** Wire the theme picker and sync `<html data-page-theme>`. */
export function initPageThemes(): void {
  const select = document.querySelector<HTMLSelectElement>('#page-theme-select');
  if (!select) {
    return;
  }

  populateThemeOptions(select);

  const initial = resolveInitialPageTheme();
  applyPageTheme(initial);
  select.value = initial;
  updateThemeHint(select, initial);

  select.addEventListener('change', () => {
    const id = select.value as PageThemeId;
    applyPageTheme(id);
    updateThemeHint(select, id);
  });
}

function populateThemeOptions(select: HTMLSelectElement): void {
  select.replaceChildren(
    ...PAGE_THEMES.map((theme) => {
      const option = document.createElement('option');
      option.value = theme.id;
      option.textContent = theme.parodyName;
      option.title = theme.tagline;
      return option;
    }),
  );
}

function updateThemeHint(select: HTMLSelectElement, id: PageThemeId): void {
  const hint = document.querySelector<HTMLElement>('#page-theme-hint');
  const meta = PAGE_THEMES.find((theme) => theme.id === id);
  if (!hint || !meta) {
    return;
  }
  hint.textContent = meta.tagline;
  hint.dataset.colorScheme = meta.colorScheme;
}
