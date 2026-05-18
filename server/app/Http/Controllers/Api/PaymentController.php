<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with('booking')->latest();

        if ($request->status) {
            $query->where('payment_status', $request->status);
        }

        if ($request->search) {
            $search = $request->search;
            $query->whereHas('booking', function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('tracking_code', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function update(Request $request, Payment $payment): JsonResponse
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:pending,paid,refunded',
            'payment_method' => 'sometimes|string',
        ]);

        $payment->update($validated);

        return response()->json([
            'payment' => new PaymentResource($payment->fresh('booking')),
        ]);
    }
}
