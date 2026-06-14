/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */

/**
 * Component stylesheet.
 *
 * Public theming API — every `--fc-*` custom property below may be set by
 * consumers on the element (or any ancestor):
 *
 * | Token                | Purpose                                  |
 * | -------------------- | ---------------------------------------- |
 * | `--fc-font`          | Font stack                               |
 * | `--fc-bg`            | Section background                       |
 * | `--fc-fg`            | Primary text colour                      |
 * | `--fc-muted`         | Secondary text colour                    |
 * | `--fc-accent`        | Accent (eyebrow, figure, focus ring)     |
 * | `--fc-card-bg`       | Card background                          |
 * | `--fc-card-border`   | Card border colour                       |
 * | `--fc-card-min`      | Minimum card track width (grid)          |
 * | `--fc-gap`           | Grid gap                                 |
 * | `--fc-pad`           | Card padding                             |
 * | `--fc-radius`        | Card corner radius                       |
 * | `--fc-shadow`        | Resting card shadow                      |
 * | `--fc-shadow-hover`  | Hover/focus card shadow                  |
 * | `--fc-ring`          | Focus ring colour                        |
 * | `--fc-transition`    | Transition duration/easing               |
 *
 * Shadow-piercing hooks (`::part()`): `section`, `heading`, `grid`, `card`,
 * `link`, `eyebrow`, `title`, `description`, `figure`, `value`, `label`,
 * `media`, `cta`, `state`.
 */
