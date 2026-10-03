Model: GPT-5.6 Terra — High

Read:

docs/architecture.md
docs/api-contract.md
docs/database.md

Your task is to define implementation patterns for the Nuxt frontend.

Do NOT build pages yet.

Create:

docs/frontend-patterns.md

The frontend stack:

- Nuxt 3
- Vue 3
- TypeScript
- Tailwind CSS
- Pinia
- @nuxtjs/i18n
- Nuxt Image
- Zod
- Nuxt UI or shadcn-vue when useful

The same Nuxt application contains:

1. Storefront
2. Admin dashboard

Document the recommended project structure.

Example areas:

components/
composables/
layouts/
middleware/
pages/
plugins/
services/
stores/
types/
utils/
constants/
locales/
assets/

Define rules for:

1. Pages

2. Components

3. Reusable UI components

4. Feature-specific components

5. API communication

6. Services

7. Pinia stores

8. Composables

9. Forms

10. Validation

11. Error handling

12. Loading states

13. Empty states

14. Pagination

15. Authentication

16. Route middleware

17. Admin authorization

18. i18n

19. RTL/LTR handling

20. SEO

21. Image optimization

22. Responsive behavior

23. Accessibility

24. State management

25. Cart persistence

26. API types

27. Naming conventions

28. File naming

29. Component size rules

30. Server/client rendering rules

Important:

Do not call $fetch randomly inside components.

Create a centralized API layer.

Recommended idea:

services/
  api/
    client.ts
    products.service.ts
    categories.service.ts
    auth.service.ts
    orders.service.ts
    blog.service.ts
    settings.service.ts

Use runtimeConfig for API URL.

Example:

NUXT_PUBLIC_API_BASE_URL

Define a consistent error handling strategy.

Define how service methods should be typed.

Define when to use:

useFetch
useAsyncData
$fetch

Document server-side fetching for SEO pages.

Document when client-side fetching is acceptable.

Define store usage.

Pinia should be used for actual global client state such as:

cart
auth state if appropriate
UI state if needed

Do not use Pinia for every API response.

Define cart architecture.

Cart should support:

productVariantId
quantity
product data required for UI

Persist cart locally initially.

Prepare for server synchronization later.

Define i18n architecture:

fa
en

Prepare:

ar
tr

Persian and Arabic:
RTL

English and Turkish:
LTR

Do not hardcode translations in components.

Define URL locale strategy according to api-contract.md.

Define layouts:

default storefront
admin

Define middleware:

auth
admin

Document authentication token handling carefully.

Avoid insecure patterns.

Define design system principles for Taj:

- premium
- minimal
- warm
- elegant
- whitespace
- restrained borders
- subtle motion
- no excessive glassmorphism
- no cheap marketplace feel

Suggested palette:

cream
off-white
beige
dark brown
charcoal
muted gold

At the end include:

"Frontend Rules"

These rules should be concise instructions future agents can follow.

Do not implement the UI yet.
