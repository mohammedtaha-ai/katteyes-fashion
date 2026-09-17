# Katteyes Fashion — Design Spec

| Field | Value |
|---|---|
| Date | 2026-09-16 |
| Status | Approved (pending final review) |
| Type | Architectural |
| Path classification | Rebuild (static HTML → full-stack Laravel + React) |
| SSoT | This document |

---

## 1. Context

### 1.1 ما نبني
إعادة هيكلة كاملة لمتجر أزياء عربي (RTL، عملة يمنية، اتصال عملاء عبر WhatsApp)
من موقع HTML/CSS/JS واحد الـ `localStorage` إلى تطبيق full-stack:

- **Backend:** Laravel 11 API (Sanctum tokens) + MySQL 8
- **Frontend:** React 18 SPA (Vite + TypeScript) + Tailwind CSS + shadcn/ui
- **Images:** local في dev / S3-compatible في prod (env-switch)
- **Checkout:** يبقى WhatsApp-based ما فيه payment gateway في v1

### 1.2 الـ repo حالياً
- `F:\workeprojects\katteyes_fashion` — ليس git repo
- 4 ملفات HTML فقط (`index.html`, `admin.html`, + 2 backup `.bak`)
- كل البيانات في الـ `localStorage` (محدود + مشتركة بين الأجهزة)
- مافي backend، مافي auth، مافي admin protection

### 1.3 الـ MVP scope
نطابق الوظائف الحالية (storefront + admin + WhatsApp checkout) + نضيف:
- Backend حقيقي ببيانات مشتركة
- Admin login + حماية لوحة التحكم
- Customer accounts اختيارية + guest checkout
- Order tracking في admin dashboard
- صور قابلة للقياس (resize + WebP)

**ما في v1 (YAGNI):** payment gateway، multi-vendor، shipping tracking، email transactional، real-time updates، CI/CD pipelines، 2FA، multi-environment (staging).

---

## 2. Decisions Summary

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Frontend/backend coupling | **Laravel API + React SPA** منفصل في monorepo | فصل deploy، قابلية scaling، API قابل لإعادة الاستخدام لاحقاً |
| 2 | Database | **MySQL 8** | طلب صريح + مراسف Laravel الافتراضي |
| 3 | Orders storage | **يُخزّن في DB** قبل فتح WhatsApp | admin يقدر يتابع الطلبات |
| 4 | Auth model | **Admin + Customer accounts + Anonymous guest checkout** | توازن بين السهولة والـ tracking |
| 5 | Image storage | **Local (dev) / S3-compatible (prod)** عبر `FILESYSTEM_DISK` env | مرونة بدون lock-in |
| 6 | UI library | **Tailwind CSS + shadcn/ui** | تحكم كامل بالتصميم، RTL-friendly، خفيف |
| 7 | Data fetching/state | **TanStack Query (server) + Zustand (cart/auth)** | modern + caching ذكي + خفيف |
| 8 | i18n | **عربي فقط في v1** | YAGNI — نصوص inline + Lang::get() لاحقاً |
| 9 | Repo layout | **Monorepo:** `api/` + `web/` في repo واحد + `docker-compose.yml` للـ dev stack | single source of truth + onboarding أسهل + بيئة موحّدة عبر Docker |

### 2.1 Defaults (defaults مش decisions مُتخذة)
- Laravel Sanctum (PAT tokens)
- React Router v6.4+ + Vite + TypeScript strict
- جدول `users` واحد مع `role` enum (`admin`, `customer`)
- صور تُرفع multipart + تُعمل resize server-side (max 1600px, WebP, quality 85)
- PHPUnit/Pest backend + Vitest + RTL frontend
- Queue driver: `sync` في dev, `database` في prod
- WhatsApp number من env `WHATSAPP_NUMBER`
- Currency: `YER` (ريال يمني — phone code `+967`)
- Timezone: `Asia/Aden`

---

## 3. Architecture Overview

### 3.1 Repository layout
```
katteyes-fashion/                    (repo root)
├── api/                              ← Laravel 11 backend
├── web/                              ← React 18 SPA frontend
├── docker/                           ← container infra
│   ├── api.Dockerfile
│   ├── web.Dockerfile.dev
│   └── mysql-init/init.sql
├── docker-compose.yml                ← dev stack (mysql, api, web, mailpit, phpmyadmin)
├── docs/
│   └── superpowers/
│       ├── specs/2026-09-16-katteyes-fashion-design.md   (هذا الملف)
│       └── plans/                                    (implementation plans لاحقاً)
├── scripts/
│   ├── setup.sh / setup.ps1
│   ├── fresh.sh
│   ├── test.sh
│   ├── backup-db.sh
│   └── deploy.sh
├── .env.example                      ← shared defaults keys reference
├── .gitignore
└── README.md                         ← how to run + deploy
```
```

### 3.2 Runtime topology
```
Client (browser)
   │  HTTPS, Bearer {token} (header)
   ▼
