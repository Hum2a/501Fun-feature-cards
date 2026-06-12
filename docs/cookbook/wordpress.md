# WordPress integration cookbook

Embed `<feature-cards>` in a classic theme or block theme without a JavaScript framework.

## 1. Enqueue the script

```php
// functions.php
add_action('wp_enqueue_scripts', function () {
  wp_enqueue_script(
    'feature-cards',
    'https://cdn.jsdelivr.net/npm/@humza/feature-cards@1/dist/feature-cards.iife.js',
    [],
    '1.0.1',
    true
  );
});
```

Use the SRI hash from `npm run sri` after each release.

## 2. Render the element

```php
<section class="feature-cards-host">
  <feature-cards
    src="<?php echo esc_url(rest_url('wp/v2/feature-cards')); ?>"
    adapter="wordpress"
    heading="<?php esc_attr_e('Why teams choose us', 'my-theme'); ?>"
    heading-level="2"
  ></feature-cards>
</section>
```

## 3. REST endpoint shape

The built-in `wordpress` adapter expects an array of posts with `title.rendered`,
`link`, optional `excerpt.rendered`, `_embedded['wp:featuredmedia']`, and ACF
fields mapped in `src/adapters/wordpress.ts`.

## 4. Imperative mount (optional)

```html
<div id="cards"></div>
<script type="module">
  import { createFeatureCards } from 'https://cdn.jsdelivr.net/npm/@humza/feature-cards@1/+esm';
  createFeatureCards({
    target: '#cards',
    src: '/wp-json/custom/v1/cards',
    adapter: 'wordpress',
  });
</script>
```

## Progressive enhancement

Without JavaScript, enqueue plain `<a>` links inside `<feature-cards>` as
documented in the README — the component upgrades them on load.
