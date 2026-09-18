<?php

namespace Tests\Feature\Categories;

use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicCategoryListTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_list_shows_only_active_categories(): void
    {
        Category::factory()->create(['name' => 'نساء',  'is_active' => true]);
        Category::factory()->create(['name' => 'مخفية', 'is_active' => false]);
        $hidden = Category::factory()->create(['name' => 'محذوفة', 'is_active' => true]);
        $hidden->delete(); // soft delete

        $r = $this->getJson('/api/v1/categories');
        $r->assertOk()
          ->assertJsonCount(1, 'data')
          ->assertJsonPath('data.0.name', 'نساء');
    }

    public function test_public_list_orders_by_sort_order(): void
    {
        Category::factory()->create(['name' => 'A', 'sort_order' => 3]);
        Category::factory()->create(['name' => 'B', 'sort_order' => 1]);
        Category::factory()->create(['name' => 'C', 'sort_order' => 2]);

        $r = $this->getJson('/api/v1/categories');
        $r->assertOk()
          ->assertJsonPath('data.0.name', 'B')
          ->assertJsonPath('data.1.name', 'C')
          ->assertJsonPath('data.2.name', 'A');
    }
}