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
2. **CI token** — GitHub secret `NPM_TOKEN` = granular token with publish on `@techystuff/feature-cards`.
3. **Provenance** — CI release workflow uses `--provenance`; local publish skips it automatically.

## Publishing workflow

### Preflight

```sh
npm run npm:preflight   # doctor + pack:verify + publish dry-run (when tagged)
```

### Bump version + tag

Use dedicated scripts (Windows-safe — do not use `npm run release --minor` without `--`):

```sh
npm run release:patch    # 1.0.8 → 1.0.9
npm run release:minor    # 1.0.8 → 1.1.0
npm run release:major    # 1.0.8 → 2.0.0
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
| `ENEEDAUTH` | `npm login` or `NPM_TOKEN` |
| `403` + **Two-factor authentication… required** | Enable 2FA; publish with `--otp=CODE` |
| `403` (other) | Not in `@techystuff` org, or token lacks publish |
| Tag ≠ package.json | Align `v1.0.8` with `"version": "1.0.8"` |
| `dist/demo` in tarball | `npm run pack:verify` runs clean + `build:lib` |
| `provenance… provider: null` | Expected locally — script omits `--provenance` |

## Related

- [INSTALL.md](INSTALL.md) — consumer install guide
- [RELEASE.md](RELEASE.md) — full release checklist
- [COMMERCIAL-LICENSING.md](../COMMERCIAL-LICENSING.md)
- Rule **50-npm-package** (`.cursor/rules/`)
