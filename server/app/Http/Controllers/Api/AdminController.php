<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AdminAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    public function reports(): JsonResponse
    {
        return response()->json([
            'stats' => $this->analyticsService->dashboard(),
            'revenue_chart' => $this->analyticsService->revenueChart(),
            'status_breakdown' => $this->analyticsService->statusBreakdown(),
        ]);
    }
}
