<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryUpsertRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $q = Category::query()->orderBy('sort_order')->orderBy('id');
        if ($request->boolean('with_trashed')) {
            $q->withTrashed();
        }
        return CategoryResource::collection($q->paginate(50));
    }

    public function store(CategoryUpsertRequest $r)
    {
        $cat = Category::create($r->validated());
        return (new CategoryResource($cat))->response()->setStatusCode(201);
    }

    public function show($id)
    {
        return new CategoryResource($this->findOrFailWithTrashed($id));
    }

    public function update(CategoryUpsertRequest $r, $id)
    {
        $cat = $this->findOrFailWithTrashed($id);
        $cat->update($r->validated());
        return new CategoryResource($cat);
    }

    public function destroy($id)
    {
        $this->findOrFailWithTrashed($id)->delete();
        return response()->json(null, 204);
    }

    public function restore($id)
    {
        Category::onlyTrashed()->findOrFail($id)->restore();
        return $this->show($id);
    }

    public function forceDestroy($id)
    {
        Category::withTrashed()->findOrFail($id)->forceDelete();
        return response()->json(null, 204);
    }

    private function findOrFailWithTrashed($id)
    {
        return Category::withTrashed()->findOrFail($id);
    }
}
