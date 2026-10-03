# Taj Frontend Patterns

## Scope

The `storefront/` directory will contain one Nuxt application with two user experiences:

- the public Taj storefront;
- the Taj administration area under `/admin`.

Vendure is the backend and its Shop GraphQL API is the source of truth for products, collections, customers, active orders, shipping and checkout. The GraphiQL page at `http://localhost:3000/graphiql/shop` is a development IDE; application requests must be sent to the GraphQL endpoint at `http://localhost:3000/shop-api`.

The frontend stack is Nuxt 4, Vue 3, TypeScript, Tailwind CSS, Pinia, `@nuxtjs/i18n`, Nuxt Image and Zod. Nuxt UI or shadcn-vue may be introduced only for components that would otherwise be expensive to make accessible, and must be themed to match Taj.

This document defines implementation conventions. It intentionally does not implement pages or UI.

## Recommended project structure

```text
storefront/
├── nuxt.config.ts
├── app/
│   ├── app.vue
│   ├── assets/css/
│   ├── components/
│   │   ├── base/
│   │   ├── common/
│   │   ├── storefront/
│   │   └── admin/
│   ├── composables/
│   ├── constants/
│   ├── layouts/
│   ├── middleware/
│   ├── pages/
│   ├── plugins/
│   ├── services/api/
│   ├── stores/
│   ├── types/
│   └── utils/
├── i18n/
│   └── locales/
│       ├── fa.json
│       └── en.json
├── public/
└── .env.example
```

Keep GraphQL documents near the service that owns them or under `services/api/graphql/` when shared. Generated GraphQL types must live in a generated-only directory and must never be edited manually.

## Pages and layouts

Pages are route-level orchestration components. A page may:

- read and validate route parameters and query strings;
- invoke a service through `useAsyncData` for SSR data;
- set SEO metadata;
- compose feature components;
- choose a page-level loading, empty or error state.

Pages must not contain GraphQL documents, raw `$fetch` calls, large presentation sections or business calculations.

`layouts/default.vue` owns the storefront header, navigation, footer and main content landmark. `layouts/admin.vue` owns the admin shell, navigation and account controls. Admin pages declare `layout: 'admin'` and the required middleware explicitly.

## Components

### Base components

`components/base/` contains small, presentation-only primitives such as `BaseButton`, `BaseInput`, `BaseSelect`, `BaseModal`, `BaseBadge`, `BaseSkeleton` and `BaseEmptyState`.

Base components:

- accept typed props and emit typed events;
- have no API access or feature-specific business rules;
- expose slots for content rather than accepting large HTML strings;
- support disabled, loading, focus and validation states where relevant;
- use design tokens instead of one-off colors and spacing.

### Common and feature components

`components/common/` contains cross-feature components such as localized links, money formatting and image wrappers. Storefront and admin components remain in their respective folders. Feature components should be grouped by domain, for example `components/storefront/product/ProductCard.vue`.

A component should normally stay below roughly 200 lines. Split it when it owns unrelated responsibilities, has multiple independent data flows, or its template becomes difficult to scan. Do not split a cohesive component merely to satisfy a number.

Components use PascalCase filenames. Composables use `useXxx.ts`, stores use domain names such as `cart.ts`, and services use `domain.service.ts`.

## API communication

### Endpoint configuration

Use Nuxt runtime configuration:

```ts
runtimeConfig: {
    public: {
        apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/shop-api',
    },
}
```

`NUXT_PUBLIC_API_BASE_URL` points to Vendure's Shop API, not the GraphiQL UI. The channel token should be configurable separately when multiple Vendure channels are introduced.

### Central client

All network traffic goes through `services/api/client.ts`. Components must never make ad hoc `$fetch` calls.

The client is responsible for:

- posting typed GraphQL operations;
- setting `content-type` and the Vendure channel header when configured;
- using `credentials: 'include'` for cookie sessions;
- forwarding safe request context during SSR where necessary;
- normalizing transport errors and GraphQL errors;
- supporting request cancellation;
- returning typed data rather than raw response envelopes.

Define a common `ApiError` with a stable application code, user-safe message, optional field errors, HTTP status and original GraphQL error metadata. Log technical details on the server; do not expose stack traces or internal messages to customers.

### Services

One service owns each business domain. For example, `products.service.ts` owns product list/detail queries and maps Vendure responses to frontend models when a view model is useful.

Every service method must have explicit input and output types:

