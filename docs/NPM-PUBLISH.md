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

GitHub shows `@techystuff/feature-cards` in the repository sidebar when the package is
published from CI with a matching `repository` field in `package.json` (already set to
`Hum2a/feature-cards`).

### Step 1 — Configure npm trusted publisher

1. Open [package access settings](https://www.npmjs.com/package/@techystuff/feature-cards/access).
2. **Trusted publishing** → **GitHub Actions**.
3. Set:
   - **Organization or user:** `Hum2a`
   - **Repository:** `feature-cards`
   - **Workflow filename:** `publish-npm.yml` (exact name, including `.yml`)
4. Save. Optionally set **Publishing access** → *Require 2FA and disallow tokens* after verifying CI works.

### Step 2 — Push a release tag

Pushing a stable tag (`v1.1.0`) runs [`.github/workflows/publish-npm.yml`](../.github/workflows/publish-npm.yml), which:

- Verifies `package.json` version and `repository.url` match the repo
- Runs tests and `npm publish --provenance --access public`
- Attaches provenance on [npmjs.com](https://www.npmjs.com/package/@techystuff/feature-cards) (green checkmark → source commit link)

```sh
npm run release:patch   # bump, commit, tag, push → CI publishes
```

Within a few minutes, the repo sidebar should show the npm package. If it does not appear after the first CI publish, confirm the `repository.url` in `package.json` and republish a patch from CI (local publishes do not establish the link).

### Manual re-run

Actions → **Publish npm package** → **Run workflow** → enter an existing tag (e.g. `v1.1.0`) if a publish failed but the tag is already pushed.

## Publishing workflow

### Preflight

```sh
npm run npm:preflight   # doctor + pack:verify + publish dry-run (when tagged)
```

### Bump version + tag

Use dedicated scripts (Windows-safe — do not use `npm run release --minor` without `--`):

```sh
npm run release:patch    # 1.1.0 → 1.1.1
npm run release:minor    # 1.1.0 → 1.2.0
npm run release:major    # 1.1.0 → 2.0.0
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
| `ENEEDAUTH` | Configure [trusted publishing](#link-npm-package-to-this-github-repo) or set `NPM_TOKEN` |
| Trusted publish fails | Workflow filename must be exactly `publish-npm.yml`; repo name case-sensitive |
| `403` + **Two-factor authentication… required** | Enable 2FA; publish with `--otp=CODE` |
| `403` (other) | Not in `@techystuff` org, or token lacks publish |
| Tag ≠ package.json | Align `v1.1.0` with `"version": "1.1.0"` |
| `dist/demo` in tarball | `npm run pack:verify` runs clean + `build:lib` |
| `provenance… provider: null` | Expected locally — script omits `--provenance` |

## Related

- [INSTALL.md](INSTALL.md) — consumer install guide
- [RELEASE.md](RELEASE.md) — full release checklist
- [COMMERCIAL-LICENSING.md](../COMMERCIAL-LICENSING.md)
- Rule **50-npm-package** (`.cursor/rules/`)
