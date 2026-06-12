# Sanity integration cookbook

Use the Sanity adapter to map GROQ query results to feature cards.

## Example GROQ query

```groq
*[_type == "featureCard"] | order(_createdAt desc) {
  "id": _id,
  eyebrow,
  title,
  description,
  "figure": {
    "value": statValue,
    "label": statLabel,
    "trend": statTrend
  },
  "cta": {
    "label": ctaLabel,
    "href": ctaUrl
  },
  theme
}
```

Expose the query via Sanity's HTTP API or a small edge function that returns JSON.

## Element usage

```html
<feature-cards
  src="https://PROJECT.api.sanity.io/v2021-06-07/data/query/production?query=..."
  adapter="sanity"
></feature-cards>
```

The adapter accepts either `{ result: [...] }` (query API) or a bare array — see
`src/adapters/sanity.ts`.

## Studio preview

In Sanity Studio, preview the same JSON shape in Vision and paste it into the demo
schema playground (`#schema-playground`) to validate before wiring production `src`.
