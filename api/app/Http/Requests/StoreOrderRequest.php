<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'items' => 'required|array|min:1|max:50',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.color' => 'required|string|max:50',
            'items.*.size' => 'required|string|max:50',
            'items.*.quantity' => 'required|integer|min:1|max:99',
            'customer_name' => 'required|string|max:100',
            'customer_address' => 'required|string|max:1000',
            'customer_notes' => 'nullable|string|max:1000',
        ];
        if (! $this->user()) {
            $rules['customer_email'] = 'required|email|max:150';
        } else {
            $rules['customer_email'] = 'nullable|email|max:150';
        }
        return $rules;
    }

    public function messages(): array
    {
        return [
            'items.required' => 'لا يمكن إرسال طلب فارغ',
            'items.*.exists' => 'أحد المنتجات غير متوفر',
            'items.*.color.required' => 'خيار اللون/المقاس غير صالح',
            'items.*.size.required' => 'خيار اللون/المقاس غير صالح',
            'customer_email.required' => 'البريد مطلوب للطلبات بدون حساب',
        ];
    }
}