# ADR-0003: Canonical schema + CMS adapter layer

| | |
| --- | --- |
| **Status** | Accepted |
| **Date** | 2026-06-12 |
| **Related** | [SCHEMA.md](../SCHEMA.md) |

## Context

Headless CMS payloads share no common shape:

| CMS | Typical response |
| --- | --- |
| WordPress | `{ id, title: { rendered }, _embedded, acf }` |
| Contentful | `{ items: [{ fields: { … } }] }` |
| Sanity | `{ result: […] }` or bare array |

Coupling the renderer to any one CMS — or to a lowest-common-denominator JSON —
forces rendering changes for every new integration.

## Decision

1. Define **one canonical schema** — `Card`, `FeatureCardsData` in `src/schema.ts`
2. Validate with **Zod** at runtime (`safeParse` — non-throwing)
3. Map CMS payloads via pure **`adapter` functions** (~40 lines each)
4. Select adapter through **`adapter` attribute** + `getAdapter()` registry
5. Default **`generic`** adapter normalises already-canonical JSON

The renderer imports **zero CMS-specific code**.

## Rationale

"CMS-agnostic with minimal adjustment" becomes concrete:

```
New CMS = one mapper + one registry line
```

Not: fork the component, add conditional branches, or expose CMS types in public API.

Zod earns its ~12 KiB gzip budget:

- Single source of truth for TS types (`z.infer`)
- Structured validation issues → `featurecards:error`
- Property-based fuzz tests guard invariants

Hand-rolled validation was rejected — false economy; error paths would be ad hoc.

## Consequences

### Positive

- WordPress, Contentful, Sanity ship as examples — not special cases in core
- Invalid CMS data fails safe (event + slot fallback)
- Contract tests (MSW) lock adapter behaviour
- Cookbooks document field mapping per CMS

### Negative

- Adapters are **lossy** — unmapped CMS fields are dropped
- Zod is the **only** bundled runtime dependency
- Adapter maintenance when CMS APIs change (expected, isolated)
- Consumers with exotic shapes preprocess to canonical JSON themselves

## Error handling

Invalid data **never throws**:

```ts
safeParseFeatureCardsData(input)
  → { success: false, issues: [...] }
  → emit featurecards:error
  → preserve light DOM
```

## Compliance

- [docs/SCHEMA.md](../SCHEMA.md) documents every field
- Cookbooks per CMS
- `npm run test:contracts` in CI
- `npm run test:fuzz` for schema properties

## References

- [ARCHITECTURE.md](../../ARCHITECTURE.md)
- `src/adapters/wordpress.ts` — reference adapter size (~40 lines)
