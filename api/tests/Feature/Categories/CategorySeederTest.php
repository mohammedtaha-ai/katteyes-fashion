<?php

namespace Tests\Feature\Categories;

use App\Models\Category;
use Database\Seeders\CategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategorySeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeder_creates_six_default_categories(): void
    {
        $this->seed(CategorySeeder::class);

        $cats = Category::all();
        $this->assertCount(6, $cats);
        $this->assertEquals('الكل',   $cats[0]->name);
        $this->assertEquals('نساء',   $cats[1]->name);
        $this->assertEquals('رجال',   $cats[2]->name);
        $this->assertEquals('أطفال',  $cats[3]->name);
        $this->assertEquals('عبايات', $cats[4]->name);
        $this->assertEquals('فساتين', $cats[5]->name);
    }

    public function test_seeder_is_idempotent_runs_twice_does_not_duplicate(): void
    {
        $this->seed(CategorySeeder::class);
        $this->seed(CategorySeeder::class);

        $this->assertCount(6, Category::all());
    }

    public function test_seeder_does_not_overwrite_existing_categories_with_different_slug(): void
    {
        Category::factory()->create(['name' => 'leftover', 'slug' => 'smoke']);
        $this->seed(CategorySeeder::class);

        $this->assertEquals(7, Category::count()); // 6 defaults + 1 leftover
        $this->assertDatabaseHas('categories', ['name' => 'leftover', 'slug' => 'smoke']);
        $this->assertDatabaseHas('categories', ['name' => 'الكل', 'slug' => 'all']);
    }
}