```ts
type GetProductsInput = {
    locale: SupportedLocale
    skip: number
    take: number
    collectionSlug?: string
}

type GetProductsResult = PaginatedResult<ProductSummary>
```

Generated GraphQL operation types are preferred. Handwritten frontend models may wrap them, but must not duplicate the entire schema. Vendure unions such as error results must be narrowed by `__typename` in the service layer.

### Fetching rules

- Use `useAsyncData` in pages and route-level composables for SSR-friendly queries and stable cache keys.
- Use `useFetch` only for a conventional HTTP endpoint where its URL-based behavior is useful. GraphQL calls should generally use services plus `useAsyncData`.
- Use `$fetch` only inside the centralized client or a Nuxt server endpoint, never scattered through pages and components.
- Fetch indexable product, collection, settings and article data on the server.
- Client-side fetching is appropriate for user-triggered filtering after hydration, cart mutations, account actions, checkout transitions and non-indexable admin interactions.
- Cache keys include all inputs that change the response, especially locale, channel, slug, filters and pagination.

## State management

Pinia is for durable client state shared across routes:

- cart state;
- authenticated-customer summary when needed globally;
- small UI state such as the mobile navigation or cart drawer.

Do not copy every API response into Pinia. Page data belongs to `useAsyncData`; local form and interaction state belongs in the component or composable.

Stores expose actions and readonly derived state. Avoid direct state mutation from components when the mutation has a business meaning.

## Cart architecture

The initial cart is persisted locally and designed to synchronize with a Vendure active order later. Cart identity is `productVariantId`, not `productId`.

Each local item contains:

- `productId` and `productVariantId`;
- localized name and slug needed to render a link;
- selected option/variant labels;
- image preview;
- unit price used only for display;
- quantity;
- optional stock hints.

Persist only a versioned, JSON-safe payload. Hydrate local storage only on the client to avoid SSR errors and hydration mismatch. Validate persisted data with Zod, discard invalid payloads safely and support future migrations.

Locally stored prices and stock are never authoritative. Checkout sends variant IDs and quantities; Vendure recalculates availability, tax, promotions, shipping and totals.

## Composables

Composables coordinate reusable reactive behavior such as pagination, locale-aware routing, API error presentation and SEO. They may call a service when they represent a reusable query flow, but they must not become a second service layer.

Prefer a composable when behavior is shared or requires Vue lifecycle/reactivity. Prefer a plain utility for deterministic transformations with no Vue state.

## Forms and validation

Use one Zod schema as the client-side validation source for each form. Infer TypeScript types from the schema when practical. Keep schemas close to their feature unless shared.

Form behavior must include:

- labels associated with controls;
- inline field errors and a form-level error summary when useful;
- untouched, dirty, submitting and success states;
- submit prevention while a request is pending;
- server validation mapped back to fields;
- no silent clearing after a failed submission.

Client validation improves feedback but never replaces Vendure validation.

## Errors, loading and empty states

Service errors are normalized once. Pages decide whether an error becomes a 404, a Nuxt error page or an inline retry state. Components receive display-safe messages or error codes and translate them through i18n.

Use skeletons when layout is predictable, a compact spinner for short local actions and disabled/loading buttons for mutations. Avoid full-page blocking indicators for small updates. Preserve existing content during filter refreshes when possible.

Empty states explain what is absent and provide one relevant next action. Search-empty, cart-empty and admin-empty states must use distinct copy.

## Pagination and filters

Public list state is represented in the URL so links are shareable and SSR-compatible. Parse query parameters into a typed, validated filter object before calling services.

Vendure list operations use `skip` and `take`; the UI may expose pages while converting them centrally:

```text
skip = (page - 1) × pageSize
```

Changing a filter resets the page. Pagination, sorting and filter state must be included in the async-data cache key. Do not request unbounded lists.

## Authentication and authorization

Prefer Vendure's HttpOnly cookie session mode with `credentials: 'include'`. Never store session tokens, passwords or privileged credentials in local storage. If bearer authentication becomes necessary, keep tokens out of persistent browser storage and document the threat model before implementation.

SSR requests that need a customer session must forward only the required cookie/header values. Never forward arbitrary incoming headers to the backend. Mutating authenticated requests must follow the backend's CSRF and origin policy.

`middleware/auth.ts` checks whether a customer session is required and redirects to the localized sign-in page while preserving a safe return path. `middleware/admin.ts` first requires authentication and then verifies an explicit admin permission/role supplied by an authorized backend operation.

