<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for validating a promotion code
 *
 * @package App\Http\Requests
 */
class ValidatePromotionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'code' => 'required|string|exists:promotions,code',
            'service_ids' => 'nullable|array',
            'service_ids.*' => 'exists:services,id',
            'amount' => 'nullable|numeric|min:0',
        ];
    }

    /**
     * Get custom error messages
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'code.required' => 'Promotion code is required',
            'code.exists' => 'Invalid promotion code',
            'service_ids.array' => 'Service IDs must be an array',
            'service_ids.*.exists' => 'One or more services do not exist',
            'amount.numeric' => 'Amount must be a number',
            'amount.min' => 'Amount cannot be negative',
        ];
    }
}
