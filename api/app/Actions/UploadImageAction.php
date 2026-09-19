<?php

namespace App\Actions;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class UploadImageAction
{
    /** @return string[] disk-relative paths */
    public function handle(array $files, string $disk = null): array
    {
        $disk = $disk ?: config('filesystems.default');
        $manager = new ImageManager(new Driver());

        return collect($files)->map(function (UploadedFile $file) use ($manager, $disk) {
            $filename = Str::uuid() . '.webp';
            $relPath = 'products/' . date('Y/m') . '/' . $filename;

            // v4 API: decode() accepts UploadedFile (or path/binary/etc)
            $img = $manager->decode($file)
                ->scaleDown(width: 1600)
                ->encodeUsingFileExtension('webp', quality: 85);

            Storage::disk($disk)->put($relPath, (string) $img);
            return $relPath;
        })->all();
    }
}
