<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardStatsTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_stats_returns_correct_counts(): void
    {
        $categories = Category::factory()->count(3)->create();

        Product::factory()->count(2)->create([
            'category_id' => $categories[0]->id,
            'is_active' => true,
        ]);
        Product::factory()->count(1)->create([
            'category_id' => $categories[1]->id,
            'is_active' => false,
        ]);

        Order::factory()->count(4)->create(['status' => 'new']);
        Order::factory()->count(2)->create(['status' => 'confirmed']);

        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $response = $this->getJson('/api/v1/admin/dashboard/stats');

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                'products_total',
                'products_active',
                'products_inactive',
                'categories_count',
                'orders_new',
            ],
        ]);
        $response->assertJson([
            'data' => [
                'products_total' => 3,
                'products_active' => 2,
                'products_inactive' => 1,
                'categories_count' => 3,
                'orders_new' => 4,
            ],
        ]);

        $this->assertTrue(Cache::has('admin.dashboard.stats'));
        $this->assertEquals(3, Cache::get('admin.dashboard.stats')['products_total']);
    }

    public function test_unauthenticated_user_cannot_access_dashboard_stats(): void
    {
        $response = $this->getJson('/api/v1/admin/dashboard/stats');

        $response->assertUnauthorized();
    }
}
