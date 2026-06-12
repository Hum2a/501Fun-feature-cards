# ADR-0005: Container-query responsiveness

**Status:** Accepted  
**Date:** 2026-06-12

## Context

Feature cards must reflow when embedded in narrow sidebars, wide heroes, or resizable
demo panels — not only when the viewport changes. Media queries tied to the viewport
would mis-layout cards inside CMS-driven columns.

## Decision

Use **CSS container queries** on the component host:

- `container-type: inline-size` on `:host`
- `@container` rules for internal spacing and heading rhythm
- Grid layout via `repeat(auto-fit, minmax(min(var(--fc-card-min), 100%), 1fr))`

The `columns` attribute caps track count but does not replace container awareness.

## Consequences

**Positive**

- Cards behave correctly in arbitrary embed contexts (verified by e2e resize test).
- Demonstrates modern CSS without JavaScript resize listeners in the component.
- Aligns with the project's "container over viewport" design rule.

**Negative**

- Container queries require recent browsers (acceptable for this project scope).
- Visual regression snapshots must use element screenshots, not full viewport only.

## Rejected alternatives

| Alternative | Why rejected |
|-------------|--------------|
| Viewport `@media` breakpoints | Wrong abstraction for embeddable components |
| `ResizeObserver` + inline styles | JS layout thrashing; harder to theme |
| Fixed column count only | Breaks narrow containers |
