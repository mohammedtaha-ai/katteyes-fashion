<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PruneImagesCommand extends Command
{
    protected $signature = 'products:prune-images {--delete : actually delete}';

    protected $description = 'Detect (and optionally delete) orphan product images.';

    public function handle(): int
    {
        $disk = config('filesystems.default');
        $known = array_flip(DB::table('product_images')->pluck('path')->all());
        $orphans = [];
        foreach (Storage::disk($disk)->allFiles('products') as $f) {
            if (! isset($known[$f])) {
                $orphans[] = $f;
            }
        }
        if (! $orphans) {
            $this->info('No orphan images.');

            return self::SUCCESS;
        }
        $this->info('Orphan images ('.count($orphans).'):');
        foreach ($orphans as $o) {
            $this->line("  $o");
        }
        if ($this->option('delete')) {
            Storage::disk($disk)->delete($orphans);
            $this->info('Deleted.');
        } else {
            $this->comment('Re-run with --delete to remove them.');
        }

        return self::SUCCESS;
    }
}