<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Carbon\Carbon;

/**
 * Form request for creating a new reservation
 *
 * @package App\Http\Requests
 */
class StoreReservationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Only clients can create reservations (unless admin)
        return $this->user() && (
            $this->user()->role === 'client' ||
            $this->user()->role === 'admin'
        );
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'service_id' => 'required|exists:services,id',
            'stylist_id' => 'required|exists:users,id', // Fixed: users table, not stylists
            'scheduled_at' => 'required|date|after:now',
            'notes' => 'nullable|string|max:500',
            'promotion_code' => 'nullable|string|exists:promotions,code',
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
            'service_id.required' => 'Please select a service',
            'service_id.exists' => 'The selected service does not exist',
            'stylist_id.required' => 'Please select a stylist',
            'stylist_id.exists' => 'The selected stylist does not exist',
            'scheduled_at.required' => 'Please select a date and time',
            'scheduled_at.after' => 'Reservation must be scheduled for a future date and time',
            'notes.max' => 'Notes cannot exceed 500 characters',
            'promotion_code.exists' => 'Invalid promotion code',
        ];
    }

    /**
     * Custom validation
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->has('scheduled_at')) {
                $scheduledAt = Carbon::parse($this->scheduled_at);

                // Check if scheduling at least 1 hour in advance
                if ($scheduledAt->diffInHours(now()) < 1) {
                    $validator->errors()->add(
                        'scheduled_at',
                        'Reservations must be made at least 1 hour in advance'
                    );
                }

                // Check if within business hours (9 AM - 6 PM)
                $hour = $scheduledAt->hour;
                if ($hour < 9 || $hour >= 18) {
                    $validator->errors()->add(
                        'scheduled_at',
                        'Reservations must be between 9:00 AM and 6:00 PM'
                    );
                }
            }
        });
    }
}
