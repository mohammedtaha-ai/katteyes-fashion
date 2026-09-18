<?php

namespace Tests\Feature\Products;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_factory_creates_product(): void
    {
        $p = Product::factory()->create();

        $this->assertNotEmpty($p->name);
        $this->assertNotEmpty($p->slug);
        $this->assertEquals('YER', $p->currency);
        $this->assertTrue($p->is_active);
    }

    public function test_soft_delete_excludes_from_default_query(): void
    {
        $p = Product::factory()->create();
        $p->delete();

        $this->assertNull(Product::find($p->id));
        $this->assertNotNull(Product::withTrashed()->find($p->id));
    }

    public function test_disk_accessor_returns_default_filesystem(): void
    {
        $p = Product::factory()->create();

        $this->assertEquals('local', $p->disk);
    }

    public function test_belongs_to_category(): void
    {
        $cat = Category::factory()->create();
        $p = Product::factory()->create(['category_id' => $cat->id]);

        $this->assertEquals($cat->id, $p->category->id);
    }
}
