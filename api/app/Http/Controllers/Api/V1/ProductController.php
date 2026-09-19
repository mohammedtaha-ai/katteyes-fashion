<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $q = Product::query()
            ->where('is_active', true)
            ->with('category');

        if ($slug = $request->query('category')) {
            $q->whereHas('category', fn ($qq) => $qq->where('slug', $slug)->where('is_active', true));
        }

        if ($s = trim((string) $request->query('q'))) {
            $q->where(function ($w) use ($s) {
                $w->where('name', 'LIKE', "%{$s}%")
                  ->orWhere('description', 'LIKE', "%{$s}%");
            });
        }

        return ProductResource::collection($q->paginate(12));
    }

    public function show(string $slug)
    {
        // NOTE: `images` and `options` eager-loads deferred to Task 4.6 —
        // those tables don't exist yet (would throw SQLSTATE in tests).
        $p = Product::where('slug', $slug)
            ->where('is_active', true)
            ->with('category')
            ->firstOrFail();
        return ['data' => new ProductResource($p)];
    }
}