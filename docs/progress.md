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

## Current limitations

- Product, cart and admin routes contain foundation placeholders only.
- Blog and settings services await their custom Vendure GraphQL schema.
- Authentication mutations and session initialization are not implemented yet.
- The local Node.js version is 22.13; Nuxt 4.5 declares Node 22.19 or newer as its supported runtime.

## Next task

Implement the customer storefront described in `docs/11-storefront.md`, using the existing API service layer and SSR conventions.
