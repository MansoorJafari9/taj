Model: GPT-5.6 Terra — Medium / High

Read:

docs/architecture.md
docs/api-contract.md
docs/frontend-patterns.md
docs/progress.md

Inspect the repository.

Create the Nuxt frontend foundation inside:

frontend/

Use:

- Nuxt 3
- Vue 3
- TypeScript
- Tailwind CSS
- Pinia
- @nuxtjs/i18n
- Nuxt Image
- Zod
- Nuxt UI or shadcn-vue if useful

Implement ONLY foundation.

Do not build complete pages yet.

Set up:

- Nuxt configuration
- TypeScript
- Tailwind
- i18n
- Pinia
- runtime config
- API base URL
- locale routing
- RTL/LTR handling
- default storefront layout
- admin layout
- basic middleware structure
- API client
- services folder
- types folder
- composables folder
- stores folder
- design tokens
- basic reusable UI primitives

Languages:

fa
en

Prepare architecture for:

ar
tr

Ensure:

fa = RTL
en = LTR

Do not hardcode language-specific UI strings in components.

Create locale translation files.

Create API layer following frontend-patterns.md.

Do not scatter $fetch in components.

Set environment support for:

NUXT_PUBLIC_API_BASE_URL

Create basic:

BaseButton
BaseInput
BaseSelect
BaseModal
BaseBadge
BaseSkeleton
BaseEmptyState

Keep components simple.

Do not create a giant design system.

Set up:

error handling
loading conventions
SEO helpers if architecture calls for them

Run:

npm install
npm run build

Fix all errors.

Update:

docs/progress.md

Do not implement full storefront or admin yet.
