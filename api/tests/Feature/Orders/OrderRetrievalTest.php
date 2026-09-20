<?php
namespace Tests\Feature\Orders;

use App\Models\{Category, Order, OrderItem, Product, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderRetrievalTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_with_matching_email(): void
    {
        $o = Order::create([
            'order_number' => 'ORD-2026-000050',
            'user_id' => null,
            'status' => 'new',
            'customer_name' => 'X',
            'customer_email' => 'x@y.test',
            'customer_address' => 'A',
            'subtotal' => 0, 'total' => 0, 'currency' => 'YER',
        ]);

        $r = $this->getJson("/api/v1/orders/{$o->order_number}?email=x@y.test");
        $r->assertOk()->assertJsonPath('data.order_number', 'ORD-2026-000050');
    }

    public function test_guest_with_other_email_returns_404(): void
    {
        $o = Order::create([
            'order_number' => 'ORD-2026-000051',
            'user_id' => null,
            'status' => 'new',
            'customer_name' => 'X',
            'customer_email' => 'x@y.test',
            'customer_address' => 'A',
            'subtotal' => 0, 'total' => 0, 'currency' => 'YER',
        ]);

        $this->getJson("/api/v1/orders/{$o->order_number}?email=other@y.test")
             ->assertNotFound();
    }

    public function test_guest_without_email_param_returns_404(): void
    {
        $o = Order::create([
            'order_number' => 'ORD-2026-000052',
            'user_id' => null,
            'status' => 'new',
            'customer_name' => 'X',
            'customer_email' => 'x@y.test',
            'customer_address' => 'A',
            'subtotal' => 0, 'total' => 0, 'currency' => 'YER',
        ]);

        $this->getJson("/api/v1/orders/{$o->order_number}")
             ->assertNotFound();
    }

    public function test_authenticated_user_can_view_their_own_order(): void
    {
        $user = User::factory()->create();
        $o = Order::create([
            'order_number' => 'ORD-2026-000053',
            'user_id' => $user->id,
            'status' => 'new',
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_address' => 'A',
            'subtotal' => 0, 'total' => 0, 'currency' => 'YER',
        ]);

        Sanctum::actingAs($user);
        $r = $this->getJson("/api/v1/orders/{$o->order_number}");
        $r->assertOk()->assertJsonPath('data.order_number', 'ORD-2026-000053');
    }

    public function test_authenticated_user_cannot_view_others_order(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $o = Order::create([
            'order_number' => 'ORD-2026-000054',
            'user_id' => $other->id,
            'status' => 'new',
            'customer_name' => $other->name,
            'customer_email' => $other->email,
            'customer_address' => 'A',
            'subtotal' => 0, 'total' => 0, 'currency' => 'YER',
        ]);

        Sanctum::actingAs($user);
        $this->getJson("/api/v1/orders/{$o->order_number}")->assertNotFound();
    }

    public function test_nonexistent_order_number_returns_404(): void
    {
        $this->getJson('/api/v1/orders/ORD-2026-999999')->assertNotFound();
    }
}
