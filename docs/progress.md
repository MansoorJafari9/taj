# Project Progress

## Completed

### Frontend architecture

- Frontend implementation conventions documented in `docs/frontend-patterns.md`.
- Vendure Shop GraphQL endpoint established as the storefront API source of truth.

### Nuxt foundation

- Nuxt 4.5 and Vue 3.5 application created in `storefront/`.
- Tailwind CSS 4, Pinia, Nuxt i18n, Nuxt Image and Zod installed and configured.
- Persian and English locale-prefixed routing configured (`/fa`, `/en`).
- SSR document direction and language configured for RTL/LTR.
- Central Vendure GraphQL client and initial domain services created.
- Storefront and admin layouts created.
- Authentication and admin middleware structure created.
- Cart, auth and UI Pinia store foundations created.
- Taj design tokens and base UI primitives created.
- Environment example and storefront run instructions added.
- Production build and locale-routing runtime smoke test passed.

### Blog and SEO

- Vendure `BlogPlugin` stores articles in PostgreSQL with draft/publish status, language, category, image URL, and SEO fields.
- Admin and Shop GraphQL APIs are implemented; Shop API exposes published articles only.
- Persian article editor is available under Dashboard → Marketing → مقالات بلاگ.
- Nuxt blog list and detail pages are server-rendered and linked from the navigation, footer and homepage.
- Article metadata includes canonical, Open Graph, `BlogPosting` JSON-LD, and `hreflang` only for published translations.
- Dynamic `sitemap.xml` includes published articles, products and categories; dynamic `robots.txt` points to it.

## Editorial workflow and deployment

1. Create an article in the Dashboard with a Latin slug, title, excerpt and rich-text body.
2. Upload a cover image to Vendure Assets and paste its public URL into the article editor.
3. Fill optional SEO title and description, then publish. Drafts do not appear in the Shop API or sitemap.
4. To publish an English translation, create an English article with the same slug.
5. Run migrations on deployment. Set `NUXT_PUBLIC_SITE_URL` and `NUXT_PUBLIC_API_BASE_URL` to the public origins.

## Current limitations

- The cover image URL is pasted manually; there is no Dashboard asset picker yet.
- Blog content is initially empty until editors publish articles.
- Authentication and checkout flows remain separate work.
