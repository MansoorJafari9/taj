Model: GPT-5.6 Luna — Medium

Read API contract and frontend patterns.

Implement storefront blog.

Routes:

/blog
/blog/[slug]

Respect localized route strategy already configured.

Blog list:

- featured/latest section if data supports it
- article cards
- pagination
- category filtering if API supports it

Article page:

- title
- cover image
- publish date
- content
- category
- related articles if supported
- SEO metadata
- Open Graph metadata

Use SSR/server fetching where appropriate.

Use Nuxt Image.

Handle RTL/LTR correctly.

Add skeleton/loading/error/empty states.

Do not create a second design language.

Reuse Taj design system.

Run build.

Update progress.md.
