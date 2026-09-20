<?php

namespace App\Http\Resources;

use App\Services\WhatsAppMessageBuilder;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request): array
    {
        $msg = (new WhatsAppMessageBuilder())->build($this->resource);
        $waNumber = config('services.whatsapp.number', env('WHATSAPP_NUMBER', '967713301759'));
        $whatsappLink = 'https://wa.me/' . rawurlencode($waNumber) . '?text=' . rawurlencode($msg);

        return [
            'order_number'      => $this->order_number,
            'status'            => $this->status,
            'customer_name'     => $this->customer_name,
            'customer_email'    => $this->customer_email,
            'customer_address'  => $this->customer_address,
            'customer_notes'    => $this->customer_notes,
            'subtotal'          => (float) $this->subtotal,
            'total'             => (float) $this->total,
            'currency'          => $this->currency,
            'whatsapp_link'     => $whatsappLink,
            'created_at'        => optional($this->created_at)->toIso8601String(),
            'items'             => $this->whenLoaded('items', fn () =>
                $this->items->map(fn ($it) => [
                    'product_name' => $it->product_name,
                    'price'        => (float) $it->price,
                    'color'        => $it->color,
                    'size'         => $it->size,
                    'quantity'     => $it->quantity,
                    'subtotal'     => (float) ($it->price * $it->quantity),
                ])
            ),
        ];
    }
}