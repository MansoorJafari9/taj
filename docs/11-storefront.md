Model: GPT-5.6 Terra — Medium / High

Read:

docs/architecture.md
docs/api-contract.md
docs/frontend-patterns.md
docs/progress.md

Inspect the current Nuxt frontend.

Implement the customer-facing storefront.

Design direction:

Premium
Minimal
Elegant
Modern
Warm
Persian luxury brand

Brand:

تاج
Taj

Avoid:

- excessive gradients
- excessive glassmorphism
- heavy animations
- crowded UI
- generic marketplace appearance
- unnecessary borders

Use whitespace carefully.

Implement:

Homepage
Products list
Product details
Category page
Blog list placeholder integration
Header
Navigation
Footer
Language switcher
Search UI
Cart button

Homepage sections:

- Header
- Hero
- Categories
- Featured products
- Best sellers placeholder/data if supported
- Gift boxes
- Promotional section
- Blog preview
- Trust section
- Newsletter
- Footer

Products page:

- responsive product grid
- pagination
- search
- category filter
- price filter
- availability
- sort

Product details:

- breadcrumb
- image gallery
- localized product info
- variant selection
- dynamic price
- discount display
- stock state
- quantity selector
- add to cart
- related products
- SEO metadata

Use the real API service interfaces.

If backend endpoints are available, connect them.

If something is not ready, use isolated mock service implementation.

Do NOT put mock data directly inside pages/components.

Support:

SSR
SEO
localized URLs
RTL/LTR

Use Nuxt Image properly.

Use server-side data loading where useful for SEO.

Create loading and error states.

Create empty states.

Make the interface fully responsive.

Test:

mobile
tablet
desktop

Run production build.

Fix errors.

Update docs/progress.md.
