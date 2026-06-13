# ADR-0006: Demo page themes and motion infrastructure

| | |
| --- | --- |
| **Status** | Accepted |
| **Date** | 2026-06-13 |
| **Scope** | Demo landing page only — **not npm public API** |
| **Related** | [DEMO.md](../DEMO.md), rules 47 & 48 |

## Context

The demo landing page outgrew a single `light-dark()` palette:

- Twelve parody-named **page themes** with picker UI
- **Animated crossfades** between theme token sets
- **Scroll reveals**, hero stagger, validation/resize pulses
- **Component-level** enter/hover motion polish

Ad hoc colours and one-off `@keyframes` would drift from accessibility
guarantees (`prefers-reduced-motion`, axe zero violations).

## Decision

### 1. Page themes — `demo/themes/`

| File | Responsibility |
| --- | --- |
| `page-theme-tokens.ts` | IDs, parody names, `localStorage` key, apply/resolve |
| `page-themes.css` | Full `--page-*` block per `[data-page-theme]` |
| `page-theme-transitions.css` | `@property` colour interpolation (~720ms) |
| `page-theme-controller.ts` | Picker wiring, crossfade orchestration |

### 2. Page motion — `demo/motion/`

| File | Responsibility |
| --- | --- |
| `page-motion.css` | Durations, easings, keyframes, chrome animation |
| `page-motion.ts` | Scroll reveal, theme flash, schema/resize pulses |

### 3. Component motion — `src/styles.ts`

- `--fc-transition` token
- Enter / hover / active animations on cards
- Demo `--page-*` fallbacks on `:host` for unthemed cards in demo context

### 4. Governance

- **Cursor rules 47 & 48** — token-first themes; mandatory motion patterns
- **FOUC guard** in `demo/index.html` synced with token constants
- **E2E tests** — theme persistence, reduced-motion chrome

## Rationale

Separating **demo chrome** from **shipped component** keeps npm bundle focused
while letting the landing page showcase polish without polluting the public
theming API (`--fc-*` only in integrator docs).

Centralised token files prevent "one-off hex in demo.css" regression — every
new theme adds a complete `--page-*` set.

## Consequences

### Positive

- Demo is a credible showcase for hiring/portfolio reviewers
- Accessibility rules enforced by convention + CI
- Theme choice persists (`fc-page-theme` in `localStorage`)
- Crossfade degrades gracefully (overlay flash without `@property`)

### Negative

- Demo-only complexity — integrators must not copy `--page-*` to production
- Font stacks may swap instantly (`--page-font` not interpolated)
- Every new theme = registry + CSS block + picker option
- Browsers without `@property` get shorter flash fallback

## Explicit non-goals

- Shipping page themes in npm package
- Documenting `--page-*` in README public API (demo docs only)
- Animating layout properties that trigger reflow jank

## Compliance

- [DEMO.md](../DEMO.md) documents theme list and architecture
- Unit tests for token helpers and motion utilities
- `prefers-reduced-motion` honoured in component and demo

## References

- [ADR-0002](0002-shadow-dom-encapsulation.md) — component tokens vs demo tokens
- `.cursor/rules/47-page-themes.mdc`, `48-page-motion.mdc`
