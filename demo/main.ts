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

/**
 * Point the third instance at the mock Worker when it's running locally,
 * otherwise fall back to the bundled static fixture so the demo always
 * renders (including on the deployed Pages site, where the Worker URL can
 * be configured via a meta tag).
 */
async function wireCmsInstance(): Promise<void> {
  const instance = document.querySelector('#cms-instance');
  if (!instance) {
    return;
  }
  const configured = document
    .querySelector('meta[name="fc-cms-endpoint"]')
    ?.getAttribute('content');
  const candidates = [configured, LOCAL_CMS].filter(
    (url): url is string => typeof url === 'string' && url.length > 0,
  );
  for (const url of candidates) {
    try {
      const probe = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(1500),
      });
      if (probe.ok) {
        instance.setAttribute('src', url);
        return;
      }
    } catch {
      // Worker not running at this URL — try the next candidate.
    }
  }
  instance.setAttribute('src', FALLBACK);
}

/** Live CSS-custom-property controls for the theming playground. */
function wirePlayground(): void {
  const form = document.querySelector<HTMLFormElement>('#playground');
  const target = document.querySelector<HTMLElement>('#inline-instance');
  if (!form || !target) {
    return;
  }
  form.addEventListener('input', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const unit = input.dataset.unit ?? '';
    target.style.setProperty(input.name, `${input.value}${unit}`);
  });
  form.addEventListener('reset', () => {
    for (const input of form.querySelectorAll<HTMLInputElement>('input')) {
      target.style.removeProperty(input.name);
    }
  });
}

/** Drag-to-resize wrapper proving container-query behaviour. */
function wireResizable(): void {
  const box = document.querySelector<HTMLElement>('#resizable');
  if (!box) {
    return;
  }
  // CSS resize handles the interaction; nothing else needed.
  box.style.resize = 'horizontal';
  box.style.overflow = 'auto';
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

void wireCmsInstance();
wirePlayground();
wireResizable();
wireEventLogging();
