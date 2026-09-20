<?php

namespace Tests\Feature\Products;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminProductImagesTest extends TestCase
{
    use RefreshDatabase;

    private function asAdmin(): User
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);
        return $admin;
    }

    public function test_create_requires_at_least_one_image(): void
    {
        $this->asAdmin();
        $cat = Category::factory()->create();

        $r = $this->postJson('/api/v1/admin/products', [
            'name' => 'x', 'slug' => 'x', 'price' => 1, 'currency' => 'YER',
            'category_id' => $cat->id,
        ]);
        $r->assertStatus(422)->assertJsonValidationErrors('images');
    }

    public function test_create_with_image_persists_image_and_relationship(): void
    {
        Storage::fake('public');
        $this->asAdmin();
        $cat = Category::factory()->create();

        $file = UploadedFile::fake()->image('photo.jpg', 1000, 800);

        $r = $this->post('/api/v1/admin/products', [
            'name' => 'فستان', 'slug' => 'dress-img', 'price' => 3500, 'currency' => 'YER',
            'category_id' => $cat->id,
            'images' => [$file],
        ]);
        $r->assertCreated();

        $p = Product::where('slug', 'dress-img')->first();
        $this->assertNotNull($p);
        $this->assertCount(1, $p->images);
        $this->assertEquals(0, $p->images->first()->sort_order);
    }

    public function test_update_with_images_replaces_existing(): void
    {
        Storage::fake('public');
        $this->asAdmin();
        $cat = Category::factory()->create();
        $p = Product::factory()->for($cat)->create();
        $oldFile = UploadedFile::fake()->image('old.jpg', 500, 400);
        $oldImage = $p->images()->create(['path' => 'products/2026/09/old.webp', 'sort_order' => 0]);

        $newFile = UploadedFile::fake()->image('new.jpg', 500, 400);

        $this->put('/api/v1/admin/products/' . $p->id, [
            'name' => $p->name, 'slug' => $p->slug, 'price' => $p->price, 'currency' => 'YER',
            'category_id' => $cat->id,
            'images' => [$newFile],
        ])->assertOk();

        $p->refresh();
        $this->assertCount(1, $p->images); // only the new one
        $this->assertNotEquals($oldImage->id, $p->images->first()->id);
    }

    public function test_update_without_images_keeps_existing(): void
    {
        Storage::fake('public');
        $this->asAdmin();
        $cat = Category::factory()->create();
        $p = Product::factory()->for($cat)->create();
        $originalImage = $p->images()->create(['path' => 'products/2026/09/keep.webp', 'sort_order' => 0]);

        $this->patchJson("/api/v1/admin/products/{$p->id}", [
            'name' => 'new name',
        ])->assertOk();

        $p->refresh();
        $this->assertCount(1, $p->images);
        $this->assertEquals($originalImage->id, $p->images->first()->id);
    }
}
