# ADR-0001: Web Component over framework component

| | |
| --- | --- |
| **Status** | Accepted |
| **Date** | 2026-06-12 |
| **Deciders** | Project author |
| **Related** | ADR-0002, ADR-0003 |

## Context

The brief asks for a reusable replacement for three hard-coded feature-card
**images**, deployable to an **unknown CMS** with **minimal adjustment**, using
**native browser APIs** where possible.

### Candidates considered

| Approach | CMS reach | Runtime cost | Build requirement |
| --- | --- | --- | --- |
| React / Vue / Svelte component | Framework sites only | Framework + reconciler | Consumer bundler |
| Lit / Stencil | Broad | Small compiler/runtime | Build step |
| Server partial (PHP/Twig) | Single stack | None | Server template |
| **Native Custom Element** | **Any JS-capable page** | **None (beyond ~25 KiB component)** | **Optional for consumer** |

The hiring brief explicitly rewards native APIs and CMS agnosticism — not
framework ecosystem depth.

## Decision

Build a native **Custom Element** (`<feature-cards>`):

- Authored in **strict TypeScript**
- Shipped as **vanilla ESM** + **self-registering IIFE**
- **Zero framework runtime** in the published bundle
- Optional **`@techystuff/feature-cards/react`** wrapper for teams that want JSX ergonomics

Registration via `customElements.define`; lifecycle via standard callbacks;
rendering via DOM APIs and constructable stylesheets.

## Rationale

1. **WordPress PHP themes** will never adopt React for one widget.
2. **Script tag integration** is the lowest-friction CMS path.
3. **Progressive enhancement** maps naturally to custom elements upgrading existing markup.
4. **Long-term maintenance** avoids N framework wrappers (React, Vue, Svelte, …).

Lit and Stencil were evaluated favourably but rejected: at this component's
size, their runtime/compiler adds bytes and conceptual overhead without
unlocking capabilities native APIs lack.

## Consequences

### Positive

- Works anywhere JavaScript runs — static HTML, SSR pages, legacy portals
- No consumer version matrix (`react@18` vs `19`, etc.) for the core
- Framework users wrap; non-framework users don't pay for unused runtime
- Aligns with portfolio positioning: platform primitives over app frameworks

### Negative

- We own lifecycle, a11y, and re-render semantics that frameworks abstract
- Test suite must cover integration concerns (e2e, a11y, visual)
- DX is `querySelector` + properties/events — not JSX unless wrapper used
- SSR story is "enhance client-side" — server renders fallback links

## Compliance

- README documents script tag, ESM, imperative, and React paths
- `createFeatureCards()` API for non-module hosts
- React wrapper is **optional peer dependency**, not bundled in core

## References

- [ARCHITECTURE.md](../../ARCHITECTURE.md)
- [MDN: Using custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
