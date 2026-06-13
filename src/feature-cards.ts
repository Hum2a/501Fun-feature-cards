/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import { getAdapter } from './adapters/index.js';
import {
  safeParseFeatureCardsData,
  resolveCardLayout,
  type Card,
  type CardAppearance,
  type FeatureCardsData,
  type Trend,
  type ValidationIssue,
} from './schema.js';
import { adoptStyles } from './styles.js';
import { buildProblemDetail, type FeatureCardsErrorDetail } from './errors.js';
import { applyWatermark, PROVENANCE } from './watermark.js';

/**
 * `<feature-cards>` — a CMS-agnostic, accessible, responsive feature-card
 * section rendered in Shadow DOM.
 *
 * ## Data sources (highest precedence first)
 * 1. The {@link FeatureCardsElement.data | `data` property} set from JS.
 * 2. An inline `<script type="application/json">` child element.
 * 3. The `src` attribute — JSON is fetched and run through the adapter
 *    named by the `adapter` attribute (default `generic`).
 * 4. Light-DOM `<a>` children — progressively enhanced. Without JavaScript
 *    (or before upgrade) those links render and work as-is.
 *
 * ## Attributes
 * - `src` — URL of a JSON endpoint.
 * - `adapter` — `generic` | `wordpress` | `contentful` | `sanity`.
 * - `columns` — caps the number of grid tracks (1–6); otherwise auto-fit.
 * - `heading` — section heading text (overrides the data's `heading`).
 * - `heading-level` — heading level for the section heading, 1–6
 *   (default 2). Card titles render one level deeper.
 * - `theme` — named token set: `brand-blue` | `brand-green` | `brand-amber`.
 *
 * ## Events (all bubble and are composed)
 * - `featurecards:ready` — fired after a successful render;
 *   `detail: { count: number }`.
 * - `featurecards:error` — fired when data is invalid or fetching fails;
 *   `detail: { issues: ValidationIssue[]; problem: ProblemDetail }` (RFC 7807-style).
 *   The component fails safe: existing light-DOM content keeps rendering.
 * - `featurecards:cardclick` — fired when a card is activated;
 *   `detail: { id: string; card: Card }`.
 *
 * ## Slots
 * - *(default)* — fallback content shown before data resolves or when data
 *   is invalid; this is the progressive-enhancement path.
 * - `heading` — replaces the generated section heading.
 *
 * ## Styling
 * See `src/styles.ts` for the full `--fc-*` custom-property token table and
 * the `::part()` hooks (`section`, `heading`, `grid`, `card`, `link`,
 * `eyebrow`, `title`, `description`, `figure`, `value`, `label`, `media`,
 * `cta`).
 */
export class FeatureCardsElement extends HTMLElement {
  /** Attributes that trigger {@link attributeChangedCallback}. */
  static get observedAttributes(): string[] {
    return ['src', 'adapter', 'columns', 'heading', 'heading-level'];
  }

