<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for creating a new conversation
 *
 * @package App\Http\Requests
 */
class StoreConversationRequest extends FormRequest
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
            'receiver_id' => 'required|exists:users,id|different:' . $this->user()->id,
            'message' => 'nullable|string|max:5000',
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
            'receiver_id.required' => 'Receiver ID is required',
            'receiver_id.exists' => 'The specified user does not exist',
            'receiver_id.different' => 'You cannot start a conversation with yourself',
            'message.max' => 'Message cannot exceed 5000 characters',
        ];
    }
}
