<?php

namespace Tests\Feature\Products;

use App\Http\Resources\ProductImageResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductImageResourceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Pin APP_URL so the URL builder produces a deterministic value.
        config()->set('app.url', 'http://localhost');
    }

    public function test_url_is_built_from_storage_disk_url(): void
    {
        config()->set('filesystems.default', 'public');
        Storage::fake('public');
        Storage::disk('public')->put('products/2026/09/abc.webp', 'x');

        $cat = Category::factory()->create();
        $p = Product::factory()->for($cat)->create();
        $img = ProductImage::factory()->for($p)->create(['path' => 'products/2026/09/abc.webp']);

        $arr = (new ProductImageResource($img))->resolve();

        // Storage::fake returns relative URL `/storage/{path}`.
        // In production (real disk), `url()` returns `${APP_URL}/storage/{path}`.
        $this->assertEquals('/storage/products/2026/09/abc.webp', $arr['url']);
    }

    public function test_sort_order_is_cast_to_int(): void
    {
        Storage::fake('public');
        $img = ProductImage::factory()->create(['sort_order' => 3]);

        $arr = (new ProductImageResource($img))->resolve();
        $this->assertSame(3, $arr['sort_order']);
    }

    public function test_id_is_included(): void
    {
        Storage::fake('public');
        $img = ProductImage::factory()->create();

        $arr = (new ProductImageResource($img))->resolve();
        $this->assertEquals($img->id, $arr['id']);
    }
}