  #shadow: ShadowRoot;
  #explicitData: FeatureCardsData | undefined;
  #renderedData: FeatureCardsData | undefined;
  #abort: AbortController | undefined;
  #stylesAdopted = false;

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open' });
  }

  /**
   * Validated data driving the current render, or `undefined` when nothing
   * has rendered yet. Setting this property takes precedence over every
   * other data source.
   */
  get data(): FeatureCardsData | undefined {
    return this.#renderedData;
  }

  set data(value: FeatureCardsData | undefined) {
    this.#explicitData = value;
    if (value !== undefined && this.isConnected) {
      this.#processData(value);
    }
  }

  /** Inert provenance record for this build (see `src/watermark.ts`). */
  get provenance(): typeof PROVENANCE {
    return PROVENANCE;
  }

  connectedCallback(): void {
    if (!this.#stylesAdopted) {
      adoptStyles(this.#shadow);
      this.#stylesAdopted = true;
    }
    if (this.#shadow.querySelector('slot') === null && this.#renderedData === undefined) {
      // Pre-data state: surface light-DOM children (the no-JS fallback).
      this.#shadow.append(document.createElement('slot'));
    }
    this.#applyColumns();
    void this.#resolveData();
  }

  disconnectedCallback(): void {
    this.#abort?.abort();
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ): void {
    if (!this.isConnected || oldValue === newValue) {
      return;
    }
    switch (name) {
      case 'src':
      case 'adapter':
        void this.#resolveData();
        break;
      case 'columns':
        this.#applyColumns();
        break;
      case 'heading':
      case 'heading-level':
        if (this.#renderedData) {
          this.#render(this.#renderedData);
        }
        break;
      default: {
        const exhaustive: never = name as never;
        void exhaustive;
      }
    }
  }

  /** Resolve the data sources in documented precedence order. */
  async #resolveData(): Promise<void> {
    if (this.#explicitData !== undefined) {
      this.#processData(this.#explicitData);
      return;
    }

    const inline = [...this.children].find(
      (child): child is HTMLScriptElement =>
        child.tagName === 'SCRIPT' && child.getAttribute('type') === 'application/json',
    );
    if (inline?.textContent) {
      try {
        const parsed: unknown = JSON.parse(inline.textContent);
        this.#processData(getAdapter('generic')(parsed));
      } catch (error) {
        this.#emitError([{ path: 'inline-json', message: String(error) }]);
      }
      return;
    }

    const src = this.getAttribute('src');
    if (src) {
      await this.#loadFromSrc(src);
      return;
    }

    const lightDomData = this.#parseLightDomLinks();
    if (lightDomData) {
      this.#processData(lightDomData);
    }
    // No source at all: stay in the slot/fallback state and wait for the
    // `data` property or an attribute change.
  }

  /** Fetch JSON from `src` and reshape it with the configured adapter. */
  async #loadFromSrc(src: string): Promise<void> {
    this.#abort?.abort();
    const controller = new AbortController();
    this.#abort = controller;
    if (this.#renderedData === undefined && this.#hasFallbackContent() === false) {
      this.#showStatus('loading');
    }
    try {
      const response = await fetch(src, { signal: controller.signal });
      if (!response.ok) {
        this.#emitError(
          [{ path: 'src', message: `request failed with HTTP ${response.status}` }],
          { status: response.status },
        );
        return;
      }
      const payload: unknown = await response.json();
      const adapter = getAdapter(this.getAttribute('adapter'));
      this.#processData(adapter(payload));
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      this.#emitError([{ path: 'src', message: String(error) }]);
    }
  }

  /**
   * Build canonical data from plain light-DOM `<a>` children, the
   * progressive-enhancement path. Supported per-anchor data attributes:
   * `data-eyebrow`, `data-description`, `data-figure-value`,
   * `data-figure-label`, `data-theme`, `data-cta`.
   */
  #parseLightDomLinks(): FeatureCardsData | undefined {
    const anchors = [...this.children].filter(
      (child): child is HTMLAnchorElement => child.tagName === 'A',
    );
    if (anchors.length === 0) {
      return undefined;
    }
    const cards: Card[] = anchors.map((anchor, index) => {
      const title = anchor.dataset.title ?? anchor.textContent?.trim() ?? '';
      const href = anchor.getAttribute('href') ?? '#';
      const ctaLabel = anchor.dataset.cta?.trim();
      return {
        id: anchor.id || `card-${index + 1}`,
        title,
        ...(anchor.dataset.eyebrow ? { eyebrow: anchor.dataset.eyebrow } : {}),
        ...(anchor.dataset.description
          ? { description: anchor.dataset.description }
          : {}),
        ...(anchor.dataset.figureValue && anchor.dataset.figureLabel
          ? {
              figure: {
                value: anchor.dataset.figureValue,
                label: anchor.dataset.figureLabel,
              },
            }
          : {}),
        ...(ctaLabel
          ? { cta: { label: ctaLabel, href } }
          : href !== '#'
            ? { cta: { label: title, href } }
            : {}),
        ...(anchor.dataset.theme ? { theme: anchor.dataset.theme } : {}),
      };
    });
    return { cards };
  }

  /** Validate, then render or fail safe. */
  #processData(input: unknown): void {
    const result = safeParseFeatureCardsData(input);
    if (!result.ok) {
      this.#emitError(result.issues);
      return;
    }
    this.#render(result.data);
  }

  /** Replace the shadow content with the rendered card section. */
  #render(data: FeatureCardsData): void {
    this.#renderedData = data;

    const section = document.createElement('section');
    section.className = 'section';
    section.setAttribute('part', 'section');

    const headingLevel = this.#headingLevel();
    const headingText = this.getAttribute('heading') ?? data.heading;
    const headingSlot = document.createElement('slot');
    headingSlot.name = 'heading';
    if (headingText) {
      const heading = document.createElement(`h${headingLevel}`);
      heading.className = 'heading';
      heading.setAttribute('part', 'heading');
      heading.textContent = headingText;
      headingSlot.append(heading);
    }
    section.append(headingSlot);

    const grid = document.createElement('ul');
    grid.className = 'grid';
    grid.setAttribute('part', 'grid');
    // list-style:none strips list semantics in some engines; restore it.
    grid.setAttribute('role', 'list');
    for (const card of data.cards) {
      grid.append(this.#renderCard(card, Math.min(headingLevel + 1, 6)));
    }
    section.append(grid);

    for (const node of [...this.#shadow.children]) {
      if (node.tagName !== 'STYLE') {
        node.remove();
      }
    }
    this.#shadow.append(section);
    applyWatermark(this.#shadow, FeatureCardsElement);

    this.dispatchEvent(
      new CustomEvent('featurecards:ready', {
        bubbles: true,
        composed: true,
        detail: { count: data.cards.length },
      }),
    );
  }

  /** Render one card as a list item wrapping a single full-area link. */
  #renderCard(card: Card, titleLevel: number): HTMLLIElement {
    const layout = resolveCardLayout(card);
    const item = document.createElement('li');
    item.className = 'card';
    item.setAttribute('part', 'card');
    item.dataset.layout = layout;
    if (card.theme) {
      item.dataset.theme = card.theme;
    }
    this.#applyAppearance(item, card.appearance);

    const link = document.createElement('a');
    link.className = 'link';
    link.setAttribute('part', 'link');
    link.href = card.cta?.href ?? '#';
    link.dataset.cardId = card.id;
    if (card.cta?.ariaLabel) {
      link.setAttribute('aria-label', card.cta.ariaLabel);
    } else if (layout === 'stat') {
      const name = [card.eyebrow, card.figure?.value, card.figure?.label]
        .filter(Boolean)
        .join(' ');
      if (name) {
        link.setAttribute('aria-label', name);
      }
    }

    link.addEventListener('click', (event) => {
      if (link.getAttribute('href') === '#') {
        event.preventDefault();
      }
      this.dispatchEvent(
        new CustomEvent('featurecards:cardclick', {
          bubbles: true,
          composed: true,
          detail: { id: card.id, card },
        }),
      );
    });

    if (layout === 'stat') {
      this.#appendStatCardContent(link, card);
    } else {
      this.#appendStandardCardContent(link, card, titleLevel);
    }

    item.append(link);
    return item;
  }

  /** Standard layout: media, eyebrow, title, figure, description, cta. */
  #appendStandardCardContent(link: HTMLAnchorElement, card: Card, titleLevel: number): void {
    if (card.media) {
      link.append(this.#renderMedia(card.media));
    }
    if (card.eyebrow) {
      link.append(this.#renderEyebrow(card.eyebrow));
    }
    if (card.title) {
      const title = document.createElement(`h${titleLevel}`);
      title.className = 'title';
      title.setAttribute('part', 'title');
      title.textContent = card.title;
      link.append(title);
    }
    if (card.figure) {
      link.append(this.#renderFigure(card.figure));
    }
    if (card.description) {
      const description = document.createElement('p');
      description.className = 'description';
      description.setAttribute('part', 'description');
      description.textContent = card.description;
      link.append(description);
    }
    if (card.cta?.label && card.cta.label !== card.title) {
      link.append(this.#renderCta(card.cta.label));
    }
  }

  /** Stat layout: top text, hero value, bottom text, foot media (501 module). */
  #appendStatCardContent(link: HTMLAnchorElement, card: Card): void {
    if (card.eyebrow) {
      link.append(this.#renderEyebrow(card.eyebrow));
    }
    if (card.figure) {
      link.append(this.#renderFigure(card.figure));
    } else if (card.title) {
      const title = document.createElement('p');
      title.className = 'stat-fallback-title';
      title.setAttribute('part', 'title');
      title.textContent = card.title;
      link.append(title);
    }
    if (card.media) {
      link.append(this.#renderMedia(card.media));
    }
    if (card.cta?.label) {
      link.append(this.#renderCta(card.cta.label));
    }
  }

  #renderEyebrow(text: string): HTMLParagraphElement {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.setAttribute('part', 'eyebrow');
    eyebrow.textContent = text;
    return eyebrow;
  }

  #renderFigure(figure: NonNullable<Card['figure']>): HTMLParagraphElement {
    const figureEl = document.createElement('p');
    figureEl.className = 'figure';
    figureEl.setAttribute('part', 'figure');

    const value = document.createElement('span');
    value.className = 'figure-value';
    value.setAttribute('part', 'value');
    value.textContent = figure.value;

    const label = document.createElement('span');
    label.className = 'figure-label';
    label.setAttribute('part', 'label');
    label.textContent = figure.label;

    figureEl.append(value, label);

    if (figure.trend) {
      const trend = document.createElement('span');
      trend.className = 'visually-hidden';
      trend.textContent = ` (${describeTrend(figure.trend)})`;
      figureEl.append(trend);
    }
    return figureEl;
  }

  #renderMedia(media: NonNullable<Card['media']>): HTMLElement {
    const mediaEl = document.createElement('figure');
    mediaEl.className = 'media';
    mediaEl.setAttribute('part', 'media');
    if ('src' in media) {
      const img = document.createElement('img');
      img.src = media.src;
      img.alt = media.alt;
      img.loading = 'lazy';
      if (media.alt === '') {
        img.setAttribute('aria-hidden', 'true');
      }
      mediaEl.append(img);
    } else {
      const icon = document.createElement('span');
      icon.className = 'icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = media.icon;
      mediaEl.append(icon);
    }
    return mediaEl;
  }

  #renderCta(label: string): HTMLSpanElement {
    const cta = document.createElement('span');
    cta.className = 'cta';
    cta.setAttribute('part', 'cta');
    cta.textContent = label;
    return cta;
  }

  #applyAppearance(item: HTMLLIElement, appearance: CardAppearance | undefined): void {
    if (!appearance) {
      return;
    }
    const map: Array<[keyof CardAppearance, string]> = [
      ['background', '--fc-card-bg'],
      ['foreground', '--fc-fg'],
      ['accent', '--fc-accent'],
      ['minHeight', '--fc-stat-min-height'],
      ['borderWidth', '--fc-card-border-width'],
      ['borderColor', '--fc-card-border'],
      ['borderRadius', '--fc-radius'],
      ['topFontSize', '--fc-stat-top-size'],
      ['middleFontSize', '--fc-stat-middle-size'],
      ['bottomFontSize', '--fc-stat-bottom-size'],
      ['mediaMaxHeight', '--fc-stat-media-max'],
      ['fontFamily', '--fc-font'],
    ];
    for (const [key, token] of map) {
      const value = appearance[key];
      if (typeof value === 'string' && value.length > 0) {
        item.style.setProperty(token, value);
      }
    }
    const transforms: string[] = [];
    if (appearance.rotateDeg !== undefined) {
      transforms.push(`rotate(${appearance.rotateDeg}deg)`);
    }
    if (appearance.scale !== undefined) {
      transforms.push(`scale(${appearance.scale})`);
    }
    if (transforms.length > 0) {
      item.style.transform = transforms.join(' ');
    }
  }

  /** Fail safe: emit structured issues, keep fallback content when present. */
  #emitError(issues: ValidationIssue[], context: { status?: number } = {}): void {
    const src = this.getAttribute('src') ?? undefined;
    const detail: FeatureCardsErrorDetail = {
      issues,
      problem: buildProblemDetail(issues, {
        ...(context.status !== undefined ? { status: context.status } : {}),
        ...(src ? { instance: src } : {}),
      }),
    };
    this.dispatchEvent(
      new CustomEvent('featurecards:error', {
        bubbles: true,
        composed: true,
        detail,
      }),
    );
    if (this.#renderedData === undefined && this.#hasFallbackContent() === false) {
      this.#showStatus('error', issues[0]?.message);
    }
  }

  /** Whether light-DOM or inline JSON fallback content is available. */
  #hasFallbackContent(): boolean {
    const hasInlineJson = [...this.children].some(
      (child) =>
        child.tagName === 'SCRIPT' && child.getAttribute('type') === 'application/json',
    );
    const hasLightDomLinks = [...this.children].some((child) => child.tagName === 'A');
    return hasInlineJson || hasLightDomLinks;
  }

  /** Render a loading or error placeholder while fetching remote data. */
  #showStatus(kind: 'loading' | 'error', message = ''): void {
    const panel = document.createElement('div');
    panel.className = `state state-${kind}`;
    panel.setAttribute('part', 'state');
    panel.setAttribute('role', kind === 'loading' ? 'status' : 'alert');
    panel.setAttribute('aria-live', kind === 'loading' ? 'polite' : 'assertive');

    const title = document.createElement('p');
    title.className = 'state-title';
    title.textContent = kind === 'loading' ? 'Loading cards…' : 'Could not load cards';

    panel.append(title);

    if (kind === 'error' && message) {
      const detail = document.createElement('p');
      detail.className = 'state-detail';
      detail.textContent = message;
      panel.append(detail);
    }

    for (const node of [...this.#shadow.children]) {
      if (node.tagName !== 'STYLE') {
        node.remove();
      }
    }
    this.#shadow.append(panel);
  }

  /** Parse `heading-level`, clamped to 1–6, default 2. */
  #headingLevel(): number {
    const raw = Number.parseInt(this.getAttribute('heading-level') ?? '2', 10);
    return Number.isNaN(raw) ? 2 : Math.min(Math.max(raw, 1), 6);
  }

  /** Mirror the `columns` attribute into the `--fc-cols` CSS variable. */
  #applyColumns(): void {
    const raw = Number.parseInt(this.getAttribute('columns') ?? '', 10);
    if (Number.isNaN(raw)) {
      this.style.removeProperty('--fc-cols');
    } else {
      this.style.setProperty('--fc-cols', String(Math.min(Math.max(raw, 1), 6)));
    }
  }
}

/** Screen-reader-friendly description of a figure's trend. */
function describeTrend(trend: Trend): string {
  switch (trend) {
    case 'up':
      return 'increased';
    case 'down':
      return 'decreased';
    case 'flat':
      return 'steady';
    default: {
      const exhaustive: never = trend;
      return exhaustive;
    }
  }
}

/**
 * Register `<feature-cards>` exactly once. Safe to call repeatedly and
 * safe when another copy of the library registered the element first.
 */
export function defineFeatureCards(): void {
  if (!customElements.get('feature-cards')) {
    customElements.define('feature-cards', FeatureCardsElement);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'feature-cards': FeatureCardsElement;
  }
}
