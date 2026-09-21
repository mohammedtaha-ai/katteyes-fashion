# UI/UX Redesign & Performance Optimization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix critical product creation bugs, integrate Redis caching, modernize the storefront and admin UI, and seed realistic catalog data for Katteyes Fashion.

**Architecture:** Three-layer approach — (1) Infrastructure first (Redis + Docker), (2) Backend fixes (slug, validation, controller, dashboard endpoint), (3) Frontend overhaul (admin bug fixes, design system, storefront components). Each task is independently testable and commits atomically.

**Tech Stack:** Laravel 11, PHP 8.3, Redis 7, React 19, TypeScript 6, Tailwind CSS 3.4, Zustand 5, TanStack Query 5, Vitest 4, Pest/PHPUnit

**Spec:** [`docs/superpowers/specs/2026-09-22-ui-ux-redesign-and-performance.md`](file:///f:/workeprojects/katteyes_fashion/docs/superpowers/specs/2026-09-22-ui-ux-redesign-and-performance.md)

## Global Constraints

- PHP ≥ 8.3, Laravel 11, React ≥ 19, TypeScript ~6.0
- RTL-first (Arabic) — all UI text in Arabic, `dir="rtl"` on root
- Font: `Tajawal` (already installed via `@fontsource/tajawal`)
- Currency: YER (Yemeni Rial)
- Docker-based development only — all commands run inside containers
- TDD: write failing test → verify failure → implement → verify pass → commit
- No new npm/composer dependencies unless explicitly listed

## File Structure

### Infrastructure
| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `docker-compose.yml` | Add Redis service, volume, api depends_on |
| Modify | `docker/api.Dockerfile` | Install phpredis extension |
| Modify | `api/.env` | Switch CACHE_STORE, SESSION_DRIVER, QUEUE_CONNECTION to redis |

### Backend
| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `api/app/Models/Product.php` | Auto-slug generation in boot listener |
| Modify | `api/app/Http/Requests/Admin/ProductUpsertRequest.php` | Make slug optional, add colors/sizes rules |
| Modify | `api/app/Http/Controllers/Api/V1/Admin/ProductController.php` | Sync options, eager load images+options in show |
| Create | `api/app/Http/Controllers/Api/V1/Admin/DashboardController.php` | Dashboard stats endpoint |
| Modify | `api/routes/api.php` | Add dashboard route |
| Create | `api/tests/Feature/Admin/ProductSlugTest.php` | Slug auto-generation tests |
| Create | `api/tests/Feature/Admin/ProductOptionsTest.php` | Colors/sizes sync tests |
| Create | `api/tests/Feature/Admin/DashboardStatsTest.php` | Dashboard endpoint tests |

### Frontend — API & Hooks
| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `web/src/api/client.ts` | FormData PUT/PATCH interceptor |
| Modify | `web/src/api/products.api.ts` | Add adminList, adminShow endpoints |
| Modify | `web/src/queries/use-products.ts` | Add useAdminProducts, useAdminProduct hooks |

### Frontend — Design System
| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `web/tailwind.config.js` | Updated brand palette, status colors, surfaces |

### Frontend — Admin Pages
| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `web/src/pages/admin/AdminProductEditPage.tsx` | Image uploader on create, error handling, admin endpoint |
| Modify | `web/src/pages/admin/AdminProductsPage.tsx` | Admin endpoint, status filters, toggle |

### Frontend — Storefront Components
| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `web/src/components/layout/Header.tsx` | Promo bar, pulse cart badge, nav links |
| Create | `web/src/stores/toast-store.ts` | Toast notification Zustand store |
| Create | `web/src/components/storefront/ToastNotification.tsx` | Floating toast component |
| Create | `web/src/components/storefront/HeroPromoSlider.tsx` | Auto-playing hero banner |
| Create | `web/src/components/storefront/CategoryStoryBar.tsx` | Instagram-style category pills |
| Create | `web/src/components/product/SmartProductCard.tsx` | Hover swap, badges, swatches, quick-add |
| Create | `web/src/components/shared/ProductGridSkeleton.tsx` | Skeleton loading placeholder |
| Create | `web/src/components/shared/ErrorBoundary.tsx` | React error boundary with retry |
| Modify | `web/src/pages/storefront/HomePage.tsx` | Wire new storefront components |
| Modify | `web/src/components/layout/StorefrontLayout.tsx` | Add ToastNotification + BottomNav |

### Seed Data
| Action | File | Responsibility |
|--------|------|----------------|
| Create | `api/database/seeders/CategorySeeder.php` | Arabic fashion categories |
| Create | `api/database/seeders/ProductSeeder.php` | Products with options and images |
| Modify | `api/database/seeders/DatabaseSeeder.php` | Call new seeders |

---

### Task 1: Infrastructure — Redis + Docker Configuration

**Files:**
- Modify: `docker-compose.yml:34-45,59-63`
- Modify: `docker/api.Dockerfile:3-8`
- Modify: `api/.env:31,39,41,47`

**Interfaces:**
- Consumes: Nothing
- Produces: Redis service available at hostname `redis:6379` inside Docker network; `phpredis` PHP extension compiled and enabled; Laravel configured to use Redis for cache, sessions, and queues.

- [ ] **Step 1: Add Redis service and volume to docker-compose.yml**

Open `docker-compose.yml`. Add the Redis service before the `volumes:` block (before line 59), add the volume, and update `api.depends_on`:

```yaml
# After the web service (line 57), before volumes:
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

volumes:
  katteyes_db_data:
  katteyes_storage:
  web_node_modules:
  katteyes_redis_data:
```

Also update `api` service `depends_on` (lines 43-45) to include Redis:

```yaml
    depends_on:
      mysql:    { condition: service_healthy }
      mailpit:  { condition: service_started }
      redis:    { condition: service_healthy }
```

- [ ] **Step 2: Install phpredis in api.Dockerfile**

In `docker/api.Dockerfile`, modify the RUN block (line 3-8) to add `pecl install redis`:

```dockerfile
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libjpeg-dev libwebp-dev libonig-dev libxml2-dev default-mysql-client \
 && docker-php-ext-configure gd --with-jpeg --with-webp \
 && docker-php-ext-install pdo_mysql gd zip bcmath opcache \
 && pecl install redis && docker-php-ext-enable redis \
 && echo "zend_extension=opcache\nopcache.enable=1\nopcache.enable_cli=1\nopcache.memory_consumption=256\nopcache.interned_strings_buffer=16\nopcache.max_accelerated_files=20000\nopcache.validate_timestamps=1\nopcache.revalidate_freq=0" > /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
 && rm -rf /var/lib/apt/lists/*
```

- [ ] **Step 3: Update api/.env for Redis**

In `api/.env`, change these lines:

```ini
# Line 31: change from database to redis
SESSION_DRIVER=redis

# Line 39: change from database to redis
QUEUE_CONNECTION=redis

# Line 41: change from database to redis
CACHE_STORE=redis

# Line 47: change from 127.0.0.1 to redis (Docker service name)
REDIS_HOST=redis
```

- [ ] **Step 4: Rebuild and verify**

```bash
docker compose down
docker compose build api --no-cache
docker compose up -d
# Wait for all services healthy, then:
docker compose exec api php -m | grep redis
# Expected: "redis" in the output
docker compose exec api php artisan tinker --execute="echo Cache::store('redis')->put('test', 'ok', 60) ? 'PASS' : 'FAIL';"
# Expected: PASS
```

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml docker/api.Dockerfile api/.env
git commit -m "infra: integrate Redis 7 for cache, sessions, and queues"
```

---

### Task 2: Backend — Product Auto-Slug Generation

**Files:**
- Modify: `api/app/Models/Product.php:1-48`
- Test: `api/tests/Feature/Admin/ProductSlugTest.php` (create)

**Interfaces:**
- Consumes: `Product` model (existing)
- Produces: `Product::booted()` static method that auto-generates a unique slug from `name` when `slug` is null/empty on create and update.

- [ ] **Step 1: Write the failing test**

Create `api/tests/Feature/Admin/ProductSlugTest.php`:

```php
<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductSlugTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->category = Category::create([
            'name' => 'فساتين', 'slug' => 'dresses', 'is_active' => true, 'sort_order' => 0,
        ]);
    }

    public function test_product_auto_generates_slug_when_not_provided(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/products', [
                'name' => 'فستان سهرة أنيق',
                'price' => 15000,
                'currency' => 'YER',
                'category_id' => $this->category->id,
                'images' => [
                    \Illuminate\Http\UploadedFile::fake()->image('dress.jpg', 400, 400),
                ],
            ]);

        $response->assertStatus(201);
        $data = $response->json('data');
        $this->assertNotEmpty($data['slug']);
        $this->assertStringContainsString('فستان-سهرة-أنيق', $data['slug']);
    }

    public function test_duplicate_name_generates_unique_slug(): void
    {
        // Create first product
        $this->actingAs($this->admin)
            ->postJson('/api/admin/products', [
                'name' => 'عباية خليجية',
                'price' => 20000,
                'currency' => 'YER',
                'category_id' => $this->category->id,
                'images' => [
                    \Illuminate\Http\UploadedFile::fake()->image('abaya1.jpg'),
                ],
            ])->assertStatus(201);

        // Create second with same name
        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/products', [
                'name' => 'عباية خليجية',
                'price' => 25000,
                'currency' => 'YER',
                'category_id' => $this->category->id,
                'images' => [
                    \Illuminate\Http\UploadedFile::fake()->image('abaya2.jpg'),
                ],
            ]);

        $response->assertStatus(201);
        $slug = $response->json('data.slug');
        $this->assertNotEquals('عباية-خليجية', $slug);
        $this->assertStringStartsWith('عباية-خليجية', $slug);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
