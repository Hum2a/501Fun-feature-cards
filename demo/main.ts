/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import '@src/index.js';
import { safeParseFeatureCardsData } from '@src/schema.js';
import { initPageThemes } from './themes/page-theme-controller.js';
import {
  flashSchemaValidation,
  initPageMotion,
  pulseResizeReadout,
} from './motion/page-motion.js';
import { initCardEditor } from './editor/card-editor.js';

const LOCAL_CMS =
  import.meta.env.VITE_FC_CMS_ENDPOINT ?? 'http://localhost:8787/api/cards';
const FALLBACK = '/fixtures/cards.json';

type CmsState = 'loading' | 'ready' | 'fallback' | 'error';

/** Update the CMS section status pill. */
function setCmsStatus(el: HTMLElement | null, state: CmsState, detail = ''): void {
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
  const primary = import.meta.env.DEV ? LOCAL_CMS : (configured ?? FALLBACK);

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
    pulseResizeReadout(readout);
  };

  update();
  const observer = new ResizeObserver(update);
  observer.observe(box);
}

/** Interactive schema validator + live preview. */
function wireSchemaPlayground(): void {
  const textarea = document.querySelector<HTMLTextAreaElement>('#schema-input');
  const output = document.querySelector<HTMLElement>('#schema-validation');
  const instance = document.querySelector<HTMLElement>('#schema-instance') as
    | (HTMLElement & { data?: unknown })
    | null;

  if (!textarea || !output || !instance) {
    return;
  }

  const sample = {
    heading: 'Schema preview',
    cards: [
      {
        id: 'schema-1',
        eyebrow: 'Live validation',
        title: 'Edit the JSON',
        description: 'Issues appear instantly using the same Zod schema as production.',
        figure: { value: '1', label: 'canonical schema' },
        cta: { label: 'Read schema.ts', href: '#schema' },
      },
    ],
  };

  textarea.value = JSON.stringify(sample, null, 2);

  const render = (): void => {
    try {
      const parsed: unknown = JSON.parse(textarea.value);
      const result = safeParseFeatureCardsData(parsed);
      if (!result.ok) {
        output.dataset.state = 'error';
        output.textContent = result.issues
          .map((issue) => `${issue.path || '(root)'}: ${issue.message}`)
          .join('\n');
        flashSchemaValidation(output, 'error');
        return;
      }
      output.dataset.state = 'ok';
      output.textContent = `Valid — ${result.data.cards.length} card(s)`;
      instance.data = result.data;
      flashSchemaValidation(output, 'ok');
    } catch (error) {
      output.dataset.state = 'error';
      output.textContent = error instanceof Error ? error.message : String(error);
      flashSchemaValidation(output, 'error');
    }
  };

  textarea.addEventListener('input', render);
  render();
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
initPageThemes();
initPageMotion();
const editorRoot = document.querySelector('#card-editor');
if (editorRoot instanceof HTMLElement) {
  initCardEditor(editorRoot);
}
wirePlayground();
wireSchemaPlayground();
wireResizable();
wireEventLogging();
