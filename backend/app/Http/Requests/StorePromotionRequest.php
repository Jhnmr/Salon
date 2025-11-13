<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Promotion;

/**
 * Form request for creating a new promotion
 *
 * @package App\Http\Requests
 */
class StorePromotionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Only admins can create promotions
        return $this->user() && in_array($this->user()->role, ['admin', 'super_admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'branch_id' => 'nullable|exists:branches,id',
            'code' => 'nullable|string|unique:promotions,code|max:20',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'discount_type' => 'required|in:' . implode(',', [
                Promotion::DISCOUNT_TYPE_PERCENTAGE,
                Promotion::DISCOUNT_TYPE_FIXED,
                Promotion::DISCOUNT_TYPE_FREE_SERVICE,
            ]),
            'discount_value' => 'required|numeric|min:0',
            'min_purchase_amount' => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'user_usage_limit' => 'nullable|integer|min:1',
            'valid_from' => 'required|date',
            'valid_until' => 'required|date|after:valid_from',
            'applicable_services' => 'nullable|array',
            'applicable_services.*' => 'exists:services,id',
            'applicable_days' => 'nullable|array',
            'applicable_days.*' => 'integer|min:0|max:6',
            'is_active' => 'nullable|boolean',
            'is_first_booking_only' => 'nullable|boolean',
            'is_public' => 'nullable|boolean',
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
            'code.unique' => 'This promotion code already exists',
            'title.required' => 'Promotion title is required',
            'discount_type.required' => 'Discount type is required',
            'discount_type.in' => 'Invalid discount type',
            'discount_value.required' => 'Discount value is required',
            'discount_value.min' => 'Discount value cannot be negative',
            'valid_from.required' => 'Start date is required',
            'valid_until.required' => 'End date is required',
            'valid_until.after' => 'End date must be after start date',
        ];
    }

    /**
     * Prepare data for validation
     */
    protected function prepareForValidation(): void
    {
        // Generate code if not provided
        if (!$this->has('code') || empty($this->code)) {
            $this->merge([
                'code' => Promotion::generateUniqueCode(),
            ]);
        } else {
            // Uppercase the code
            $this->merge([
                'code' => strtoupper($this->code),
            ]);
        }
    }
}
