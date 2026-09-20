<?php

namespace Tests\Feature\Orders;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderModelsTest extends TestCase
{
    use RefreshDatabase;

    public function test_factory_creates_order(): void
    {
        $o = Order::factory()->create();
        $this->assertNotEmpty($o->order_number);
        $this->assertEquals('new', $o->status);
        $this->assertEquals('YER', $o->currency);
    }

    public function test_order_number_is_unique(): void
    {
        Order::factory()->create(['order_number' => 'ORD-2026-000001']);
        $this->expectException(QueryException::class);
        Order::factory()->create(['order_number' => 'ORD-2026-000001']);
    }

    public function test_order_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $o = Order::factory()->for($user)->create();
        $this->assertEquals($user->id, $o->user->id);
    }

    public function test_user_has_many_orders(): void
    {
        $user = User::factory()->create();
        Order::factory()->count(3)->for($user)->create();
        $this->assertCount(3, $user->fresh()->orders);
    }

    public function test_order_has_many_items(): void
    {
        $o = Order::factory()->create();
        OrderItem::factory()->count(2)->for($o)->create();
        $this->assertCount(2, $o->fresh()->items);
    }

    public function test_cascading_delete_order_deletes_items(): void
    {
        $o = Order::factory()->create();
        OrderItem::factory()->for($o)->create();
        OrderItem::factory()->for($o)->create();

        $o->forceDelete(); // cascade only works with hard delete
        $this->assertEquals(0, OrderItem::where('order_id', $o->id)->count());
    }

    public function test_restrict_on_delete_product_prevents_deletion(): void
    {
        $cat = Category::factory()->create();
        $p = Product::factory()->for($cat)->create();
        $o = Order::factory()->create();
        OrderItem::factory()->for($o)->for($p)->create();

        $this->expectException(QueryException::class);
        $p->forceDelete();
    }
}
