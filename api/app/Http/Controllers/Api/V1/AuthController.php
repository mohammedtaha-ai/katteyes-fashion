<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\{LoginRequest, RegisterRequest};
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\{JsonResponse, Request};
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);
        $user->role = 'customer';
        $user->save();
        $token = $user->createToken('web')->plainTextToken;

        return response()->json(['data' => ['token' => $token, 'user' => new UserResource($user)]], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->string('email'))->first();
        if (! $user || ! Hash::check($request->string('password'), $user->password)) {
            return response()->json(['message' => 'بيانات الدخول غير صحيحة'], 401);
        }
        $token = $user->createToken('web')->plainTextToken;
        return response()->json(['data' => ['token' => $token, 'user' => new UserResource($user)]]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([], 204);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();
        return response()->json([], 204);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => ['user' => new UserResource($request->user())]]);
    }
}
