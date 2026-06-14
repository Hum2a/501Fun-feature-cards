# npm publishing (maintainers)

Playbook for publishing **`@techystuff/feature-cards`** to npm. **Consumers** should
read **[INSTALL.md](INSTALL.md)** instead.

| | |
| --- | --- |
| **Package** | `@techystuff/feature-cards` |
| **Org** | [@techystuff](https://www.npmjs.com/org/techystuff) |
| **Licence on npm** | AGPL-3.0-only + legal files in tarball |

## Tarball contents

| Included | Excluded |
| --- | --- |
| `dist/feature-cards.js` (ESM) | `dist/demo/` |
| `dist/feature-cards.iife.js` | `demo/`, `tests/`, `worker/` |
| `dist/react.js` + `dist/types/` | CI configs, source `.ts` |
| `custom-elements.json` | |
| `LICENSE`, `NOTICE`, legal docs | |

Verify: `npm run pack:verify`

## One-time setup

```sh
npm login
npm whoami
npm org ls techystuff   # must list your user
```

1. **2FA** — npm → Settings → Enable 2FA → Authorization and publishing (required to publish).
2. **Trusted publishing (recommended)** — links npm ↔ GitHub and removes long-lived tokens (see below).
3. **CI token (fallback)** — GitHub secret `NPM_TOKEN` = granular token with publish on `@techystuff/feature-cards` if trusted publishing is not configured yet.
4. **Provenance** — enabled in `publishConfig` and CI (`publish-npm.yml`); local publish skips it automatically.

## Link npm package to this GitHub repo

There are **two registries** involved:

| Registry | Package name | Purpose |
| --- | --- | --- |
| [npmjs.com](https://www.npmjs.com/package/@techystuff/feature-cards) | `@techystuff/feature-cards` | **Consumer installs** (`npm install …`) |
| [GitHub Packages](https://github.com/users/Hum2a/packages) | `@hum2a/feature-cards` | **Repo sidebar** “Packages” section |

The repo sidebar only lists packages on **GitHub Packages** (`npm.pkg.github.com`), not npmjs.com.
The workflow publishes to both on every stable tag.

### Step 1 — Configure npm trusted publisher (for npmjs.com)

1. Open [package access settings](https://www.npmjs.com/package/@techystuff/feature-cards/access).
2. **Trusted publishing** → **GitHub Actions**.
3. Set:
   - **Organization or user:** `Hum2a`
   - **Repository:** `feature-cards`
   - **Workflow filename:** `publish-npm.yml` (exact name, including `.yml`)
4. Save. Optionally set **Publishing access** → *Require 2FA and disallow tokens* after verifying CI works.

### Step 2 — Push a release tag (or re-run workflow)

Pushing a stable tag (`v1.1.1`) runs [`.github/workflows/publish-npm.yml`](../.github/workflows/publish-npm.yml), which:

- Publishes `@techystuff/feature-cards` to npm with provenance
- Publishes `@hum2a/feature-cards` to GitHub Packages (populates repo sidebar)

```sh
npm run release:patch   # bump, commit, tag, push → CI publishes both
```

**Re-publish v1.1.1 now:** Actions → **Publish npm package** → Run workflow → tag `v1.1.1`

GitHub Packages appears in the sidebar within a few minutes. npm provenance shows on npmjs.com (green checkmark).

## Publishing workflow

### Preflight

```sh
npm run npm:preflight   # doctor + pack:verify + publish dry-run (when tagged)
```

### Bump version + tag

Use dedicated scripts (Windows-safe — do not use `npm run release --minor` without `--`):

```sh
npm run release:patch    # 1.1.1 → 1.1.2
npm run release:minor    # 1.1.1 → 1.2.0
npm run release:major    # 1.1.1 → 2.0.0
```

See [RELEASE.md](RELEASE.md) for CHANGELOG, automatic version-pin sync, and SRI.

### Publish

When HEAD matches tag `vX.Y.Z`:

```sh
npm run release:package
# Local + 2FA:
node scripts/publish-package.mjs --skip-check --otp=123456
```

Verify: `npm view @techystuff/feature-cards version`

### After publish

Version pins in docs are committed by the release script. Run `npm run sri` if the IIFE bundle changed.

## Dual licensing on npm

Public registry stays AGPL. Commercial buyers install the **same package** under a
signed grant — see [COMMERCIAL-LICENSING.md](../COMMERCIAL-LICENSING.md).

## Troubleshooting

| Error | Fix |
| --- | --- |
| Release created, npm unchanged | npm job failed — check Actions logs; re-run with tag `vX.Y.Z` |
| Sidebar still empty | GitHub Packages job failed; npmjs.com alone does not fill sidebar |
| `ENEEDAUTH` on npm job | Configure [trusted publishing](#step-1--configure-npm-trusted-publisher-for-npmjscom) or set `NPM_TOKEN` |
| `403` + **Two-factor authentication… required** | Enable 2FA; publish with `--otp=CODE` |
| `403` (other) | Not in `@techystuff` org, or token lacks publish |
| Tag ≠ package.json | Align `v1.1.1` with `"version": "1.1.1"` |
| `dist/demo` in tarball | `npm run pack:verify` runs clean + `build:lib` |
| `provenance… provider: null` | Expected locally — script omits `--provenance` |

## Related

- [INSTALL.md](INSTALL.md) — consumer install guide
- [RELEASE.md](RELEASE.md) — full release checklist
- [COMMERCIAL-LICENSING.md](../COMMERCIAL-LICENSING.md)
- Rule **50-npm-package** (`.cursor/rules/`)
