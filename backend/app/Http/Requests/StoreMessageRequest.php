<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Message;

/**
 * Form request for sending a new message
 *
 * @package App\Http\Requests
 */
class StoreMessageRequest extends FormRequest
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
            'conversation_id' => 'required|exists:conversations,id',
            'message' => 'required_without:attachment|string|max:5000',
            'attachment' => 'nullable|file|max:10240', // 10MB max
            'attachment_type' => 'nullable|in:' . implode(',', [
                Message::ATTACHMENT_TYPE_IMAGE,
                Message::ATTACHMENT_TYPE_VIDEO,
                Message::ATTACHMENT_TYPE_AUDIO,
                Message::ATTACHMENT_TYPE_DOCUMENT,
                Message::ATTACHMENT_TYPE_LOCATION,
            ]),
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
            'conversation_id.required' => 'Conversation ID is required',
            'conversation_id.exists' => 'The specified conversation does not exist',
            'message.required_without' => 'Either a message or attachment is required',
            'message.max' => 'Message cannot exceed 5000 characters',
            'attachment.max' => 'Attachment size cannot exceed 10MB',
            'attachment_type.in' => 'Invalid attachment type',
        ];
    }
}
