<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            ['name' => 'الكل',   'slug' => 'all',     'sort_order' => 0],
            ['name' => 'نساء',   'slug' => 'women',   'sort_order' => 1],
            ['name' => 'رجال',   'slug' => 'men',     'sort_order' => 2],
            ['name' => 'أطفال',  'slug' => 'kids',    'sort_order' => 3],
            ['name' => 'عبايات', 'slug' => 'abayas',  'sort_order' => 4],
            ['name' => 'فساتين', 'slug' => 'dresses', 'sort_order' => 5],
        ];
        foreach ($defaults as $row) {
            Category::updateOrCreate(['slug' => $row['slug']], $row);
        }
    }
}
