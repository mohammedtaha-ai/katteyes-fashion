<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CategoryUpsertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id') ?? $this->route('category');
        return [
            'name' => 'required|string|max:80',
            'slug' => ($id ? 'sometimes|required' : 'required')
                . '|string|max:100|unique:categories,slug,' . ($id ?? 'NULL') . ',id',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer|min:0',
        ];
    }
}
