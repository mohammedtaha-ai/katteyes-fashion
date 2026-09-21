# Design Specification: UI/UX Modernization, Performance Optimization & Redis Integration

- **Document Date:** 2026-09-22
- **Last Revised:** 2026-09-22 (v1.1 — Post-review corrections)
- **Project:** Katteyes Fashion
- **Architectural Path:** System-wide UI/UX & Infrastructure Enhancement

---

## 1. Executive Summary & Problem Statement

Katteyes Fashion is a modern fashion e-commerce web platform consisting of a Laravel 11 backend, a React 19 + Tailwind CSS frontend, and a Docker environment.

### Problems Identified:
1. **Severe Latency & Queueing in Docker:**
   - ~~PHP CLI server (`php artisan serve`) was running with OPcache disabled for CLI (`opcache.enable_cli=0`).~~ *(Resolved — OPcache CLI is now enabled in `api.Dockerfile`.)*
   - ~~`PHP_CLI_SERVER_WORKERS` was commented out and missing the `--no-reload` flag, causing the server to run in single-threaded mode.~~ *(Resolved — 4 workers with `--no-reload` now configured.)*
   - Mounting code from Windows host into Docker still incurs filesystem I/O overhead.
   - Cache, sessions, and queues all rely on MySQL `database` driver instead of in-memory Redis, adding unnecessary latency to every request.
2. **Product Creation Failure & UI Lock:**
   - Backend `ProductUpsertRequest` required `images` (min: 1) and `slug` (required string).
   - Frontend `AdminProductEditPage.tsx` hid image uploading on new products (`isNew`), sent no images, and omitted `slug`.
   - Mutation had no `onError` handler, causing silent failures (HTTP 422) where the submit button froze indefinitely.
   - Colors and sizes were sent in `FormData` but never validated or persisted into the `product_options` table.
3. **Product Editing & Viewing Discrepancies:**
   - Admin product edit queried the public storefront endpoint `/products/{slug}` instead of `/admin/products/{id}`, causing 404 errors for ID lookups.
   - Admin product table queried the public storefront endpoint, filtering out inactive and soft-deleted products.
4. **Lack of High-Speed In-Memory Caching:**
   - Cache and sessions relied on database queries instead of in-memory caching like Redis.
5. **Static & Outdated UI/UX:**
   - Storefront was minimal and lifeless without engagement drivers (no dynamic banners, no quick preview, no responsive story pills, no cart feedback).
   - Admin panel lacked modern KPI visibility, quick status toggling, and rich option badges.

---

## 2. Infrastructure & Performance Architecture (Redis & OPcache)

### 2.1 Redis Service Integration
Add a dedicated Redis 7 container to `docker-compose.yml`:
```yaml
  redis:
    image: redis:alpine
    command: ["redis-server", "--appendonly", "yes"]
    ports: ["6379:6379"]
    volumes:
      - katteyes_redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
```

Update the `api` service to depend on Redis (ensures Redis is healthy before the API starts):
```yaml
  api:
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
```

- In `docker/api.Dockerfile`:
  Install `phpredis` extension:
  ```dockerfile
  pecl install redis && docker-php-ext-enable redis
  ```
- In `.env` and `api/.env`:
  > **⚠️ Note:** Current `api/.env` has `REDIS_HOST=127.0.0.1` which will not work inside Docker. Must be changed to the Docker service name `redis`.
  ```env
  CACHE_STORE=redis
  SESSION_DRIVER=redis
  QUEUE_CONNECTION=redis
  REDIS_CLIENT=phpredis
  REDIS_HOST=redis
  REDIS_PORT=6379
  ```

### 2.2 Database-to-Redis Migration Strategy
Since cache, sessions, and queues currently use the `database` driver:
1. **Cache:** Run `php artisan cache:clear` after switching `CACHE_STORE` to `redis`. The MySQL `cache` table can remain as fallback but will no longer be written to.
2. **Sessions:** All active user sessions stored in the `sessions` table will be invalidated — users will need to re-login. Schedule the migration during a low-traffic window.
3. **Queue Jobs:** Drain existing database queue jobs before switching: `php artisan queue:work --stop-when-empty`. Any remaining jobs in the `jobs` table after the switch will be orphaned.
4. **Rollback Plan:** If Redis becomes unavailable, revert the three env vars (`CACHE_STORE`, `SESSION_DRIVER`, `QUEUE_CONNECTION`) back to `database`. No data migration is needed for rollback since MySQL tables remain intact.

### 2.3 PHP CLI OPcache & Concurrency (✅ Already Configured)
> **Note:** The following optimizations are already in place in `docker/api.Dockerfile`. Listed here for completeness — no changes needed.

- OPcache CLI enabled (`opcache.enable_cli=1`), 256MB memory, 20k accelerated files.
- Docker CMD runs `php artisan serve --host=0.0.0.0 --port=8000 --no-reload` with `PHP_CLI_SERVER_WORKERS=4`.
- **Expected Outcome (with Redis):** Sub-300ms response times for all API endpoints, zero request queue blocking.

---

## 3. UI/UX Design System & Tokens

