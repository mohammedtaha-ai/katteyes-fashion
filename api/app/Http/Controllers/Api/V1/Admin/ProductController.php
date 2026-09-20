<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductUpsertRequest;
use App\Http\Resources\ProductImageResource;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Actions\UploadImageAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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

    public function store(ProductUpsertRequest $r, UploadImageAction $action)
    {
        $p = Product::create($r->validated())->fresh();
        $p->load('category');

        if ($r->hasFile('images')) {
            $paths = $action->handle($r->file('images'));
            foreach ($paths as $i => $path) {
                $p->images()->create(['path' => $path, 'sort_order' => $i]);
            }
            $p->load('images');
        }

        return response()->json(['data' => new ProductResource($p)], 201);
    }

    public function show($product)
    {
        $p = Product::withTrashed()->with('category')->findOrFail($product);
        return ['data' => new ProductResource($p)];
    }

    public function update(ProductUpsertRequest $r, $product, UploadImageAction $action)
    {
        $p = Product::withTrashed()->findOrFail($product);
        $p->update($r->validated());
        $p->load('category');

        if ($r->hasFile('images')) {
            // REPLACE mode: delete old + upload new
            $oldImages = $p->images()->get();
            $paths = $action->handle($r->file('images'));
            $p->images()->delete();
            foreach ($paths as $i => $path) {
                $p->images()->create(['path' => $path, 'sort_order' => $i]);
            }
            foreach ($oldImages as $old) {
                Storage::disk(config('filesystems.default'))->delete($old->path);
            }
            $p->load('images');
        }

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

    public function appendImages(Request $r, UploadImageAction $action, $product)
    {
        $r->validate([
            'images' => 'required|array|min:1|max:20',
            'images.*' => 'file|image|mimes:jpeg,jpg,png,webp|max:10240',
        ]);

        $p = Product::findOrFail($product);
        $start = $p->images()->max('sort_order') ?? -1;

        $paths = $action->handle($r->file('images'));
        foreach ($paths as $i => $path) {
            $p->images()->create(['path' => $path, 'sort_order' => $start + $i + 1]);
        }

        return ['data' => ProductImageResource::collection($p->fresh()->images()->orderBy('sort_order')->get())];
    }

    public function deleteImage($product, $image)
    {
        $p = Product::findOrFail($product);

        if ($p->images()->count() <= 1) {
            return response()->json(['message' => 'لا يمكن حذف آخر صورة'], 422);
        }

        $img = $p->images()->findOrFail($image);
        Storage::disk(config('filesystems.default'))->delete($img->path);
        $img->delete();

        return response()->json(null, 204);
    }

    public function reorderImages(Request $r, $product)
    {
        $data = $r->validate(['ids' => 'required|array|min:1']);
        $p = Product::findOrFail($product);

        $existing = $p->images()->pluck('id')->all();
        sort($existing);
        $requested = $data['ids'];
        sort($requested);

        if ($existing !== $requested) {
            return response()->json(['message' => 'قائمة IDs غير مكتملة'], 422);
        }

        foreach ($data['ids'] as $i => $imageId) {
            $p->images()->where('id', $imageId)->update(['sort_order' => $i]);
        }

        return response()->json(null, 204);
    }
}