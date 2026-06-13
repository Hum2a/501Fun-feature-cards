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
cp .env.example .env                        # optional: local demo/tooling vars
cp worker/.dev.vars.example worker/.dev.vars  # optional: Worker CORS for local CMS
npm run doctor   # verify your toolchain
npm run dev      # demo at http://localhost:5173
```

## Before you open a PR

1. `npm run check` — typecheck, lint, full test chain, size budget. This is
   the same gate CI runs.
2. New public behaviour needs unit tests; rendered-markup changes must keep
   `npm run test:a11y` green and update visual baselines intentionally
   (`npx playwright test tests/visual --update-snapshots` on **Chromium** —
   visual tests skip WebKit).
3. Demo page UI (theme picker, motion) must follow `.cursor/rules/47-page-themes.mdc`
   and `48-page-motion.mdc`.
4. Update the README API table and JSDoc for any public API change.

## Releasing

Releases are managed with `scripts/release.sh` (Git Bash on Windows, bash
elsewhere). Conventional commits feed the generated `CHANGELOG.md` entries.

```sh
# See the latest tag vs current commit
npm run release:current

# Patch release: bump version, update CHANGELOG, commit, tag, push
npm run release -- --patch

# Minor / major
npm run release -- --minor
npm run release -- --major

# Tag + publish to npm in one step
npm run release -- --patch --publish

# Publish an existing tag (HEAD must match the tag)
npm run release:package
npm run release:package:dry   # dry-run only
```

Pushing a stable `v*.*.*` tag triggers CI to publish `@humza/feature-cards`
to npm and create a GitHub Release. Set the `NPM_TOKEN` secret in the repo
for automated publishes.

Before tagging a release:

1. Run `npm run build:lib` so `custom-elements.json` is current (or `npm run cem:check`).
2. Run `npm run sri` and update cookbook SRI hashes if the IIFE bundle changed.
3. Run `npm run check` locally.

Pre-release tags (`--name beta` → `v1.1.0-beta`) create a GitHub
pre-release but are **not** auto-published to npm unless you run
`npm run release:package -- --allow-prerelease` locally.

## Commit style

Conventional commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`…). Keep
subjects under ~70 characters and explain the *why* in the body when it
isn't obvious.

## Licence

By contributing you agree your contributions are licensed under
AGPL-3.0-only, the project licence.
