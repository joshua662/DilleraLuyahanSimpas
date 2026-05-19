<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'address' => ['sometimes', 'string'],
            'pickup_date' => ['sometimes', 'date', 'after_or_equal:today'],
            'pickup_time' => ['sometimes', 'string', 'max:10'],
            'weight' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
            'payment_method' => ['nullable', 'string', 'in:cash,gcash'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
        ];
    }
}
