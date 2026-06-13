# Accessibility

Accessibility is an **acceptance criterion**, not a nice-to-have. This component
targets **WCAG 2.2 Level AA** for its default token sets and ships with an
automated **axe-core gate at zero violations** plus keyboard integration tests.

For integrator FAQ see [`docs/FAQ.md`](docs/FAQ.md). For test commands see
[`docs/TESTING.md`](docs/TESTING.md).

## Design principles

1. **Native semantics first** — real headings, links, and lists; ARIA only when
   semantics cannot express the pattern.
2. **One activation target per card** — the entire card is a single `<a>`; no
   nested interactive controls fighting for focus.
3. **Fail safe** — invalid data preserves light-DOM fallback links.
4. **User preferences are law** — reduced motion, increased contrast, and colour
   scheme preferences override decorative choices.

## WCAG 2.2 criteria addressed

| Criterion | Level | How we meet it |
| --- | --- | --- |
| 1.1.1 Non-text content | A | Meaningful images: real `alt` from data. Decorative: `alt=""` + `aria-hidden`. Icons: always decorative. |
| 1.3.1 Info and relationships | A | `<section>`, heading hierarchy, list semantics for card grid. |
| 1.3.2 Meaningful sequence | A | DOM order matches reading order; single link per card. |
| 1.4.3 Contrast (minimum) | AA | Default `--fc-*` tokens meet AA in light and dark via `light-dark()`. |
| 1.4.4 Resize text | AA | `rem` / `clamp()` — usable at 200% zoom. |
| 1.4.10 Reflow | AA | Grid reflows to single column in narrow **containers** without horizontal scroll. |
| 1.4.11 Non-text contrast | AA | Focus ring and card borders meet contrast against adjacent colours in default themes. |
| 2.1.1 Keyboard | A | Every card link: Tab focusable, Enter activates. |
| 2.4.3 Focus order | A | DOM order; one tab stop per card. |
| 2.4.6 Headings and labels | AA | Section + card titles; configurable `heading-level`. |
| 2.4.7 Focus visible | AA | 3px `:focus-visible` outline, accent colour, 2px offset. |
| 2.4.11 Focus not obscured | AA | Focus ring not clipped by shadow padding defaults. |
| 2.5.8 Target size | AA | Whole-card links exceed 24×24 CSS px by wide margin. |
| 4.1.2 Name, role, value | A | Link name from visible text or `cta.ariaLabel`. |

> **Integrator responsibility:** overriding `--fc-*` tokens with low-contrast
> colours makes contrast **your** obligation. Defaults are tested.

## Heading strategy

The component cannot know its position in the page outline. Use **`heading-level`**
(1–6, default **2**):

```
Page h1
  └── feature-cards heading-level="2"  →  section h2
        └── card titles                  →  h3
```

If the data omits a section heading, card titles still render at
`heading-level + 1`. Nest correctly by setting `heading-level` one less than
the surrounding heading on the host page.

Override the section heading visually with the **`heading` slot** while keeping
levels programmatically correct.

## Keyboard interaction

| Input | Behaviour |
| --- | --- |
| `Tab` | Move to next card link in DOM order |
| `Shift+Tab` | Move to previous card link |
| `Enter` | Activate focused link; emits `featurecards:cardclick` |

**Deliberately omitted:** arrow-key grid navigation. Cards are a **list of links**,
not a composite widget — browser link semantics are correct and predictable.

## Screen reader experience

| Element | Announcement |
| --- | --- |
| Section | Region with heading (when heading present) |
| Card | Link whose name combines eyebrow, title, figure, description, CTA text |
| Figure trend | Visually-hidden expansion: e.g. "97% customer satisfaction (increased)" |
| Decorative media | Hidden from accessibility tree |

### Accessible name examples

| Data | Computed name (simplified) |
| --- | --- |
| Title + CTA only | "Ship faster — Get started" |
| With figure trend up | Includes "(increased)" context |
| `cta.ariaLabel` set | Uses explicit label instead of concatenation |

## Motion & contrast preferences

| Preference | Component behaviour | Demo page behaviour |
| --- | --- | --- |
| `prefers-reduced-motion: reduce` | `--fc-transition` → `0s`; no hover transforms | `data-motion="reduce"`; no theme crossfade |
| `prefers-contrast: more` | Thicker borders; muted text promoted | High-contrast theme available in picker |
| `prefers-color-scheme` | `light-dark()` token pairs | Page themes also set `color-scheme` |

## Theming API accessibility notes

- Customise via **`--fc-*` tokens** and **`::part()`** — do not inject CSS that
  removes focus outlines.
- **`::part(link):focus-visible`** is the supported focus hook.
- Do not set `pointer-events: none` on parts — cards must remain activatable.

## Testing approach

### Automated (CI gate)

```sh
npm run test:a11y    # axe on full demo — zero violations
npm run test:e2e     # keyboard + reduced motion scenarios
```

### Unit coverage

- Decorative vs meaningful `alt` handling
- Trend announcement strings
- `ariaLabel` plumbing
- Heading level math

### Manual release checklist

- [ ] Tab through all demo cards without trap or skip
- [ ] 200% browser zoom — no clipping or overlap
- [ ] VoiceOver or NVDA on one card with figure + trend
- [ ] Spot check with `prefers-reduced-motion` enabled

## Known limitations

| Limitation | Mitigation |
| --- | --- |
| Shadow DOM on very old assistive tech | No-JS plain links remain fully accessible in light DOM |
| Consumer token overrides | Document contrast responsibility; test after theming |
| Icon-only meaning | Express meaning in text fields; icons are decorative |
| Demo parody themes | Some themes are jokes — `high-contrast-parental-controls` is the serious a11y showcase |

## Reporting accessibility bugs

Treat a11y regressions as **release blockers**. File a GitHub issue with:

1. WCAG criterion affected (if known)
2. Browser + assistive tech versions
3. Reduced test case JSON or URL
4. Expected vs actual behaviour

Security issues use the private channel in [SECURITY.md](SECURITY.md).

---

**Related:** [README § Accessibility](README.md#accessibility) ·
[ADR-0002](docs/adr/0002-shadow-dom-encapsulation.md) (open shadow for testing)
