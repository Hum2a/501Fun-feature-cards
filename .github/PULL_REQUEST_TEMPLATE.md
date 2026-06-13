## What

<!-- One sentence: what does this PR change? -->

## Why

<!-- Link issue (#123) or explain motivation. What problem does this solve? -->

## How

<!-- Optional: approach notes for reviewers — adapter? demo-only? breaking? -->

## Screenshots / recordings

<!-- Required for visual, motion, or theme changes. Before/after if helpful. -->

## Checklist

- [ ] `npm run check` passes locally
- [ ] New public behaviour has unit tests
- [ ] Rendered-markup changes keep axe at **zero** violations (`npm run test:a11y`)
- [ ] Visual baselines updated intentionally on **Chromium** if layout changed
- [ ] README / `docs/` updated for public API or integration changes
- [ ] Demo UI follows rules **46–48** (themes/motion) if applicable
- [ ] `npm run rules:sync` run if `.cursor/rules/` changed
- [ ] No new runtime dependencies; AGPL headers on new source files
- [ ] CEM updated if public custom element API changed (`npm run cem:check`)

## Test plan

<!-- How did you verify? Copy commands or manual steps. -->

```sh
# Example
npm run check
npm run test:e2e
```

## Docs

<!-- Which docs did you update? Link paths if non-obvious. -->

- [ ] README API table
- [ ] `docs/SCHEMA.md`
- [ ] Cookbook(s)
- [ ] ADR (if architectural)
