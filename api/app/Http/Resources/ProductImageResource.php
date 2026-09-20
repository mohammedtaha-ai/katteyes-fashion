<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductImageResource extends JsonResource
{
    public function toArray($request): array
    {
        $disk = $this->resource->product?->disk ?? config('filesystems.default');

        return [
            'id'         => $this->id,
            'url'        => Storage::disk($disk)->url($this->path),
            'sort_order' => (int) $this->sort_order,
        ];
    }
}