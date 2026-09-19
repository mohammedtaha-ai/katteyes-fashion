<?php
namespace Tests\Unit\Actions;

use App\Actions\UploadImageAction;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UploadImageActionTest extends TestCase
{
    public function test_resizes_to_max_1600_and_stores_as_webp(): void
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->image('big.jpg', 2400, 1800);

        $paths = (new UploadImageAction())->handle([$file], disk: 'public');

        $this->assertCount(1, $paths);
        Storage::disk('public')->assertExists($paths[0]);
        $contents = Storage::disk('public')->get($paths[0]);
        $this->assertSame('RIFF', substr($contents, 0, 4));
        $this->assertMatchesRegularExpression('#^products/\d{4}/\d{2}/[a-f0-9-]+\.webp$#', $paths[0]);
    }

    public function test_handles_multiple_files(): void
    {
        Storage::fake('public');
        $files = [
            UploadedFile::fake()->image('a.jpg', 1000, 800),
            UploadedFile::fake()->image('b.jpg', 1500, 1200),
            UploadedFile::fake()->image('c.jpg', 800, 600),
        ];

        $paths = (new UploadImageAction())->handle($files, disk: 'public');

        $this->assertCount(3, $paths);
        foreach ($paths as $p) {
            Storage::disk('public')->assertExists($p);
        }
    }
}
