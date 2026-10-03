Model: GPT-5.6 Sol — High

Perform a focused performance review of both:

frontend/
backend/

Read all docs first.

Do not redesign the architecture.

Frontend:

Review:

SSR usage
client-only components
bundle size
image handling
Nuxt Image
lazy loading
data fetching
duplicate API calls
large dependencies
hydration issues
pagination
rendering patterns

Reduce unnecessary client-side JavaScript.

Do not sacrifice correctness for synthetic performance.

Backend:

Review:

EF Core queries
N+1
Include usage
projections
AsNoTracking
pagination
indexes from database.md
unbounded queries
large responses

Do not add Redis just because caching exists.

Only add caching if there is a clear measurable use case.

Do not add distributed infrastructure.

Run builds/tests after changes.

Document meaningful optimizations in progress.md.

--------------------

Perform final end-to-end engineering review.

Read:

architecture.md
api-contract.md
database.md
frontend-patterns.md
progress.md

Do not add unrelated features.

Verify backend:

build
migrations
startup
Swagger
authentication
products
categories
checkout
orders
payments
blog
settings
uploads
validation
authorization

Verify frontend:

production build
storefront routes
admin routes
i18n
RTL
LTR
API integration
cart
checkout
auth
products
blog
settings
responsive behavior
error states
loading states

Verify API contract consistency.

Check for mismatches between:

Nuxt TypeScript types
API DTOs
api-contract.md

Check:

nullable fields
enums
pagination
error responses
locale behavior
slugs

Remove:

dead code
unused dependencies
temporary debug logging
unused components
obvious TODOs that should already be complete

Do NOT perform large refactors unless required to fix a real issue.

Run relevant tests.

At the end update:

docs/progress.md

with:

Completed Features
Known Limitations
Remaining Work
Deployment Requirements
Environment Variables
How To Run Backend
How To Run Frontend
How To Run Tests
