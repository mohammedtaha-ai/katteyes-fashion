# web/ — React 18 + Vite Frontend

This is the React 18 SPA for Katteyes Fashion.

## Running locally (Docker — preferred)

Already handled by `scripts/setup.sh` at the repo root. The `web` service
mounts this folder, so edits hot-reload via Vite HMR.

Open <http://localhost:5173>.

## Running outside Docker (native Node)

```bash
cd web
cp .env.example .env
npm install
npm run dev
```

## Environment variables

| Variable       | Purpose                                          | Example                       |
|----------------|--------------------------------------------------|-------------------------------|
| VITE_API_URL   | Base URL of the Laravel API (axios baseURL)      | `http://localhost:8000/api/v1` |

`.env` changes require a Vite restart (`npm run dev`).

## Scripts

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build → dist/
npm run preview   # Preview production build
npm test          # Run Vitest suite once
npm run test:watch # Vitest watch mode
```

## Folder structure

```
web/src/
├── api/           # Typed axios modules + types.ts (one module per domain)
├── assets/        # Images, fonts (Tajawal via @fontsource)
├── components/
│   ├── admin/     # Admin-only widgets (ImageUploader, etc.)
│   ├── auth/      # RequireAuth route gate
│   ├── cart/      # CartItemRow, QtyControl, CartSummary
│   ├── checkout/  # CheckoutForm (RHF + Zod)
│   ├── layout/    # Header, Footer, StorefrontLayout, AdminLayout, CategoryTabs
│   ├── product/   # ProductCard, ProductGrid, ProductSlider, OptionPicker
│   └── ui/        # Button + future shadcn primitives
├── lib/           # cn() + formatCurrency()
├── pages/
│   ├── account/   # MyOrdersPage
│   ├── admin/     # AdminProductsPage, AdminProductEditPage, AdminCategoriesPage, AdminOrdersPage, AdminOrderDetailPage, AdminUsersPage
│   ├── auth/      # LoginPage, RegisterPage
│   ├── storefront/ # HomePage, ProductDetailPage, CartPage, CheckoutPage, OrderConfirmedPage
│   └── NotFoundPage.tsx
├── queries/       # TanStack Query hooks (one file per domain)
├── stores/        # Zustand stores (auth, cart)
├── __tests__/     # Vitest tests + MSW mocks
├── App.tsx
├── main.tsx
├── routes.tsx     # AppRoutes (Router + nested layouts)
└── index.css      # Tailwind directives + Tajawal font imports
```

## Tests

```bash
docker compose exec web npm test -- --run
```

71 frontend tests across stores, hooks, components, and pages.