docker compose exec api php artisan test --filter=ProductSlugTest -v
```
Expected: FAIL (slug validation still requires slug, or slug is empty)

- [ ] **Step 3: Implement auto-slug in Product model**

Modify `api/app/Models/Product.php`. Add the `booted` method and `Str` import:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'description', 'price', 'currency', 'category_id', 'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Product $product) {
            if (empty($product->slug)) {
                $product->slug = static::makeUniqueSlug($product->name);
            }
        });

        static::updating(function (Product $product) {
            if ($product->isDirty('name') && !$product->isDirty('slug')) {
                $product->slug = static::makeUniqueSlug($product->name, $product->id);
            }
        });
    }

    public static function makeUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $base = Str::slug($name, '-', null);
        if ($base === '') {
            $base = Str::random(8);
        }

        $slug = $base;
        $counter = 1;
        while (
            static::withTrashed()
                ->where('slug', $slug)
                ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    // ... existing relationships unchanged ...
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function options()
    {
        return $this->hasMany(ProductOption::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getDiskAttribute(): string
    {
        return config('filesystems.default');
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
docker compose exec api php artisan test --filter=ProductSlugTest -v
```
Expected: 2 tests PASS

- [ ] **Step 5: Commit**

```bash
git add api/app/Models/Product.php api/tests/Feature/Admin/ProductSlugTest.php
git commit -m "feat: auto-generate unique slug from product name on create/update"
```

---

### Task 3: Backend — Validation Fix (Slug Optional + Colors/Sizes)

**Files:**
- Modify: `api/app/Http/Requests/Admin/ProductUpsertRequest.php:14-37`
- Test: `api/tests/Feature/Admin/ProductValidationTest.php` (create)

**Interfaces:**
- Consumes: Task 2 auto-slug (slug no longer required in request)
- Produces: `ProductUpsertRequest` accepts optional `slug`, validates `colors[]` and `sizes[]` arrays. Images still required on POST.

- [ ] **Step 1: Write the failing test**

Create `api/tests/Feature/Admin/ProductValidationTest.php`:

```php
<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ProductValidationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->category = Category::create([
            'name' => 'اختبار', 'slug' => 'test', 'is_active' => true, 'sort_order' => 0,
        ]);
    }

    public function test_create_product_without_slug_passes_validation(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/products', [
                'name' => 'منتج بدون سلاق',
                'price' => 5000,
                'currency' => 'YER',
                'category_id' => $this->category->id,
                'images' => [UploadedFile::fake()->image('test.jpg')],
            ]);

        $response->assertStatus(201);
    }

    public function test_create_product_with_colors_and_sizes_passes_validation(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/products', [
                'name' => 'منتج بألوان ومقاسات',
                'price' => 8000,
                'currency' => 'YER',
                'category_id' => $this->category->id,
                'images' => [UploadedFile::fake()->image('test.jpg')],
                'colors' => ['أحمر', 'أزرق', 'أبيض'],
                'sizes' => ['S', 'M', 'L', 'XL'],
            ]);

        $response->assertStatus(201);
    }

    public function test_colors_items_must_be_strings_max_50(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/products', [
                'name' => 'اختبار',
                'price' => 1000,
                'currency' => 'YER',
                'category_id' => $this->category->id,
                'images' => [UploadedFile::fake()->image('test.jpg')],
                'colors' => [str_repeat('x', 51)],
            ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['colors.0']);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
docker compose exec api php artisan test --filter=ProductValidationTest -v
```
Expected: FAIL (`slug` required, `colors` not in validation rules)

- [ ] **Step 3: Update ProductUpsertRequest**

Replace the `rules()` method in `api/app/Http/Requests/Admin/ProductUpsertRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProductUpsertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('product');
        $required = $id ? 'sometimes|required' : 'required';
        $rules = [
            'name' => $required . '|string|max:150',
            'slug' => "sometimes|nullable|string|max:180|unique:products,slug," . ($id ?? 'NULL') . ",id",
            'description' => 'sometimes|nullable|string',
            'price' => $required . '|numeric|min:0',
            'currency' => $required . '|string|size:3',
            'category_id' => $required . '|exists:categories,id',
            'is_active' => 'sometimes|boolean',
            'colors' => 'sometimes|array',
            'colors.*' => 'string|max:50',
            'sizes' => 'sometimes|array',
            'sizes.*' => 'string|max:50',
        ];

        if ($this->isMethod('POST')) {
            $rules['images'] = 'required|array|min:1|max:20';
        } else {
            $rules['images'] = 'sometimes|array|min:1|max:20';
        }
        $rules['images.*'] = 'file|image|mimes:jpeg,jpg,png,webp|max:10240';

        return $rules;
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
docker compose exec api php artisan test --filter=ProductValidationTest -v
```
Expected: 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add api/app/Http/Requests/Admin/ProductUpsertRequest.php api/tests/Feature/Admin/ProductValidationTest.php
git commit -m "fix: make slug optional, add colors/sizes validation rules"
```

---

### Task 4: Backend — Controller Options Sync + Eager Loading

**Files:**
- Modify: `api/app/Http/Controllers/Api/V1/Admin/ProductController.php:33-53`
- Test: `api/tests/Feature/Admin/ProductOptionsTest.php` (create)

**Interfaces:**
- Consumes: Task 3 (colors/sizes now pass validation)
- Produces: `store()` and `update()` persist colors/sizes to `product_options` table. `show()` eager-loads `['category', 'images', 'options']`. `ProductResource` already handles serialization via `whenLoaded('options')`.

- [ ] **Step 1: Write the failing test**

Create `api/tests/Feature/Admin/ProductOptionsTest.php`:

```php
<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ProductOptionsTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->category = Category::create([
            'name' => 'ملابس', 'slug' => 'clothes', 'is_active' => true, 'sort_order' => 0,
        ]);
    }

    public function test_store_persists_colors_and_sizes_to_options_table(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/products', [
                'name' => 'تيشيرت رجالي',
                'price' => 3000,
                'currency' => 'YER',
                'category_id' => $this->category->id,
                'images' => [UploadedFile::fake()->image('shirt.jpg')],
                'colors' => ['أبيض', 'أسود'],
                'sizes' => ['M', 'L', 'XL'],
            ]);

        $response->assertStatus(201);
        $productId = $response->json('data.id');

        $this->assertDatabaseCount('product_options', 5);
        $this->assertDatabaseHas('product_options', [
            'product_id' => $productId,
            'type' => 'color',
            'value' => 'أبيض',
        ]);
        $this->assertDatabaseHas('product_options', [
            'product_id' => $productId,
            'type' => 'size',
            'value' => 'XL',
        ]);
    }

    public function test_update_replaces_options(): void
    {
        // Create product with initial options
        $createRes = $this->actingAs($this->admin)
            ->postJson('/api/admin/products', [
                'name' => 'بنطلون',
                'price' => 5000,
                'currency' => 'YER',
                'category_id' => $this->category->id,
                'images' => [UploadedFile::fake()->image('pants.jpg')],
                'colors' => ['أزرق'],
                'sizes' => ['S'],
            ]);
        $productId = $createRes->json('data.id');

        // Update with new options
        $this->actingAs($this->admin)
            ->postJson("/api/admin/products/{$productId}", [
                '_method' => 'PUT',
                'name' => 'بنطلون محدث',
                'price' => 5500,
                'currency' => 'YER',
                'category_id' => $this->category->id,
                'colors' => ['أحمر', 'أخضر'],
                'sizes' => ['M', 'L'],
            ])
            ->assertOk();

        // Old options replaced
        $this->assertDatabaseMissing('product_options', [
            'product_id' => $productId, 'value' => 'أزرق',
        ]);
        $this->assertDatabaseHas('product_options', [
            'product_id' => $productId, 'type' => 'color', 'value' => 'أحمر',
        ]);
        $this->assertDatabaseCount('product_options', 4); // 2 colors + 2 sizes
    }

    public function test_show_eager_loads_images_and_options(): void
    {
        $createRes = $this->actingAs($this->admin)
            ->postJson('/api/admin/products', [
                'name' => 'حذاء رياضي',
                'price' => 12000,
                'currency' => 'YER',
                'category_id' => $this->category->id,
                'images' => [UploadedFile::fake()->image('shoe.jpg')],
                'colors' => ['أبيض'],
                'sizes' => ['42'],
            ]);
        $productId = $createRes->json('data.id');

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/products/{$productId}");

        $response->assertOk();
        $data = $response->json('data');
        $this->assertArrayHasKey('images', $data);
        $this->assertArrayHasKey('colors', $data);
        $this->assertArrayHasKey('sizes', $data);
        $this->assertContains('أبيض', $data['colors']);
        $this->assertContains('42', $data['sizes']);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
docker compose exec api php artisan test --filter=ProductOptionsTest -v
```
Expected: FAIL (colors/sizes not persisted, show doesn't load options)

- [ ] **Step 3: Update ProductController store, update, and show**

In `api/app/Http/Controllers/Api/V1/Admin/ProductController.php`, add a helper method and update `store`, `update`, `show`:

Add this private method at the bottom of the class (before closing `}`):

```php
    private function syncOptions(Product $product, array $validated): void
    {
        $product->options()->delete();

        $options = [];
        $sort = 0;

        foreach ($validated['colors'] ?? [] as $color) {
            $options[] = ['type' => 'color', 'value' => $color, 'sort_order' => $sort++];
        }
        foreach ($validated['sizes'] ?? [] as $size) {
            $options[] = ['type' => 'size', 'value' => $size, 'sort_order' => $sort++];
        }

        if (count($options) > 0) {
            $product->options()->createMany($options);
        }
    }
