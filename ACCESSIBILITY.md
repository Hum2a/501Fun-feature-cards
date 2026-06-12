# Accessibility

Accessibility is an acceptance criterion for this component, verified by an
automated axe-core gate (zero violations) and by hand with a keyboard. This
document records what is addressed, how, and what the limits are.

## WCAG 2.2 criteria addressed

| Criterion | How |
| --- | --- |
| 1.1.1 Non-text content | Meaningful images get real `alt` text from the data; decorative images get `alt=""` + `aria-hidden="true"`; icons are always `aria-hidden`. |
| 1.3.1 Info and relationships | Semantic structure: `<section>`, real headings, a `role="list"` card list, `<article>`-free single-link cards. No ARIA where semantics suffice. |
| 1.3.2 Meaningful sequence | DOM order matches visual order; the whole card is one link, so there is no split reading order. |
| 1.4.3 Contrast (minimum) | All token defaults meet AA in light and dark schemes; the axe gate includes `color-contrast`. |
| 1.4.4 Resize text | All type uses `rem`/`clamp()`; nothing breaks at 200% zoom. |
| 1.4.10 Reflow | CSS Grid `auto-fit` + container queries reflow to one column in narrow containers with no horizontal scroll. |
| 2.1.1 Keyboard | Every card is a link: reachable with Tab, activated with Enter. No custom key handling to get wrong, no focus trap. |
| 2.4.3 Focus order | Cards follow DOM order; one tab stop per card. |
| 2.4.6 Headings and labels | Section heading + per-card title headings; `heading-level` lets the host page keep a correct outline. |
| 2.4.7 / 2.4.13 Focus visible/appearance | A 3px `:focus-visible` outline in the accent colour, offset 2px, on every card link. |
| 2.5.8 Target size | Whole-card links far exceed 24×24px. |
| 4.1.2 Name, role, value | Links have accessible names from their content, or `cta.ariaLabel` when the data provides one. Events don't replace native link behaviour. |

## Heading strategy

The component cannot know where it sits in a page outline, so the
`heading-level` attribute (1–6, default 2) sets the section heading's level
and card titles render one level deeper. If the data supplies no section
heading, card titles still render at `heading-level + 1` — set
`heading-level` to one less than the surrounding heading to nest correctly.

## Keyboard map

| Key | Behaviour |
| --- | --- |
| `Tab` / `Shift+Tab` | Move between card links in DOM order |
| `Enter` | Activate the focused card (follows the link, emits `featurecards:cardclick`) |

There are deliberately no arrow-key grid semantics: cards are a list of
links, not a composite widget, so standard link interaction is correct.

## Screen-reader behaviour

- The section announces as a region with its heading.
- Each card announces as a link whose name is the card's text content
  (eyebrow, title, figure, description, CTA) or the explicit `ariaLabel`.
- Figure trends get visually-hidden context — "97% customer satisfaction
  (increased)" — instead of an unexplained arrow glyph.

## Motion and contrast preferences

- `prefers-reduced-motion: reduce` — all transitions and hover transforms
  are disabled (motion is only ever applied under `no-preference`).
- `prefers-contrast: more` — card borders thicken and muted text is
  promoted to full foreground colour.
- `light-dark()` tokens adapt to `prefers-color-scheme` automatically.

## Testing approach

- **Automated:** `npm run test:a11y` drives the full demo (all rendering
  modes) through axe-core via Playwright and fails on any violation.
- **Unit-level:** decorative/meaningful alt handling, trend announcements,
  `aria-label` plumbing, and heading levels are unit-tested.
- **Manual:** keyboard walk-through and zoom checks are part of the release
  checklist.

## Known limitations

- The component renders into Shadow DOM; assistive tech released before
  ~2020 may have degraded shadow-root support. The no-JS fallback (plain
  links) remains fully accessible in those environments.
- Colour tokens can be overridden by consumers; contrast then becomes the
  consumer's responsibility. The defaults are AA-safe.
- `icon` media renders the supplied glyph as decorative; if an icon is the
  only carrier of meaning, the data should express that meaning in text.
