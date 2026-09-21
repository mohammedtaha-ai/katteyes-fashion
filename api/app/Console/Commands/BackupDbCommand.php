<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class BackupDbCommand extends Command
{
    protected $signature = 'backup:db {--keep=7 : how many backups to retain}';

    protected $description = 'Dump MySQL database to storage/backups/db-YYYY-MM-DD.sql.gz';

    public function handle(): int
    {
        $filename = 'backups/db-'.date('Y-m-d').'.sql.gz';
        $fullPath = storage_path('app/'.$filename);

        File::ensureDirectoryExists(dirname($fullPath));

        $cmd = sprintf(
            'mysqldump -h%s -u%s -p%s %s | gzip > %s',
            escapeshellarg(env('DB_HOST', '127.0.0.1')),
            escapeshellarg(env('DB_USERNAME', 'root')),
            escapeshellarg(env('DB_PASSWORD', '')),
            escapeshellarg(env('DB_DATABASE', 'katteyes')),
            escapeshellarg($fullPath),
        );

        // Sanitize command for logging (mask password)
        $logCmd = preg_replace('/-p\S+/', '-p****', $cmd);
        $this->info("Running: $logCmd");

        exec($cmd, $output, $exitCode);
        if ($exitCode !== 0) {
            $this->error("mysqldump exited with code $exitCode");

            return self::FAILURE;
        }

        $this->info("Wrote $filename");

        // Retain only N most-recent backups
        $keep = (int) $this->option('keep');
        if ($keep > 0) {
            $disk = config('filesystems.default');
            $files = collect(Storage::disk($disk)->files('backups'))
                ->sortByDesc(fn ($f) => $f)
                ->values();
            $toDelete = $files->slice($keep);
            foreach ($toDelete as $f) {
                Storage::disk($disk)->delete($f);
                $this->line("Pruned old backup: $f");
            }
        }

        return self::SUCCESS;
    }
}