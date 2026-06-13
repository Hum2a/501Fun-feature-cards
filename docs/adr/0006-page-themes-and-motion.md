# ADR-0006: Demo page themes and motion infrastructure

## Status

Accepted — 2026-06-13

## Context

The demo landing page grew beyond a single `light-dark()` palette: twelve
parody-named page themes, animated theme crossfades, scroll reveals, and
component-level motion polish. Ad hoc colours and one-off animations would
drift from accessibility guarantees (`prefers-reduced-motion`, axe).

## Decision

1. **Page themes** live in `demo/themes/`:
   - `page-theme-tokens.ts` — ids, parody names, apply/resolve helpers
   - `page-themes.css` — all `--page-*` colour values per `[data-page-theme]`
   - `page-theme-transitions.css` — `@property` registration for crossfades
   - `page-theme-controller.ts` — picker wiring and `localStorage`

2. **Page motion** lives in `demo/motion/`:
   - `page-motion.css` — durations, easings, keyframes, demo chrome animation
   - `page-motion.ts` — scroll reveal, theme flash, validation/resize pulses

3. **Component motion** extends `src/styles.ts` with `--fc-transition` and
   enter/hover/active animations; demo page tokens cascade into un-themed
   cards via `--page-*` fallbacks on `:host`.

4. **Cursor rules 47 and 48** enforce token-first themes and mandatory motion
   for new demo/component UI.

## Consequences

- Demo-only infrastructure; not part of the published npm bundle API.
- Theme font stacks may still swap instantly (`--page-font` is not interpolated).
- Browsers without `@property` colour animation fall back to a short overlay flash.
- Every new theme requires a full token block in `page-themes.css` and a registry entry.
