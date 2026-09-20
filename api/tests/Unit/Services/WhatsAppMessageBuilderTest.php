<?php

namespace Tests\Unit\Services;

use App\Models\{Order, OrderItem};
use App\Services\WhatsAppMessageBuilder;
use Tests\TestCase;

class WhatsAppMessageBuilderTest extends TestCase
{
    public function test_build_contains_order_number_and_customer_name(): void
    {
        $o = new Order([
            'order_number' => 'ORD-2026-000123',
            'customer_name' => 'سامي',
            'customer_address' => 'صنعاء',
            'customer_notes' => null,
            'total' => 7000,
            'currency' => 'YER',
        ]);
        $o->setRelation('items', collect([
            new OrderItem(['product_name' => 'فستان', 'color' => 'أحمر', 'size' => 'M', 'quantity' => 1, 'price' => 3500]),
            new OrderItem(['product_name' => 'قميص', 'color' => 'أبيض', 'size' => 'L', 'quantity' => 2, 'price' => 1750]),
        ]));

        $msg = (new WhatsAppMessageBuilder())->build($o);
        $this->assertStringContainsString('ORD-2026-000123', $msg);
        $this->assertStringContainsString('سامي', $msg);
        $this->assertStringContainsString('صنعاء', $msg);
        $this->assertStringContainsString('فستان (أحمر - M) × 1 = 3,500.00 YER', $msg);
        $this->assertStringContainsString('قميص (أبيض - L) × 2 = 3,500.00 YER', $msg);
        $this->assertStringContainsString('7,000.00 YER', $msg);
    }

    public function test_build_uses_default_note_when_null(): void
    {
        $o = new Order([
            'order_number' => 'ORD-2026-000001',
            'customer_name' => 'x', 'customer_address' => 'y',
            'customer_notes' => null,
            'total' => 100, 'currency' => 'YER',
        ]);
        $o->setRelation('items', collect([]));

        $msg = (new WhatsAppMessageBuilder())->build($o);
        $this->assertStringContainsString('لا يوجد', $msg);
    }
}
