<?php

namespace Tests\Feature\Console;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PruneImagesCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_prune_images_detects_orphans(): void
    {
        Storage::fake('public');
        config(['filesystems.default' => 'public']);

        $p = Product::factory()->create();
        ProductImage::factory()
            ->for($p)
            ->create(['path' => 'products/2026/09/real.webp']);
        Storage::disk('public')->put('products/2026/09/orphan.webp', 'x');

        $this->artisan('products:prune-images')
            ->expectsOutputToContain('orphan.webp')
            ->assertExitCode(0);
    }

    public function test_prune_images_with_delete_removes_orphan_files(): void
    {
        Storage::fake('public');
        config(['filesystems.default' => 'public']);

        Storage::disk('public')->put('products/orphan.webp', 'x');

        $this->artisan('products:prune-images', ['--delete' => true])
            ->expectsOutputToContain('Deleted.')
            ->assertExitCode(0);

        $this->assertFalse(Storage::disk('public')->exists('products/orphan.webp'));
    }

    public function test_prune_images_reports_no_orphans_when_storage_is_clean(): void
    {
        Storage::fake('public');
        config(['filesystems.default' => 'public']);

        $this->artisan('products:prune-images')
            ->expectsOutputToContain('No orphan images.')
            ->assertExitCode(0);
    }
}