Route middleware improves navigation behavior; it is not a security boundary. Vendure must enforce every privileged operation. Never expose payment secrets, superadmin credentials or Admin API tokens through public runtime configuration.

## Internationalization and direction

Initially support:

| Locale | Direction | Status |
| --- | --- | --- |
| `fa` | RTL | default |
| `en` | LTR | enabled |
| `ar` | RTL | architecture-ready |
| `tr` | LTR | architecture-ready |

Use prefixed localized URLs for every language, including the default language: `/fa/products/...` and `/en/products/...`. This makes locale explicit, predictable for SEO and independent from cookies. A request to `/` redirects to the selected/default locale. If a later business decision changes this strategy, update routing, canonical and hreflang behavior together.

The route locale must also select the Vendure request language. UI translations live in `locales/*.json`; product and collection translations come from Vendure. Never hardcode customer-facing strings in templates.

Set `lang` and `dir` on the document from a single locale configuration map. Prefer CSS logical properties such as `margin-inline-start`, `padding-inline` and `inset-inline-end`. Do not create duplicated RTL and LTR components. Directional icons such as arrows may be mirrored; universal icons must not be mirrored blindly.

## SEO and rendering

Product, collection, home and blog pages are server-rendered. Each indexable page defines localized title, description, canonical URL and social metadata from real data. Product and article structured data may be added only when the required fields exist.

Do not render critical product content only after mount. Use `useSeoMeta` and `useHead` from page data obtained during SSR. Canonical and alternate URLs must follow the locale-prefix strategy.

Use client-only rendering only for browser-only features such as local cart hydration. Keep the stable initial markup server-rendered and isolate client-only sections narrowly.

## Images

Use `NuxtImg`/`NuxtPicture` for storefront media. Configure the Vendure asset host as an allowed image domain. Always provide dimensions or an aspect ratio to prevent layout shift, meaningful alternative text for content images, an empty alt for decorative images and responsive `sizes`.

Hero/LCP images may be eager and high priority. Product grids, galleries below the fold and blog previews use lazy loading. Do not upscale small source images.

## Design system

Taj should feel premium, minimal, warm and elegant. Use a restrained token palette:

- cream and off-white surfaces;
- beige for secondary surfaces;
- dark brown and charcoal for primary text and controls;
- muted gold for limited accents, never large low-contrast text areas.

Whitespace and typography establish hierarchy. Borders are subtle and purposeful. Motion is brief, respects `prefers-reduced-motion` and never blocks interaction. Avoid excessive gradients, glass effects, shadows and dense marketplace-style cards.

Define color, typography, radius, spacing, shadow and motion values as CSS/Tailwind tokens. Storefront and admin may use different density while sharing the same foundational tokens.

## Responsive behavior and accessibility

Build mobile-first and test at content-driven breakpoints rather than specific device names. Product grids, navigation, tables and forms must work at mobile, tablet and desktop widths. Admin tables may use horizontal scrolling or purpose-built mobile rows without hiding essential actions.

Use semantic landmarks, heading order, native controls and keyboard-accessible dialogs/menus. All interactive elements require visible focus. Do not use color alone to communicate status. Target WCAG 2.2 AA contrast and interaction behavior. Announce important asynchronous status changes with an appropriate live region.

## Frontend Rules

1. Treat Vendure Shop GraphQL at `/shop-api` as the commerce source of truth; `/graphiql/shop` is only its development explorer.
2. Keep all requests in the typed API client and domain services; never scatter `$fetch` through components.
3. Use SSR and `useAsyncData` for indexable pages, with locale and filters included in cache keys.
4. Use Pinia only for shared client state such as cart, auth summary and small UI state.
5. Identify cart lines by `productVariantId`; never trust persisted price or stock at checkout.
6. Keep session credentials in secure HttpOnly cookies and keep secrets out of public runtime config and local storage.
7. Use explicit locale-prefixed URLs and derive API language, document language and direction from the route locale.
8. Put UI text in locale files and commerce translations in Vendure.
9. Prefer CSS logical properties and shared components for RTL/LTR support.
10. Validate forms and persisted browser data with Zod, while treating backend validation as authoritative.
11. Normalize API errors in one place and provide intentional loading, empty and retry states.
12. Keep pages thin, base components presentation-only and business rules in services/stores/composables according to ownership.
13. Use Nuxt Image with responsive sizes, dimensions and correct lazy/eager behavior.
14. Follow Taj's restrained design tokens and accessibility requirements.
15. Do not implement storefront or admin pages until the Nuxt foundation task begins.