```

Update `store` method (lines 33-47) — add `syncOptions` call and load options:

```php
    public function store(ProductUpsertRequest $r, UploadImageAction $action)
    {
        $validated = $r->validated();
        $p = Product::create($validated)->fresh();
        $p->load('category');

        if ($r->hasFile('images')) {
            $paths = $action->handle($r->file('images'));
            foreach ($paths as $i => $path) {
                $p->images()->create(['path' => $path, 'sort_order' => $i]);
            }
        }

        $this->syncOptions($p, $validated);

        $p->load(['images', 'options']);
        return response()->json(['data' => new ProductResource($p)], 201);
    }
```

Update `update` method (lines 55-76) — add `syncOptions` call and load options:

```php
    public function update(ProductUpsertRequest $r, $product, UploadImageAction $action)
    {
        $p = Product::withTrashed()->findOrFail($product);
        $validated = $r->validated();
        $p->update($validated);
        $p->load('category');

        if ($r->hasFile('images')) {
            $oldImages = $p->images()->get();
            $paths = $action->handle($r->file('images'));
            $p->images()->delete();
            foreach ($paths as $i => $path) {
                $p->images()->create(['path' => $path, 'sort_order' => $i]);
            }
            foreach ($oldImages as $old) {
                Storage::disk(config('filesystems.default'))->delete($old->path);
            }
        }

        $this->syncOptions($p, $validated);

        $p->load(['images', 'options']);
        return ['data' => new ProductResource($p)];
    }
```

Update `show` method (lines 49-53) — add images and options to eager load:

```php
    public function show($product)
    {
        $p = Product::withTrashed()->with(['category', 'images', 'options'])->findOrFail($product);
        return ['data' => new ProductResource($p)];
    }
```

- [ ] **Step 4: Run test to verify it passes**

```bash
docker compose exec api php artisan test --filter=ProductOptionsTest -v
```
Expected: 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add api/app/Http/Controllers/Api/V1/Admin/ProductController.php api/tests/Feature/Admin/ProductOptionsTest.php
git commit -m "feat: sync colors/sizes to product_options, eager load in show"
```

---

### Task 5: Backend — Dashboard Stats Endpoint

**Files:**
- Create: `api/app/Http/Controllers/Api/V1/Admin/DashboardController.php`
- Modify: `api/routes/api.php:35-54`
- Test: `api/tests/Feature/Admin/DashboardStatsTest.php` (create)

**Interfaces:**
- Consumes: `Product`, `Category`, `Order` models
- Produces: `GET /api/admin/dashboard/stats` → `{ products_total, products_active, products_inactive, categories_count, orders_new }`

- [ ] **Step 1: Write the failing test**

Create `api/tests/Feature/Admin/DashboardStatsTest.php`:

```php
<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardStatsTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_stats_returns_correct_counts(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $cat = Category::create(['name' => 'تست', 'slug' => 'test', 'is_active' => true, 'sort_order' => 0]);
        Category::create(['name' => 'تست٢', 'slug' => 'test2', 'is_active' => true, 'sort_order' => 1]);

        Product::factory()->count(3)->create(['category_id' => $cat->id, 'is_active' => true]);
        Product::factory()->count(2)->create(['category_id' => $cat->id, 'is_active' => false]);

        $response = $this->actingAs($admin)->getJson('/api/admin/dashboard/stats');

        $response->assertOk()
                 ->assertJsonStructure([
                     'data' => ['products_total', 'products_active', 'products_inactive', 'categories_count', 'orders_new'],
                 ])
                 ->assertJson(['data' => [
                     'products_total' => 5,
                     'products_active' => 3,
                     'products_inactive' => 2,
                     'categories_count' => 2,
                 ]]);
    }

    public function test_unauthenticated_user_cannot_access_dashboard_stats(): void
    {
        $this->getJson('/api/admin/dashboard/stats')->assertUnauthorized();
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
docker compose exec api php artisan test --filter=DashboardStatsTest -v
```
Expected: FAIL (404 — route does not exist)

- [ ] **Step 3: Create DashboardController**

Create `api/app/Http/Controllers/Api/V1/Admin/DashboardController.php`:

```php
<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function stats()
    {
        $data = Cache::remember('admin.dashboard.stats', 300, function () {
            return [
                'products_total' => Product::count(),
                'products_active' => Product::where('is_active', true)->count(),
                'products_inactive' => Product::where('is_active', false)->count(),
                'categories_count' => Category::count(),
                'orders_new' => Order::where('status', 'new')->count(),
            ];
        });

        return response()->json(['data' => $data]);
    }
}
```

- [ ] **Step 4: Add route in api.php**

In `api/routes/api.php`, inside the admin group (after line 35), add:

```php
    Route::get('dashboard/stats', [\App\Http\Controllers\Api\V1\Admin\DashboardController::class, 'stats']);
```

- [ ] **Step 5: Run test to verify it passes**

```bash
docker compose exec api php artisan test --filter=DashboardStatsTest -v
```
Expected: 2 tests PASS

- [ ] **Step 6: Commit**

```bash
git add api/app/Http/Controllers/Api/V1/Admin/DashboardController.php api/routes/api.php api/tests/Feature/Admin/DashboardStatsTest.php
git commit -m "feat: add admin dashboard stats endpoint with Redis caching"
```

---

### Task 6: Frontend — Axios FormData Interceptor + Admin API Hooks

