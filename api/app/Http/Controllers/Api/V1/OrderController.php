<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\CreateOrderAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function store(StoreOrderRequest $request, CreateOrderAction $action)
    {
        $order = $action->execute($request->validated(), $request);
        return response()->json(['data' => new OrderResource($order)], 201);
    }

    public function show(Request $request, string $order_number)
    {
        $order = Order::where('order_number', $order_number)->first();
        if (! $order) abort(404);

        $user = $request->user();
        if ($user) {
            abort_unless($order->user_id === $user->id, 404);
        } else {
            $email = (string) $request->query('email', '');
            abort_unless($email !== '' && $email === $order->customer_email, 404);
        }

        return ['data' => new OrderResource($order->load('items'))];
    }
}
