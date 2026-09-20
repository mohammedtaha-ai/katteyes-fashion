<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_number' => 'ORD-' . now()->format('Y') . '-' . str_pad((string) $this->faker->unique()->numberBetween(1, 999999), 6, '0', STR_PAD_LEFT),
            'user_id' => null,
            'status' => 'new',
            'customer_name' => $this->faker->name(),
            'customer_email' => $this->faker->safeEmail(),
            'customer_address' => $this->faker->address(),
            'subtotal' => $this->faker->randomFloat(2, 100, 9999),
            'total' => $this->faker->randomFloat(2, 100, 9999),
            'currency' => 'YER',
        ];
    }
}
