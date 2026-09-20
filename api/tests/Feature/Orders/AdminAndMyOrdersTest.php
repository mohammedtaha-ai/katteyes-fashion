<?php
namespace Tests\Feature\Orders;

use App\Models\{Order, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminAndMyOrdersTest extends TestCase
{
    use RefreshDatabase;

    private function createOrder(array $attrs = []): Order
    {
        return Order::create(array_merge([
            'order_number' => 'ORD-2026-' . rand(1, 999999),
            'user_id' => null,
            'status' => 'new',
            'customer_name' => 'x',
            'customer_email' => 'a@b.c',
            'customer_address' => 'y',
            'subtotal' => 0, 'total' => 0, 'currency' => 'YER',
        ], $attrs));
    }

    private function asAdmin(): User
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);
        return $admin;
    }

    public function test_admin_can_list_orders_with_status_filter(): void
    {
        $this->createOrder(['order_number' => 'ORD-2026-000001', 'status' => 'new']);
        $this->createOrder(['order_number' => 'ORD-2026-000002', 'status' => 'confirmed']);

        $this->asAdmin();
        $r = $this->getJson('/api/v1/admin/orders?status=confirmed');
        $r->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.status', 'confirmed');
    }

    public function test_customer_gets_403_on_admin(): void
    {
        $cust = User::factory()->create(['role' => 'customer']);
        Sanctum::actingAs($cust);
        $this->getJson('/api/v1/admin/orders')->assertForbidden();
    }

    public function test_admin_can_update_status(): void
    {
        $o = $this->createOrder(['order_number' => 'ORD-2026-000010']);
        $this->asAdmin();

        $this->patchJson("/api/v1/admin/orders/{$o->order_number}", ['status' => 'confirmed'])
             ->assertOk()->assertJsonPath('data.status', 'confirmed');

        $this->assertEquals('confirmed', $o->fresh()->status);
    }

    public function test_admin_can_delete_order(): void
    {
        $o = $this->createOrder(['order_number' => 'ORD-2026-000020']);
        $this->asAdmin();

        $this->deleteJson("/api/v1/admin/orders/{$o->order_number}")->assertNoContent();
        $this->assertNull(Order::find($o->id));
    }

    public function test_user_can_list_their_own_orders(): void
    {
        $user = User::factory()->create();
        $this->createOrder(['order_number' => 'ORD-2026-000030', 'user_id' => $user->id]);
        $this->createOrder(['order_number' => 'ORD-2026-000031', 'user_id' => $user->id]);
        $this->createOrder(['order_number' => 'ORD-2026-000032', 'user_id' => null]);

        Sanctum::actingAs($user);
        $r = $this->getJson('/api/v1/my/orders');
        $r->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_user_cannot_view_others_orders_via_my(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $o = $this->createOrder(['order_number' => 'ORD-2026-000040', 'user_id' => $other->id]);

        Sanctum::actingAs($user);
        $this->getJson("/api/v1/my/orders/{$o->order_number}")->assertNotFound();
    }
}
