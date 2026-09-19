<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProductUpsertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('product');
        $required = $id ? 'sometimes|required' : 'required';
        return [
            'name' => $required . '|string|max:150',
            'slug' => $required . "|string|max:180|unique:products,slug," . ($id ?? 'NULL') . ",id",
            'description' => 'sometimes|nullable|string',
            'price' => $required . '|numeric|min:0',
            'currency' => $required . '|string|size:3',
            'category_id' => $required . '|exists:categories,id',
            'is_active' => 'sometimes|boolean',
        ];
    }
}