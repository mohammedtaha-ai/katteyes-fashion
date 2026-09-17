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

// auth-protected
Route::middleware('auth:sanctum')->group(function () {
    Route::get ('auth/me',         [AuthController::class, 'me']);
    Route::post('auth/logout',     [AuthController::class, 'logout']);
    Route::post('auth/logout-all', [AuthController::class, 'logoutAll']);
});