### 3.1 Color Palette & Theme Tokens (`tailwind.config.js`)
- **Brand Primary:** `#0F172A` (Rich Slate Black - modern luxury).
- **Brand Accent:** `#E5A83B` and `#D97706` (Vibrant warm gold for primary CTAs, active highlights, badges).
- **Surfaces:** `#F8FAFC` and `#F1F5F9` (Clean, soft light background).
- **Status Colors:**
  - Active / Success: `#10B981` (Emerald).
  - Discount / Danger / Delete: `#EF4444` (Ruby).
  - Info / Actions: `#3B82F6` (Royal Blue).

### 3.2 Typography & Elevations
- **Font Family:** `Tajawal`, sans-serif (RTL Arabic optimized with English fallback).
- **Border Radii:** `rounded-xl` (12px) and `rounded-2xl` (16px) for cards, inputs, and dialogs.
- **Shadows & Hover States:** `shadow-sm`, `shadow-md`, `hover:shadow-xl hover:-translate-y-1 transition-all duration-300`.

---

## 4. Storefront Architecture & Components

1. **Modern Sticky Header (`Header.tsx`):**
   - Top announcement promo bar ("✨ New Summer Fashion Collection 2026 | Fast Delivery Across All Governorates 🚚").
   - Brand logo with modern typography and accent glow.
   - Interactive cart trigger with item count pulse animation (reads from `cart-store.ts` Zustand store).
   - Direct navigation to "My Orders" and "Sign In / Admin".

2. **Interactive Promotional Hero Banner (`HeroPromoSlider.tsx`):**
   - Dynamic slide transitions featuring campaign promotions, fashion highlights, and clear call-to-actions ("Shop Now").
   - **Data Source:** Static slides array defined in component (no API endpoint). Future iteration may introduce a CMS-backed `/api/banners` endpoint.
   - **Auto-play:** 5s interval with pause-on-hover, manual prev/next navigation.

3. **Category Story / Pill Bar (`CategoryStoryBar.tsx`):**
   - Instagram Stories-style circular category pills along the top with smooth horizontal scrolling.
   - Luminous gold active ring indicating the selected category.
   - **Data Source:** Fetches from existing `GET /api/categories` endpoint via `useCategories()` hook.
   - **Interaction:** Selecting a pill filters the product grid below (replaces current `CategoryTabs.tsx` component).

4. **Smart Interactive Product Card (`SmartProductCard.tsx`):**
   - Fashion-standard 3:4 aspect ratio.
   - **Hover Image Swap:** Smoothly shows the secondary angle image on hover if available.
   - **Promotional Badges:** "New ✨", "Sale 🔥", "Top Trending ⭐".
   - **Color Swatches:** Circular color dots showing available variants directly on the card (reads from `product.options` relation).
   - **Quick Add to Cart:** Single-click drawer/overlay to choose size and add immediately (writes to `cart-store.ts`).

5. **Toast Notification System (`ToastNotification.tsx`):**
   - Floating notifications appearing on cart actions, showing thumbnail, product name, and "View Cart" CTA.
   - **State Management:** Managed via a dedicated `toast-store.ts` Zustand store with auto-dismiss (4s timeout).
   - Positioned fixed bottom-right (LTR) / bottom-left (RTL), stacks up to 3 visible toasts.

6. **Loading & Error States (cross-cutting):**
   - **Skeleton Loaders:** Product grid, category bar, and hero banner display animated pulse skeleton placeholders during data fetching.
   - **React Error Boundary:** Wrap each major section (`HeroPromoSlider`, `CategoryStoryBar`, product grid) in error boundaries to prevent full-page crashes. Fallback UI shows a retry button with a friendly message.

---

## 5. Admin Dashboard Architecture & Components

1. **Admin Header & KPI Metric Cards (`AdminDashboardMetrics.tsx`):**
   - Quick KPI cards at the top: Total Products (Active / Inactive breakdown), Categories Count, and New Orders Count.
   - **Data Source:** New `GET /api/admin/dashboard/stats` endpoint returning aggregated counts in a single query.
   - Direct "View Live Store 🌐" shortcut in sidebar.

2. **Revamped Product Edit/Create Form (`AdminProductEditPage.tsx`):**
   - **Immediate Image Uploader:** Visible and active during product creation (`isNew`). Supports Drag & Drop, thumbnails, reordering, and deleting.
   - **Client-side Image Validation:** Enforces at least one image before submission with a clear, polite notice.
   - **Interactive Color & Size Badges (`TagInput.tsx`):** Quick-select standard sizes (`S`, `M`, `L`, `XL`, `XXL`) and custom color tags.
   - **Automatic Slug Generator:** Auto-derives unique slug from product name in the background.
   - **Comprehensive Error & Success Feedback:** Spinner during saving, explicit red field validations, and green toast on success.
   - **Mutation Error Handling:** `onError` callback parses Laravel 422 validation errors and maps them to field-level messages. `onSettled` always re-enables the submit button to prevent UI lock.
   - **Data Fetch:** Uses new `useAdminProduct(id)` hook fetching from `GET /api/admin/products/{id}` (not the public `/products/{slug}` endpoint).

