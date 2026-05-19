<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'This email is already registered. Please sign in instead.',
            'email.required' => 'Email is required.',
            'email.email' => 'Enter a valid email address.',
            'password.min' => 'Password must be at least 6 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
        ];
    }

    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator): void
    {
        $errors = $validator->errors();
        $response = [
            'message' => $errors->first() ?: 'Validation failed.',
            'errors' => $errors->toArray(),
        ];

        if ($errors->has('email') && str_contains($errors->first('email'), 'already registered')) {
            $response['code'] = 'EMAIL_EXISTS';
        }

        throw new \Illuminate\Http\Exceptions\HttpResponseException(
            response()->json($response, 422)
        );
    }
}
