# Shopify Online Store 2.0 compatibility pass

This branch modernizes the Speaking Roses theme without replacing the storefront's configured legacy sections.

## What changed

- Restores the complete historical `config/settings_schema.json` that was accidentally reduced to an empty array on `main`.
- Renders Shopify's `content_for_header` directly and exactly once so app embeds and Shopify-managed storefront scripts can load normally.
- Removes whole-page `<body>` capture/minification from `layout/theme.liquid`.
- Keeps the existing Shipping Bar, custom header, mobile menu, cart drawer, footer, Judge.me/Yotpo/Loox, Recharge, Limespot, tracking, BCPO, zoom, and Custom Price Calculator integration points.
- Decouples the cart page from the Product Page “disable recently viewed” preference. The historical schema has no separate cart-page preference, so cart behavior is no longer incorrectly controlled by the product-page toggle.
- Adds an Online Store 2.0-compatible Custom Liquid section.
- Adds header/footer section-group scaffolds for the next migration phase.

## Why the header/footer groups are not activated yet

The current `settings_data.json` stores real storefront configuration under legacy static section IDs such as `shipping_bar` and `custom-header`. Switching `theme.liquid` to section groups immediately would create new section instances and could reset configured header/footer values.

The group JSON files are therefore intentionally present as scaffolding but are not referenced by `layout/theme.liquid` in this compatibility pass.

## Existing OS 2.0 support retained

The repository already contains JSON templates for core storefront routes and an `apps.liquid` wrapper with `@app` support. Product sections also contain app-block support. Those files are retained rather than rewritten unnecessarily.

## Legacy files intentionally retained

GemPages-era templates, old VASTA snippets, and compatibility integrations have not been deleted. Removing them safely requires checking assignments and app dependencies against the actual Shopify store.

## Recommended validation before merge/publish

Run from a local checkout with Shopify CLI:

```sh
shopify theme check
shopify theme dev --store YOUR-STORE.myshopify.com
shopify theme push --unpublished --theme "Speaking Roses OS2 Test" --store YOUR-STORE.myshopify.com
```

Test at minimum:

- Home page
- Collection/search
- Standard and customized product templates
- Add-to-cart and cart drawer
- Cart page
- Mobile menu
- Reviews widgets
- Subscription products
- Custom Price Calculator products
- App embeds in the Theme Editor
- Header/footer settings in the Theme Editor

Do not publish the test theme until those storefront paths have been verified.
