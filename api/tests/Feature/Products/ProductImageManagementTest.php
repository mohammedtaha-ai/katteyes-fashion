<?php

namespace Tests\Feature\Products;

use App\Models\{Category, Product, ProductImage, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductImageManagementTest extends TestCase
{
    use RefreshDatabase;

    private function asAdmin(): User
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);
        return $admin;
    }

    public function test_append_images_adds_to_gallery(): void
    {
        Storage::fake('public');
        $this->asAdmin();
        $cat = Category::factory()->create();
        $p = Product::factory()->for($cat)->create();
        $p->images()->create(['path' => 'products/2026/09/first.webp', 'sort_order' => 0]);

        $r = $this->post('/api/v1/admin/products/' . $p->id . '/images', [
            'images' => [
                UploadedFile::fake()->image('a.jpg', 500, 400),
                UploadedFile::fake()->image('b.jpg', 500, 400),
            ],
        ]);
        $r->assertOk()
          ->assertJsonCount(3, 'data');

        $p->refresh();
        $this->assertCount(3, $p->images);
    }

    public function test_delete_last_image_returns_422(): void
    {
        $this->asAdmin();
        $cat = Category::factory()->create();
        $p = Product::factory()->for($cat)->create();
        $img = $p->images()->create(['path' => 'products/2026/09/last.webp', 'sort_order' => 0]);

        $this->deleteJson("/api/v1/admin/products/{$p->id}/images/{$img->id}")
             ->assertStatus(422)
             ->assertJsonFragment(['message' => 'لا يمكن حذف آخر صورة']);
    }

    public function test_delete_non_last_image_removes_row_and_storage(): void
    {
        config(['filesystems.default' => 'public']);
        Storage::fake('public');
        Storage::disk('public')->put('products/2026/09/old.webp', 'x');
        $this->asAdmin();
        $cat = Category::factory()->create();
        $p = Product::factory()->for($cat)->create();
        $p->images()->create(['path' => 'products/2026/09/keep1.webp', 'sort_order' => 0]);
        $old = $p->images()->create(['path' => 'products/2026/09/old.webp', 'sort_order' => 1]);
        $p->images()->create(['path' => 'products/2026/09/keep2.webp', 'sort_order' => 2]);

        $this->deleteJson("/api/v1/admin/products/{$p->id}/images/{$old->id}")
             ->assertNoContent();

        $p->refresh();
        $this->assertCount(2, $p->images);
        Storage::disk('public')->assertMissing('products/2026/09/old.webp');
    }

    public function test_reorder_images_with_valid_ids(): void
    {
        $this->asAdmin();
        $cat = Category::factory()->create();
        $p = Product::factory()->for($cat)->create();
        $a = $p->images()->create(['path' => 'a', 'sort_order' => 0]);
        $b = $p->images()->create(['path' => 'b', 'sort_order' => 1]);
        $c = $p->images()->create(['path' => 'c', 'sort_order' => 2]);

        $this->postJson("/api/v1/admin/products/{$p->id}/images/reorder", [
            'ids' => [$c->id, $a->id, $b->id],
        ])->assertNoContent();

        $p->refresh();
        $this->assertEquals($c->id, $p->images[0]->id);
        $this->assertEquals($a->id, $p->images[1]->id);
        $this->assertEquals($b->id, $p->images[2]->id);
    }

    public function test_reorder_images_with_invalid_ids_returns_422(): void
    {
        $this->asAdmin();
        $cat = Category::factory()->create();
        $p = Product::factory()->for($cat)->create();
        $a = $p->images()->create(['path' => 'a', 'sort_order' => 0]);
        $b = $p->images()->create(['path' => 'b', 'sort_order' => 1]);

        $this->postJson("/api/v1/admin/products/{$p->id}/images/reorder", [
            'ids' => [$a->id, 999],
        ])->assertStatus(422);
    }
}