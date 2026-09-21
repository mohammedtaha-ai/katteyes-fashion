<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductSlugTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_auto_generates_slug_when_not_provided(): void
    {
        $category = Category::factory()->create();

        $product = Product::create([
            'name' => 'فستان سهرة أنيق',
            'price' => 2500,
            'currency' => 'YER',
            'category_id' => $category->id,
        ]);

        $this->assertNotEmpty($product->slug);
        $this->assertEquals('فستان-سهرة-أنيق', $product->slug);
    }

    public function test_duplicate_name_generates_unique_slug(): void
    {
        $category = Category::factory()->create();

        $product1 = Product::create([
            'name' => 'عباية خليجية',
            'price' => 3000,
            'currency' => 'YER',
            'category_id' => $category->id,
        ]);

        $product2 = Product::create([
            'name' => 'عباية خليجية',
            'price' => 3200,
            'currency' => 'YER',
            'category_id' => $category->id,
        ]);

        $this->assertEquals('عباية-خليجية', $product1->slug);
        $this->assertEquals('عباية-خليجية-1', $product2->slug);
    }

    public function test_updating_name_regenerates_slug(): void
    {
        $category = Category::factory()->create();

        $product = Product::create([
            'name' => 'فستان سهرة أنيق',
            'price' => 2500,
            'currency' => 'YER',
            'category_id' => $category->id,
        ]);

        $this->assertEquals('فستان-سهرة-أنيق', $product->slug);

        $product->update(['name' => 'فستان سهرة ملكي']);
        $product->refresh();

        $this->assertEquals('فستان-سهرة-ملكي', $product->slug);

        // Explicit slug change should not be overwritten
        $product->update(['slug' => 'custom-slug', 'name' => 'فستان آخر']);
        $product->refresh();

        $this->assertEquals('custom-slug', $product->slug);
    }
}
