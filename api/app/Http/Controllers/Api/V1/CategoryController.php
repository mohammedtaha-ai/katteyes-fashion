<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        $cats = Category::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
        return CategoryResource::collection($cats);
    }
}