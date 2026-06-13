# Architecture diagrams

Visual companion to [ARCHITECTURE.md](../../ARCHITECTURE.md) and
[docs/adr/](../adr/). Mermaid renders on GitHub and most Markdown viewers.

## Data source precedence & render flow

```mermaid
flowchart TB
  subgraph sources["Data sources (precedence ↓ top wins)"]
    P["① data property"]
    J["② inline JSON script"]
    F["③ src fetch"]
    L["④ light-DOM links"]
  end

  subgraph adapters["CMS adapters (on ③ only)"]
    G[generic]
    W[wordpress]
    C[contentful]
    S[sanity]
  end

  subgraph core["Component core"]
    Z["Zod safeParse"]
    CE["FeatureCardsElement"]
    SD["Shadow DOM + adoptedStyleSheets"]
  end

  P --> Z
  J --> G --> Z
  F --> adapters --> Z
  L --> Z
  Z -->|valid| CE --> SD
  Z -->|invalid| E["featurecards:error"]
  CE --> R["featurecards:ready"]
  CE --> K["featurecards:cardclick"]
  CE --> WM["canary watermark (inert)"]
```

## Adapter layer

```mermaid
flowchart LR
  WP["WordPress REST"] --> AW[wordpress adapter]
  CF["Contentful items[]"] --> AC[contentful adapter]
  SA["Sanity GROQ result"] --> AS[sanity adapter]
  GN["Canonical JSON"] --> AG[generic adapter]

  AW --> SCH["FeatureCardsData"]
  AC --> SCH
  AS --> SCH
  AG --> SCH

  SCH --> REN["Renderer"]
```

## Deploy topology

```mermaid
flowchart TB
  subgraph gh["GitHub"]
    PR[Pull Request]
    M[master branch]
    TAG[v*.*.* tag]
  end

  subgraph cf["Cloudflare"]
    PAGES["Pages — demo static"]
    WORKER["Worker — mock CMS"]
  end

  subgraph npmreg["npm"]
    PKG["@humza/feature-cards"]
  end

  PR -->|preview deploy| PAGES
  M -->|production deploy| PAGES
  M --> WORKER
  TAG --> PKG

  PAGES --> DEMO["501fun.humza-butt.space"]
  WORKER --> CMS["cms.501fun.humza-butt.space"]
```

## Demo vs shipped layers

```mermaid
flowchart TB
  subgraph npm["Published npm bundle"]
    FC["src/ — feature-cards"]
    TOK["--fc-* tokens"]
  end

  subgraph demo["Demo only (not in npm API)"]
    PT["demo/themes/ — --page-*"]
    PM["demo/motion/"]
    PG["schema playground"]
  end

  PAGE["Browser page"] --> FC
  PAGE --> PT
  PAGE --> PM
  FC --> TOK
  PT -.->|fallback cascade| FC
```

## Theme & motion stack (demo)

```mermaid
sequenceDiagram
  participant User
  participant Picker as theme picker
  participant LS as localStorage
  participant HTML as html[data-page-theme]
  participant CSS as page-themes.css

  User->>Picker: select theme
  Picker->>LS: fc-page-theme
  Picker->>HTML: data-page-theme + color-scheme
  HTML->>CSS: @property crossfade (~720ms)
  Note over CSS: skipped if prefers-reduced-motion
```

## CI quality gates

```mermaid
flowchart LR
  subgraph checks["checks job"]
    TC[typecheck]
    LT[lint + format]
    UT[coverage + fuzz + contracts]
    CE[cem:check]
    BD[build + size]
    AX[a11y + e2e + visual layout]
  end

  subgraph parallel["parallel jobs"]
    BR[browser WTR]
    BM[benchmark]
  end

  TC --> LT --> UT --> CE --> BD --> AX
```

## Related reading

| Topic | Document |
| --- | --- |
| Narrative architecture | [ARCHITECTURE.md](../../ARCHITECTURE.md) |
| Schema fields | [SCHEMA.md](../SCHEMA.md) |
| Demo themes | [DEMO.md](../DEMO.md) |
| ADRs | [docs/adr/](../adr/) |
