<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for updating a reservation
 *
 * @package App\Http\Requests
 */
class UpdateReservationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        $reservation = $this->route('reservation');

        // Client (owner), stylist, or admin can update
        return $this->user() && (
            $reservation->client_id === $this->user()->id ||
            $reservation->stylist_id === $this->user()->id ||
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
            'stylist_id' => 'nullable|exists:stylists,id',
            'scheduled_at' => 'nullable|date|after:now',
            'status' => 'nullable|in:pending,confirmed,completed,cancelled,no_show',
            'notes' => 'nullable|string|max:500',
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
            'stylist_id.exists' => 'The selected stylist does not exist',
            'scheduled_at.after' => 'Reservation must be scheduled for a future date and time',
            'status.in' => 'Invalid reservation status',
            'notes.max' => 'Notes cannot exceed 500 characters',
        ];
    }
}
