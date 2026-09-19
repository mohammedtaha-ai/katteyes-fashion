<?php
namespace Tests\Feature\Products;

use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_resource_returns_basic_fields(): void
    {
        $cat = Category::factory()->create(['name' => 'نساء', 'slug' => 'women']);
        $p = Product::factory()->create([
            'name' => 'فستان',
            'slug' => 'dress-1',
            'description' => 'وصف',
            'price' => 3500,
            'currency' => 'YER',
            'category_id' => $cat->id,
            'is_active' => true,
        ]);
        $arr = (new ProductResource($p))->resolve();

        $this->assertEquals($p->id, $arr['id']);
        $this->assertEquals('فستان', $arr['name']);
        $this->assertEquals('dress-1', $arr['slug']);
        $this->assertEquals('وصف', $arr['description']);
        $this->assertEquals(3500.0, $arr['price']);
        $this->assertEquals('YER', $arr['currency']);
        $this->assertTrue($arr['is_active']);
    }

    public function test_resource_includes_category_when_loaded(): void
    {
        $cat = Category::factory()->create();
        $p = Product::factory()->create(['category_id' => $cat->id]);
        $p->load('category');

        $arr = (new ProductResource($p))->resolve();
        $this->assertArrayHasKey('category', $arr);
        $this->assertEquals($cat->id, $arr['category']['id']);
        $this->assertEquals($cat->slug, $arr['category']['slug']);
    }

    public function test_resource_excludes_category_when_not_loaded(): void
    {
        $p = Product::factory()->create();
        $arr = (new ProductResource($p))->resolve();
        $this->assertArrayNotHasKey('category', $arr);
    }

    public function test_resource_excludes_images_when_not_loaded(): void
    {
        $p = Product::factory()->create();
        $arr = (new ProductResource($p))->resolve();
        $this->assertArrayNotHasKey('images', $arr);
    }

    public function test_resource_excludes_colors_sizes_when_options_not_loaded(): void
    {
        $p = Product::factory()->create();
        $arr = (new ProductResource($p))->resolve();
        $this->assertArrayNotHasKey('colors', $arr);
        $this->assertArrayNotHasKey('sizes', $arr);
    }
}
