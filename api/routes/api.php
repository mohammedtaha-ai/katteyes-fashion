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

// auth-protected
Route::middleware('auth:sanctum')->group(function () {
    Route::get ('auth/me',         [AuthController::class, 'me']);
    Route::post('auth/logout',     [AuthController::class, 'logout']);
    Route::post('auth/logout-all', [AuthController::class, 'logoutAll']);
});

// admin-only (spec §5.6)
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::apiResource('categories', \App\Http\Controllers\Api\V1\Admin\CategoryController::class)
         ->except(['create', 'edit']);
    Route::post('categories/{id}/restore',  [\App\Http\Controllers\Api\V1\Admin\CategoryController::class, 'restore']);
    Route::delete('categories/{id}/force', [\App\Http\Controllers\Api\V1\Admin\CategoryController::class, 'forceDestroy']);
});
