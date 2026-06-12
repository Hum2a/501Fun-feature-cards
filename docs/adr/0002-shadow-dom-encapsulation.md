# ADR-0002: Shadow DOM for style encapsulation

- Status: accepted
- Date: 2026-06-12

## Context

The component will be dropped into pages whose CSS we cannot see: themes,
resets, utility frameworks, `!important` rules. Style collisions in either
direction are the main way embedded widgets break. Options: light-DOM
rendering with namespaced classes, an iframe, or Shadow DOM.

## Decision

Render into an **open Shadow DOM** with a constructable stylesheet
(`adoptedStyleSheets`, with a `<style>` fallback). Expose theming only
through CSS custom properties (`--fc-*`) and `::part()` hooks.

## Consequences

- Host CSS cannot break the cards; card CSS cannot leak out. The component
  is predictable in any CMS — the core of the "minimal adjustment" claim.
- Theming is an explicit, documented public API instead of "override our
  internal classes and hope": tokens for values, parts for structure.
- Light-DOM children remain meaningful: they are the no-JS fallback and a
  data source (progressive enhancement), surfaced via `<slot>` until data
  renders.
- `mode: 'open'` keeps the root inspectable for tests, axe, and consumers.
- An iframe was rejected: it isolates harder but destroys SEO, heading
  context for assistive tech, container-relative layout, and theming.
