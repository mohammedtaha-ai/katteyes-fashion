# Project Structure

> Updated after each task. Stays in sync with the actual repo.
> To refresh: `tree -L 3 -I 'node_modules|vendor|dist|.git|storage|bootstrap'` from the repo root.

```
katteyes-fashion/                    (repo root)
├── api/                              Laravel 11 backend (Task 1.3+)
├── web/                              React 18 SPA (Task 1.4+)
├── docker/                           Container infra (Task 1.2+)
│   ├── api.Dockerfile
│   ├── web.Dockerfile.dev
│   └── mysql-init/
│       └── 01-init.sql               utf8mb4 collation
├── docker-compose.yml                mysql + mailpit + phpmyadmin (api/web come in 1.3/1.4)
├── scripts/                          bootstrap, test, deploy (Phase 9)
├── docs/
│   ├── api-contract.md               (Phase 9)
│   ├── runbook.md                    (Phase 9)
│   ├── codebase/roadmap/             ← this folder
│   └── superpowers/
│       ├── specs/2026-09-16-katteyes-fashion-design.md
│       └── plans/2026-09-17-katteyes-fashion-build.md
├── .env.example                      Root env (DB + ports + admin seed)
├── .gitignore
└── README.md
```

## api/ — Laravel 11

```
api/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/V1/
│   │   │   ├── AuthController.php
│   │   │   ├── CategoryController.php
│   │   │   ├── ProductController.php
│   │   │   ├── OrderController.php
│   │   │   ├── MyOrdersController.php
│   │   │   └── Admin/
│   │   │       ├── CategoryController.php
│   │   │       ├── ProductController.php
│   │   │       └── OrderController.php
│   │   ├── Middleware/EnsureRole.php
│   │   ├── Requests/
│   │   │   ├── Auth/{Login,Register}Request.php
│   │   │   ├── Admin/CategoryUpsertRequest.php
│   │   │   ├── Admin/ProductUpsertRequest.php
│   │   │   └── StoreOrderRequest.php
│   │   └── Resources/
│   │       ├── UserResource.php
│   │       ├── CategoryResource.php
│   │       ├── ProductResource.php
│   │       ├── ProductImageResource.php
│   │       └── OrderResource.php
│   ├── Actions/
│   │   ├── CreateOrderAction.php
│   │   └── UploadImageAction.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Category.php
│   │   ├── Product.php
│   │   ├── ProductImage.php
│   │   ├── ProductOption.php
│   │   ├── Order.php
│   │   └── OrderItem.php
│   ├── Services/
│   │   ├── OrderNumberGenerator.php
│   │   └── WhatsAppMessageBuilder.php
│   ├── Console/Commands/
│   │   ├── PruneImagesCommand.php
│   │   └── BackupDbCommand.php
│   └── Providers/AppServiceProvider.php
├── bootstrap/app.php                 (CORS + middleware aliases)
├── config/{database,cors,filesystems,sanctum,services}.php
├── database/
│   ├── migrations/                   (year-prefixed)
│   ├── factories/
│   └── seeders/{DatabaseSeeder,AdminSeeder,CategorySeeder}.php
├── routes/{api,console,web}.php
├── tests/{Feature,Unit}/             (Pest 3)
│   ├── Feature/Auth/...
│   ├── Feature/Categories/...
│   ├── Feature/Products/...
│   ├── Feature/Orders/...
│   └── Unit/{Actions,Services}/...
├── composer.json
└── phpunit.xml
```

## web/ — React 18 + Vite

```
web/
├── src/
│   ├── main.tsx                      entry + QueryClient + Router
│   ├── App.tsx                       top-level routes
│   ├── routes.tsx                    route table
│   ├── api/
│   │   ├── client.ts                 axios + Bearer + 401 interceptor
│   │   ├── types.ts                  Product/Category/Order/User types
│   │   ├── auth.api.ts
│   │   ├── categories.api.ts
│   │   ├── products.api.ts
│   │   └── orders.api.ts
│   ├── queries/                      TanStack Query hooks
│   │   ├── use-auth.ts
│   │   ├── use-products.ts
│   │   ├── use-categories.ts
│   │   └── use-orders.ts
│   ├── stores/                       Zustand (persisted)
│   │   ├── auth-store.ts
│   │   └── cart-store.ts
│   ├── components/
│   │   ├── ui/                       shadcn primitives (Button, …)
│   │   ├── layout/{StorefrontLayout,AdminLayout,Header,CategoryTabs}.tsx
│   │   ├── product/{ProductCard,ProductGrid,ProductSlider,OptionPicker}.tsx
│   │   ├── cart/{CartItemRow,QtyControl,CartSummary}.tsx
│   │   ├── checkout/CheckoutForm.tsx
│   │   └── admin/ImageUploader.tsx
│   ├── pages/
│   │   ├── storefront/{HomePage,ProductDetailPage,CartPage,CheckoutPage,OrderConfirmedPage}.tsx
│   │   ├── auth/{LoginPage,RegisterPage}.tsx
│   │   ├── account/MyOrdersPage.tsx
│   │   └── admin/{AdminProductsPage,AdminProductEditPage,AdminCategoriesPage,AdminOrdersPage,AdminOrderDetailPage}.tsx
│   ├── lib/{utils,storage}.ts
│   ├── hooks/{use-auth,use-debounce}.ts
│   ├── __tests__/                    Vitest + RTL + MSW
│   │   ├── mocks/{handlers,server}.ts
│   │   ├── stores/{auth,cart}-store.test.ts
│   │   ├── lib/formatCurrency.test.ts
│   │   ├── api/client.test.ts
│   │   └── components/...
│   └── styles/globals.css            Tailwind + RTL + Tajawal
├── index.html                        `<html dir="rtl" lang="ar">`
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```