**Files:**
- Modify: `web/src/api/client.ts:9-13`
- Modify: `web/src/api/products.api.ts:36-54`
- Modify: `web/src/queries/use-products.ts:1-30`

**Interfaces:**
- Consumes: Axios client, existing `productsApi` object
- Produces: `apiClient` auto-converts FormData PUT/PATCH to POST+_method. New functions `productsApi.adminList(params)` and `productsApi.adminShow(id)`. New hooks `useAdminProducts(filters)` and `useAdminProduct(id)`.

- [ ] **Step 1: Add FormData interceptor to client.ts**

In `web/src/api/client.ts`, update the request interceptor (lines 9-13) to handle FormData:

```typescript
import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth-store'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`

  // FormData PUT/PATCH → POST + _method spoofing for Laravel
  if (
    config.data instanceof FormData &&
    config.method &&
    ['put', 'patch'].includes(config.method)
  ) {
    config.data.append('_method', config.method.toUpperCase())
    config.method = 'post'
  }

  return config
})

apiClient.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().clear()
      const url = err.config?.url ?? ''
      if (!url.includes('/auth/login')) window.location.assign('/login')
    }
    return Promise.reject(err)
  },
)
```

- [ ] **Step 2: Add admin endpoints to products.api.ts**

In `web/src/api/products.api.ts`, add `adminList` and `adminShow` to the `productsApi` object (after line 40):

```typescript
export const productsApi = {
  list: (params: ProductListParams = {}) =>
    apiClient.get<ProductsListResponse>(`/products${buildQuery(params)}`),
  show: (slug: string) =>
    apiClient.get<ProductResponse>(`/products/${slug}`),

  // Admin-specific endpoints
  adminList: (params: ProductListParams & { status?: string } = {}) =>
    apiClient.get<ProductsListResponse>(`/admin/products${buildQuery(params)}`),
  adminShow: (id: number) =>
    apiClient.get<ProductResponse>(`/admin/products/${id}`),

  adminCreate: (form: FormData) =>
    apiClient.post<ProductResponse>('/admin/products', form),
  adminUpdate: (id: number, form: FormData) =>
    apiClient.patch<ProductResponse>(`/admin/products/${id}`, form),
  adminDelete: (id: number) =>
    apiClient.delete<void>(`/admin/products/${id}`),
  adminRestore: (id: number) =>
    apiClient.post<void>(`/admin/products/${id}/restore`),
  appendImages: (id: number, form: FormData) =>
    apiClient.post<ProductImagesResponse>(`/admin/products/${id}/images`, form),
  deleteImage: (productId: number, imageId: number) =>
    apiClient.delete<void>(`/admin/products/${productId}/images/${imageId}`),
  reorderImages: (id: number, ids: number[]) =>
    apiClient.post<void>(`/admin/products/${id}/images/reorder`, { ids }),
}
```

- [ ] **Step 3: Add admin hooks to use-products.ts**

In `web/src/queries/use-products.ts`, add after the existing `productKeys` (line 11):

```typescript
export const adminProductKeys = {
  all: ['admin-products'] as const,
  lists: () => [...adminProductKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...adminProductKeys.lists(), filters] as const,
  details: () => [...adminProductKeys.all, 'detail'] as const,
  detail: (id: number) => [...adminProductKeys.details(), id] as const,
}
```

Then add the hooks after `useProduct` (after line 29):

```typescript
export interface UseAdminProductsFilters {
  category?: string
  status?: string
  q?: string
}

export const useAdminProducts = (filters: UseAdminProductsFilters = {}) =>
  useQuery({
    queryKey: adminProductKeys.list(filters),
    queryFn: () => productsApi.adminList({ ...filters, page: 1 }),
  })

export const useAdminProduct = (id: number) =>
  useQuery({
    queryKey: adminProductKeys.detail(id),
    queryFn: () => productsApi.adminShow(id),
    enabled: id > 0,
  })
```

Update existing mutation hooks to also invalidate admin query keys. In `useCreateProduct`:

```typescript
export const useCreateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: FormData) => productsApi.adminCreate(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all })
      qc.invalidateQueries({ queryKey: adminProductKeys.all })
    },
  })
}
```

Apply same pattern to `useUpdateProduct`, `useDeleteProduct`, `useRestoreProduct` — add `qc.invalidateQueries({ queryKey: adminProductKeys.all })` in their `onSuccess`.

- [ ] **Step 4: Commit**

```bash
git add web/src/api/client.ts web/src/api/products.api.ts web/src/queries/use-products.ts
git commit -m "feat: add FormData interceptor, admin product API endpoints and hooks"
```

---

### Task 7: Design System — Tailwind Config Update

**Files:**
- Modify: `web/tailwind.config.js:1-14`

**Interfaces:**
- Consumes: Nothing
- Produces: Tailwind tokens — `brand.DEFAULT`, `brand.accent`, `brand.accent-dark`, `brand.light`, `brand.surface`, `status.success`, `status.danger`, `status.info`

- [ ] **Step 1: Update tailwind.config.js**

Replace entire `web/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0F172A',
          accent: '#E5A83B',
          'accent-dark': '#D97706',
          light: '#F8FAFC',
          surface: '#F1F5F9',
        },
        status: {
          success: '#10B981',
          danger: '#EF4444',
          info: '#3B82F6',
        },
      },
      fontFamily: { sans: ['Tajawal', 'sans-serif'] },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Verify build still works**

```bash
docker compose exec web npx vite build --mode development 2>&1 | head -5
```
Expected: Build succeeds without errors

- [ ] **Step 3: Commit**

```bash
git add web/tailwind.config.js
git commit -m "design: update Tailwind tokens with luxury brand palette and status colors"
```

---

### Task 8: Frontend — AdminProductEditPage Revamp

**Files:**
- Modify: `web/src/pages/admin/AdminProductEditPage.tsx:1-248`

**Interfaces:**
- Consumes: Task 6 `useAdminProduct(id)`, `useCreateProduct()`, `useUpdateProduct()`, `useAppendImages()`. Task 7 design tokens.
- Produces: Revamped page with image uploader on create, `onError`/`onSettled` mutation handlers, admin endpoint for data fetch.

- [ ] **Step 1: Rewrite AdminProductEditPage.tsx**

Replace `web/src/pages/admin/AdminProductEditPage.tsx` with the full updated version:

```tsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AxiosError } from 'axios'
import {
  useAdminProduct,
  useCreateProduct,
  useUpdateProduct,
  useAppendImages,
  useDeleteImage,
  useReorderImages,
} from '@/queries/use-products'
import { useAdminCategories } from '@/queries/use-categories'
import { Button } from '@/components/ui/Button'
import { ImageUploader } from '@/components/admin/ImageUploader'

const schema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'السعر غير صالح'),
  currency: z.string().min(1),
  is_active: z.boolean(),
  category_id: z.coerce.number().min(1, 'القسم مطلوب'),
  colors: z.string().optional(),
  sizes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function AdminProductEditPage() {
  const { id } = useParams()
  const isNew = id === 'new' || !id
  const productId = isNew ? 0 : Number(id)
  const navigate = useNavigate()

  const [newFiles, setNewFiles] = useState<File[]>([])
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({})
  const [successMsg, setSuccessMsg] = useState('')

  const { data: prodData } = useAdminProduct(productId)
  const { data: catData } = useAdminCategories()
  const createP = useCreateProduct()
  const updateP = useUpdateProduct()
  const appendImgs = useAppendImages()
  const deleteImg = useDeleteImage()
  const reorderImgs = useReorderImages()

  const cats = catData?.data?.data ?? []
  const product = prodData?.data?.data

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true, currency: 'YER' },
  })

  useEffect(() => {
    if (product && !isNew) {
      reset({
        name: product.name,
        description: product.description ?? '',
        price: product.price,
        currency: product.currency,
        is_active: product.is_active,
        category_id:
          (product as any).category_id ?? (product.category?.id ?? 0),
        colors: (product.colors ?? []).join(','),
        sizes: (product.sizes ?? []).join(','),
      })
    }
  }, [product, isNew, reset])

  const handleMutationError = (error: unknown) => {
    if (error instanceof AxiosError && error.response?.status === 422) {
      const validationErrors = error.response.data?.errors ?? {}
      setServerErrors(validationErrors)
    } else {
      setServerErrors({ general: ['حدث خطأ غير متوقع. حاول مرة أخرى.'] })
    }
  }

  const onSubmit = (data: FormValues) => {
    setServerErrors({})
    setSuccessMsg('')

    // Client-side image validation for new products
    if (isNew && newFiles.length === 0) {
      setServerErrors({ images: ['يجب إضافة صورة واحدة على الأقل'] })
      return
    }

    const fd = new FormData()
    fd.append('name', data.name)
    fd.append('description', data.description ?? '')
    fd.append('price', String(data.price))
    fd.append('currency', data.currency)
    fd.append('is_active', data.is_active ? '1' : '0')
    fd.append('category_id', String(data.category_id))
    ;(data.colors ?? '')
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .forEach((c) => fd.append('colors[]', c))
    ;(data.sizes ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((s) => fd.append('sizes[]', s))

    // Attach images for new product creation
    if (isNew) {
      newFiles.forEach((f) => fd.append('images[]', f))
    }

    const onSaved = (savedId: number) => {
      if (!isNew && newFiles.length > 0) {
        const imgFd = new FormData()
        newFiles.forEach((f) => imgFd.append('images[]', f))
        appendImgs.mutate(
          { id: savedId, form: imgFd },
          {
            onSuccess: () => navigate('/admin/products'),
            onError: handleMutationError,
          },
        )
      } else {
        setSuccessMsg('تم الحفظ بنجاح ✅')
        setTimeout(() => navigate('/admin/products'), 800)
      }
    }

    const mutationOptions = {
      onError: handleMutationError,
    }

    if (isNew) {
      createP.mutate(fd, {
        ...mutationOptions,
        onSuccess: (res: any) => onSaved(res.data.data.id),
      })
    } else {
      updateP.mutate(
        { id: productId, form: fd },
        {
          ...mutationOptions,
          onSuccess: () => onSaved(productId),
        },
      )
    }
  }

  const isPending = createP.isPending || updateP.isPending || appendImgs.isPending

  const onDeleteImage = (imageId: number) => {
    if (!productId) return
    if (!confirm('هل أنت متأكد من حذف الصورة؟')) return
    deleteImg.mutate({ productId, imageId })
  }

  const onReorderImages = (orderedIds: number[]) => {
    if (!productId) return
    reorderImgs.mutate({ id: productId, ids: orderedIds })
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-bold mb-4">
        {isNew ? 'منتج جديد' : 'تعديل منتج'}
      </h1>

      {successMsg && (
        <div className="bg-status-success/10 text-status-success border border-status-success/20 rounded-xl p-3 mb-3 text-sm">
          {successMsg}
        </div>
      )}

      {serverErrors.general && (
        <div className="bg-status-danger/10 text-status-danger border border-status-danger/20 rounded-xl p-3 mb-3 text-sm">
          {serverErrors.general.join(', ')}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3"
        data-testid="product-form"
      >
        <input
          {...register('name')}
          placeholder="الاسم"
          className="border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-brand-accent/40 outline-none"
        />
        {(errors.name || serverErrors.name) && (
          <p className="text-status-danger text-xs">
            {errors.name?.message ?? serverErrors.name?.[0]}
          </p>
        )}

        <textarea
          {...register('description')}
          placeholder="الوصف"
          rows={3}
          className="border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-brand-accent/40 outline-none"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            {...register('price')}
            type="number"
            placeholder="السعر"
            className="border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-brand-accent/40 outline-none"
          />
          <input
            {...register('currency')}
            placeholder="YER"
            className="border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-brand-accent/40 outline-none"
          />
        </div>

        <select
          {...register('category_id', { valueAsNumber: true })}
          className="border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-brand-accent/40 outline-none"
          defaultValue=""
        >
          <option value="" disabled>— اختر القسم —</option>
          {cats.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {(errors.category_id || serverErrors.category_id) && (
          <p className="text-status-danger text-xs">
            {errors.category_id?.message ?? serverErrors.category_id?.[0]}
          </p>
        )}

        <input
          {...register('colors')}
          placeholder="الألوان (مفصولة بفواصل): أحمر,أزرق,أخضر"
          className="border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-brand-accent/40 outline-none"
        />

        <input
          {...register('sizes')}
          placeholder="المقاسات (مفصولة بفواصل): S,M,L,XL"
          className="border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-brand-accent/40 outline-none"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            {...register('is_active', {
              setValueAs: (v) => v === true || v === 'on' || v === '1',
            })}
          />
          نشط
        </label>

        {/* Image uploader — ALWAYS visible, including on create */}
        <ImageUploader
          images={product?.images ?? []}
          newFiles={newFiles}
          onNewFilesChange={setNewFiles}
          onDelete={isNew ? undefined : onDeleteImage}
          onReorder={isNew ? undefined : onReorderImages}
        />
        {serverErrors.images && (
          <p className="text-status-danger text-xs">{serverErrors.images[0]}</p>
        )}

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isPending}
            data-testid="submit-product"
            className="bg-brand-accent hover:bg-brand-accent-dark text-white rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {isPending ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2.5 text-sm text-zinc-600 hover:text-zinc-900"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

```bash
docker compose exec web npx tsc --noEmit 2>&1 | head -20
```
Expected: No errors related to AdminProductEditPage

- [ ] **Step 3: Commit**

```bash
git add web/src/pages/admin/AdminProductEditPage.tsx
git commit -m "fix: revamp admin product form — image uploader on create, error handling, admin endpoint"
```

---

### Task 9: Frontend — AdminProductsPage Revamp

**Files:**
- Modify: `web/src/pages/admin/AdminProductsPage.tsx:1-105`

**Interfaces:**
- Consumes: Task 6 `useAdminProducts(filters)`, `useDeleteProduct()`, `useRestoreProduct()`. Task 7 design tokens.
- Produces: Admin products page using admin-specific API, with status filters and toggle.

- [ ] **Step 1: Rewrite AdminProductsPage.tsx**

Replace `web/src/pages/admin/AdminProductsPage.tsx`:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminProducts, useDeleteProduct, useRestoreProduct, useUpdateProduct } from '@/queries/use-products'
import { useAdminCategories } from '@/queries/use-categories'
import { formatCurrency } from '@/lib/utils'
import { Edit, Trash2, RotateCcw, Plus } from 'lucide-react'

const STATUS_FILTERS = [
  { label: 'الكل', value: '' },
  { label: 'نشط', value: 'active' },
  { label: 'معطل', value: 'inactive' },
] as const

export function AdminProductsPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const { data, isLoading } = useAdminProducts({
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
  })
  const deleteP = useDeleteProduct()
  const restoreP = useRestoreProduct()
  const updateP = useUpdateProduct()
  const { data: catData } = useAdminCategories()
  const cats = catData?.data?.data ?? []

  const products = data?.data?.data ?? []

  const toggleActive = (productId: number, currentActive: boolean) => {
    const fd = new FormData()
    fd.append('is_active', currentActive ? '0' : '1')
    updateP.mutate({ id: productId, form: fd })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">المنتجات</h1>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="bg-brand-accent hover:bg-brand-accent-dark text-white text-xs px-4 py-2 rounded-xl flex items-center gap-1 transition-colors"
          data-testid="add-product"
        >
          <Plus size={14} />
          إضافة
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-colors ${
              statusFilter === f.value
                ? 'bg-brand-accent text-white border-brand-accent'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-brand-accent'
            }`}
          >
            {f.label}
          </button>
        ))}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-xl border border-zinc-200 bg-white"
        >
          <option value="">كل الأقسام</option>
          {cats.map((c: any) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-zinc-500">جاري التحميل...</p>
      ) : products.length === 0 ? (
        <p className="text-zinc-500">لا توجد منتجات بعد.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-xs" data-testid="admin-products-table">
            <thead className="bg-brand-surface text-zinc-600">
              <tr>
                <th className="p-2.5 text-right">الاسم</th>
                <th className="p-2.5 text-right">القسم</th>
                <th className="p-2.5 text-right">السعر</th>
                <th className="p-2.5 text-right">الحالة</th>
                <th className="p-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-t hover:bg-brand-surface/50 transition-colors"
                  data-testid={`admin-product-row-${p.id}`}
                >
                  <td className="p-2.5 font-medium">{p.name}</td>
                  <td className="p-2.5 text-zinc-500">
                    {p.category?.name ?? '-'}
                  </td>
                  <td className="p-2.5">{formatCurrency(p.price, p.currency)}</td>
                  <td className="p-2.5">
                    <button
                      onClick={() => toggleActive(p.id, p.is_active)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
                        p.is_active
                          ? 'bg-status-success/10 text-status-success'
                          : 'bg-zinc-100 text-zinc-400'
                      }`}
                    >
                      {p.is_active ? 'نشط' : 'معطل'}
                    </button>
                  </td>
                  <td className="p-2.5 flex gap-1">
                    <button
                      onClick={() => navigate(`/admin/products/${p.id}`)}
                      className="p-1 text-status-info hover:text-status-info/70 transition-colors"
                      data-testid={`edit-${p.id}`}
                      aria-label="تعديل"
                    >
                      <Edit size={14} />
                    </button>
                    {(p as any).deleted_at ? (
                      <button
                        onClick={() => restoreP.mutate(p.id)}
                        className="p-1 text-status-success hover:text-status-success/70 transition-colors"
                        data-testid={`restore-${p.id}`}
                        aria-label="استعادة"
                      >
                        <RotateCcw size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا المنتج؟'))
                            deleteP.mutate(p.id)
                        }}
                        className="p-1 text-status-danger hover:text-status-danger/70 transition-colors"
                        data-testid={`delete-${p.id}`}
                        aria-label="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

```bash
docker compose exec web npx tsc --noEmit 2>&1 | head -20
```
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add web/src/pages/admin/AdminProductsPage.tsx
git commit -m "fix: admin products page uses admin API, adds status filters and toggle"
```

---

### Task 10: Storefront — Header, Toast System & Layout

**Files:**
- Modify: `web/src/components/layout/Header.tsx:1-64`
- Create: `web/src/stores/toast-store.ts`
- Create: `web/src/components/storefront/ToastNotification.tsx`
- Modify: `web/src/components/layout/StorefrontLayout.tsx:1-14`

**Interfaces:**
- Consumes: `useCartStore`, `useAuthStore` (existing), Task 7 design tokens
- Produces: `useToastStore` with `addToast(toast)` and `removeToast(id)`. `<ToastNotification />` renders floating toasts. Updated `<Header />` with promo bar and pulse animation. `<StorefrontLayout />` mounts toast container.

- [ ] **Step 1: Create toast-store.ts**

Create `web/src/stores/toast-store.ts`:

```typescript
import { create } from 'zustand'

export interface Toast {
  id: string
  message: string
  productName?: string
  thumbnail?: string
  type?: 'success' | 'error' | 'info'
}

interface ToastState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = crypto.randomUUID()
    set((s) => ({
      toasts: [...s.toasts.slice(-2), { ...toast, id }],
    }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
```

- [ ] **Step 2: Create ToastNotification.tsx**

Create `web/src/components/storefront/ToastNotification.tsx`:

```tsx
import { X, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToastStore } from '@/stores/toast-store'

export function ToastNotification() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)
  const navigate = useNavigate()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 start-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-white rounded-xl shadow-xl border border-zinc-100 p-3 flex items-center gap-3 animate-[slideUp_0.3s_ease-out]"
        >
          {toast.thumbnail ? (
            <img
              src={toast.thumbnail}
              alt=""
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-brand-accent/10 flex items-center justify-center">
              <ShoppingBag size={18} className="text-brand-accent" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">
              {toast.productName ?? toast.message}
            </p>
            {toast.productName && (
              <button
                onClick={() => {
                  removeToast(toast.id)
                  navigate('/cart')
                }}
                className="text-[10px] text-brand-accent font-bold mt-0.5"
              >
                عرض السلة ←
              </button>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-zinc-400 hover:text-zinc-600"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Update Header.tsx with promo bar and pulse badge**

Replace `web/src/components/layout/Header.tsx`:

```tsx
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Settings, User } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'

export function Header() {
  const navigate = useNavigate()
  const count = useCartStore((s) => s.totalItems())
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => !!s.token)

  return (
    <>
      {/* Promo Bar */}
      <div className="bg-brand text-white text-[11px] text-center py-1.5 font-medium">
        ✨ مجموعة صيف 2026 الجديدة | توصيل سريع لجميع المحافظات 🚚
      </div>

      {/* Main Header */}
      <header className="bg-white px-4 py-3 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <button
          onClick={() => navigate('/')}
          className="font-black text-lg group"
        >
          <span className="text-brand-accent group-hover:drop-shadow-[0_0_8px_rgba(229,168,59,0.5)] transition-all">
            Katteyes
          </span>{' '}
          <span className="text-brand">Fashion</span>
        </button>
        <div className="flex gap-4 items-center">
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin/products')}
              title="لوحة التحكم"
              aria-label="لوحة التحكم"
              className="hover:text-brand-accent transition-colors"
            >
              <Settings size={20} />
            </button>
          )}
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/my-orders')}
              title="طلباتي"
              aria-label="طلباتي"
              className="text-sm hover:text-brand-accent transition-colors"
            >
              {user?.name}
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-sm hover:text-brand-accent transition-colors flex items-center gap-1"
            >
              <User size={16} />
              دخول
            </button>
          )}
          <button
            onClick={() => navigate('/cart')}
            className="relative hover:text-brand-accent transition-colors"
            title="السلة"
            aria-label="السلة"
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-1.5 -end-1.5 bg-brand-accent text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold animate-pulse">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>
    </>
  )
}
```

- [ ] **Step 4: Update StorefrontLayout.tsx to include ToastNotification**

Replace `web/src/components/layout/StorefrontLayout.tsx`:

```tsx
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { ToastNotification } from '@/components/storefront/ToastNotification'

