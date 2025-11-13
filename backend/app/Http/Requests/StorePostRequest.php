<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for storing a new post
 *
 * @package App\Http\Requests
 */
class StorePostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Only stylists can create posts
        return $this->user() && $this->user()->role === 'stylist';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'caption' => 'required|string|max:1000',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'is_portfolio' => 'nullable|boolean',
            'is_visible' => 'nullable|boolean',
            'published_at' => 'nullable|date',
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
            'caption.required' => 'A caption is required for the post',
            'caption.max' => 'Caption cannot exceed 1000 characters',
            'image.required' => 'At least one image is required',
            'image.image' => 'The file must be an image',
            'image.mimes' => 'Only jpeg, png, jpg, and gif images are allowed',
            'image.max' => 'Image size cannot exceed 5MB',
            'images.max' => 'You can upload a maximum of 5 images',
        ];
    }
}
