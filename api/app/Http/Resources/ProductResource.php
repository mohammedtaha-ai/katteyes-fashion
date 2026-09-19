<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'slug'       => $this->slug,
            'description'=> $this->description,
            'price'      => (float) $this->price,
            'currency'   => $this->currency,
            'category'   => $this->whenLoaded('category', fn () => [
                'id'    => $this->category->id,
                'slug'  => $this->category->slug,
                'name'  => $this->category->name,
            ]),
            'is_active'  => (bool) $this->is_active,
            'images'     => $this->whenLoaded('images', fn () =>
                ProductImageResource::collection($this->images)
            ),
            'colors'     => $this->whenLoaded('options', fn () =>
                $this->options->where('type', 'color')->pluck('value')->values()
            ),
            'sizes'      => $this->whenLoaded('options', fn () =>
                $this->options->where('type', 'size')->pluck('value')->values()
            ),
        ];
    }
}