export function StorefrontLayout() {
  return (
    <div dir="rtl" className="min-h-screen bg-brand-light text-zinc-900">
      <Header />
      <main>
        <Outlet />
      </main>
      <ToastNotification />
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add web/src/stores/toast-store.ts web/src/components/storefront/ToastNotification.tsx web/src/components/layout/Header.tsx web/src/components/layout/StorefrontLayout.tsx
git commit -m "feat: modernized header with promo bar, toast notification system"
```

---

### Task 11: Storefront — HeroPromoSlider + CategoryStoryBar + HomePage

**Files:**
- Create: `web/src/components/storefront/HeroPromoSlider.tsx`
- Create: `web/src/components/storefront/CategoryStoryBar.tsx`
- Create: `web/src/components/product/SmartProductCard.tsx`
- Create: `web/src/components/shared/ProductGridSkeleton.tsx`
- Create: `web/src/components/shared/ErrorBoundary.tsx`
- Modify: `web/src/pages/storefront/HomePage.tsx:1-67`

**Interfaces:**
- Consumes: `useCategories()`, `useProducts()`, Task 7 design tokens, `useCartStore`, `useToastStore`
- Produces: `<HeroPromoSlider />`, `<CategoryStoryBar active onChange />`, `<SmartProductCard product />`, `<ProductGridSkeleton />`, `<ErrorBoundary>`, rewired `<HomePage />`

- [ ] **Step 1: Create HeroPromoSlider.tsx**

Create `web/src/components/storefront/HeroPromoSlider.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'

const SLIDES = [
  {
    title: 'مجموعة صيف 2026',
    subtitle: 'أناقة تليق بك في كل مناسبة',
    cta: 'تسوقي الآن',
    gradient: 'from-brand-accent/30 via-brand-accent/10 to-brand-light',
    emoji: '👗',
  },
  {
    title: 'عبايات خليجية فاخرة',
    subtitle: 'تصاميم حصرية بأجود الأقمشة',
    cta: 'اكتشفي المجموعة',
    gradient: 'from-brand/10 via-brand-surface to-brand-light',
    emoji: '✨',
  },
  {
    title: 'خصم يصل إلى 30%',
    subtitle: 'على جميع الإكسسوارات والأحذية',
    cta: 'تسوقي الآن',
    gradient: 'from-status-danger/10 via-brand-accent/10 to-brand-light',
    emoji: '🔥',
  },
]

export function HeroPromoSlider() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [paused])

  const prev = () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length)
  const next = () => setCurrent((c) => (c + 1) % SLIDES.length)
  const slide = SLIDES[current]

  return (
    <section
      className={`bg-gradient-to-l ${slide.gradient} px-6 py-10 text-center relative overflow-hidden transition-all duration-500`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      data-testid="hero-slider"
    >
      <div className="text-4xl mb-3">{slide.emoji}</div>
      <h1 className="text-2xl md:text-3xl font-black mb-2 text-brand">
        {slide.title}
      </h1>
      <p className="text-sm text-zinc-600 mb-4">{slide.subtitle}</p>
      <button className="bg-brand-accent hover:bg-brand-accent-dark text-white text-sm px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg">
        {slide.cta}
      </button>

      {/* Navigation */}
      <button
        onClick={next}
        className="absolute start-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition-colors"
        aria-label="السابق"
      >
        <ChevronRight size={18} />
      </button>
      <button
        onClick={prev}
        className="absolute end-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition-colors"
        aria-label="التالي"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? 'w-6 bg-brand-accent' : 'w-1.5 bg-zinc-300'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create CategoryStoryBar.tsx**

Create `web/src/components/storefront/CategoryStoryBar.tsx`:

```tsx
import { useCategories } from '@/queries/use-categories'

interface Props {
  active: string
  onChange: (slug: string) => void
}

export function CategoryStoryBar({ active, onChange }: Props) {
  const { data, isLoading } = useCategories()
  const categories = data?.data?.data ?? []

  if (isLoading) {
    return (
      <div className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-hide">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 min-w-[64px]">
            <div className="w-14 h-14 rounded-full bg-zinc-200 animate-pulse" />
            <div className="w-10 h-2 rounded bg-zinc-200 animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-hide bg-white border-b" data-testid="category-story-bar">
      <button
        onClick={() => onChange('')}
        className="flex flex-col items-center gap-1.5 min-w-[64px]"
      >
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-lg transition-all ${
            active === ''
              ? 'ring-2 ring-brand-accent ring-offset-2 bg-brand-accent/10'
              : 'bg-brand-surface hover:bg-zinc-200'
          }`}
        >
          🛍️
        </div>
        <span className={`text-[10px] font-semibold ${active === '' ? 'text-brand-accent' : 'text-zinc-500'}`}>
          الكل
        </span>
      </button>

      {categories.map((cat: any) => {
        const isActive = active === cat.slug
        const emoji = getCategoryEmoji(cat.slug)
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.slug)}
            className="flex flex-col items-center gap-1.5 min-w-[64px]"
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-lg transition-all ${
                isActive
                  ? 'ring-2 ring-brand-accent ring-offset-2 bg-brand-accent/10'
                  : 'bg-brand-surface hover:bg-zinc-200'
              }`}
            >
              {emoji}
            </div>
            <span className={`text-[10px] font-semibold truncate max-w-[64px] ${isActive ? 'text-brand-accent' : 'text-zinc-500'}`}>
              {cat.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function getCategoryEmoji(slug: string): string {
  const map: Record<string, string> = {
    'dresses': '👗', 'فساتين-سهرة': '👗',
    'abayas': '🧕', 'عبايات-خليجية': '🧕',
    'casual': '👚', 'ملابس-كاجوال': '👚',
    'shoes': '👠', 'أحذية-وحقائب': '👜',
    'accessories': '💍', 'إكسسوارات': '💍',
  }
  return map[slug] ?? '🏷️'
}
```

- [ ] **Step 3: Create SmartProductCard.tsx**

Create `web/src/components/product/SmartProductCard.tsx`:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import type { Product } from '@/api/types'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/stores/cart-store'
import { useToastStore } from '@/stores/toast-store'

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect fill="#f1f5f9" width="300" height="400"/><text x="50%" y="50%" font-family="sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle" dominant-baseline="middle">لا توجد صورة</text></svg>',
  )

function getBadge(product: Product): { label: string; color: string } | null {
  const created = new Date(product.created_at ?? '')
  const daysSince = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSince < 7) return { label: 'جديد ✨', color: 'bg-brand-accent text-white' }
  return null
}

