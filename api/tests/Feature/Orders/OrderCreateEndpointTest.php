<?php

namespace Tests\Feature\Orders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductOption;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderCreateEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_post_orders_returns_201_with_resource(): void
    {
        $cat = Category::factory()->create();
        $p = Product::factory()->for($cat)->create(['name' => 'فستان', 'price' => 3500]);
        ProductOption::factory()->for($p)->create(['type' => 'color', 'value' => 'أحمر']);
        ProductOption::factory()->for($p)->create(['type' => 'size', 'value' => 'M']);

        $r = $this->postJson('/api/v1/orders', [
            'items' => [
                ['product_id' => $p->id, 'color' => 'أحمر', 'size' => 'M', 'quantity' => 2],
            ],
            'customer_name' => 'سامي',
            'customer_email' => 's@test.test',
            'customer_address' => 'صنعاء',
        ]);

        $r->assertCreated()
          ->assertJsonStructure(['data' => [
              'order_number', 'status', 'customer_name', 'customer_email',
              'customer_address', 'subtotal', 'total', 'currency',
              'whatsapp_link', 'items',
          ]])
          ->assertJsonPath('data.customer_name', 'سامي')
          ->assertJsonPath('data.status', 'new')
          ->assertJsonPath('data.total', 7000);
    }

    public function test_whatsapp_link_contains_order_number(): void
    {
        config(['services.whatsapp.number' => '967713301759']);

        $cat = Category::factory()->create();
        $p = Product::factory()->for($cat)->create(['price' => 100]);

        $r = $this->postJson('/api/v1/orders', [
            'items' => [
                ['product_id' => $p->id, 'color' => 'x', 'size' => 'M', 'quantity' => 1],
            ],
            'customer_name' => 'x',
            'customer_email' => 'a@b.c',
            'customer_address' => 'y',
        ]);

        $link = $r->json('data.whatsapp_link');
        $this->assertStringStartsWith('https://wa.me/967713301759', $link);
        $this->assertStringContainsString('?text=', $link);
    }

    public function test_post_orders_validates_input(): void
    {
        $r = $this->postJson('/api/v1/orders', []);
        $r->assertStatus(422)->assertJsonValidationErrors(['items', 'customer_name', 'customer_address']);
    }
}