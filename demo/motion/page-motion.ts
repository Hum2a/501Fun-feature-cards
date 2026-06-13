/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const THEME_TRANSITION_MS = 720;
const THEME_HINT_FADE_MS = 180;

/** Whether the user prefers reduced motion. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Brief overlay while page theme tokens crossfade. */
export function flashThemeTransition(): void {
  if (prefersReducedMotion()) {
    return;
  }
  const root = document.documentElement;
  root.classList.add('theme-transitioning');
  window.setTimeout(
    () => root.classList.remove('theme-transitioning'),
    THEME_TRANSITION_MS,
  );
}

/** Pulse the vibe select while its value changes. */
export function pulseThemeSelect(select: HTMLSelectElement): void {
  if (prefersReducedMotion()) {
    return;
  }
  select.classList.remove('theme-select-switching');
  void select.offsetWidth;
  select.classList.add('theme-select-switching');
  window.setTimeout(
    () => select.classList.remove('theme-select-switching'),
    THEME_TRANSITION_MS,
  );
}

/** Crossfade the tagline under the theme picker. */
export function crossfadeThemeHint(
  hint: HTMLElement,
  nextText: string,
  colorScheme: 'light' | 'dark',
): void {
  if (prefersReducedMotion()) {
    hint.textContent = nextText;
    hint.dataset.colorScheme = colorScheme;
    return;
  }

  hint.classList.add('theme-hint-swapping');

  window.setTimeout(() => {
    hint.textContent = nextText;
    hint.dataset.colorScheme = colorScheme;
    hint.classList.remove('theme-hint-swapping');
  }, THEME_HINT_FADE_MS);
}

/** Enable smooth token interpolation after the initial theme is applied. */
export function enableThemeAnimation(): void {
  if (prefersReducedMotion()) {
    return;
  }
  requestAnimationFrame(() => {
    document.documentElement.classList.add('theme-animate');
  });
}

/** Scroll-triggered reveal for `.motion-reveal` sections. */
export function initScrollReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>('.motion-reveal');
  if (targets.length === 0) {
    return;
  }

  if (prefersReducedMotion()) {
    targets.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  targets.forEach((el) => observer.observe(el));
}

/** Pulse the resize readout when the container width changes. */
export function pulseResizeReadout(readout: HTMLElement): void {
  if (prefersReducedMotion()) {
    return;
  }
  readout.classList.remove('motion-tick');
  void readout.offsetWidth;
  readout.classList.add('motion-tick');
}

/** Flash schema validation panel on state change. */
export function flashSchemaValidation(
  panel: HTMLElement,
  state: 'ok' | 'error' | 'neutral',
): void {
  panel.classList.remove('motion-flash-ok', 'motion-flash-error');
  if (prefersReducedMotion() || state === 'neutral') {
    return;
  }
  void panel.offsetWidth;
  panel.classList.add(state === 'ok' ? 'motion-flash-ok' : 'motion-flash-error');
}

/** Wire scroll reveal and mark the document motion-ready. */
export function initPageMotion(): void {
  document.documentElement.dataset.motion = prefersReducedMotion() ? 'reduce' : 'full';
  initScrollReveal();
}
