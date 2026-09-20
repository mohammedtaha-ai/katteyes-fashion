<?php

namespace Tests\Feature\Orders;

use App\Actions\CreateOrderAction;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductOption;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class CreateOrderActionTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_order_with_snapshotted_items(): void
    {
        $cat = Category::factory()->create();
        $p = Product::factory()->for($cat)->create(['price' => 3500, 'name' => 'فستان أحمر']);
        ProductOption::factory()->for($p)->create(['type' => 'color', 'value' => 'أحمر']);
        ProductOption::factory()->for($p)->create(['type' => 'size', 'value' => 'M']);

        $order = app(CreateOrderAction::class)->execute([
            'items' => [
                ['product_id' => $p->id, 'color' => 'أحمر', 'size' => 'M', 'quantity' => 2],
            ],
            'customer_name'    => 'سامي',
            'customer_address' => 'صنعاء',
            'customer_email'   => 's@test.test',
        ]);

        $this->assertNotEmpty($order->order_number);
        $this->assertMatchesRegularExpression('/^ORD-\d{4}-\d{6}$/', $order->order_number);
        $this->assertEquals(7000.0, $order->total);
        $this->assertCount(1, $order->items);
        $this->assertEquals('فستان أحمر', $order->items->first()->product_name);
        $this->assertEquals(3500.0, $order->items->first()->price);
    }

    public function test_empty_items_throws_with_exact_message(): void
    {
        $this->expectException(ValidationException::class);
        try {
            app(CreateOrderAction::class)->execute([
                'items' => [],
                'customer_name' => 'x',
                'customer_address' => 'y',
            ]);
        } catch (ValidationException $e) {
            $this->assertEquals(['items' => ['لا يمكن إرسال طلب فارغ']], $e->errors());
            throw $e;
        }
    }

    public function test_missing_product_throws_with_exact_message(): void
    {
        $this->expectException(ValidationException::class);
        try {
            app(CreateOrderAction::class)->execute([
                'items' => [
                    ['product_id' => 999999, 'color' => 'أحمر', 'size' => 'M', 'quantity' => 1],
                ],
                'customer_name' => 'x',
                'customer_address' => 'y',
                'customer_email' => 'a@b.c',
            ]);
        } catch (ValidationException $e) {
            $this->assertEquals('أحد المنتجات غير متوفر', $e->errors()['items.0.product_id'][0]);
            throw $e;
        }
    }

    public function test_invalid_color_throws_with_exact_message(): void
    {
        $cat = Category::factory()->create();
        $p = Product::factory()->for($cat)->create();
        ProductOption::factory()->for($p)->create(['type' => 'color', 'value' => 'أحمر']);

        $this->expectException(ValidationException::class);
        try {
            app(CreateOrderAction::class)->execute([
                'items' => [
                    ['product_id' => $p->id, 'color' => 'أزرق', 'size' => 'M', 'quantity' => 1],
                ],
                'customer_name' => 'x',
                'customer_address' => 'y',
                'customer_email' => 'a@b.c',
            ]);
        } catch (ValidationException $e) {
            $this->assertEquals('خيار اللون/المقاس غير صالح', $e->errors()['items.0.color'][0]);
            throw $e;
        }
    }

    public function test_guest_without_email_throws_with_exact_message(): void
    {
        $cat = Category::factory()->create();
        $p = Product::factory()->for($cat)->create();

        $this->expectException(ValidationException::class);
        try {
            app(CreateOrderAction::class)->execute([
                'items' => [
                    ['product_id' => $p->id, 'color' => 'x', 'size' => 'M', 'quantity' => 1],
                ],
                'customer_name' => 'x',
                'customer_address' => 'y',
                // NO email (guest without email)
            ]);
        } catch (ValidationException $e) {
            $this->assertEquals('البريد مطلوب للطلبات بدون حساب', $e->errors()['customer_email'][0]);
            throw $e;
        }
    }
}