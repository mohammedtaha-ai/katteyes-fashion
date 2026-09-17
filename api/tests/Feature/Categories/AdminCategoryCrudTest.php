<?php

namespace Tests\Feature\Categories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminCategoryCrudTest extends TestCase
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

        $create = $this->postJson('/api/v1/admin/categories', [
            'name' => 'فساتين', 'slug' => 'dresses',
        ]);
        $create->assertCreated()->assertJsonPath('data.name', 'فساتين');
        $id = $create->json('data.id');

        $this->patchJson("/api/v1/admin/categories/{$id}", ['name' => 'فساتين كبيرة'])
             ->assertOk()->assertJsonPath('data.name', 'فساتين كبيرة');

        $this->deleteJson("/api/v1/admin/categories/{$id}")->assertNoContent();
        $this->assertNull(Category::find($id));
        $this->assertNotNull(Category::withTrashed()->find($id));

        $this->postJson("/api/v1/admin/categories/{$id}/restore")->assertOk();
        $this->assertNotNull(Category::find($id));

        $this->deleteJson("/api/v1/admin/categories/{$id}/force")->assertNoContent();
        $this->assertNull(Category::withTrashed()->find($id));
    }

    public function test_non_admin_gets_403(): void
    {
        $this->asCustomer();
        $this->getJson('/api/v1/admin/categories')->assertForbidden();
    }

    public function test_unauthenticated_gets_401(): void
    {
        $this->getJson('/api/v1/admin/categories')->assertUnauthorized();
    }

    public function test_list_orders_by_sort_order(): void
    {
        $this->asAdmin();
        Category::factory()->create(['name' => 'A', 'sort_order' => 3]);
        Category::factory()->create(['name' => 'B', 'sort_order' => 1]);
        Category::factory()->create(['name' => 'C', 'sort_order' => 2]);

        $this->getJson('/api/v1/admin/categories')
             ->assertOk()
             ->assertJsonPath('data.0.name', 'B')
             ->assertJsonPath('data.1.name', 'C')
             ->assertJsonPath('data.2.name', 'A');
    }
}
