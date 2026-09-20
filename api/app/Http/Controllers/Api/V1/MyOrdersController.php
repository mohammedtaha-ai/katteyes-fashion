<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use Illuminate\Http\Request;

class MyOrdersController extends Controller
{
    public function index(Request $request)
    {
        $orders = $request->user()->orders()->with('items')->orderByDesc('id')->paginate(20);
        return OrderResource::collection($orders);
    }

    public function show(Request $request, string $order_number)
    {
        $o = $request->user()->orders()->where('order_number', $order_number)->with('items')->firstOrFail();
        return ['data' => new OrderResource($o)];
    }
}
