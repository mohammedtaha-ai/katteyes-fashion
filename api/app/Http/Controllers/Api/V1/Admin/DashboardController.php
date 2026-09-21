<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function stats()
    {
        $data = Cache::remember('admin.dashboard.stats', 300, function () {
            return [
                'products_total' => Product::count(),
                'products_active' => Product::where('is_active', true)->count(),
                'products_inactive' => Product::where('is_active', false)->count(),
                'categories_count' => Category::count(),
                'orders_new' => Order::where('status', 'new')->count(),
            ];
        });

        return response()->json(['data' => $data]);
    }
}
