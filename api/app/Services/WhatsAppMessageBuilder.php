<?php

namespace App\Services;

use App\Models\Order;

class WhatsAppMessageBuilder
{
    /**
     * Build the WhatsApp message text for an order.
     * Format: header (order number, customer info) + items list + total.
     */
    public function build(Order $order): string
    {
        $lines = [];
        $lines[] = "*طلب جديد — {$order->order_number}*";
        $lines[] = "الاسم: {$order->customer_name}";
        $lines[] = "العنوان: {$order->customer_address}";
        $lines[] = 'ملاحظات: ' . ($order->customer_notes ?: 'لا يوجد');
        $lines[] = '——————';

        foreach ($order->items as $i => $item) {
            $sub = $item->price * $item->quantity;
            $lines[] = sprintf(
                '%d. %s (%s - %s) × %d = %s %s',
                $i + 1,
                $item->product_name,
                $item->color,
                $item->size,
                $item->quantity,
                number_format($sub, 2, '.', ','),
                $order->currency
            );
        }

        $lines[] = '——————';
        $lines[] = '*المجموع: ' . number_format($order->total, 2, '.', ',') . ' ' . $order->currency . '*';

        return implode("\n", $lines);
    }
}
