<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Image housekeeping
Schedule::command('products:prune-images')->daily()->at('04:00');

// Queue cleanup
Schedule::command('queue:prune-failed')->weekly();

// Nightly DB backup with 7-day retention
Schedule::command('backup:db --keep=7')->daily()->at('03:00');