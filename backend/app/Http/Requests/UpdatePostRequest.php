<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for updating an existing post
 *
 * @package App\Http\Requests
 */
class UpdatePostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        $post = $this->route('post');

        // User must be the post owner or an admin
        return $this->user() && (
            $post->stylist->user_id === $this->user()->id ||
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
            'caption' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'is_portfolio' => 'nullable|boolean',
            'is_visible' => 'nullable|boolean',
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
            'caption.max' => 'Caption cannot exceed 1000 characters',
            'image.image' => 'The file must be an image',
            'image.mimes' => 'Only jpeg, png, jpg, and gif images are allowed',
            'image.max' => 'Image size cannot exceed 5MB',
        ];
    }
}
