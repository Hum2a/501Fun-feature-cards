/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { safeParseFeatureCardsData, type Card, type FeatureCardsData } from '@src/schema.js';
import {
  cloneCards,
  createBlankCard,
  DEFAULT_501_CARDS,
  EDITOR_STORAGE_KEY,
} from './card-editor-defaults.js';
import {
  LUCIDE_ICON_CATALOG,
  resolveIconSrc,
  type LucideIconOption,
} from './icon-catalog.js';

const THEME_PRESETS: Array<{ id: string; label: string; background: string }> = [
  { id: '501-green', label: '501 green', background: '#c6f135' },
  { id: '501-magenta', label: '501 magenta', background: '#e91e8c' },
  { id: '501-blue', label: '501 blue', background: '#29b6f6' },
];

function loadStored(): FeatureCardsData {
  try {
    const raw = localStorage.getItem(EDITOR_STORAGE_KEY);
    if (!raw) {
      return cloneCards(DEFAULT_501_CARDS);
    }
    const parsed: unknown = JSON.parse(raw);
    const result = safeParseFeatureCardsData(parsed);
    if (!result.ok) {
      return cloneCards(DEFAULT_501_CARDS);
    }
    for (const card of result.data.cards) {
      if (card.media && 'src' in card.media) {
        card.media.src = resolveIconSrc(card.media.src);
      }
    }
    return result.data;
  } catch {
    return cloneCards(DEFAULT_501_CARDS);
  }
}

function persist(data: FeatureCardsData): void {
  localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify(data));
}

function ensureAppearance(card: Card): NonNullable<Card['appearance']> {
  card.appearance ??= {};
  return card.appearance;
}

function readIconSrc(form: HTMLFormElement): string {
  const selected = form.querySelector<HTMLInputElement>('input[name="iconSrc"]:checked');
  return selected?.value ?? resolveIconSrc(undefined);
}

function syncIconPickerSelection(picker: HTMLElement, src: string): void {
  const resolved = resolveIconSrc(src);
  for (const input of picker.querySelectorAll<HTMLInputElement>('input[name="iconSrc"]')) {
    input.checked = input.value === resolved;
  }
}

function renderIconPicker(picker: HTMLElement, onSelect: () => void): void {
  picker.replaceChildren();
  for (const icon of LUCIDE_ICON_CATALOG) {
    picker.append(createIconOption(icon, onSelect));
  }
}

function createIconOption(icon: LucideIconOption, onSelect: () => void): HTMLLabelElement {
  const label = document.createElement('label');
  label.className = 'card-editor-icon-option';

  const input = document.createElement('input');
  input.type = 'radio';
  input.name = 'iconSrc';
  input.value = icon.src;
  input.addEventListener('change', onSelect);

  const preview = document.createElement('span');
  preview.className = 'card-editor-icon-preview';
  preview.setAttribute('aria-hidden', 'true');

  const img = document.createElement('img');
  img.src = icon.src;
  img.alt = '';
  img.width = 28;
  img.height = 28;
  img.loading = 'lazy';
  img.decoding = 'async';
  preview.append(img);

  const caption = document.createElement('span');
  caption.className = 'card-editor-icon-label';
  caption.textContent = icon.label;

  label.append(input, preview, caption);
  return label;
}

