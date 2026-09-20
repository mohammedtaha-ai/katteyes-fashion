<?php
use App\Http\Controllers\Api\V1\AuthController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;

RateLimiter::for('auth', function ($request) {
    return Limit::perMinute(60)->by($request->ip());
});

Route::middleware('throttle:auth')->group(function () {
    // public, rate-limited (spec §5.8)
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login',    [AuthController::class, 'login']);
});

// public storefront (no auth, spec §5.3)
Route::get('categories', [\App\Http\Controllers\Api\V1\CategoryController::class, 'index']);
Route::get('products',   [\App\Http\Controllers\Api\V1\ProductController::class, 'index']);
Route::get('products/{slug}', [\App\Http\Controllers\Api\V1\ProductController::class, 'show']);
Route::post('orders', [\App\Http\Controllers\Api\V1\OrderController::class, 'store']);
Route::get('orders/{order_number}', [\App\Http\Controllers\Api\V1\OrderController::class, 'show']);

// auth-protected
Route::middleware('auth:sanctum')->group(function () {
    Route::get ('auth/me',         [AuthController::class, 'me']);
    Route::post('auth/logout',     [AuthController::class, 'logout']);
    Route::post('auth/logout-all', [AuthController::class, 'logoutAll']);

    Route::get('my/orders',                 [\App\Http\Controllers\Api\V1\MyOrdersController::class, 'index']);
    Route::get('my/orders/{order_number}',  [\App\Http\Controllers\Api\V1\MyOrdersController::class, 'show']);
});

// admin-only (spec §5.6)
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::apiResource('categories', \App\Http\Controllers\Api\V1\Admin\CategoryController::class)
         ->except(['create', 'edit']);
    Route::post('categories/{id}/restore',  [\App\Http\Controllers\Api\V1\Admin\CategoryController::class, 'restore']);
    Route::delete('categories/{id}/force', [\App\Http\Controllers\Api\V1\Admin\CategoryController::class, 'forceDestroy']);

    Route::apiResource('products', \App\Http\Controllers\Api\V1\Admin\ProductController::class)
         ->except(['create', 'edit']);
    Route::post  ('products/{product}/restore', [\App\Http\Controllers\Api\V1\Admin\ProductController::class, 'restore']);
    Route::delete('products/{product}/force',  [\App\Http\Controllers\Api\V1\Admin\ProductController::class, 'forceDestroy']);

    Route::post('products/{product}/images',         [\App\Http\Controllers\Api\V1\Admin\ProductController::class, 'appendImages']);
    Route::delete('products/{product}/images/{image}', [\App\Http\Controllers\Api\V1\Admin\ProductController::class, 'deleteImage']);
    Route::post('products/{product}/images/reorder',  [\App\Http\Controllers\Api\V1\Admin\ProductController::class, 'reorderImages']);

    Route::get   ('orders',                [\App\Http\Controllers\Api\V1\Admin\OrderController::class, 'index']);
    Route::get   ('orders/{order_number}', [\App\Http\Controllers\Api\V1\Admin\OrderController::class, 'show']);
    Route::patch ('orders/{order_number}', [\App\Http\Controllers\Api\V1\Admin\OrderController::class, 'update']);
    Route::delete('orders/{order_number}', [\App\Http\Controllers\Api\V1\Admin\OrderController::class, 'destroy']);
});
