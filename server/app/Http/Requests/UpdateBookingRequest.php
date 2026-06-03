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
        $pickupDateRules = ['sometimes', 'date'];
        if (! $this->user()?->isAdmin()) {
            $pickupDateRules[] = 'after_or_equal:today';
        }

        return [
            'full_name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'address' => ['sometimes', 'string'],
            'pickup_date' => $pickupDateRules,
            'pickup_time' => ['sometimes', 'string', 'max:10'],
            'weight' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
            'customer_type' => ['sometimes', 'string', 'in:walk_in,pick_up'],
            'payment_method' => ['nullable', 'string', 'in:cash'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
        ];
    }
}
