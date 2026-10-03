Model: GPT-5.6 Luna — Medium

Read frontend-patterns.md and inspect current storefront code.

Implement the cart.

Use Pinia.

Cart item identity must be based on:

productVariantId

not only productId.

Cart item should include enough UI data to render:

productId
productVariantId
slug
name
image
weight
weightUnit
unitPrice
discountPrice if applicable
quantity

Persist cart locally.

Do not treat locally stored prices as trusted backend values.

Local prices are only for display.

Backend will revalidate during checkout.

Implement:

add item
remove item
increase quantity
decrease quantity
set quantity
clear cart
item count
subtotal display

Handle:

same product + same variant
same product + different variants

Create:

/cart

Cart page should include:

items
variant information
quantity controls
remove
subtotal
checkout CTA
empty cart state

Make responsive.

Add loading/error handling where relevant.

Do not implement checkout yet.

Run frontend build.

Fix all errors.

Update docs/progress.md.
