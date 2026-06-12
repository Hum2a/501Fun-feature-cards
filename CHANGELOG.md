# Changelog

All notable changes to this project are documented in this file. The format
is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-06-12

### Added

- `<feature-cards>` Custom Element with Shadow DOM, adopted stylesheets,
  and progressive enhancement from plain light-DOM links.
- Four data sources with documented precedence: `data` property, inline
  JSON, `src` fetch + adapter, light-DOM anchors.
- Canonical Zod-validated `Card` / `FeatureCardsData` schema with a
  non-throwing `safeParse` helper.
- CMS adapter layer: `generic`, `wordpress`, `contentful`, `sanity`, plus a
  registry (`getAdapter`).
- Theming API: `--fc-*` custom-property token layer, `::part()` hooks,
  three built-in themes (`brand-blue`, `brand-green`, `brand-amber`),
  adaptive light/dark via `light-dark()`.
- Container-query responsiveness (no viewport media queries), grid
  `auto-fit` layout, `clamp()` fluid type, `columns` cap.
- Accessibility: configurable `heading-level`, single-link cards, trend
  announcements, reduced-motion and contrast support; axe gate at zero
  violations (see `ACCESSIBILITY.md`).
- Events: `featurecards:ready`, `featurecards:error`,
  `featurecards:cardclick`.
- Canary watermark (inert authorship markers) and read-only
  `canary:verify` CLI (see `SECURITY.md`).
- Demo landing page with three instantiation modes, theming playground,
  and container-resize showcase; mock Cloudflare Worker CMS endpoint.
- Full test stack: Vitest unit suite (90%+ coverage thresholds), axe-core
  a11y gate, Playwright e2e, visual baselines.
- CI/CD: GitHub Actions for checks, Cloudflare Pages/Worker deployment,
  tag-based npm releases via `scripts/release.sh`.

[Unreleased]: https://github.com/Hum2a/feature-cards/compare/v0.0.1...HEAD
[1.0.0]: https://github.com/humza/feature-cards/releases/tag/v1.0.0

[0.0.1]: https://github.com/Hum2a/feature-cards/compare/v0.0.0...v0.0.1
