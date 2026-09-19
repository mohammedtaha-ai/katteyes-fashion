# Function Catalog

> **Format:** `ClassName::methodName(argType, argType) → path/to/file.ext:lineStart`
> Updated after each task. Group by **domain**, not by file — orient toward features.

---

## api/ — Backend

### Auth
- `User::create(array)` → `api/app/Models/User.php:13` (Laravel default; HasApiTokens trait added in Task 2.3)
- `User::role` column `enum('admin','customer') default 'customer'` → `api/database/migrations/0001_01_01_000000_create_users_table.php:20`
- `AuthController::register(RegisterRequest)` → `api/app/Http/Controllers/Api/V1/AuthController.php:18`
- `AuthController::login(LoginRequest)` → `api/app/Http/Controllers/Api/V1/AuthController.php:31`
- `AuthController::logout(Request)` → `api/app/Http/Controllers/Api/V1/AuthController.php:42`
- `AuthController::logoutAll(Request)` → `api/app/Http/Controllers/Api/V1/AuthController.php:47`
- `AuthController::me(Request)` → `api/app/Http/Controllers/Api/V1/AuthController.php:52`
- `RegisterRequest::rules()` → email unique + password (Password::min(8))
- `LoginRequest::rules()` → email + password required
- `UserResource::toArray()` → id, name, email, role
- `RateLimiter::for('auth')` → 60 req/min per IP (spec §5.8)
- `EnsureRole` middleware guards admin-only routes (registered in Phase 2.4 / 3.2)
- `AdminSeeder::run()` → `api/database/seeders/AdminSeeder.php:11`
  - Reads ADMIN_EMAIL/ADMIN_NAME/ADMIN_PASSWORD from env
  - Creates user with role='admin' (uses firstOrNew + direct assignment to bypass Fillable)
  - Idempotent (safe to run multiple times)
- `DatabaseSeeder::run()` → calls `AdminSeeder::class` only (categories are NOT seeded; admin adds them via dashboard — see Task 3.4 reversal)

### Categories (public + admin)
- `Category::products()` → returns `hasMany(Product::class)` relation (Product model added in Phase 4)
- `Category` uses `SoftDeletes` trait; `find()` excludes soft-deleted, `withTrashed()` includes
- `CategoryFactory::definition()` → `api/database/factories/CategoryFactory.php:11`
- Migration: `categories` table with `id, name, slug unique, is_active bool default true, sort_order int default 0, timestamps, deleted_at`
- `categories` admin endpoints (Task 3.2)
  - `CategoryController::index(Request)` → `api/app/Http/Controllers/Api/V1/Admin/CategoryController.php:13` (with `?with_trashed=1`)
  - `CategoryController::store(CategoryUpsertRequest)` → line 22
  - `CategoryController::show($id)` → line 27
  - `CategoryController::update(CategoryUpsertRequest, $id)` → line 32
  - `CategoryController::destroy($id)` → soft delete
  - `CategoryController::restore($id)` → restore soft-deleted
  - `CategoryController::forceDestroy($id)` → hard delete (works on active or soft-deleted)
  - `CategoryUpsertRequest::rules()` → name required, slug required on create / optional on update, unique (excludes current id)
  - `CategoryResource::toArray()` → id, name, slug, is_active, sort_order, products_count (when loaded)
- `GET /api/v1/categories` public endpoint (Task 3.3)
  - `CategoryController::index()` (public) → `api/app/Http/Controllers/Api/V1/CategoryController.php:11`
    - Returns only `is_active=true` and not soft-deleted categories
    - Ordered by `sort_order ASC, id ASC`
    - No auth required (public storefront endpoint, spec §5.3)
  - Route: `api/routes/api.php` — public section, no middleware beyond the `api/v1` prefix from `bootstrap/app.php` (`apiPrefix: 'api/v1'`)
- `DatabaseSeeder::run()` → calls `AdminSeeder` only. Categories (and all future entities) are added by the admin via the dashboard. No default seeders.

### Products (public list/detail + admin CRUD + images)
- `Product::category()` → `belongsTo(Category::class)` (Phase 4.1)
- `Product::images()` → `hasMany(ProductImage::class)` (Phase 5)
- `Product::options()` → `hasMany(ProductOption::class)` (Phase 4.6)
- `Product::orderItems()` → `hasMany(OrderItem::class)` (Phase 6)
- `Product::getDiskAttribute()` → returns `config('filesystems.default')` (used by `ProductImageResource` in Phase 5 to build full URLs)
- `ProductFactory::definition()` → `api/database/factories/ProductFactory.php:11`
- `products` table: id, name 150, slug 180 unique, description text, price decimal(10,2), currency varchar(3) default 'YER', category_id FK restrictOnDelete, is_active bool, timestamps, deleted_at; INDEX (category_id, is_active)
- `ProductResource::toArray()` → `api/app/Http/Resources/ProductResource.php:13`
  - Fields: id, name, slug, description, price (float), currency, category (whenLoaded), is_active (bool), images (whenLoaded via callback form), colors[] (whenLoaded), sizes[] (whenLoaded)
  - `category`, `images`, `colors`, `sizes` only present when their relations are eager-loaded (N+1 prevention). Uses callback form for `whenLoaded()` to avoid `MissingValue`-is-truthy bug triggering spurious queries.
- `ProductImageResource::toArray()` (STUB) → `api/app/Http/Resources/ProductImageResource.php:8` — replaced properly in Task 5.2 (with full URL via `Storage::disk->url()`)
- `ProductImage` model (STUB) → `api/app/Models/ProductImage.php:11` — `belongsTo(Product)` + `path`/`sort_order` fillable; fleshed out in Phase 5 with table migration + `ProductImageFactory`

### Orders (create + retrieve + admin + customer my-orders)
_(populated by Phase 6)_

### Image Upload Pipeline
_(populated by Phase 5)_

### Middleware
- `EnsureRole::handle(Request, Closure, string ...$roles)` → `api/app/Http/Middleware/EnsureRole.php:11`
  - Alias: `role` (registered in `api/bootstrap/app.php`)
  - Returns 403 with message "ممنوع" if user.role not in roles list
  - Tests: `api/tests/Feature/Auth/EnsureRoleTest.php` (3 cases: admin allow, customer forbid, unauthenticated forbid)

### Scheduled (artisan commands)
_(populated by Phase 9.7)_

---

## web/ — Frontend

### API layer
_(populated by Phase 7)_

### Stores (Zustand)
_(populated by Phase 7.3)_

### Queries (TanStack)
_(populated by Phase 7.4)_

### Auth / Account
_(populated by Phase 8.5–8.6)_

### Storefront (Home / Detail)
_(populated by Phase 8.1–8.2)_

### Cart + Checkout
_(populated by Phase 8.3–8.4)_

### Admin pages
_(populated by Phase 8.7–8.8)_

### Layout
_(populated by Phase 7.6)_

---

## Cross-cutting

### Docker services (`docker-compose.yml`)
- `mysql:8.4` → port 3306, healthcheck on `mysqladmin ping`, persistent volume `katteyes_db_data`, init SQL from `./docker/mysql-init/`
- `mailpit` (axllent/mailpit:latest) → SMTP 1025 + web UI 8025
- `phpmyadmin` → web UI on 8080, depends on mysql healthy
- _(api + web services added in Phase 1.3/1.4)_

### Routes summary (`api/routes/api.php`)
_(populated as routes are wired in Phases 2–6)_

### Frontend routes (`web/src/routes.tsx`)
_(populated in Phase 7.5)_
