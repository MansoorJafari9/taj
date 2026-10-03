Model: GPT-5.6 Terra — Medium

Read api-contract.md and frontend-patterns.md.

Inspect:

cart implementation
checkout backend API

Implement:

/checkout

Create a clean checkout flow.

Sections:

Customer information
Address
Shipping
Order review
Payment initiation

The exact structure can be single-page or step-based depending on current design system.

Do not trust cart prices.

The checkout request must send only the API contract fields.

Example:

productVariantId
quantity

Display backend-calculated checkout/order totals when available.

Handle backend validation errors gracefully.

Handle:

out-of-stock item
price change
invalid variant
authentication requirement
address validation

Do not implement payment gateway logic directly in frontend.

Frontend only:

requests checkout/payment initialization
receives redirect/payment URL or payment information
redirects appropriately

Create responsive UI.

Support RTL and LTR.

Add loading states.

Prevent double submit.

Run frontend build.

Update docs/progress.md.
