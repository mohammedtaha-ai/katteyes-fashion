<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class OrderNumberGenerator
{
    /**
     * Generate the next order number in the format `ORD-{YYYY}-{NNNNNN}`.
     * Per-year zero-padded sequence based on max existing order_number for the year.
     */
    public function generate(?int $year = null): string
    {
        $year = $year ?? (int) now()->format('Y');

        // MySQL needs `CAST AS UNSIGNED`, SQLite needs `CAST AS INTEGER`.
        $cast = DB::connection()->getDriverName() === 'mysql' ? 'UNSIGNED' : 'INTEGER';

        $last = DB::table('orders')
            ->where('order_number', 'LIKE', "ORD-{$year}-%")
            ->selectRaw("MAX(CAST(SUBSTRING(order_number, -6) AS {$cast})) AS m")
            ->value('m') ?? 0;

        return sprintf('ORD-%d-%06d', $year, $last + 1);
    }
}
