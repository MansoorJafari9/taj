Model: GPT-5.6 Terra — High

Read:

frontend-patterns.md
api-contract.md
progress.md

Inspect existing frontend.

Build the Admin Dashboard using the existing admin layout.

Routes:

/admin
/admin/products
/admin/categories
/admin/orders
/admin/customers
/admin/blog
/admin/settings

Protect routes using existing authentication architecture.

Admin design should be:

minimal
professional
clean
dense enough for productivity
responsive

Do not use storefront visual patterns blindly inside admin.

Implement admin shell:

Sidebar
Topbar
Breadcrumb
Mobile navigation
User menu

Dashboard:

Total orders
Revenue
Products
Low stock
Recent orders
Recent customers
Sales chart placeholder/real data depending API availability

Products:

table
search
pagination
filters
create
edit
active state
featured state

Product editor:

basic information
translations
category
images
variants
SEO

Variants editor:

weight
weight unit
price
discount price
stock
SKU
active state

Categories:

tree/list
create
edit
parent category
translations
sort order
active state

Orders:

list
filters
details
status update

Customers:

list
details
order history if API provides it

Blog:

list
create
edit
publish/draft
translations
SEO

Settings:

general
store
languages
SEO
shipping placeholders
payment configuration placeholders

Do NOT expose payment secrets.

Use reusable admin components.

Avoid a huge universal DataTable abstraction if simple specific tables are clearer.

Handle:

loading
errors
empty states
confirm dialogs
form validation
API validation responses

Make responsive.

Run build.

Update progress.md.
