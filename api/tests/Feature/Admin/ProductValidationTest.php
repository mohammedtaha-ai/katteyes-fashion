<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
    }

    public function test_create_product_without_slug_passes_validation(): void
    {
        $category = Category::factory()->create();

        $response = $this->post('/api/v1/admin/products', [
            'name' => 'فستان سهرة أنيق',
            'price' => 1500,
            'currency' => 'YER',
            'category_id' => $category->id,
            'images' => [
                UploadedFile::fake()->image('test.jpg'),
            ],
        ]);

        $response->assertCreated();
    }

    public function test_create_product_with_colors_and_sizes_passes_validation(): void
    {
        $category = Category::factory()->create();

        $response = $this->post('/api/v1/admin/products', [
            'name' => 'فستان سهرة مطرز',
            'price' => 2000,
            'currency' => 'YER',
            'category_id' => $category->id,
            'colors' => ['أحمر', 'أزرق'],
            'sizes' => ['S', 'M', 'L'],
            'images' => [
                UploadedFile::fake()->image('test.jpg'),
            ],
        ]);

        $response->assertCreated();
    }

    public function test_colors_items_must_be_strings_max_50(): void
    {
        $category = Category::factory()->create();

        $response = $this->post('/api/v1/admin/products', [
            'name' => 'فستان كلاسيكي',
            'price' => 1200,
            'currency' => 'YER',
            'category_id' => $category->id,
            'colors' => [str_repeat('a', 51)],
            'images' => [
                UploadedFile::fake()->image('test.jpg'),
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('colors.0');
    }
}
