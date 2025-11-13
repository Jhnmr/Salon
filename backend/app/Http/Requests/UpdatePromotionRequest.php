<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Promotion;

/**
 * Form request for updating a promotion
 *
 * @package App\Http\Requests
 */
class UpdatePromotionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Only admins can update promotions
        return $this->user() && in_array($this->user()->role, ['admin', 'super_admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $promotionId = $this->route('promotion');

        return [
            'branch_id' => 'nullable|exists:branches,id',
            'code' => 'nullable|string|max:20|unique:promotions,code,' . $promotionId,
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'discount_type' => 'nullable|in:' . implode(',', [
                Promotion::DISCOUNT_TYPE_PERCENTAGE,
                Promotion::DISCOUNT_TYPE_FIXED,
                Promotion::DISCOUNT_TYPE_FREE_SERVICE,
            ]),
            'discount_value' => 'nullable|numeric|min:0',
            'min_purchase_amount' => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'user_usage_limit' => 'nullable|integer|min:1',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after:valid_from',
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
            'discount_type.in' => 'Invalid discount type',
            'discount_value.min' => 'Discount value cannot be negative',
            'valid_until.after' => 'End date must be after start date',
        ];
    }

    /**
     * Prepare data for validation
     */
    protected function prepareForValidation(): void
    {
        // Uppercase the code if provided
        if ($this->has('code') && !empty($this->code)) {
            $this->merge([
                'code' => strtoupper($this->code),
            ]);
        }
    }
}
