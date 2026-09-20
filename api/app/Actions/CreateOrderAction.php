<?php

namespace App\Actions;

use App\Models\Order;
use App\Models\Product;
use App\Services\OrderNumberGenerator;
use App\Services\WhatsAppMessageBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateOrderAction
{
    public function __construct(
        private OrderNumberGenerator $numbers,
        private WhatsAppMessageBuilder $messages,
    ) {}

    public function execute(array $data, ?Request $request = null): Order
    {
        $user = $request?->user();

        // Spec §7.4: separate cart-empty vs missing-product vs missing-email with exact strings
        if (empty($data['items'])) {
            throw ValidationException::withMessages(['items' => ['لا يمكن إرسال طلب فارغ']]);
        }

        $productIds = collect($data['items'])->pluck('product_id')->all();
        $products = Product::whereIn('id', $productIds)
            ->with('options')
            ->get()
            ->keyBy('id');

        foreach ($data['items'] as $idx => $item) {
            if (! isset($products[$item['product_id']])) {
                throw ValidationException::withMessages([
                    "items.{$idx}.product_id" => ['أحد المنتجات غير متوفر'],
                ]);
            }
        }

        // Per-item color/size validation
        foreach ($data['items'] as $idx => $item) {
            $p = $products[$item['product_id']];
            $validColors = $p->options->where('type', 'color')->pluck('value');
            $validSizes  = $p->options->where('type', 'size')->pluck('value');
            if ($validColors->isNotEmpty() && ! $validColors->contains($item['color'])) {
                throw ValidationException::withMessages([
                    "items.{$idx}.color" => ['خيار اللون/المقاس غير صالح'],
                ]);
            }
            if ($validSizes->isNotEmpty() && ! $validSizes->contains($item['size'])) {
                throw ValidationException::withMessages([
                    "items.{$idx}.size" => ['خيار اللون/المقاس غير صالح'],
                ]);
            }
        }

        // Guest + no email (only if user not auth'd and no email supplied)
        if (! $user && empty($data['customer_email'])) {
            throw ValidationException::withMessages([
                'customer_email' => ['البريد مطلوب للطلبات بدون حساب'],
            ]);
        }

        return DB::transaction(function () use ($data, $user, $products) {
            $total = 0;
            foreach ($data['items'] as $it) {
                $total += $products[$it['product_id']]->price * $it['quantity'];
            }

            $order = Order::create([
                'order_number'    => $this->numbers->generate(),
                'user_id'         => $user?->id,
                'status'          => 'new',
                'customer_name'   => $data['customer_name'],
                'customer_email'  => $data['customer_email'] ?? $user?->email,
                'customer_address'=> $data['customer_address'],
                'customer_notes'  => $data['customer_notes'] ?? null,
                'subtotal'        => $total,
                'total'           => $total,
                'currency'        => 'YER',
            ]);

            foreach ($data['items'] as $it) {
                $p = $products[$it['product_id']];
                $order->items()->create([
                    'product_id'   => $p->id,
                    'product_name' => $p->name,
                    'price'        => $p->price,
                    'color'        => $it['color'],
                    'size'         => $it['size'],
                    'quantity'     => $it['quantity'],
                ]);
            }

            return $order->load('items');
        });
    }
}