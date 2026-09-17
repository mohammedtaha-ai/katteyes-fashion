<?php

namespace Tests\Feature\Categories;

use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_factory_creates_category(): void
    {
        $cat = Category::factory()->create();

        $this->assertNotEmpty($cat->name);
        $this->assertNotEmpty($cat->slug);
        $this->assertTrue($cat->is_active);
    }

    public function test_soft_delete_excludes_from_default_query(): void
    {
        $cat = Category::factory()->create();
        $cat->delete();

        $this->assertNull(Category::find($cat->id));
        $this->assertNotNull(Category::withTrashed()->find($cat->id));
    }

    public function test_slug_must_be_unique(): void
    {
        Category::factory()->create(['slug' => 'same-slug']);

        $this->expectException(\Illuminate\Database\QueryException::class);
        Category::factory()->create(['slug' => 'same-slug']);
    }
}
