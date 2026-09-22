<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'فساتين سهرة', 'slug' => 'فساتين-سهرة', 'sort_order' => 0, 'is_active' => true],
            ['name' => 'عبايات خليجية', 'slug' => 'عبايات-خليجية', 'sort_order' => 1, 'is_active' => true],
            ['name' => 'ملابس كاجوال', 'slug' => 'ملابس-كاجوال', 'sort_order' => 2, 'is_active' => true],
            ['name' => 'أحذية وحقائب', 'slug' => 'أحذية-وحقائب', 'sort_order' => 3, 'is_active' => true],
            ['name' => 'إكسسوارات', 'slug' => 'إكسسوارات', 'sort_order' => 4, 'is_active' => true],
        ];

        foreach ($categories as $data) {
            Category::firstOrCreate(
                ['slug' => $data['slug']],
                $data
            );
        }
    }
}