┌────────────────────────────┐         ┌──────────────────┐
│  React SPA (web/dist)      │ ──────▶ │ Laravel API      │
│  • Tailwind + shadcn/ui    │  /api/* │ • Sanctum auth   │
│  • React Router v6.4       │         │ • Eloquent ORM   │
│  • TanStack Query + Zustand│         │ • Storage (S3/   │
│  • RTL, Arabic             │         │   local)         │
└────────────────────────────┘         └──────┬───────────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │ MySQL 8      │
                                       │ S3 (or local)│
                                       └──────────────┘
```

### 3.3 Cross-cutting choices
- **CORS:** `allowed_origins = [env(FRONTEND_URL)]`. `supports_credentials=false`. Sanctum header-based.
- **API versioning:** prefix `/api/v1` — نسمح بكسر التوافق في v2 بدون كسر frontend.
- **No shared types package in v1:** الـ API contract مُوثّق في Section 4 + يُحفظ في `docs/api-contract.md` (يُنشأ أثناء الـ planning). النسخة يُديرها المطور يدوياً.
- **Static deploy:** `web/dist` يُرفع على Netlify/Vercel/CDN. الـ API يُرفع على Laravel Forge/DigitalOcean (Section 9).

---

## 4. Data Model (MySQL 8)

كل الـ tables تحت `api/database/migrations/`. UTF-8MB4. Timestamps + soft deletes حيث يُذكر.

### 4.1 `users`
```
id                  bigint pk
name                varchar(100)
email               varchar(150) unique
email_verified_at   timestamp nullable
phone               varchar(20) nullable           -- future field, not used in v1
password            varchar(255)                   -- bcrypt
role                enum('admin','customer') default 'customer'
remember_token      varchar(100) nullable
timestamps
soft_deletes        NO                             -- out of v1
```

> Sanctum personal access tokens table تُضاف عبر `php artisan vendor:publish` (standard).

### 4.2 `categories`
```
id              bigint pk
name            varchar(80)
slug            varchar(100) unique
is_active       bool default true
sort_order      int default 0
timestamps
deleted_at      timestamp nullable                -- SoftDeletes
```

### 4.3 `products`
```
id              bigint pk
name            varchar(150)
slug            varchar(180) unique
description     text nullable
price           decimal(10,2)
currency        varchar(3) default 'YER'
category_id     bigint fk → categories.id ON DELETE RESTRICT
is_active       bool default true
timestamps
deleted_at      timestamp nullable                -- SoftDeletes

INDEX (category_id, is_active)
```

### 4.4 `product_images`
```
id              bigint pk
product_id      bigint fk → products.id ON DELETE CASCADE
path            varchar(255)                     -- disk-relative, بدون leading slash
sort_order      int default 0
timestamps

INDEX (product_id, sort_order)
```

### 4.5 `product_options` (colors + sizes)
```
id              bigint pk
product_id      bigint fk → products.id ON DELETE CASCADE
type            enum('color','size')
value           varchar(50)                      -- 'أحمر', 'S', 'XL'
sort_order      int default 0
timestamps

INDEX (product_id, type, sort_order)
UNIQUE (product_id, type, value)
```

### 4.6 `orders` (guest + auth support)
```
id                  bigint pk
order_number        varchar(20) unique            -- 'ORD-2026-000123'
user_id             bigint fk → users.id ON DELETE SET NULL nullable
status              enum('new','confirmed','shipped','delivered','cancelled')
                                                  default 'new'
customer_name       varchar(100)
customer_email      varchar(150) nullable
customer_address    text
customer_notes      text nullable
subtotal            decimal(10,2)
total               decimal(10,2)
currency            varchar(3) default 'YER'
whatsapp_sent_at    timestamp nullable
timestamps
NO soft_deletes                                 -- permanent record

INDEX (status, created_at desc)
INDEX (user_id, created_at desc)
```

### 4.7 `order_items` (snapshot)
```
id              bigint pk
order_id        bigint fk → orders.id ON DELETE CASCADE
product_id      bigint fk → products.id ON DELETE RESTRICT
product_name    varchar(150)                     -- snapshot
price           decimal(10,2)                    -- snapshot
color           varchar(50)                      -- snapshot
size            varchar(50)                      -- snapshot
quantity        int
timestamps

INDEX (order_id)
```

### 4.8 Standard tables (auto-generated by Laravel)
`personal_access_tokens`, `password_reset_tokens`, `failed_jobs`, `migrations`, `cache`, `cache_locks`.

### 4.9 Notes
- **Soft deletes:** على `products` و `categories` فقط. الـ `orders` permanent. الـ `users` لا (out of v1).
- **Seeded defaults:** 1 admin user + 6 categories ("الكل", "نساء", "رجال", "أطفال", "عبايات", "فساتين").
- **Why `RESTRICT` on `products.order_id` in `order_items`:** حذف منتج عليه تاريخ طلبات يجب أن يفشل بدلاً من حذف تاريخ. الـ soft delete UX يعالج هذا.

---

## 5. API Contract (REST)

Base: `/api/v1`. JSON in/out. Bearer tokens (`Authorization: Bearer <token>`).

### 5.1 Response shape conventions
- Success single: `{ "data": {...} }`
- Success list paginated: `{ "data": [...], "meta": { current_page, per_page, total, last_page } }`
- Error: `{ "message": "...", "errors": { "field": ["..."] } }`

### 5.2 Status codes
- `200` ok
- `201` created
- `204` deleted
- `401` no auth
- `403` wrong role
- `404` not found
- `422` validation

### 5.3 Public storefront endpoints
```
GET    /api/v1/categories                                   → active categories for nav
GET    /api/v1/products?category={slug}&q={s}&page=N        → list w/ filter/search/page
GET    /api/v1/products/{slug}                              → detail w/ images + options
POST   /api/v1/orders                                       → create order (guest or auth)
GET    /api/v1/orders/{order_number}                       → view order (auth-owned OR guest+?email=)
```

**`POST /api/v1/orders` request:**
```json
{
  "items": [
    { "product_id": 12, "color": "أحمر", "size": "M", "quantity": 1 }
  ],
  "customer_name": "محمد الأحمدي",
  "customer_email": "user@example.com",
  "customer_address": "صنعاء - شارع الزبيري",
  "customer_notes": "التوصيل بعد 5"
}
```

**response:**
```json
{
  "data": {
    "order_number": "ORD-2026-000123",
    "total": 5200.00,
    "currency": "YER",
    "whatsapp_link": "https://wa.me/967713301759?text=...",
    "items": [
      { "product_name": "فستان سهرة", "color": "أحمر", "size": "M", "quantity": 1, "price": 3500 }
    ]
  }
}
```

### 5.4 Auth endpoints (Sanctum PAT)
```
POST   /api/v1/auth/register     { name, email, password, password_confirmation }
POST   /api/v1/auth/login        { email, password }           → { token, user }
POST   /api/v1/auth/logout                                   (Bearer)
POST   /api/v1/auth/logout-all                               (Bearer)
GET    /api/v1/auth/me                                       (Bearer)
```

Login response:
```json
{ "data": { "token": "1|aB3...", "user": { "id": 7, "name": "...", "email": "...", "role": "customer" } } }
```

### 5.5 Customer authenticated endpoints
```
GET    /api/v1/my/orders?page=N                            → user's orders
GET    /api/v1/my/orders/{order_number}                    → user's order detail
```

### 5.6 Admin only (`/admin/*`, middleware `auth + role:admin`)

**Categories:**
```
GET    /api/v1/admin/categories?with_trashed=1
POST   /api/v1/admin/categories
GET    /api/v1/admin/categories/{id}
PATCH  /api/v1/admin/categories/{id}
DELETE /api/v1/admin/categories/{id}                       → soft delete
POST   /api/v1/admin/categories/{id}/restore
DELETE /api/v1/admin/categories/{id}/force
```

**Products:**
```
GET    /api/v1/admin/products?status=&category=&q=&page=
GET    /api/v1/admin/products/{id}
POST   /api/v1/admin/products                              ← multipart/form-data + images[]
PATCH  /api/v1/admin/products/{id}
DELETE /api/v1/admin/products/{id}                         → soft delete
POST   /api/v1/admin/products/{id}/restore
DELETE /api/v1/admin/products/{id}/force

POST   /api/v1/admin/products/{id}/images                  ← multipart + images[]
DELETE /api/v1/admin/products/{id}/images/{imageId}        → 422 لو آخر صورة
POST   /api/v1/admin/products/{id}/images/reorder          ← { ids: [imgId3, imgId1, imgId2] }
```

**Orders:**
```
GET    /api/v1/admin/orders?status=&from=&to=&page=
GET    /api/v1/admin/orders/{order_number}
PATCH  /api/v1/admin/orders/{order_number}                 ← status transitions
DELETE /api/v1/admin/orders/{order_number}                 → hard delete (rare)
```

### 5.7 Image serving
- Local: `${APP_URL}/storage/${path}` (after `storage:link`)
- S3: `Storage::disk('s3')->url($path)` returned by Resource
- Resource class `ProductImageResource` يحول الـ path المخزّن → URL كامل

### 5.8 Rate limiting
- Sanctum default: `60 req/min` على `/api/v1/auth/*` (login brute-force)

---

## 6. Frontend (React SPA)

### 6.1 Folder layout
```
web/src/
├── main.tsx                    ← entry + global providers (QueryClient, Router)
├── App.tsx                     ← top-level routes
├── routes.tsx
├── api/
│   ├── client.ts               ← axios + Bearer interceptor + 401 redirect
│   ├── types.ts                ← Product, Category, Order, User types
│   ├── auth.api.ts
│   ├── products.api.ts
│   ├── categories.api.ts
│   └── orders.api.ts
├── queries/                    ← TanStack Query hooks
│   ├── use-products.ts
│   ├── use-categories.ts
│   ├── use-orders.ts
│   └── use-auth.ts
├── stores/                     ← Zustand (persisted)
│   ├── auth-store.ts           ← { user, token, setAuth, clear }
│   └── cart-store.ts           ← { items, addItem, updateQty, removeItem, clear }
├── components/
│   ├── ui/                     ← shadcn primitives
│   ├── layout/
│   │   ├── StorefrontLayout.tsx
│   │   ├── AdminLayout.tsx
│   │   ├── Header.tsx
│   │   ├── SearchBar.tsx
│   │   ├── CategoryTabs.tsx
│   │   └── Footer.tsx
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductSlider.tsx
│   │   └── OptionPicker.tsx
│   ├── cart/{CartItemRow,QtyControl,CartSummary}.tsx
│   └── checkout/CheckoutForm.tsx
├── pages/
│   ├── storefront/{HomePage,ProductDetailPage,CartPage,CheckoutPage,OrderConfirmedPage}.tsx
│   ├── auth/{LoginPage,RegisterPage}.tsx
│   ├── account/MyOrdersPage.tsx
│   └── admin/
│       ├── AdminProductsPage.tsx
│       ├── AdminProductEditPage.tsx
│       ├── AdminCategoriesPage.tsx
│       ├── AdminOrdersPage.tsx
│       └── AdminOrderDetailPage.tsx
├── lib/
│   ├── utils.ts                ← cn(), formatCurrency()
│   └── storage.ts
├── hooks/{use-auth,use-debounce}.ts
└── styles/globals.css          ← Tailwind + RTL tweaks + brand palette
```

### 6.2 Routes (React Router v6.4+)
```ts
// Public
/                         HomePage
/products/:slug           ProductDetailPage
/cart                     CartPage
/checkout                 CheckoutPage
/order-confirmed/:orderNumber   OrderConfirmedPage

// Auth
/login                    LoginPage          (customer + admin)
/register                 RegisterPage       (customer)

// Authenticated
/my-orders                MyOrdersPage

// Admin (RequireAuth role="admin")
/admin                    → redirect /admin/products
/admin/products           AdminProductsPage
/admin/products/new       AdminProductEditPage (create)
/admin/products/:id       AdminProductEditPage (edit)
/admin/categories         AdminCategoriesPage
/admin/orders             AdminOrdersPage
/admin/orders/:orderNumber   AdminOrderDetailPage

// 404
*                         NotFoundPage
```

### 6.3 State management
- **Zustand `auth-store`** — `{ user, token, isAuthenticated, isAdmin, setAuth, clear }`. Persisted in localStorage (`zustand/middleware/persist`).
- **Zustand `cart-store`** — `{ items: CartItem[], addItem, updateQty, removeItem, clear, totalPrice, totalItems }`. Persisted in localStorage.

```ts
interface CartItem {
  productId: number
  productName: string
  price: number
  currency: string
  img: string
  color: string
  size: string
  quantity: number
}
```

- **TanStack Query** للـ server state. Query keys: `['products', filters]`, `['product', slug]`, `['categories']`, `['my-orders', page]`, `['admin-orders', filters]`.

### 6.4 API client
- axios instance مع `baseURL = import.meta.env.VITE_API_URL`
- Request interceptor: حقن Bearer token من `auth-store`
- Response interceptor: 401 → `auth-store.clear()` + `location.assign('/login')`

### 6.5 RTL & UI
- `index.html`: `<html dir="rtl" lang="ar">`
- **Tailwind logical properties فقط:** `ms-2`, `me-2`, `ps-4`, `pe-4` (لا `mr-2`/`pl-4` أبداً)
- Font: `Tajawal` عبر `@fontsource/tajawal` (offline-friendly)
- shadcn Dialog/Dropdown/Drawer (Radix) تدعم `dir` تلقائياً

### 6.6 Forms
- **React Hook Form** + **Zod** schemas
- shadcn `<Form>` wrapper مع رسائل خطأ عربية
- Image upload في admin: **react-dropzone** مع preview + drag-to-reorder

---

## 7. Cross-Cutting Flows

### 7.1 Auth flow

**Token lifecycle:**
- Token name: `web`
- TTL: **no expiration** (Sanctum PAT)
- Logout: `user()->currentAccessToken()->delete()` (revoke current)
- Logout-all: `user()->tokens()->delete()`
- `password` event → revoke all tokens عند تغيّر الباسورد

**Middleware (Laravel):**
- `auth:sanctum` على admin + customer routes
- `EnsureRole` middleware (`role:admin`)

**Frontend gate:**
```tsx
<RequireAuth roles={['admin']}>...</RequireAuth>
```

**CORS:**
```php
'allowed_origins' => [env('FRONTEND_URL')],
'supports_credentials' => false,
```

### 7.2 Image upload pipeline

**Limits:** 10 MB per image, max 20 images per product.

**Processing (Intervention Image v3):**
```php
$image = $manager->read($file)->scaleDown(width: 1600)->encodeByExtension('webp', quality: 85);
$filename = Str::uuid() . '.webp';
$path = "products/" . date('Y/m') . "/{$filename}";
Storage::disk(config('filesystems.default'))->put($path, (string) $image);
```

**Validation:**
```php
'image' => 'array|max:20',
'image.*' => 'file|image|mimes:jpeg,jpg,png,webp|max:10240',
```

**Edit semantics (موحّد لتجنب الغموض):**

- **Create** (`POST /admin/products`): MUST include `images[]` ≥ 1. وإلا → `422`.
- **Replace** (`PATCH /admin/products/{id}` مع `images[]`): تستبدل المجموعة كاملة.
  - لو الجديد `images[]` فاضي عند الـ PATCH → لا تغيير للصور (نترك الحالية).
  - لو الجديد `images[]` فيه ≥ 1 → نمسح صفوف `product_images` القديمة + ملفات الـ storage. الصورة الأولى الجديدة تصبح الـ primary.
- **Append** (`POST /admin/products/{id}/images`): تُضاف صور للـ gallery بدون حذف الحالية.
- **Delete one** (`DELETE /admin/products/{id}/images/{imageId}`):
  - لو الصورة آخر صورة للمنتج → `422: لا يمكن حذف آخر صورة`.
  - وإلا → حذف الصف + ملف الـ storage.
- الصور في `order_items` لا تُحفظ (snapshots على product_name/price فقط)، فالـ FK لا يمنع حذف الصور نهائياً.
- الإدارة: cleanup artisan command `products:prune-images` (scheduled daily) يحذف ملفات يتيمة.

### 7.3 Order + WhatsApp flow

```
[Cart in Zustand]  →  POST /api/v1/orders
                              │
                              ▼
            CreateOrderAction:
            1. Validate (FormRequest)
            2. DB::transaction:
               • Insert order (snapshot fields)
               • Insert order_items (snap names + prices)
            3. Generate order_number
            4. Build WhatsApp link
            5. Return OrderResource
                              │
                              ▼
     { order_number, total, items, whatsapp_link }
                              │
                              ▼
       Frontend:
       • cartStore.clear()
       • openWhatsappLink(link)
       • navigate /order-confirmed/{order_number}
```

**Order number format:** `ORD-{YYYY}-{NNNNNN}` zero-padded per-year sequence.

**WhatsApp message template:**
```
*طلب جديد — ORD-2026-000123*
الاسم: {customer_name}
العنوان: {customer_address}
ملاحظات: {customer_notes || 'لا يوجد'}
——————
1. {product_name} ({color} - {size}) × {quantity} = {subtotal} ر.ي
——————
*المجموع: {total} ر.ي*
```

`urlencode()` + newlines = `%0A`.

**Guest order verification (later view):**

- `GET /api/v1/orders/{order_number}`
- **If `auth:sanctum` + user مالك الطلب** (`order.user_id == auth()->id()`) → 200.
- **If guest (no Bearer token)** + `?email=...` يطابق `order.customer_email` → 200.
- **Otherwise** → `404` (لا نكشف هل الـ order_number موجود أم لا).
- Authentication الـ admin: لا يحق له يعرض طلبات customers عبر هذا endpoint (يستخدم admin endpoint بدلاً منه).

**Idempotency note:** duplicate submits ممكن ينشئوا order مكرر. YAGNI mitigation في v1 (rate limit + submit spinner).

### 7.4 Standard error messages
| Case | HTTP | Message |
|---|---|---|
| Cart فارغ | 422 | "لا يمكن إرسال طلب فارغ" |
| منتج مش موجود | 422 | "أحد المنتجات غير متوفر" |
| لون/مقاس غير مطابق | 422 | "خيار اللون/المقاس غير صالح" |
| Guest بدون email | 422 | "البريد مطلوب للطلبات بدون حساب" |
| Server crash | 500 | generic (Log ID في dev فقط) |

---

## 8. Testing Strategy

### 8.1 Backend — Pest v3 + PHPUnit
```
api/tests/
├── Feature/                          ← HTTP stack
│   ├── Auth/{Register,Login,Logout,RoleMiddleware}Test.php
│   ├── Products/{PublicProductList,ProductDetail,AdminCreateProduct,
│   │             AdminUpdateProduct,AdminDeleteRestore,ProductSoftDeleteVisibility}Test.php
│   ├── Categories/{...}Test.php
│   └── Orders/{CreateGuest,CreateAuth,Validation,NumberGen,WhatsAppBuild,
│                GuestRetrieval}Test.php
├── Unit/                             ← classes in isolation
│   ├── Actions/UploadImageActionTest.php
│   ├── Services/{OrderNumberGenerator,WhatsAppMessageBuilder}Test.php
│   └── Models/{Product,Order,User}Test.php
└── Pest.php
```

- **SQLite in-memory** للسرعة. **MySQL test DB** (`katteyes_test`) للـ critical FK behavior + JSON columns.
- **Coverage target:** ≥ 70% على `app/Actions/`, `app/Services/`, `app/Http/Controllers/Api/`.

### 8.2 Frontend — Vitest + React Testing Library + MSW
```
web/src/
├── __tests__/
│   ├── stores/{cart-store,auth-store}.test.ts
│   ├── lib/formatCurrency.test.ts
│   ├── api/client.test.ts            ← interceptor 401 → redirect
│   └── mocks/handlers.ts             ← MSW
├── components/{product,CartItemRow,checkout/CheckoutForm}.test.tsx
└── pages/auth/LoginPage.test.tsx
```

- **Coverage target:** ≥ 60% على `stores/`, `lib/`, و components الأساسية.
- **No E2E in v1** (Playwright deferred — manual QA).

### 8.3 Test commands
```bash
# Backend
cd api && php artisan test [--filter=Order] [--coverage]
cd api && vendor/bin/pint --test

# Frontend
cd web && npm test | npm run test:watch | npm run test:coverage
cd web && npm run lint && npm run type-check
```

### 8.4 Known testing gaps (logged, not blocking)
1. E2E للـ full checkout flow — manual testing
2. Visual cross-browser (Safari, mobile RTL) — manual QA
3. Load test — N/A at MVP scale
4. WhatsApp message preview — manual check

---

## 9. Deployment + DevOps

### 9.1 Local dev (Docker Desktop — primary path)
- **Docker Desktop 4.x+** (Windows) — يجب أن يكون شغّال قبل تشغيل setup
- **Git** + **Node 20 LTS + npm** (لـ `npm install` فقط — لا حاجة لـ PHP محلي!)
- **الحاوية الواحدة `docker-compose.yml`** في الـ repo root تشمل:
  - `mysql` — `mysql:8.4` مع volume `katteyes_db_data`, healthcheck
  - `api` — `php:8.3-cli` + Composer + required PHP extensions، مع `Dockerfile`, volume للـ source code
  - `web` — `node:20-alpine` للـ dev server، مع `Dockerfile.dev`
  - `mailpit` — `axllent/mailpit:latest` على `localhost:8025` لالتقاط emails محلياً
  - `phpmyadmin` — `phpmyadmin:latest` على `localhost:8080` (اختياري للإدارة اليدوية)
- **Quickstart واحد:** `bash scripts/setup.sh` → يبني الصور، يُقلع الحاويات، ينفّذ `migrate --seed`، يخزن `katteyes_token` للـ admin الأول.
- المشروع NOT git repo حالياً — `git init` يُنفّذ في الـ first commit قبل الـ scaffold.

**بديل بدون Docker (fallback):**
- **Herd** (https://herd.laravel.com) + MySQL محلي على الـ host
- الـ backend يبدأ عبر `php artisan serve` بدل container
- الـ setup script يقبل الـ flag `LOCAL=1` ليُفعّل وضع fallback

### 9.1.1 Container architecture (dev stack)

**`docker-compose.yml` services:**

```yaml
services:
  mysql:
    image: mysql:8.4
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_USER: ${DB_USERNAME}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    ports: ["${DB_PORT:-3306}:3306"]
    volumes:
      - katteyes_db_data:/var/lib/mysql
      - ./docker/mysql-init:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 5s
      retries: 20

  api:
    build:
      context: .
      dockerfile: docker/api.Dockerfile
    env_file: .env
    ports: ["${API_PORT:-8000}:8000"]
    volumes:
      - ./api:/var/www/html:cache       # bind-mount source for live reload
      - katteyes_storage:/var/www/html/storage
    depends_on:
      mysql: { condition: service_healthy }
      mailpit: { condition: service_started }

  web:
    build:
      context: .
      dockerfile: docker/web.Dockerfile.dev
    env_file: .env
    ports: ["${WEB_PORT:-5173}:5173"]
    volumes:
      - ./web:/app:cache               # bind-mount, node_modules in named volume
      - web_node_modules:/app/node_modules
    depends_on:
      - api

  mailpit:
    image: axllent/mailpit:latest
    ports:
      - "${MAILPIT_PORT:-8025}:8025"   # web UI
      - "1025:1025"                     # SMTP
    # لا volume — emails الفايتة تُحذف عند إعادة التشغيل

  phpmyadmin:
    image: phpmyadmin:latest
    environment:
      PMA_HOST: mysql
      PMA_PORT: 3306
    ports: ["${PHPMYADMIN_PORT:-8080}:80"]
    depends_on:
      mysql: { condition: service_healthy }

volumes:
  katteyes_db_data:        # persistent
  katteyes_storage:        # persistent (shared between host + container)
  web_node_modules:        # persistent (لا تحذف عند إعادة البناء)
```

**`docker/api.Dockerfile`:**
```dockerfile
FROM php:8.3-cli-bookworm

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev libxml2-dev \
    default-mysql-client \
 && docker-php-ext-install pdo_mysql gd zip bcmath \
 && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html

# الـ source يُبَنت عبر bind-mount (لا نضعه هنا)
EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
```

**`docker/web.Dockerfile.dev`:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
# node_modules تأتي عبر volume
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

**Networking:**
- حاوية `api` تتصل بـ `mysql` عبر `DB_HOST=mysql` (DNS name).
- `web` يستهلك API عبر `http://api:8000` (داخل الـ network) أو `VITE_API_URL=http://localhost:8000` (من الـ browser).
- كل الـ host ports قابلة للتعديل عبر الـ root `.env`.

**Volumes (persistence strategy):**
- `katteyes_db_data`: بيانات MySQL (يبقى بعد `docker compose down`)
- `katteyes_storage`: ملفات Laravel storage (الصور المرفوعة محلياً) — مشتركة بين host + container لـ `php artisan storage:link`
- `web_node_modules`: cache لـ dependencies (يبقى عبر rebuilds)

**Live reload:**
- تعديلات `api/**` تنعكس مباشرة في الـ container (bind-mount)
- تعديلات `web/**` تنعكس مباشرة في Vite HMR (bind-mount)

### 9.1.2 Daily driver commands

```bash
docker compose up -d                   # يقلع كل الحاويات
docker compose down                    # يوقف ويحذف الحاويات (الـ volumes تبقى)
docker compose down -v                 # يحذف الـ volumes (DB + storage)
docker compose logs -f api             # tail الـ API logs
docker compose exec api bash           # يدخل الـ container
docker compose exec api php artisan migrate:fresh --seed
docker compose exec api php artisan test
```

### 9.2 Setup scripts
```
scripts/
├── setup.sh / setup.ps1              ← boot from zero
├── fresh.sh                          ← migrate:fresh --seed + storage:link
├── test.sh                           ← run all tests
├── backup-db.sh                      ← mysqldump + s3 cp
└── deploy.sh                         ← Forge-style deploy helper
```

### 9.3 Environment files

**Root `.env` (تُحمّل في كل الحاويات):**
```bash
# ── Database (used by api + mysql container) ──
DB_DATABASE=katteyes
DB_USERNAME=katteyes
DB_PASSWORD=katteyes_password
DB_ROOT_PASSWORD=root_password
DB_PORT=3306

# ── Ports ──
API_PORT=8000
WEB_PORT=5173
PHPMYADMIN_PORT=8080
MAILPIT_PORT=8025

# ── Admin seed (created in first migrate --seed) ──
ADMIN_EMAIL=admin@katteyes.test
ADMIN_PASSWORD=password
ADMIN_NAME="Store Admin"

# ── WhatsApp Business ──
WHATSAPP_NUMBER=967713301759
```

**`api/.env` (auto-generated by setup.sh من الـ root env):**
```bash
APP_NAME="Katteyes Fashion"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:${API_PORT:-8000}
APP_TIMEZONE=Asia/Aden

# داخل الـ container, الـ host = service name
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

SESSION_DRIVER=cookie
CACHE_STORE=database
QUEUE_CONNECTION=sync

FILESYSTEM_DISK=local

FRONTEND_URL=http://localhost:${WEB_PORT:-5173}
SANCTUM_STATEFUL_DOMAINS=localhost:${WEB_PORT:-5173}

WHATSAPP_NUMBER=${WHATSAPP_NUMBER}

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_FROM_ADDRESS="noreply@katteyes.test"
MAIL_FROM_NAME="${APP_NAME}"
```

**`web/.env` (auto-generated):**
```bash
VITE_API_URL=http://localhost:${API_PORT:-8000}/api/v1
```

**Fallback mode (LOCAL=1 — بدون Docker):**
- `DB_HOST=127.0.0.1` بدل `mysql`
- `MAIL_MAILER=log` بدل `mailpit`
- `FRONTEND_URL=http://localhost:5173` كما هو

### 9.4 Production topology (recommended)
```
Internet
    │
    ▼
┌──────────────┐         ┌─────────────────────────┐
│   Netlify    │         │   DigitalOcean VPS       │
│   (Web SPA)  │         │   (Laravel Forge)        │
│   - CDN      │ ──────▶ │   - PHP-FPM 8.3          │
│   - SSL auto │ /api/*  │   - Nginx + Let's Enc    │
└──────────────┘         │   - MySQL 8              │
                         │   - Redis (cache)        │
                         └────────┬────────────────┘
                                  │
                                  ▼
                           ┌──────────────┐
                           │ AWS S3 bucket│
                           │ (products)   │
                           └──────────────┘
```

**`scripts/deploy.sh` (Forge-targeted):**
```bash
git pull origin main
cd api
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache route:cache view:cache
php artisan storage:link
php artisan queue:restart
```

**Web SPA:** Netlify auto-detects Vite → `npm run build` → CDN deploy.

### 9.5 Backups
- **Dev (Docker):** الـ DB في `katteyes_db_data` volume. اللقطات اليدوية:
  ```bash
  docker compose exec mysql mysqldump -u root -p$DB_ROOT_PASSWORD katteyes | gzip > backup-$(date +%F).sql.gz
  ```
- **Production (Forge + MySQL on VPS):** Forge scheduled backups (daily, 7-day retention). Manual: `bash scripts/backup-db.sh` → `mysqldump | gzip` → `s3 cp s3://katteyes-backups/`
- **S3 images:** versioning on + lifecycle rule 90-day noncurrent → Glacier
- **RTO:** ~5 min (gunzip + mysql restore)

### 9.6 Cron
**Production (Forge):** تُسجّل في Forge Scheduler UI (نفس الـ commands). يعمل تحت `forge` user.

**Production (self-hosted VPS):** Entry في host crontab:
```cron
* * * * * cd /home/forge/katteyes-fashion/api && php artisan schedule:run >> /dev/null 2>&1
```

**Dev (Docker):** الـ scheduler يحتاج عملية منفصلة (الـ api container يعمل `serve` فقط). خياران:
1. **أبسط:** نفّذ الـ commands يدوياً حسب الحاجة (`docker compose exec api php artisan products:prune-images`).
2. **للـ CI/automation:** خدمة إضافية في `docker-compose.yml`:
   ```yaml
   scheduler:
     build: { context: ., dockerfile: docker/api.Dockerfile }
     command: php artisan schedule:work
     depends_on: [api, mysql]
     env_file: .env
     volumes: [./api:/var/www/html:cache]
   ```
   (يُضاف في الـ plan لو احتجنا scheduled jobs في dev.)

الـ commands المسجلة:
```php
// api/app/Console/Kernel.php
$schedule->command('products:prune-images')->daily();
$schedule->command('queue:prune-failed')->weekly();
$schedule->command('backup:db')->daily()->at('03:00');
```

### 9.7 Observability (YAGNI in v1)
- v1: Laravel logs إلى `storage/logs/laravel.log`. `php artisan pail` في dev.
- Future: Sentry, Forge server metrics, Telescope (DEV ONLY).

---

## 10. Out of Scope (Logged for Future)

| # | Deferred | Why |
|---|---|---|
| 1 | CI/CD pipelines | manual deploys كافية للـ MVP |
| 2 | Multi-environment (staging) | production فقط للـ v1 |
| 3 | Email transactional | log driver فقط في v1 |
| 4 | Real-time updates | polling/refresh عادي |
| 5 | Per-IP rate limit على storefront | Cloudflare في الإنتاج |
| 6 | Admin 2FA | يضاف لما الحساب يدخل الإنتاج الفعلي |
| 7 | E2E browser tests (Playwright) | manual QA يكفي في v1 |
| 8 | Customer phone capture | نُفعّله بناءً على طلب المستخدم لاحقاً |
| 9 | Payment gateway | checkout ما زال WhatsApp-based فقط |
| 10 | Multi-vendor | single-tenant فقط |

---

## 11. Acceptance Criteria

Implementation plan يُعتبر مكتمل لما يتحقق التالي:

### Functional
- [ ] `bash scripts/setup.sh` يقوم بكل من الـ API و الـ Web بدون تدخل يدوي
- [ ] صفحة الـ storefront تعرض categories + products w/ filter + search
- [ ] صفحة تفاصيل المنتج تعرض slider للصور + اختيار لون/مقاس
- [ ] Cart في الـ Zustand يبقى عبر reloads (persisted)
- [ ] Checkout POST يحفظ order في MySQL ويُرجع `whatsapp_link`
- [ ] فتح الـ WhatsApp link يفتح تبويب جديد مع رسالة مُنسّقة
- [ ] Admin login مع `role:admin` يعمل ويحمي `/api/v1/admin/*`
- [ ] Customer login/registration يعمل ويعود token صحيح
- [ ] Customer مسجّل يستدعي `GET /api/v1/my/orders` ويُرجع طلباته فقط
- [ ] Admin يقدر ينشئ/يعدّل/يحذف (ناعم) منتج بصورة واحدة على الأقل
- [ ] Admin يقدر يضيف صور متعددة لمنتج موجود
- [ ] صورة محذوفة من المنتج غير ظاهرة في الـ storefront
- [ ] منتج soft-deleted لا يظهر في public APIs
- [ ] Admin يقدر يصيّف الـ categories في الـ admin (chips) ويرى المنتجات فقط داخل قسم مُختار
- [ ] Admin يقدر يحدث حالة طلب `new → confirmed → shipped → delivered`
- [ ] Guest يقدر يعرض طلب سابق بـ `order_number + email`

### Technical
- [ ] جميع الـ 5 Backend decision flows تم تنفيذها كـ Pest feature tests
- [ ] `php artisan test` و `npm test` ينجحون 100%
- [ ] `npm run build` ينتج `web/dist/` بدون أخطاء TS أو lint
- [ ] `php artisan test --coverage` يظهر ≥ 70% على backend المحدد
- [ ] CORS يعمل فقط لـ `FRONTEND_URL` المحدد
- [ ] صور تُرفع → resized → WebP → تُخزّن على الـ disk المحدد من env
- [ ] WhatsApp link يُبنى في backend من `WHATSAPP_NUMBER` env
- [ ] RTL يعمل في chromium + mobile browsers (manual QA)
- [ ] API docs أو OpenAPI spec منشأ على `docs/api-contract.md`
- [ ] README يصف خطوة-بخطوة كيف يُشغّل و يُنشر

### Operational
- [ ] `.env.example` كامل لكلا الـ apps + root `.env.example` للـ Docker
- [ ] `bash scripts/setup.sh` يقلع docker stack بالكامل ويشغّل migrations على Windows + Linux (Docker Desktop / Docker Engine متطلب)
- [ ] `LOCAL=1 bash scripts/setup.sh` يعمل بنفس النتيجة بدون Docker (Herd/php fallback)
- [ ] `docker compose up -d` يقلع mysql + api + web + mailpit + phpmyadmin بدون errors
- [ ] `docker compose exec api php artisan test` ينجح 100% داخل container الـ api
- [ ] `phpmyadmin` على `localhost:8080` يرى الـ DB `katteyes` مع الـ seed
- [ ] Mailpit UI على `localhost:8025` يستقبل أي email نرسله من الـ API (debugging)
- [ ] `scripts/backup-db.sh` ينتج نسخة مضغوطة في `s3://...`
- [ ] `scripts/deploy.sh` ينجح على Laravel Forge dry-run (manual test)
- [ ] scheduled cron tasks مُسجّلة في `Kernel.php`

---

## 12. Open Questions

لا أسئلة مفتوحة حالياً. كل القرارات اتُخذت في الـ brainstorming وتم تأكيدها.

---

## 13. Appendix A — Cross-References

| Topic | Section |
|---|---|
| Architecture overview | §3 |
| Database schema | §4 |
| REST contract | §5 |
| Frontend structure | §6 |
| Auth flow | §7.1 |
| Image upload pipeline | §7.2 |
| Order + WhatsApp flow | §7.3 |
| Testing | §8 |
| Deployment | §9 |
| Acceptance criteria | §11 |

---

## 14. Document History

| Date | Author | Change |
|---|---|---|
| 2026-09-16 | Claude (brainstorming session with user) | Initial spec — 7 sections + acceptance criteria |
| 2026-09-17 | Claude | Docker Desktop primary path + docker-compose stack (mysql, api, web, mailpit, phpmyadmin); updated §9.1, §9.3 .env files, §9.5 service design; added `docker/` folder to §3.1 |
