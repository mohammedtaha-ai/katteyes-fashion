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
- `DatabaseSeeder::run()` → calls `AdminSeeder::class` only (more seeders added in Phases 3 & 9)

### Categories (public + admin)
_(populated by Phase 3)_

### Products (public list/detail + admin CRUD + images)
_(populated by Phase 4–5)_

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
