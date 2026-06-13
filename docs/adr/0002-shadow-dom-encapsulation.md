# ADR-0002: Shadow DOM for style encapsulation

| | |
| --- | --- |
| **Status** | Accepted |
| **Date** | 2026-06-12 |
| **Related** | ADR-0005 (container layout inside shadow) |

## Context

Embedded widgets land on pages with unpredictable CSS: CSS resets, utility
frameworks, `!important` theme rules, legacy CMS class names. Collisions cause:

- Host styles breaking widget layout/typography
- Widget styles leaking and affecting host navigation/forms

### Options

| Option | Encapsulation | Theming story | a11y / SEO |
| --- | --- | --- | --- |
| Light DOM + BEM classes | Weak | Class overrides | Native |
| CSS Modules (build-time) | Medium | Host must compile | Native |
| **Shadow DOM** | **Strong** | **Tokens + parts** | Good (open mode) |
| iframe | Total | Painful | Poor |

## Decision

Render card UI into an **open Shadow DOM** root with:

- **Constructable stylesheets** (`adoptedStyleSheets`) + `<style>` fallback
- Public theming via **`--fc-*` CSS custom properties** on `:host`
- Structural hooks via documented **`::part(...)`** selectors
- **Default slot** preserving light-DOM children for progressive enhancement

`mode: 'open'` — shadow root inspectable by tests, axe, and debugging tools.

## Rationale

The brief requires dropping into **arbitrary CMS pages** with **minimal
adjustment**. Light-DOM-only widgets routinely break in production themes;
support burden falls on widget authors. Shadow DOM makes the component
**predictable** while keeping an explicit, documented styling contract.

iframe isolation was rejected: breaks heading hierarchy for assistive tech,
hurts SEO context, prevents container-relative layout, and complicates theming.

## Consequences

### Positive

- Host CSS cannot accidentally zero out card padding or hide focus rings
- Card CSS cannot pollute host `.button` or `a` styles
- Theming is **API-driven** (`--fc-accent`) not "inspect our classes"
- Slot preserves no-JS links and invalid-data fallback

### Negative

- Consumers cannot style arbitrary internal nodes — only tokens/parts
- Global design systems must map brand tokens → `--fc-*`
- Very old browsers lack full shadow DOM (fallback links still work)
- Visual regression tests target element screenshots

## Theming contract

Documented in README and [SCHEMA.md](../SCHEMA.md):

```css
feature-cards {
  --fc-accent: var(--brand-primary);
}
feature-cards::part(link):focus-visible { /* allowed */ }
feature-cards .internal-card-class { /* NOT supported */ }
```

## Compliance

- All internal styles in `src/styles.ts` / constructable sheet
- No undocumented `::slotted` styling requirements for consumers
- Focus visible styles on `::part(link)`

## References

- [ARCHITECTURE.md](../../ARCHITECTURE.md)
- [ACCESSIBILITY.md](../../ACCESSIBILITY.md)
