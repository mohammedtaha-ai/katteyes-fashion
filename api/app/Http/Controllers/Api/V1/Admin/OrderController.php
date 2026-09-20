<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $q = Order::query()->with('items')->orderByDesc('id');
        if ($s = $request->query('status')) $q->where('status', $s);
        if ($from = $request->query('from')) $q->whereDate('created_at', '>=', $from);
        if ($to = $request->query('to')) $q->whereDate('created_at', '<=', $to);
        return OrderResource::collection($q->paginate(20));
    }

    public function show(string $order_number)
    {
        $o = Order::where('order_number', $order_number)->with('items')->firstOrFail();
        return ['data' => new OrderResource($o)];
    }

    public function update(Request $request, string $order_number)
    {
        $data = $request->validate(['status' => 'required|in:new,confirmed,shipped,delivered,cancelled']);
        $o = Order::where('order_number', $order_number)->firstOrFail();
        $o->update($data);
        return ['data' => new OrderResource($o)];
    }

    public function destroy(string $order_number): JsonResponse
    {
        Order::where('order_number', $order_number)->firstOrFail()->delete();
        return response()->json(null, 204);
    }
}
