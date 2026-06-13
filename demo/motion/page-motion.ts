/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const FLASH_MS = 520;

/** Whether the user prefers reduced motion. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Brief overlay flash when the page theme changes. */
export function flashThemeTransition(): void {
  if (prefersReducedMotion()) {
    return;
  }
  const root = document.documentElement;
  root.classList.add('theme-transitioning');
  window.setTimeout(() => root.classList.remove('theme-transitioning'), FLASH_MS);
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