/** Interactive 501-style card editor — core task deliverable for the brief. */
export function initCardEditor(root: HTMLElement): void {
  const preview = root.querySelector<HTMLElement>('#card-editor-preview');
  const jsonOut = root.querySelector<HTMLElement>('#card-editor-json');
  const tabs = root.querySelector<HTMLElement>('#card-editor-tabs');
  const coreForm = root.querySelector<HTMLFormElement>('#card-editor-core');
  const advancedForm = root.querySelector<HTMLFormElement>('#card-editor-advanced');
  const sectionHeading = root.querySelector<HTMLInputElement>('#editor-section-heading');
  const iconPicker = root.querySelector<HTMLElement>('#card-editor-icon-picker');

  if (
    !preview ||
    !jsonOut ||
    !tabs ||
    !coreForm ||
    !advancedForm ||
    !sectionHeading ||
    !iconPicker
  ) {
    return;
  }

  let data = loadStored();
  let selected = 0;

  const renderPreview = (): void => {
    const payload: FeatureCardsData = {
      ...data,
      heading: sectionHeading.value.trim() || undefined,
    };
    const result = safeParseFeatureCardsData(payload);
    jsonOut.textContent = JSON.stringify(payload, null, 2);
    if (!result.ok) {
      jsonOut.textContent = result.issues.map((i) => `${i.path}: ${i.message}`).join('\n');
      return;
    }
    (preview as HTMLElement & { data?: FeatureCardsData }).data = result.data;
    persist(result.data);
  };

  const renderTabs = (): void => {
    tabs.replaceChildren();
    data.cards.forEach((card, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'card-editor-tab';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(index === selected));
      btn.textContent = card.eyebrow || card.figure?.value || `Card ${index + 1}`;
      btn.addEventListener('click', () => {
        selected = index;
        renderTabs();
        syncFormsFromCard();
        renderPreview();
      });
      tabs.append(btn);
    });
  };

  const currentCard = (): Card => {
    const card = data.cards[selected];
    if (!card) {
      data.cards[selected] = createBlankCard(selected);
    }
    return data.cards[selected]!;
  };

  const syncFormsFromCard = (): void => {
    const card = currentCard();
    const appearance = card.appearance ?? {};
    const iconSrc =
      card.media && 'src' in card.media ? resolveIconSrc(card.media.src) : resolveIconSrc(undefined);

    sectionHeading.value = data.heading ?? '';

    const set = (name: string, value: string | number): void => {
      const el = coreForm.elements.namedItem(name);
      if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) {
        el.value = String(value);
      }
      const adv = advancedForm.elements.namedItem(name);
      if (adv instanceof HTMLInputElement || adv instanceof HTMLSelectElement) {
        adv.value = String(value);
      }
    };

    set('topText', card.eyebrow ?? '');
    set('middleText', card.figure?.value ?? '');
    set('bottomText', card.figure?.label ?? '');
    syncIconPickerSelection(iconPicker, iconSrc);
    set('background', appearance.background ?? '#c6f135');
    set('foreground', appearance.foreground ?? '#0a0a0a');
    set('rotateDeg', appearance.rotateDeg ?? 0);
    set('scale', appearance.scale ?? 1);
    set('minHeight', appearance.minHeight?.replace('rem', '') ?? '18');
    set('theme', card.theme ?? '501-green');

    set('topFontSize', appearance.topFontSize?.replace('rem', '') ?? '');
    set('middleFontSize', appearance.middleFontSize?.replace('rem', '') ?? '');
    set('bottomFontSize', appearance.bottomFontSize?.replace('rem', '') ?? '');
    set('borderWidth', appearance.borderWidth?.replace('px', '') ?? '0');
    set('borderColor', appearance.borderColor ?? '#0a0a0a');
    set('borderRadius', appearance.borderRadius?.replace('rem', '') ?? '');
    set('mediaMaxHeight', appearance.mediaMaxHeight?.replace('rem', '') ?? '7.5');
    set('fontFamily', appearance.fontFamily ?? '');

    syncRangeOutputs(coreForm);
    syncRangeOutputs(advancedForm);
  };

  const applyFormToCard = (): void => {
    const card = currentCard();
    const appearance = ensureAppearance(card);
    const val = (name: string): string => {
      const el = coreForm.elements.namedItem(name) ?? advancedForm.elements.namedItem(name);
      if (el instanceof RadioNodeList) {
        return el.value;
      }
      if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) {
        return el.value;
      }
      return '';
    };

    card.layout = 'stat';
    const top = val('topText').trim();
    const middle = val('middleText').trim();
    const bottom = val('bottomText').trim();
    card.eyebrow = top || undefined;
    card.figure = middle && bottom ? { value: middle, label: bottom } : undefined;
    delete card.title;
    delete card.description;

    const iconSrc = readIconSrc(coreForm);
    card.media = iconSrc ? { src: iconSrc, alt: '' } : undefined;

    appearance.background = val('background');
    appearance.foreground = val('foreground');
    appearance.rotateDeg = Number.parseFloat(val('rotateDeg')) || 0;
    appearance.scale = Number.parseFloat(val('scale')) || 1;
    const minH = val('minHeight');
    appearance.minHeight = minH ? `${minH}rem` : undefined;

    card.theme = val('theme') || undefined;

    const rem = (name: string): string | undefined => {
      const v = val(name).trim();
      return v ? `${v}rem` : undefined;
    };
    appearance.topFontSize = rem('topFontSize');
    appearance.middleFontSize = rem('middleFontSize');
    appearance.bottomFontSize = rem('bottomFontSize');
    const bw = val('borderWidth').trim();
    appearance.borderWidth = bw ? `${bw}px` : undefined;
    appearance.borderColor = val('borderColor') || undefined;
    appearance.borderRadius = rem('borderRadius');
    appearance.mediaMaxHeight = rem('mediaMaxHeight');
    const ff = val('fontFamily').trim();
    appearance.fontFamily = ff || undefined;

    data.heading = sectionHeading.value.trim() || undefined;
    syncRangeOutputs(coreForm);
    renderTabs();
    renderPreview();
  };

  renderIconPicker(iconPicker, applyFormToCard);

  coreForm.addEventListener('input', applyFormToCard);
  advancedForm.addEventListener('input', applyFormToCard);
  sectionHeading.addEventListener('input', renderPreview);

  root.querySelector('#card-editor-add')?.addEventListener('click', () => {
    data.cards.push(createBlankCard(data.cards.length));
    selected = data.cards.length - 1;
    renderTabs();
    syncFormsFromCard();
    renderPreview();
  });

  root.querySelector('#card-editor-remove')?.addEventListener('click', () => {
    if (data.cards.length <= 1) {
      return;
    }
    data.cards.splice(selected, 1);
    selected = Math.min(selected, data.cards.length - 1);
    renderTabs();
    syncFormsFromCard();
    renderPreview();
  });

  root.querySelector('#card-editor-reset')?.addEventListener('click', () => {
    data = cloneCards(DEFAULT_501_CARDS);
    selected = 0;
    renderTabs();
    syncFormsFromCard();
    renderPreview();
  });

  root.querySelector('#card-editor-copy')?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(jsonOut.textContent ?? '');
  });

  renderTabs();
  syncFormsFromCard();
  renderPreview();
}

function syncRangeProgress(input: HTMLInputElement): void {
  const min = Number.parseFloat(input.min);
  const max = Number.parseFloat(input.max);
  const value = Number.parseFloat(input.value);
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  input.style.setProperty('--range-progress', `${pct}%`);
}

function syncRangeOutputs(form: HTMLFormElement): void {
  for (const input of form.querySelectorAll<HTMLInputElement>('input[type="range"]')) {
    syncRangeProgress(input);
    const out = form.querySelector<HTMLOutputElement>(`output[for="${input.id}"]`);
    if (out) {
      const unit = input.dataset.unit ?? '';
      out.textContent = `${input.value}${unit}`;
    }
  }
}

export { LUCIDE_ICON_CATALOG, THEME_PRESETS };
