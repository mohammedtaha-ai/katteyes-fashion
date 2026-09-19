<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductUpsertRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $q = Product::query()->withTrashed()->with('category')->orderByDesc('id');
        if ($r = $request->query('status')) {
            if ($r === 'active')   $q->where('is_active', true);
            if ($r === 'inactive') $q->where('is_active', false);
        }
        if ($slug = $request->query('category')) {
            $q->whereHas('category', fn ($w) => $w->where('slug', $slug));
        }
        if ($s = trim((string) $request->query('q'))) {
            $q->where('name', 'LIKE', "%{$s}%");
        }
        return ProductResource::collection($q->paginate(20));
    }

    public function store(ProductUpsertRequest $r)
    {
        $p = Product::create($r->validated())->fresh();
        $p->load('category');
        return response()->json(['data' => new ProductResource($p)], 201);
    }

    public function show($product)
    {
        $p = Product::withTrashed()->with('category')->findOrFail($product);
        return ['data' => new ProductResource($p)];
    }

    public function update(ProductUpsertRequest $r, $product)
    {
        $p = Product::withTrashed()->findOrFail($product);
        $p->update($r->validated());
        $p->load('category');
        return ['data' => new ProductResource($p)];
    }

    public function destroy($product)
    {
        Product::withTrashed()->findOrFail($product)->delete();
        return response()->json(null, 204);
    }

    public function restore($product)
    {
        Product::onlyTrashed()->findOrFail($product)->restore();
        return $this->show($product);
    }

    public function forceDestroy($product)
    {
        Product::withTrashed()->findOrFail($product)->forceDelete();
        return response()->json(null, 204);
    }
}