export const componentCss = /* css */ `
:host {
  /* ---- public token layer (theming API) ---------------------------- */
  --fc-font: var(--page-font, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif);
  --fc-bg: transparent;
  --fc-fg: var(--page-fg, light-dark(#16202b, #e8edf2));
  --fc-muted: var(--page-muted, light-dark(#51606f, #9aa7b4));
  --fc-accent: var(--page-accent, light-dark(#2563eb, #7aa2ff));
  --fc-card-bg: var(--page-card, light-dark(#ffffff, #1a2330));
  --fc-card-border: var(--page-border, light-dark(#e3e8ee, #2c3a4b));
  --fc-card-min: 16rem;
  --fc-gap: clamp(0.75rem, 2cqi, 1.5rem);
  --fc-pad: clamp(1rem, 3cqi, 1.75rem);
  --fc-radius: 0.875rem;
  --fc-shadow: 0 1px 2px var(--page-shadow, rgb(0 0 0 / 0.06)), 0 4px 12px var(--page-shadow, rgb(0 0 0 / 0.05));
  --fc-shadow-hover: 0 2px 4px var(--page-shadow, rgb(0 0 0 / 0.08)), 0 12px 28px var(--page-shadow, rgb(0 0 0 / 0.12));
  --fc-ring: var(--fc-accent);
  --fc-transition: 220ms cubic-bezier(0.22, 1, 0.36, 1);
  --fc-card-border-width: 1px;
  --fc-stat-min-height: 17.5rem;
  --fc-stat-top-size: clamp(0.95rem, 2.4cqi, 1.15rem);
  --fc-stat-middle-size: clamp(2.4rem, 11cqi, 4.75rem);
  --fc-stat-bottom-size: clamp(0.95rem, 2.4cqi, 1.15rem);
  --fc-stat-media-max: 7.5rem;
  --fc-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --fc-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --fc-stagger: 65ms;

  display: block;
  container-type: inline-size;
  color-scheme: light dark;
  font-family: var(--fc-font);
  color: var(--fc-fg);
}

:host([hidden]) {
  display: none;
}

.section {
  background: var(--fc-bg);
}

.heading {
  font-size: clamp(1.35rem, 3.5cqi, 1.9rem);
  line-height: 1.2;
  margin: 0 0 clamp(0.75rem, 2cqi, 1.25rem);
}

@media (prefers-reduced-motion: no-preference) {
  .heading {
    animation: fc-heading-enter 560ms var(--fc-ease-out) backwards;
  }
}

@keyframes fc-heading-enter {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ---- layout: auto-fit grid, optionally capped by [columns] --------- */
.grid {
  display: grid;
  gap: var(--fc-gap);
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(var(--fc-card-min), 100%), 1fr)
  );
  list-style: none;
  margin: 0;
  padding: 0;
}

:host([columns]) .grid {
  grid-template-columns: repeat(
    var(--fc-cols, 3),
    minmax(min(var(--fc-card-min), 100%), 1fr)
  );
}

/* ---- card ----------------------------------------------------------- */
.card {
  position: relative;
  display: flex;
  border-radius: var(--fc-radius);
  background: var(--fc-card-bg);
  border: var(--fc-card-border-width) solid var(--fc-card-border);
  box-shadow: var(--fc-shadow);
  overflow: hidden;
  transform-origin: center center;
}

.card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--fc-accent) 14%, transparent),
    transparent 55%
  );
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--fc-transition);
}

.link {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  flex: 1;
  padding: var(--fc-pad);
  border-radius: inherit;
  color: inherit;
  text-decoration: none;
  outline: none;
}

.link:focus-visible {
  outline: 3px solid var(--fc-ring);
  outline-offset: 2px;
}

.eyebrow {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fc-accent);
  transition:
    letter-spacing var(--fc-transition),
    color var(--fc-transition);
}

@media (prefers-reduced-motion: no-preference) {
  .link:hover .eyebrow,
  .link:focus-visible .eyebrow {
    letter-spacing: 0.12em;
  }
}

.title {
  margin: 0;
  font-size: clamp(1.05rem, 2.6cqi, 1.3rem);
  line-height: 1.25;
  transition: transform var(--fc-transition);
}

@media (prefers-reduced-motion: no-preference) {
  .link:hover .title,
  .link:focus-visible .title {
    transform: translateX(2px);
  }
}

.description {
  margin: 0;
  color: var(--fc-muted);
  font-size: 0.95rem;
  line-height: 1.55;
}

.figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.figure-value {
  font-size: clamp(1.9rem, 6cqi, 3.25rem);
  font-weight: 800;
  line-height: 1.05;
  color: var(--fc-accent);
  font-variant-numeric: tabular-nums;
  transition: transform var(--fc-transition);
}

@media (prefers-reduced-motion: no-preference) {
  .link:hover .figure-value,
  .link:focus-visible .figure-value {
    transform: scale(1.03);
  }
}

.figure-label {
  color: var(--fc-muted);
  font-size: 0.85rem;
}

.media {
  margin: 0 0 0.25rem;
}

.media img {
  display: block;
  width: 100%;
  border-radius: calc(var(--fc-radius) - 0.35rem);
  object-fit: cover;
  transition: transform var(--fc-transition);
}

@media (prefers-reduced-motion: no-preference) {
  .link:hover .media img,
  .link:focus-visible .media img {
    transform: scale(1.04);
  }
}

.media .icon {
  font-size: 1.75rem;
  line-height: 1;
}

.cta {
  margin-top: auto;
  padding-top: 0.5rem;
  font-weight: 600;
  color: var(--fc-accent);
  font-size: 0.92rem;
  transition: color var(--fc-transition);
}

.cta::after {
  content: ' \\2192';
  transition: transform var(--fc-transition);
}

.link:hover .cta::after,
.link:focus-visible .cta::after {
  transform: translateX(2px);
}

.state {
  display: grid;
  gap: 0.35rem;
  padding: clamp(1rem, 3cqi, 1.5rem);
  border: 1px dashed var(--fc-card-border);
  border-radius: var(--fc-radius);
  background: color-mix(in srgb, var(--fc-card-bg) 88%, var(--fc-accent));
  color: var(--fc-muted);
}

@media (prefers-reduced-motion: no-preference) {
  .state {
    animation: fc-state-enter 480ms var(--fc-ease-out) backwards;
  }
}

@keyframes fc-state-enter {
  from {
    opacity: 0;
    transform: scale(0.98);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.state-title {
  margin: 0;
  font-weight: 700;
  color: var(--fc-fg);
}

.state-detail {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.45;
}

.state-loading .state-title::after {
  content: '';
  display: inline-block;
  width: 0.45rem;
  height: 0.45rem;
  margin-left: 0.35rem;
  border-radius: 50%;
  background: var(--fc-accent);
  vertical-align: 0.05em;
  animation: fc-pulse 1.2s ease-in-out infinite;
}

.state-error {
  border-style: solid;
  background: color-mix(in srgb, var(--fc-card-bg) 82%, #b91c1c);
}

@keyframes fc-pulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.9);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .state-loading .state-title::after {
    animation: none;
    opacity: 0.7;
  }

  .link:hover .cta::after,
  .link:focus-visible .cta::after {
    transform: none;
  }

  .heading,
  .state,
  .card {
    animation: none;
  }

  .card,
  .card::before,
  .eyebrow,
  .title,
  .figure-value,
  .media img,
  .cta {
    transition: none;
  }
}

/* ---- motion (opt-in only) ------------------------------------------- */
@media (prefers-reduced-motion: no-preference) {
  .card {
    animation: fc-card-enter 620ms var(--fc-ease-out) backwards;
    transition:
      transform var(--fc-transition),
      box-shadow var(--fc-transition),
      border-color var(--fc-transition);
  }

  .card:nth-child(1) {
    animation-delay: 0ms;
  }

  .card:nth-child(2) {
    animation-delay: var(--fc-stagger);
  }

  .card:nth-child(3) {
    animation-delay: calc(var(--fc-stagger) * 2);
  }

  .card:nth-child(4) {
    animation-delay: calc(var(--fc-stagger) * 3);
  }

  .card:nth-child(5) {
    animation-delay: calc(var(--fc-stagger) * 4);
  }

  .card:nth-child(6) {
    animation-delay: calc(var(--fc-stagger) * 5);
  }

  .card:hover,
  .card:has(.link:focus-visible) {
    transform: translateY(-4px);
    box-shadow: var(--fc-shadow-hover);
    border-color: color-mix(in srgb, var(--fc-accent) 35%, var(--fc-card-border));
  }

  .card:hover::before,
  .card:has(.link:focus-visible)::before {
    opacity: 1;
  }

  .card:has(.link:active) {
    transform: translateY(-1px) scale(0.995);
  }
}

@keyframes fc-card-enter {
  from {
    opacity: 0;
    transform: translateY(1rem) scale(0.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-contrast: more) {
  .card {
    border-width: 2px;
  }

  .description,
  .figure-label {
    color: var(--fc-fg);
  }
}

/* ---- container-driven responsiveness -------------------------------- */
@container (max-width: 26rem) {
  .link {
    gap: 0.4rem;
  }
}

@container (min-width: 60rem) {
  .heading {
    margin-bottom: 1.5rem;
  }
}

/* ---- built-in demo themes (mirror the three original 501 cards) ----- */
:host([theme='brand-blue']),
.card[data-theme='brand-blue'] {
  --fc-accent: light-dark(#1d4ed8, #8ab4ff);
  --fc-card-bg: light-dark(#eff4ff, #14233f);
  --fc-card-border: light-dark(#c7d7fe, #2a4374);
}

:host([theme='brand-green']),
.card[data-theme='brand-green'] {
  --fc-accent: light-dark(#047857, #5fd4ab);
  --fc-card-bg: light-dark(#ecfdf5, #0e2b22);
  --fc-card-border: light-dark(#a7f3d0, #1d5c47);
}

:host([theme='brand-amber']),
.card[data-theme='brand-amber'] {
  --fc-accent: light-dark(#b45309, #ffc266);
  --fc-card-bg: light-dark(#fffbeb, #2e2410);
  --fc-card-border: light-dark(#fde68a, #6b5320);
}

/* ---- 501 landing-page stat card themes (reference design) ------------ */
.card[data-theme='501-green'],
.card[data-theme='501-magenta'],
.card[data-theme='501-blue'] {
  --fc-fg: #0a0a0a;
  --fc-muted: #0a0a0a;
  --fc-accent: #0a0a0a;
  --fc-card-border: #0a0a0a;
}

.card[data-theme='501-green'] {
  --fc-card-bg: #c6f135;
}

.card[data-theme='501-magenta'] {
  --fc-card-bg: #e91e8c;
}

.card[data-theme='501-blue'] {
  --fc-card-bg: #29b6f6;
}

/* ---- stat layout (501 module): top / hero / bottom / foot icon -------- */
.card[data-layout='stat'] {
  --fc-radius: 0.35rem;
  --fc-pad: clamp(1.1rem, 3cqi, 1.65rem);
}

.card[data-layout='stat'] .link {
  min-height: var(--fc-stat-min-height);
  justify-content: flex-start;
  gap: 0.35rem;
}

.card[data-layout='stat'] .eyebrow {
  text-transform: none;
  letter-spacing: normal;
  font-size: var(--fc-stat-top-size);
  font-weight: 600;
}

.card[data-layout='stat'] .figure {
  margin: 0.15rem 0 0;
  gap: 0.1rem;
}

.card[data-layout='stat'] .figure-value {
  font-size: var(--fc-stat-middle-size);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.03em;
}

.card[data-layout='stat'] .figure-label {
  font-size: var(--fc-stat-bottom-size);
  font-weight: 600;
}

.card[data-layout='stat'] .eyebrow,
.card[data-layout='stat'] .figure-value,
.card[data-layout='stat'] .figure-label,
.card[data-layout='stat'] .stat-fallback-title {
  color: var(--fc-fg);
}

.card[data-layout='stat'] .media {
  margin-top: auto;
  margin-bottom: 0;
  padding-top: 0.75rem;
  align-self: stretch;
}

.card[data-layout='stat'] .media img {
  width: auto;
  height: var(--fc-stat-media-max);
  max-width: 100%;
  margin-inline: auto;
  object-fit: contain;
  border-radius: 0;
  filter: brightness(0);
}

.card[data-layout='stat'] .stat-fallback-title {
  margin: 0;
  font-size: var(--fc-stat-middle-size);
  font-weight: 800;
  line-height: 1;
}

.card[data-layout='stat'] .cta {
  display: none;
}

.card[data-layout='stat']::before {
  display: none;
}

@media (prefers-reduced-motion: no-preference) {
  .card[data-layout='stat']:hover,
  .card[data-layout='stat']:has(.link:focus-visible) {
    transform: var(--fc-stat-hover-transform, translateY(-2px));
  }
}
`;

let cachedSheet: CSSStyleSheet | undefined;

/**
 * Adopt the component stylesheet into a shadow root, using a shared
 * constructable CSSStyleSheet where supported and falling back to an
 * inline `<style>` element elsewhere (older engines, some test DOMs).
 */
export function adoptStyles(root: ShadowRoot): void {
  try {
    if (!cachedSheet) {
      cachedSheet = new CSSStyleSheet();
      cachedSheet.replaceSync(componentCss);
    }
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, cachedSheet];
  } catch {
    const style = document.createElement('style');
    style.textContent = componentCss;
    root.append(style);
  }
}
