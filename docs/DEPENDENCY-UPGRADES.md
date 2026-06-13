# Dependency upgrade plan

Tracked majors deferred from routine housekeeping (2026-06-13). Patch/minor
bumps land via Dependabot or `npm update` in CI.

| Package | Current | Target | Blocker / notes |
| --- | --- | --- | --- |
| `wrangler` | 3.x | 4.x | esbuild audit chain; Worker deploy + wrangler-action v4 |
| `vite` | 6.x | 8.x | tied to vitest/vite-node; run after vitest upgrade |
| `vitest` | 2.x | 4.x | coverage + bench config; breaking API changes |
| `zod` | 3.x | 4.x | Dependabot PR open; schema API review required |
| `typescript` | 5.x | 6.x | wait for eslint/typescript-eslint support |
| `fast-check` | 3.x | 4.x | low priority; fuzz tests only |
| `happy-dom` | 15.x | 20.x | vitest environment compatibility |

## Security

`npm audit` reports **high** severity via `esbuild` in dev tooling (vite,
vitest, wrangler). CI runs audit at `high` with `continue-on-error` until
wrangler 4 migration completes.

## Process

1. Upgrade one major at a time on a dedicated branch.
2. Run `npm run check` locally and in CI.
3. Update this table when merged.