export function SmartProductCard({ product }: { product: Product & { created_at?: string } }) {
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const addToast = useToastStore((s) => s.addToast)
  const [hovered, setHovered] = useState(false)

  const img1 = product.images?.[0]?.url ?? PLACEHOLDER
  const img2 = product.images?.[1]?.url
  const badge = getBadge(product)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      currency: product.currency,
      img: img1,
      color: product.colors?.[0] ?? '',
      size: product.sizes?.[0] ?? '',
    })
    addToast({
      message: 'تمت الإضافة للسلة',
      productName: product.name,
      thumbnail: img1 !== PLACEHOLDER ? img1 : undefined,
    })
  }

  return (
    <div
      onClick={() => navigate(`/products/${product.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-testid="smart-product-card"
      className="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative"
    >
      {/* Image — 3:4 aspect ratio */}
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-surface">
        <img
          src={hovered && img2 ? img2 : img1}
          alt={product.name}
          className="w-full h-full object-cover transition-opacity duration-500"
          loading="lazy"
        />
        {/* Badge */}
        {badge && (
          <span className={`absolute top-2 start-2 ${badge.color} text-[10px] font-bold px-2 py-0.5 rounded-full`}>
            {badge.label}
          </span>
        )}
        {/* Quick Add Button */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-2 end-2 bg-white/90 hover:bg-brand-accent hover:text-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
          aria-label="إضافة سريعة"
        >
          <ShoppingBag size={16} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        {product.category?.name && (
          <div className="text-[10px] text-brand-accent font-bold mb-0.5">
            {product.category.name}
          </div>
        )}
        <div className="text-xs font-semibold mb-1.5 truncate">{product.name}</div>

        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1 mb-1.5">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color}
                className="w-3.5 h-3.5 rounded-full border border-zinc-200"
                style={{ backgroundColor: colorToHex(color) }}
                title={color}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[9px] text-zinc-400">+{product.colors.length - 4}</span>
            )}
          </div>
        )}

        <div className="text-sm font-bold text-brand">
          {formatCurrency(product.price, product.currency)}
        </div>
      </div>
    </div>
  )
}

function colorToHex(name: string): string {
  const map: Record<string, string> = {
    'أحمر': '#EF4444', 'أزرق': '#3B82F6', 'أخضر': '#10B981',
    'أبيض': '#FFFFFF', 'أسود': '#111111', 'وردي': '#EC4899',
    'بيج': '#D2B48C', 'ذهبي': '#E5A83B', 'فضي': '#C0C0C0',
    'بني': '#92400E', 'رمادي': '#6B7280', 'برتقالي': '#F97316',
    'بنفسجي': '#8B5CF6', 'كحلي': '#1E3A5F', 'زيتي': '#556B2F',
  }
  return map[name] ?? '#CBD5E1'
}
```

- [ ] **Step 4: Create ProductGridSkeleton.tsx**

Create `web/src/components/shared/ProductGridSkeleton.tsx`:

```tsx
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-4 py-4" data-testid="product-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
          <div className="aspect-[3/4] bg-zinc-200 animate-pulse" />
          <div className="p-3 space-y-2">
            <div className="h-2 w-12 bg-zinc-200 rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-zinc-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-zinc-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Create ErrorBoundary.tsx**

Create `web/src/components/shared/ErrorBoundary.tsx`:

```tsx
import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm mb-2">حدث خطأ غير متوقع</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="text-brand-accent text-sm font-semibold hover:underline"
            >
              حاول مرة أخرى
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
```

- [ ] **Step 6: Rewrite HomePage.tsx to wire everything together**

Replace `web/src/pages/storefront/HomePage.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { HeroPromoSlider } from '@/components/storefront/HeroPromoSlider'
import { CategoryStoryBar } from '@/components/storefront/CategoryStoryBar'
import { SmartProductCard } from '@/components/product/SmartProductCard'
import { ProductGridSkeleton } from '@/components/shared/ProductGridSkeleton'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { useProducts } from '@/queries/use-products'

function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export function HomePage() {
  const [category, setCategory] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounced(searchInput)

  const { data, isLoading } = useProducts({
    category: category || undefined,
    q: debouncedSearch || undefined,
  })

  const products = data?.data?.data ?? []

  return (
    <div>
      {/* Hero Banner */}
      <ErrorBoundary>
        <HeroPromoSlider />
      </ErrorBoundary>

      {/* Search */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="relative">
          <Search
            size={16}
            className="absolute top-1/2 -translate-y-1/2 start-3 text-zinc-400"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ابحثي عن منتج..."
            data-testid="search-input"
            className="w-full h-10 ps-9 pe-3 rounded-xl bg-brand-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </div>
      </div>

      {/* Category Story Bar */}
      <ErrorBoundary>
        <CategoryStoryBar active={category} onChange={setCategory} />
      </ErrorBoundary>

      {/* Product Grid */}
      {isLoading ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <div className="p-8 text-center text-zinc-400 text-sm">
          لا توجد منتجات في هذا القسم
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-4 py-4">
          {products.map((product) => (
            <ErrorBoundary key={product.id}>
              <SmartProductCard product={product} />
            </ErrorBoundary>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 7: Verify build**

```bash
docker compose exec web npx tsc --noEmit 2>&1 | head -20
```
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add web/src/components/storefront/ web/src/components/product/SmartProductCard.tsx web/src/components/shared/ web/src/pages/storefront/HomePage.tsx
git commit -m "feat: modern storefront — hero slider, story categories, smart cards, skeletons, error boundaries"
```

---

### Task 12: Seed Data — Categories + Products

**Files:**
- Create: `api/database/seeders/CategorySeeder.php`
- Create: `api/database/seeders/ProductSeeder.php`
- Modify: `api/database/seeders/DatabaseSeeder.php:15-18`

**Interfaces:**
- Consumes: `Category`, `Product`, `ProductOption`, `ProductImage` models
- Produces: 5 Arabic categories + 10+ products with colors, sizes, and placeholder images via `php artisan db:seed`

- [ ] **Step 1: Create CategorySeeder.php**

Create `api/database/seeders/CategorySeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'فساتين سهرة', 'slug' => 'فساتين-سهرة', 'sort_order' => 0],
            ['name' => 'عبايات خليجية', 'slug' => 'عبايات-خليجية', 'sort_order' => 1],
            ['name' => 'ملابس كاجوال', 'slug' => 'ملابس-كاجوال', 'sort_order' => 2],
            ['name' => 'أحذية وحقائب', 'slug' => 'أحذية-وحقائب', 'sort_order' => 3],
            ['name' => 'إكسسوارات', 'slug' => 'إكسسوارات', 'sort_order' => 4],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(
                ['slug' => $cat['slug']],
                array_merge($cat, ['is_active' => true]),
            );
        }
    }
}
```

- [ ] **Step 2: Create ProductSeeder.php**

Create `api/database/seeders/ProductSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'category_slug' => 'فساتين-سهرة',
                'name' => 'فستان سهرة ساتان ذهبي',
                'price' => 45000,
                'description' => 'فستان سهرة فاخر من الساتان الذهبي مع تطريز يدوي',
                'colors' => ['ذهبي', 'أسود', 'بيج'],
                'sizes' => ['S', 'M', 'L', 'XL'],
            ],
            [
                'category_slug' => 'فساتين-سهرة',
                'name' => 'فستان أحمر مطرز بالكريستال',
                'price' => 55000,
                'description' => 'فستان أنيق مطرز بالكريستال للمناسبات الخاصة',
                'colors' => ['أحمر', 'بنفسجي'],
                'sizes' => ['S', 'M', 'L'],
            ],
            [
                'category_slug' => 'عبايات-خليجية',
                'name' => 'عباية خليجية مطرزة',
                'price' => 35000,
                'description' => 'عباية خليجية فاخرة بتطريز يدوي وأكمام واسعة',
                'colors' => ['أسود', 'كحلي'],
                'sizes' => ['M', 'L', 'XL', 'XXL'],
            ],
            [
                'category_slug' => 'عبايات-خليجية',
                'name' => 'عباية كريب سادة',
                'price' => 25000,
                'description' => 'عباية كريب ناعمة بقصة عصرية',
                'colors' => ['أسود', 'رمادي', 'بني'],
                'sizes' => ['S', 'M', 'L', 'XL'],
            ],
            [
                'category_slug' => 'ملابس-كاجوال',
                'name' => 'تيشيرت قطن عصري',
                'price' => 5000,
                'description' => 'تيشيرت قطن 100% مريح للاستخدام اليومي',
                'colors' => ['أبيض', 'أسود', 'رمادي', 'أزرق'],
                'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            ],
            [
                'category_slug' => 'ملابس-كاجوال',
                'name' => 'بنطلون جينز واسع',
                'price' => 12000,
                'description' => 'بنطلون جينز بقصة واسعة عصرية',
                'colors' => ['أزرق', 'أسود'],
                'sizes' => ['S', 'M', 'L', 'XL'],
            ],
            [
                'category_slug' => 'أحذية-وحقائب',
                'name' => 'حذاء كعب عالي ذهبي',
                'price' => 18000,
                'description' => 'حذاء كعب عالي أنيق مناسب للسهرات',
                'colors' => ['ذهبي', 'أسود', 'فضي'],
                'sizes' => ['36', '37', '38', '39', '40'],
            ],
            [
                'category_slug' => 'أحذية-وحقائب',
                'name' => 'حقيبة يد جلد طبيعي',
                'price' => 22000,
                'description' => 'حقيبة يد فاخرة من الجلد الطبيعي',
                'colors' => ['أسود', 'بني', 'بيج'],
                'sizes' => [],
            ],
            [
                'category_slug' => 'إكسسوارات',
                'name' => 'طقم مجوهرات كريستال',
                'price' => 15000,
                'description' => 'طقم عقد وأقراط كريستال لامع',
                'colors' => ['ذهبي', 'فضي'],
                'sizes' => [],
            ],
            [
                'category_slug' => 'إكسسوارات',
                'name' => 'شال حرير مطبوع',
                'price' => 8000,
                'description' => 'شال حرير فاخر بطباعة زهور',
                'colors' => ['وردي', 'أزرق', 'بيج'],
                'sizes' => [],
            ],
        ];

        foreach ($products as $item) {
            $category = Category::where('slug', $item['category_slug'])->first();
            if (!$category) continue;

            $product = Product::create([
                'name' => $item['name'],
                'price' => $item['price'],
                'currency' => 'YER',
                'description' => $item['description'],
                'category_id' => $category->id,
                'is_active' => true,
            ]);

            // Create placeholder images (2 per product)
            $width = 600;
            $height = 800;
            for ($i = 0; $i < 2; $i++) {
                $seed = $product->id * 10 + $i;
                $url = "https://picsum.photos/seed/{$seed}/{$width}/{$height}";
                $product->images()->create([
                    'path' => $url,
                    'sort_order' => $i,
                ]);
            }

            // Create color options
            $sort = 0;
            foreach ($item['colors'] as $color) {
                $product->options()->create([
                    'type' => 'color',
                    'value' => $color,
                    'sort_order' => $sort++,
                ]);
            }

            // Create size options
            foreach ($item['sizes'] as $size) {
                $product->options()->create([
                    'type' => 'size',
                    'value' => $size,
                    'sort_order' => $sort++,
                ]);
            }
        }
    }
}
```

- [ ] **Step 3: Update DatabaseSeeder.php**

Modify `api/database/seeders/DatabaseSeeder.php` line 17:

```php
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
        ]);
    }
```

- [ ] **Step 4: Run the seeder and verify**

```bash
docker compose exec api php artisan migrate:fresh --seed
docker compose exec api php artisan tinker --execute="echo 'Categories: '.App\Models\Category::count().', Products: '.App\Models\Product::count().', Options: '.App\Models\ProductOption::count();"
```
Expected: `Categories: 5, Products: 10, Options: ~50+`

- [ ] **Step 5: Commit**

```bash
git add api/database/seeders/
git commit -m "feat: seed realistic Arabic fashion catalog with categories, products, and options"
```

---

## Post-Implementation Verification

After all tasks are complete, run the full suite:

```bash
# Backend tests
docker compose exec api php artisan test -v

# Frontend type check
docker compose exec web npx tsc --noEmit

# Frontend build
docker compose exec web npx vite build

# Verify Redis connectivity
docker compose exec api php artisan tinker --execute="echo Cache::store('redis')->put('verify', 'ok', 60) ? 'Redis OK' : 'Redis FAIL';"
```

All commands must pass with zero errors before the work is considered complete.
