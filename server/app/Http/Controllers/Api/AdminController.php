<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AdminAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function __construct(
        protected AdminAnalyticsService $analyticsService
    ) {}

    public function dashboard(): JsonResponse
    {
        return response()->json([
            'stats' => $this->analyticsService->dashboard(),
            'revenue_chart' => $this->analyticsService->revenueChart(),
            'status_breakdown' => $this->analyticsService->statusBreakdown(),
            'recent_orders' => $this->analyticsService->recentOrders(),
        ]);
    }

    public function customers(Request $request): JsonResponse
    {
        $query = User::where('role', 'customer')->withCount('bookings');

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function storeCustomer(StoreCustomerRequest $request): JsonResponse
    {
        $data = $request->validated();
        $password = $data['password'] ?? Str::password(12);

        $customer = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => $password,
            'role' => 'customer',
        ]);

        return response()->json([
            'message' => 'Customer created successfully.',
            'customer' => new UserResource($customer),
        ], 201);
    }

    public function updateCustomer(UpdateCustomerRequest $request, int $customer): JsonResponse
    {
        $user = User::where('role', 'customer')->findOrFail($customer);
        $data = $request->validated();

        if (isset($data['password']) && $data['password'] !== '') {
            $user->password = $data['password'];
        }
        unset($data['password']);

        $user->fill($data);
        $user->save();

        return response()->json([
            'message' => 'Customer updated successfully.',
            'customer' => new UserResource($user->fresh()),
        ]);
    }

    public function destroyCustomer(int $customer): JsonResponse
    {
        $user = User::where('role', 'customer')->findOrFail($customer);
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Customer deleted successfully.']);
    }

    public function reports(): JsonResponse
    {
        return response()->json([
            'stats' => $this->analyticsService->dashboard(),
            'revenue_chart' => $this->analyticsService->revenueChart(),
            'status_breakdown' => $this->analyticsService->statusBreakdown(),
        ]);
    }
}
