# Contributing

Thanks for your interest! This project is small and opinionated; the rules
below keep it that way.

## Ground rules

- **Zero runtime dependencies** in shipped code (Zod is the single,
  bundled exception). No frameworks, ever.
- Accessibility regressions are release blockers: axe must stay at zero
  violations and keyboard operation must remain complete.
- The canary watermark (`src/watermark.ts`) must not be removed or altered.
- Every source file carries the AGPL-3.0 licence header.

## Getting started

```sh
git clone https://github.com/humza/feature-cards
cd feature-cards
npm install
npm run doctor   # verify your toolchain
npm run dev      # demo at http://localhost:5173
```

## Before you open a PR

1. `npm run check` — typecheck, lint, full test chain, size budget. This is
   the same gate CI runs.
2. New public behaviour needs unit tests; rendered-markup changes must keep
   `npm run test:a11y` green and update visual baselines intentionally
   (`npx playwright test tests/visual --update-snapshots`).
3. Update the README API table and JSDoc for any public API change.
4. Add a changeset (`npx changeset`) describing the change for the
   changelog.

## Commit style

Conventional commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`…). Keep
subjects under ~70 characters and explain the *why* in the body when it
isn't obvious.

## Licence

By contributing you agree your contributions are licensed under
AGPL-3.0-only, the project licence.
