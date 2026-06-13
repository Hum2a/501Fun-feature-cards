# ADR-0005: Container-query responsiveness

| | |
| --- | --- |
| **Status** | Accepted |
| **Date** | 2026-06-12 |
| **Related** | ADR-0002 (layout inside shadow root) |

## Context

Feature cards must reflow correctly when embedded in:

- Full-width marketing bands
- ~280px sidebar widgets
- Resizable demo panels (explicit requirement in demo)
- CMS column layouts of unknown width

**Viewport media queries** answer "how wide is the browser?" — not "how wide is
the widget?" A component that only listens to viewport breakpoints mis-layouts
in narrow columns on wide screens (and vice versa).

## Decision

Size the component using **CSS container queries** on the host:

```css
:host {
  container-type: inline-size;
  container-name: feature-cards;
}

@container feature-cards (max-width: 480px) {
  /* tighter spacing, smaller heading rhythm */
}
```

Combined with:

- **Grid:** `repeat(auto-fit, minmax(min(var(--fc-card-min), 100%), 1fr))`
- **Fluid type:** `clamp()` on title and figure sizes
- **`columns` attribute (1–6):** caps track count when layout requires it —
  does **not** replace container awareness

**No JavaScript resize listeners** for layout in the component core.

## Rationale

Container queries are the correct abstraction for **embeddable Web Components**
in CMS-driven layouts where the author controls column width, not viewport.

`ResizeObserver` + inline styles would:

- Cause layout thrashing
- Fight theming (inline overrides tokens)
- Add JS where CSS suffices

Fixed column counts alone fail narrow containers — cards would overflow or
shrink illegibly.

## Consequences

### Positive

- Verified by e2e test resizing `#resizable` container (not viewport)
- Demonstrates modern CSS competency aligned with project rules
- Works inside Shadow DOM without leaking queries to host
- Grid auto-fit reduces author decisions — responsive by default

### Negative

- Requires browsers with container query support (acceptable project scope)
- Visual regression uses **element screenshots**, not viewport-only captures
- Authors must not set `display: contents` on host in ways that break containment
- `columns` attribute can fight auto-fit if set too high for narrow containers

## Rejected alternatives

| Alternative | Why rejected |
| --- | --- |
| Viewport `@media` breakpoints | Wrong axis for embeddable widgets |
| `ResizeObserver` + inline styles | JS layout; harder to theme; perf cost |
| Fixed column count only | Breaks narrow embed contexts |
| `%` width hacks | Unpredictable in flex/grid parent contexts |

## Compliance

- E2E: `tests/e2e/demo.spec.ts` container responsiveness
- Demo: resizable showcase section
- No viewport `@media` in component styles (project rule)

## References

- [ARCHITECTURE.md](../../ARCHITECTURE.md)
- [MDN: CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
