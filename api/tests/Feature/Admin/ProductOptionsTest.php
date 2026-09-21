<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductOptionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
    }

    public function test_store_persists_colors_and_sizes_to_options_table(): void
    {
        $category = Category::factory()->create();

        $response = $this->post('/api/v1/admin/products', [
            'name' => 'فستان أبيض وأسود',
            'price' => 2500,
            'currency' => 'YER',
            'category_id' => $category->id,
            'colors' => ['أبيض', 'أسود'],
            'sizes' => ['M', 'L', 'XL'],
            'images' => [
                UploadedFile::fake()->image('test.jpg'),
            ],
        ]);

        $response->assertCreated();
        $productId = $response->json('data.id');

        $this->assertDatabaseCount('product_options', 5);
        $this->assertDatabaseHas('product_options', [
            'product_id' => $productId,
            'type' => 'color',
            'value' => 'أبيض',
        ]);
        $this->assertDatabaseHas('product_options', [
            'product_id' => $productId,
            'type' => 'color',
            'value' => 'أسود',
        ]);
        $this->assertDatabaseHas('product_options', [
            'product_id' => $productId,
            'type' => 'size',
            'value' => 'M',
        ]);
        $this->assertDatabaseHas('product_options', [
            'product_id' => $productId,
            'type' => 'size',
            'value' => 'L',
        ]);
        $this->assertDatabaseHas('product_options', [
            'product_id' => $productId,
            'type' => 'size',
            'value' => 'XL',
        ]);
    }

    public function test_update_replaces_options(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->id]);
        $product->options()->create(['type' => 'color', 'value' => 'أزرق', 'sort_order' => 0]);
        $product->options()->create(['type' => 'size', 'value' => 'S', 'sort_order' => 1]);

        $this->assertDatabaseCount('product_options', 2);

        $response = $this->post("/api/v1/admin/products/{$product->id}", [
            '_method' => 'PUT',
            'name' => $product->name,
            'price' => $product->price,
            'currency' => $product->currency,
            'category_id' => $category->id,
            'colors' => ['أحمر', 'أخضر'],
            'sizes' => ['M', 'L'],
        ]);

        $response->assertOk();

        // Old options removed
        $this->assertDatabaseMissing('product_options', [
            'product_id' => $product->id,
            'type' => 'color',
            'value' => 'أزرق',
        ]);
        $this->assertDatabaseMissing('product_options', [
            'product_id' => $product->id,
            'type' => 'size',
            'value' => 'S',
        ]);

        // New options saved
        $this->assertDatabaseCount('product_options', 4);
        $this->assertDatabaseHas('product_options', [
            'product_id' => $product->id,
            'type' => 'color',
            'value' => 'أحمر',
        ]);
        $this->assertDatabaseHas('product_options', [
            'product_id' => $product->id,
            'type' => 'color',
            'value' => 'أخضر',
        ]);
        $this->assertDatabaseHas('product_options', [
            'product_id' => $product->id,
            'type' => 'size',
            'value' => 'M',
        ]);
        $this->assertDatabaseHas('product_options', [
            'product_id' => $product->id,
            'type' => 'size',
            'value' => 'L',
        ]);
    }

    public function test_show_eager_loads_images_and_options(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->id]);
        $product->images()->create(['path' => 'products/test-image.jpg', 'sort_order' => 0]);
        $product->options()->createMany([
            ['type' => 'color', 'value' => 'وردي', 'sort_order' => 0],
            ['type' => 'color', 'value' => 'بنفسجي', 'sort_order' => 1],
            ['type' => 'size', 'value' => 'S', 'sort_order' => 2],
            ['type' => 'size', 'value' => 'M', 'sort_order' => 3],
        ]);

        $response = $this->getJson("/api/v1/admin/products/{$product->id}");

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                'id',
                'name',
                'images',
                'colors',
                'sizes',
            ],
        ]);

        $data = $response->json('data');
        $this->assertIsArray($data['images']);
        $this->assertCount(1, $data['images']);
        $this->assertEqualsCanonicalizing(['وردي', 'بنفسجي'], $data['colors']);
        $this->assertEqualsCanonicalizing(['S', 'M'], $data['sizes']);
    }
}
