<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductImageResource extends JsonResource
{
    public function toArray($request): array
    {
        $disk = $this->resource->product?->disk ?? config('filesystems.default');

        $url = (str_starts_with($this->path, 'http://') || str_starts_with($this->path, 'https://'))
            ? $this->path
            : Storage::disk($disk)->url($this->path);

        return [
            'id'         => $this->id,
            'url'        => $url,
            'sort_order' => (int) $this->sort_order,
        ];
    }
}