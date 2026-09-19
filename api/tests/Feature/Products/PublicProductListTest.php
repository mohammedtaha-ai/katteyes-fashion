<?php

namespace Tests\Feature\Products;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicProductListTest extends TestCase
{
    use RefreshDatabase;

    public function test_list_excludes_inactive_products(): void
    {
        $cat = Category::factory()->create(['is_active' => true]);
        Product::factory()->for($cat)->create(['name' => 'فستان', 'is_active' => true]);
        Product::factory()->for($cat)->create(['name' => 'مخفي', 'is_active' => false]);

        $r = $this->getJson('/api/v1/products');
        $r->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'فستان');
    }

    public function test_list_excludes_soft_deleted_products(): void
    {
        $cat = Category::factory()->create();
        $p = Product::factory()->for($cat)->create(['is_active' => true]);
        $p->delete(); // soft delete

        $this->getJson('/api/v1/products')->assertJsonCount(0, 'data');
    }

    public function test_list_filters_by_category_slug(): void
    {
        $catWomen = Category::factory()->create(['slug' => 'women', 'is_active' => true]);
        $catMen   = Category::factory()->create(['slug' => 'men', 'is_active' => true]);

        Product::factory()->for($catWomen)->create(['name' => 'فستان', 'is_active' => true]);
        Product::factory()->for($catMen)->create(['name' => 'قميص', 'is_active' => true]);

        $r = $this->getJson('/api/v1/products?category=women');
        $r->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'فستان');
    }

    public function test_list_searches_by_name_and_description(): void
    {
        $cat = Category::factory()->create();
        Product::factory()->for($cat)->create(['name' => 'فستان أحمر', 'description' => 'صوف', 'is_active' => true]);
        Product::factory()->for($cat)->create(['name' => 'قميص',     'description' => 'قطن', 'is_active' => true]);

        $r = $this->getJson('/api/v1/products?q=أحمر');
        $r->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'فستان أحمر');

        $r = $this->getJson('/api/v1/products?q=صوف');
        $r->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_list_paginates_12_per_page(): void
    {
        $cat = Category::factory()->create();
        Product::factory()->for($cat)->count(15)->create(['is_active' => true]);

        $r = $this->getJson('/api/v1/products');
        $r->assertOk()->assertJsonCount(12, 'data');
        $this->assertEquals(15, $r->json('meta.total'));
    }

    public function test_list_includes_category_in_response(): void
    {
        $cat = Category::factory()->create(['name' => 'نساء']);
        Product::factory()->for($cat)->create();

        $r = $this->getJson('/api/v1/products');
        $r->assertOk()->assertJsonPath('data.0.category.name', 'نساء');
    }
}