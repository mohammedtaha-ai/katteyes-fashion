<?php

namespace Tests\Feature\Products;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductOption;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductImagesAndOptionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_factory_creates_image(): void
    {
        $img = ProductImage::factory()->create();
        $this->assertNotEmpty($img->path);
        $this->assertEquals(0, $img->sort_order);
    }

    public function test_image_belongs_to_product(): void
    {
        $img = ProductImage::factory()->create();
        $this->assertNotNull($img->product);
    }

    public function test_cascading_delete_with_product(): void
    {
        $p = Product::factory()->create();
        ProductImage::factory()->for($p)->create();
        ProductOption::factory()->for($p)->create();

        $p->forceDelete();

        $this->assertEquals(0, ProductImage::where('product_id', $p->id)->count());
        $this->assertEquals(0, ProductOption::where('product_id', $p->id)->count());
    }

    public function test_factory_creates_option(): void
    {
        $opt = ProductOption::factory()->create(['type' => 'color', 'value' => 'أحمر']);
        $this->assertEquals('color', $opt->type);
        $this->assertEquals('أحمر', $opt->value);
    }

    public function test_option_belongs_to_product(): void
    {
        $opt = ProductOption::factory()->create();
        $this->assertNotNull($opt->product);
    }

    public function test_unique_product_type_value_constraint(): void
    {
        $p = Product::factory()->create();
        ProductOption::factory()->for($p)->create(['type' => 'color', 'value' => 'أحمر']);

        $this->expectException(\Illuminate\Database\QueryException::class);
        ProductOption::factory()->for($p)->create(['type' => 'color', 'value' => 'أحمر']);
    }
}