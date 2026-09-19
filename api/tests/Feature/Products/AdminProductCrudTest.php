<?php

namespace Tests\Feature\Products;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminProductCrudTest extends TestCase
{
    use RefreshDatabase;

    private function asAdmin(): User
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);
        return $admin;
    }

    private function asCustomer(): User
    {
        $cust = User::factory()->create(['role' => 'customer']);
        Sanctum::actingAs($cust);
        return $cust;
    }

    public function test_admin_can_create_update_soft_delete_restore_force_delete(): void
    {
        $this->asAdmin();
        $cat = Category::factory()->create();
        $create = $this->postJson('/api/v1/admin/products', [
            'name' => 'فستان', 'slug' => 'dress-1',
            'price' => 3500, 'currency' => 'YER', 'category_id' => $cat->id,
        ]);
        $create->assertCreated()->assertJsonPath('data.name', 'فستان');
        $id = $create->json('data.id');

        $this->patchJson("/api/v1/admin/products/{$id}", ['price' => 4000])
             ->assertOk()->assertJsonPath('data.price', 4000);

        $this->deleteJson("/api/v1/admin/products/{$id}")->assertNoContent();
        $this->assertNull(Product::find($id));
        $this->assertNotNull(Product::withTrashed()->find($id));

        $this->postJson("/api/v1/admin/products/{$id}/restore")->assertOk();
        $this->assertNotNull(Product::find($id));

        $this->deleteJson("/api/v1/admin/products/{$id}/force")->assertNoContent();
        $this->assertNull(Product::withTrashed()->find($id));
    }

    public function test_customer_gets_403(): void
    {
        $this->asCustomer();
        $this->getJson('/api/v1/admin/products')->assertForbidden();
    }

    public function test_unauthenticated_gets_401(): void
    {
        $this->getJson('/api/v1/admin/products')->assertUnauthorized();
    }

    public function test_list_filters_by_status_active_inactive(): void
    {
        $this->asAdmin();
        $cat = Category::factory()->create();
        Product::factory()->for($cat)->create(['is_active' => true,  'name' => 'active']);
        Product::factory()->for($cat)->create(['is_active' => false, 'name' => 'inactive']);

        $this->getJson('/api/v1/admin/products?status=active')
             ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'active');

        $this->getJson('/api/v1/admin/products?status=inactive')
             ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'inactive');
    }
}