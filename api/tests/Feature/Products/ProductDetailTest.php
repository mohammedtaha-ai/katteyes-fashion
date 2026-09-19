<?php

namespace Tests\Feature\Products;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductDetailTest extends TestCase
{
    use RefreshDatabase;

    public function test_show_returns_product_by_slug(): void
    {
        $cat = Category::factory()->create();
        $p = Product::factory()->for($cat)->create(['name' => 'فستان', 'slug' => 'dress-1']);

        $r = $this->getJson("/api/v1/products/{$p->slug}");
        $r->assertOk()
          ->assertJsonPath('data.slug', 'dress-1')
          ->assertJsonPath('data.name', 'فستان')
          ->assertJsonPath('data.category.id', $cat->id);
    }

    public function test_show_returns_404_for_inactive_product(): void
    {
        $p = Product::factory()->create(['is_active' => false]);

        $this->getJson("/api/v1/products/{$p->slug}")->assertNotFound();
    }

    public function test_show_returns_404_for_soft_deleted_product(): void
    {
        $p = Product::factory()->create();
        $p->delete();

        $this->getJson("/api/v1/products/{$p->slug}")->assertNotFound();
    }

    public function test_show_returns_404_for_nonexistent_slug(): void
    {
        $this->getJson('/api/v1/products/nonexistent')->assertNotFound();
    }

    public function test_show_eager_loads_category(): void
    {
        $cat = Category::factory()->create();
        $p = Product::factory()->for($cat)->create();

        $r = $this->getJson("/api/v1/products/{$p->slug}");
        $r->assertOk()
          ->assertJsonStructure(['data' => ['id', 'name', 'slug', 'price', 'currency', 'category' => ['id', 'slug', 'name']]])
          ->assertJsonPath('data.category.id', $cat->id);
    }
}
