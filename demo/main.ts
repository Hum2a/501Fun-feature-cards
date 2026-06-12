/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import '@src/index.js';

const LOCAL_CMS =
  import.meta.env.VITE_FC_CMS_ENDPOINT ?? 'http://localhost:8787/api/cards';
const FALLBACK = '/fixtures/cards.json';

type CmsState = 'loading' | 'ready' | 'fallback' | 'error';

/** Update the CMS section status pill. */
function setCmsStatus(
  el: HTMLElement | null,
  state: CmsState,
  detail = '',
): void {
  if (!el) {
    return;
  }
  el.dataset.state = state;
  const messages: Record<CmsState, string> = {
    loading: detail || 'Connecting to the mock CMS…',
    ready: detail ? `Loaded from ${detail}` : 'Loaded from the mock CMS',
    fallback: 'Live CMS unavailable — showing bundled fixture',
    error: 'Could not load cards — check the console for details',
  };
  el.textContent = messages[state];
}

/**
 * Point the CMS instance at the mock Worker (dev) or production endpoint,
 * falling back to the bundled fixture on error — one fetch, no probe.
 */
function wireCmsInstance(): void {
  const instance = document.querySelector('#cms-instance');
  const status = document.querySelector<HTMLElement>('#cms-status');
  if (!instance) {
    return;
  }

  const configured = document
    .querySelector('meta[name="fc-cms-endpoint"]')
    ?.getAttribute('content');
  const primary = import.meta.env.DEV
    ? LOCAL_CMS
    : (configured ?? FALLBACK);

  setCmsStatus(status, 'loading');

  let triedFallback = false;

  instance.addEventListener('featurecards:ready', () => {
    const src = instance.getAttribute('src') ?? '';
    if (src.includes('fixtures')) {
      setCmsStatus(status, triedFallback ? 'fallback' : 'ready', 'static fixture');
      return;
    }
    setCmsStatus(status, 'ready', shortenUrl(src));
  });

  instance.addEventListener('featurecards:error', () => {
    if (!triedFallback && instance.getAttribute('src') !== FALLBACK) {
      triedFallback = true;
      setCmsStatus(status, 'loading', 'Trying bundled fallback…');
      instance.setAttribute('src', FALLBACK);
      return;
    }
    setCmsStatus(status, 'error');
  });

  instance.setAttribute('src', primary);
}

/** Live CSS-custom-property controls for the theming playground. */
function wirePlayground(): void {
  const form = document.querySelector<HTMLFormElement>('#playground');
  const target = document.querySelector<HTMLElement>('#playground-instance');
  if (!form || !target) {
    return;
  }

  const rangeOutputs: Array<[string, string]> = [
    ['--fc-radius', 'radius-out'],
    ['--fc-card-min', 'min-out'],
  ];

  const syncOutput = (input: HTMLInputElement): void => {
    const pair = rangeOutputs.find(([name]) => name === input.name);
    if (!pair) {
      return;
    }
    const output = document.getElementById(pair[1]);
    if (output) {
      output.textContent = `${input.value}${input.dataset.unit ?? ''}`;
    }
  };

  form.addEventListener('input', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const unit = input.dataset.unit ?? '';
    target.style.setProperty(input.name, `${input.value}${unit}`);
    syncOutput(input);
  });

  form.addEventListener('reset', () => {
    requestAnimationFrame(() => {
      for (const input of form.querySelectorAll<HTMLInputElement>('input')) {
        target.style.removeProperty(input.name);
        syncOutput(input);
      }
    });
  });

  for (const input of form.querySelectorAll<HTMLInputElement>('input[type="range"]')) {
    syncOutput(input);
  }
}

/** Show live container width while the resizable wrapper is dragged. */
function wireResizable(): void {
  const box = document.querySelector<HTMLElement>('#resizable');
  const readout = document.querySelector<HTMLElement>('#resize-readout');
  if (!box || !readout) {
    return;
  }

  const update = (): void => {
    const width = Math.round(box.getBoundingClientRect().width);
    readout.textContent = `Container width: ${width}px`;
  };

  update();
  const observer = new ResizeObserver(update);
  observer.observe(box);
}

/** Log component events so the console shows the public event API. */
function wireEventLogging(): void {
  document.addEventListener('featurecards:ready', (event) => {
    console.info('[feature-cards] ready', (event as CustomEvent).detail);
  });
  document.addEventListener('featurecards:error', (event) => {
    console.warn('[feature-cards] error', (event as CustomEvent).detail);
  });
  document.addEventListener('featurecards:cardclick', (event) => {
    console.info('[feature-cards] cardclick', (event as CustomEvent).detail);
  });
}

/** Shorten a URL for the status pill. */
function shortenUrl(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    return `${hostname}${pathname === '/' ? '' : pathname}`;
  } catch {
    return url;
  }
}

wireCmsInstance();
wirePlayground();
wireResizable();
wireEventLogging();
