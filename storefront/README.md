# Taj Storefront

Nuxt 4 storefront for the Taj Vendure shop.

## Requirements

- Node.js `22.19+` (or a compatible newer LTS release)
- Vendure backend running locally on port `3000`

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

The storefront defaults to `http://localhost:3000/shop-api`. Configure another endpoint with `NUXT_PUBLIC_API_BASE_URL`.
The Nuxt development server runs at `http://localhost:3001` to avoid conflicting with Vendure.

## Commands

```bash
npm run dev
npm run build
npm run preview
```

The application uses locale-prefixed routes such as `/fa` and `/en`.