3. **Admin Products Table (`AdminProductsPage.tsx`):**
   - Backed by dedicated `useAdminProducts()` hook to fetch all products including inactive and soft-deleted items via `GET /api/admin/products`.
   - Quick filters by category and status (`All`, `Active`, `Inactive`, `Deleted`).
   - Single-click status toggle (Active / Disabled), edit button, delete, and restore actions.

4. **Real-time Categories Management (`AdminCategoriesPage.tsx`):**
   - Instant addition, inline editing, and deletion with zero-delay updates powered by Redis cache invalidation.

---

## 6. Backend API & Data Integrity (Laravel 11)

1. **Product Model (`Product.php`):**
   - Add `makeUniqueSlug(string $name)` boot listener to automatically generate unique slugs when not explicitly passed.
2. **Form Request (`ProductUpsertRequest.php`):**
   - Make `slug` optional (`sometimes|nullable`).
   - Add validation for `colors` (`sometimes|array`, `colors.*: string|max:50`) and `sizes` (`sometimes|array`, `sizes.*: string|max:50`).
3. **Admin Product Controller (`Admin/ProductController.php`):**
   - **`store` & `update`:** Sync colors and sizes with `product_options` table. Delete existing options then bulk-insert new ones in a transaction.
   - **`show`:** Eager load `['category', 'images', 'options']`.
4. **Dashboard Stats Endpoint (`Admin/DashboardController.php`):**
   - New `GET /api/admin/dashboard/stats` returning: `{ products_total, products_active, products_inactive, categories_count, orders_new }`.
   - Cache response in Redis for 5 minutes (`Cache::remember('admin.dashboard.stats', 300, ...)`).
5. **FormData PUT/PATCH Handling:**
   - In the frontend Axios client (`web/src/api/client.ts`), add an interceptor that detects `FormData` bodies on `PUT`/`PATCH` requests:
     ```typescript
     if (config.data instanceof FormData && ['put', 'patch'].includes(config.method)) {
       config.data.append('_method', config.method.toUpperCase());
       config.method = 'post';
     }
     ```
   - Laravel's `\Illuminate\Http\Middleware\TrustProxies` and `ConvertEmptyStringsToNull` middleware handle the rest automatically — no backend changes needed for `_method` spoofing.
6. **Redis Cache Invalidation:**
   - Invalidate relevant cache keys on product/category create, update, and delete operations using `Cache::forget()`.
   - Tag-based caching (`Cache::tags(['products'])`) for bulk invalidation where supported.

---

## 7. Realistic Seed Data (`ProductSeeder.php`)

Create a database seeder populating:
- Realistic Arabic categories: "فساتين سهرة" (Evening Dresses), "عبايات خليجية" (Abayas), "ملابس كاجوال" (Casual Wear), "أحذية وحقائب" (Shoes & Bags), "إكسسوارات" (Accessories).
- Rich product records with realistic pricing in Yemeni Rials (YER), curated color sets, size options, and image assets.

### Image Strategy:
- Use placeholder fashion images from `https://picsum.photos` or `https://via.placeholder.com` during seeding.
- Download images to `storage/app/public/products/` using Laravel's `Storage::disk('public')`.
- Each product should have 2–4 images stored in the `product_images` table with sequential `sort_order`.
- Create symbolic link: `php artisan storage:link`.

### Integration:
- Update `DatabaseSeeder.php` to call `CategorySeeder::class` before `ProductSeeder::class`.
- Seeder should be idempotent (use `firstOrCreate` for categories, `truncate` + re-seed for products in dev).

---

## 8. Test-Driven Development (TDD) Strategy

### Automated Backend Tests (Pest / PHPUnit):

**Product CRUD & Validation:**
1. `test_admin_can_create_product_without_explicit_slug_and_slug_is_auto_generated`
2. `test_admin_can_create_and_update_product_with_colors_and_sizes_in_options`
3. `test_admin_show_product_returns_eager_loaded_images_and_options`
4. `test_admin_products_index_supports_status_and_trashed_filtering`
5. `test_admin_create_product_with_images_stores_files_and_creates_records`
6. `test_admin_update_product_via_formdata_post_with_method_put_succeeds`

**Authentication & Authorization:**
7. `test_unauthenticated_user_cannot_access_admin_endpoints`
8. `test_non_admin_user_receives_403_on_admin_routes`

**Redis & Infrastructure:**
9. `test_redis_connection_is_available_and_cache_store_works`
10. `test_dashboard_stats_endpoint_returns_correct_aggregated_counts`

### Automated Frontend Tests (Vitest & Testing Library):

**Admin Pages:**
1. `AdminProductEditPage` displays image uploader on new product creation.
2. `AdminProductEditPage` displays validation error if images are missing.
3. `AdminProductEditPage` shows field-level errors on 422 response and re-enables submit button.
4. `AdminProductsPage` renders full admin products list with status badges.

**Storefront Components:**
5. `HomePage` renders hero promo slider and category story pills.
6. `SmartProductCard` shows secondary image on hover and displays color swatches.
7. `ToastNotification` appears on cart add action and auto-dismisses after timeout.
8. `CategoryStoryBar` filters product grid when a category pill is selected.
