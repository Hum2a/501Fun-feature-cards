# Branching strategy

| Branch | Purpose |
| --- | --- |
| `master` | Production — deploys to Cloudflare Pages/Worker (`config/site.json` → `productionBranch`) |
| `main` | CI alias — same checks as `master` if present |
| Feature branches | Short-lived (`housekeeping`, `theme-parodying`, …) → PR into `master` |

## Workflow

1. Branch from `master`.
2. Open PR — CI + deploy preview comment on PRs.
3. Merge to `master` — production deploy + post-deploy smoke.
4. Delete merged feature branches (local and remote) after merge.

## Releases

Version tags (`v*.*.*`) on `master` trigger npm publish when `NPM_TOKEN` is set.
Use `npm run release -- --minor` (or `--patch`) before tagging.
