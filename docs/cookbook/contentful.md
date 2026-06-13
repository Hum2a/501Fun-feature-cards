# Contentful integration cookbook

Map a Contentful content type to the canonical card schema via the built-in adapter.

## Content model (suggested)

| Field ID | Type | Maps to |
|----------|------|---------|
| `internalId` | Short text | `id` |
| `eyebrow` | Short text | `eyebrow` |
| `title` | Short text | `title` |
| `description` | Long text | `description` |
| `statValue` | Short text | `figure.value` |
| `statLabel` | Short text | `figure.label` |
| `ctaLabel` | Short text | `cta.label` |
| `ctaUrl` | Short text | `cta.href` |
| `theme` | Short text | `theme` |

## Delivery API query

```
GET https://cdn.contentful.com/spaces/{space}/environments/master/entries?content_type=featureCard&access_token=...
```

## Element usage

```html
<feature-cards
  src="https://cdn.contentful.com/spaces/SPACE/environments/master/entries?content_type=featureCard&access_token=TOKEN"
  adapter="contentful"
  heading="From Contentful"
></feature-cards>
```

The adapter in `src/adapters/contentful.ts` normalises Contentful's `items[]`
envelope into `{ cards: [...] }`.

## Webhook → static JSON (optional)

For static sites, use a Contentful webhook to rebuild a JSON file on deploy and
point `src` at that file with `adapter="generic"`.
