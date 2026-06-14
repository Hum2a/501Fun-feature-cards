# Release playbook

Step-by-step guide for shipping `@techystuff/feature-cards` to GitHub, npm, and
production. Read [CONTRIBUTING.md](../CONTRIBUTING.md) for contributor context;
[BRANCHING.md](BRANCHING.md) for branch policy.

## Version policy

[Semantic Versioning](https://semver.org/) + [Keep a Changelog](https://keepachangelog.com/).

| Bump | When |
| --- | --- |
| **PATCH** | Bug fixes, docs-only npm metadata, non-breaking internal changes |
| **MINOR** | New features, adapters, optional schema fields, demo enhancements |
| **MAJOR** | Breaking public API, schema removals, validation tightening |

Current version lives in `package.json` and [CHANGELOG.md](../CHANGELOG.md).

## Pre-release checklist

Run on **`master`** (or release branch) with a clean tree:

```sh
npm run doctor          # toolchain OK
npm run check           # full gate
npm run cem:check       # custom-elements.json fresh (or npm run build:lib)
npm run sri             # copy hash for cookbook/CDN docs if IIFE changed
npm run canary:verify -- https://501fun.humza-butt.space   # optional smoke
```

Before tagging:

1. **`CHANGELOG.md`** — move `[Unreleased]` entries into a dated version section
2. **`custom-elements.json`** — matches generator (`npm run cem:check`)
3. **Version pins** — `npm run release:patch|minor|major` updates `package.json` and all doc pins automatically (`scripts/sync-version-pins.mjs`); run `npm run sri` if the IIFE hash changed
4. **Visual baselines** — updated if markup changed (`tests/visual/`)

## Release commands

Uses `scripts/run-release.mjs` (Node) wrapping version bump logic:

```sh
# Inspect state
npm run release:current

# Bump + changelog + commit + tag + push (use dedicated scripts on Windows)
npm run release:patch    # 1.1.0 → 1.1.1
npm run release:minor    # 1.1.0 → 1.2.0
npm run release:major    # 1.1.0 → 2.0.0

# Alternative: flags after `--` (npm run release --minor does NOT work)
npm run release -- --minor

# Dry run (no git writes)
npm run release:dry-run
npm run release:dry-run:minor

# Tag + npm publish in one step (requires npm login + 2FA OTP locally)
npm run release:patch -- --publish
```

### Preflight (before every publish)

```sh
npm run npm:preflight   # doctor + pack:verify + publish dry-run (when tagged)
```

See **[NPM.md](NPM.md)** for first-time npm account setup and commercial dual-licensing.

### Publish an existing tag

When HEAD already matches a pushed tag:

```sh
npm run release:package
# Local publish with 2FA:
node scripts/publish-package.mjs --skip-check --otp=123456
npm run release:package:dry   # validation only
```

### Pre-releases

```sh
npm run release -- --minor --name beta
# → v1.3.0-beta — GitHub pre-release, NOT auto-published to npm
npm run release:package -- --allow-prerelease   # manual npm pre-release
```

## Automated CI publish

Pushing a stable **`v*.*.*`** tag to GitHub triggers the release workflow when
`NPM_TOKEN` is configured:

1. Build library (`build:lib`)
2. Run tests
3. Publish to npm with provenance
4. Create GitHub Release from tag notes

Secrets required: **`NPM_TOKEN`**.

## Post-release

| Task | Command / action |
| --- | --- |
| Verify npm | `npm view @techystuff/feature-cards version` |
| Verify tarball | `npm run pack:verify` |
| Verify demo | `npm run canary:verify -- https://501fun.humza-butt.space` |
| SRI (if IIFE changed) | `npm run sri` — cookbook hash snippets only |
| GitHub Release notes | Auto from tag; add highlights if needed |
| Dependabot | Triage major bumps per [DEPENDENCY-UPGRADES.md](DEPENDENCY-UPGRADES.md) |

Production deploy happens on **merge to `master`**, not on npm tag — tag and deploy
are independent unless you merge release commits to master.

## Deployment (demo + mock CMS)

Merge to `master` → GitHub Actions **Deploy** workflow:

1. Build demo → Cloudflare Pages
2. Attach custom domain (`501fun.humza-butt.space`)
3. Deploy Worker → `cms.501fun.humza-butt.space`
4. Post-deploy smoke: CMS JSON validate + canary verify

Manual deploy (maintainers):

```sh
npm run deploy
```

Requires `.env` with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

See [README § Deployment](../README.md#deployment).

## Rollback

| Surface | Rollback |
| --- | --- |
| **npm** | Deprecate bad version; publish patch — npm unpublish is discouraged |
| **Pages** | Redeploy previous commit via Cloudflare dashboard or revert merge on `master` |
| **Worker** | `wrangler deploy` previous script version |
| **Git tag** | Delete remote tag only if publish failed before consumers fetched |

## Release artefact matrix

| Artefact | Updated when | Verify with |
| --- | --- | --- |
| `dist/feature-cards.js` | every release | `npm pack`, `npm run size` |
| `dist/feature-cards.iife.js` | every release | `npm run sri` |
| `dist/types/` | every release | `npm run typecheck` |
| `custom-elements.json` | API surface change | `npm run cem:check` |
| `docs/api/` | optional | `npm run docs:api` |
| Cookbook SRI | IIFE hash change | `npm run sri` |

## Related

- [BRANCHING.md](BRANCHING.md)
- [SECURITY.md](../SECURITY.md) — canary verification
- [CHANGELOG.md](../CHANGELOG.md)
