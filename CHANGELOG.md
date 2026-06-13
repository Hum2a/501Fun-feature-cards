# Changelog

All notable changes to this project are documented in this file. The format
is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.2] - 2026-06-13

### Added
- Enhance 501 stat card editor with icon size functionality.
- Implement 501 stat card editor and update documentation.
- Add setup scripts for new contributors.
- Enhance theme transitions and animations for improved user experience.
- Integrate motion effects and transitions across demo components.
- Implement page theme system with dynamic theme selection.
- Schema playground for people who edit JSON for fun.
- Mock CMS Worker now speaks OpenAPI.
- Custom Elements Manifest for IDE autocompletion enthusiasts.
- Optional React wrapper (peer dependency, not our problem).
- CreateFeatureCards() for WordPress themes that fear JSX.
- Apologise in RFC 7807 when your cards are wrong.
- Add agent rules synchronization script and update documentation for new rules structure.
- Enhance demo styles and functionality with new CSS variables, skip link, and CMS status updates.
- Enhance README and scripts for custom domain attachment, including DNS management and error handling.
- Implement custom domain attachment for CMS Worker and enhance deployment scripts with new commands.
- Add lines-of-code reporting tool and update AGENTS documentation with new commands.
- Enhance deployment process with custom domain attachment and support for master branch.
- Add production environment configuration and update deployment process.
### Changed
- Run prettier to satisfy format:check in CI.
- Remove unused imports in run-wrangler script to streamline code.
- Streamline deployment scripts and enhance environment variable loading for Cloudflare integration.
### Fixed
- Update CMS endpoint URLs to use the new custom domain for production and demo environments.
## [1.2.0] - 2026-06-13

### Added

- Imperative `createFeatureCards()` API for non-SPA hosts.
- Optional React wrapper export (`@humza/feature-cards/react`).
- RFC 7807-style `ProblemDetail` on `featurecards:error` (`{ issues, problem }`).
- Custom Elements Manifest (`custom-elements.json`) + VS Code HTML custom data.
- Demo schema playground (edit JSON, live preview).
- CMS cookbook docs (WordPress, Contentful, Sanity) and OpenAPI schema for the mock Worker.
- TypeDoc API reference (`npm run docs:api`).
- MSW contract tests, fast-check fuzz tests, Web Test Runner browser suite, render benchmark.
- CI hardening: CodeQL, Lighthouse workflow, WebKit e2e/a11y, post-deploy CMS smoke, npm provenance.
- Scripts: `validate:cms`, `sri`, `cem`, `cem:check`, `rules:sync:check`.
- Demo page theme system: twelve parody-named themes, animated crossfade picker,
  `localStorage` persistence, and FOUC guard in `index.html`.
- Demo page motion layer: scroll reveals, theme flash, schema/resize pulses; component
  enter/hover animations in `src/styles.ts`.
- Cursor rules 47 (page themes) and 48 (page motion).
- ADR-0006 documenting demo theme and motion infrastructure.
- Housekeeping docs: branching strategy, dependency upgrade plan.
- E2E coverage for theme picker persistence and page reduced-motion chrome.
- Unit tests for page theme tokens, motion helpers, and the React wrapper.

### Changed

- Visual regression baselines are pinned to Chromium; WebKit skips visual tests.
- CI runs MSW contract tests, Prettier format check, browser suite, CEM drift check,
  and uploads TypeDoc artifacts; redundant WebKit-only job removed.
- Lighthouse workflow falls back to `pages.dev` when the production origin is unreachable.
- Post-deploy smoke validates CMS JSON and canary markers without swallowing failures.
- README documents the vibe picker, motion layer, and `master` as the production branch.
- Cookbook CDN examples pin `@humza/feature-cards@1.2`.
- Node toolchain pinned to 22.13+ via `.nvmrc`.

## [1.0.1] - 2026-06-12

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

[Unreleased]: https://github.com/Hum2a/feature-cards/compare/v1.0.2...HEAD
[1.2.0]: https://github.com/Hum2a/feature-cards/compare/v1.0.1...v1.2.0
[1.0.1]: https://github.com/Hum2a/feature-cards/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Hum2a/feature-cards/releases/tag/v1.0.0
[0.0.1]: https://github.com/Hum2a/feature-cards/compare/v0.0.0...v0.0.1

[1.0.2]: https://github.com/Hum2a/feature-cards/compare/v1.0.1...v1.0.2
