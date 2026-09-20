<?php

namespace Tests\Feature\Orders;

use App\Models\Order;
use App\Services\OrderNumberGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderNumberGeneratorIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_first_order_in_a_year_is_000001(): void
    {
        $gen = new OrderNumberGenerator();
        $this->assertEquals('ORD-2026-000001', $gen->generate(2026));
    }

    public function test_next_order_increments_by_one(): void
    {
        Order::create([
            'order_number' => 'ORD-2026-000010',
            'customer_name' => 'x', 'customer_address' => 'y',
            'subtotal' => 0, 'total' => 0, 'currency' => 'YER',
        ]);
        $gen = new OrderNumberGenerator();
        $this->assertEquals('ORD-2026-000011', $gen->generate(2026));
    }

    public function test_year_isolates_sequence(): void
    {
        Order::create([
            'order_number' => 'ORD-2025-000999',
            'customer_name' => 'x', 'customer_address' => 'y',
            'subtotal' => 0, 'total' => 0, 'currency' => 'YER',
        ]);
        $gen = new OrderNumberGenerator();
        $this->assertEquals('ORD-2026-000001', $gen->generate(2026));
    }
}
