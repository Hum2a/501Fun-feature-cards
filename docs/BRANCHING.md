# Branching strategy

How git branches map to CI, previews, production deploys, and npm releases.

## Branch roles

| Branch | Role | Deploys | npm publish |
| --- | --- | --- | --- |
| **`master`** | Production source of truth | Pages + Worker on merge | Tags only (`v*.*.*`) |
| **`main`** | Optional alias | Same CI as `master` if present | — |
| **Feature branches** | Short-lived work | PR preview (`*.pages.dev`) | Never |
| **Tags `v*.*.*`** | Released versions | Does not auto-deploy demo | Yes (`publish-npm.yml`) |

Production branch name is configured in [`config/site.json`](../config/site.json)
(`productionBranch`, currently **`master`**).

## Standard workflow

```mermaid
gitGraph
  commit id: "master"
  branch feature/housekeeping
  checkout feature/housekeeping
  commit id: "docs: expand README"
  commit id: "test: theme e2e"
  checkout master
  merge feature/housekeeping id: "PR #N"
  commit id: "tag v1.2.0" tag: "v1.2.0"
```

1. **Branch** from latest `master`
   ```sh
   git checkout master && git pull
   git checkout -b feature/my-change
   ```
2. **Develop** — keep commits conventional; run `npm run check` before push
3. **Open PR** into `master` — CI runs full checks + deploy preview comment
4. **Review** — axe, coverage, size budget must pass
5. **Merge** — production deploy + post-deploy smoke (CMS validate + canary)
6. **Delete** merged feature branch (local + remote)

## PR preview deploys

Every pull request triggers the **Deploy** workflow:

- Builds `dist/demo/`
- Uploads to Cloudflare Pages with branch name
- Comments preview URL on the PR

Previews use `*.pages.dev` — not the custom domain. Custom domain attaches
only on **`master`** merges.

## Release vs deploy

These are **independent** pipelines:

| Action | Triggers | Result |
| --- | --- | --- |
| Merge to `master` | Push | Demo + Worker production deploy |
| Push tag `v1.2.0` | Tag push | npm publish + GitHub Release |

Release commits (version bump, changelog) should land on `master` before tagging.
See [RELEASE.md](RELEASE.md).

## Branch naming conventions

| Pattern | Use |
| --- | --- |
| `feature/<name>` | New functionality |
| `fix/<name>` | Bug fixes |
| `docs/<name>` | Documentation-only |
| `chore/<name>` | Tooling, deps, CI |
| `housekeeping` | Maintenance batches (ok for internal work) |

Avoid long-lived branches diverging far from `master`.

## Branch hygiene

After merge, delete stale branches:

```sh
git branch -d feature/my-change
git push origin --delete feature/my-change
```

Known merged remotes to prune periodically: `lol`, `polish`, `animations`,
`theme-parodying` (delete when confirmed merged).

Dependabot branches: review individually; do not bulk-merge without
`npm run check`. Major bumps tracked in [DEPENDENCY-UPGRADES.md](DEPENDENCY-UPGRADES.md).

## Hotfix policy

For production emergencies:

1. Branch from `master`: `fix/critical-issue`
2. Minimal fix + test
3. Fast-track PR
4. Patch release: `npm run release -- --patch --publish`
5. Merge fix to `master` if not already there

## Protected branch expectations

Recommended GitHub settings for `master`:

- Require PR before merge
- Require status checks: **CI / checks** (and deploy if applicable)
- Require linear history (optional)
- Restrict force-push

## Related

- [CONTRIBUTING.md](../CONTRIBUTING.md)
- [RELEASE.md](RELEASE.md)
- [config/site.json](../config/site.json)
