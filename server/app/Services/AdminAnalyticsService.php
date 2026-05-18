<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use App\Repositories\BookingRepository;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsService
{
    public function __construct(
        protected BookingRepository $bookingRepository
    ) {}

    public function dashboard(): array
    {
        return [
            'total_orders' => Booking::count(),
            'daily_revenue' => $this->bookingRepository->todayRevenue(),
            'total_revenue' => $this->bookingRepository->totalRevenue(),
            'pending_orders' => Booking::whereNotIn('status', ['delivered', 'cancelled'])->count(),
            'delivered_orders' => $this->bookingRepository->countByStatus('delivered'),
            'total_customers' => User::where('role', 'customer')->count(),
        ];
    }

    public function revenueChart(): array
    {
        $data = Booking::where('status', 'delivered')
            ->select(DB::raw('DATE(updated_at) as date'), DB::raw('SUM(total_price) as revenue'))
            ->where('updated_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $data->map(fn ($row) => [
            'date' => $row->date,
            'revenue' => (float) $row->revenue,
        ])->toArray();
    }

    public function statusBreakdown(): array
    {
        return Booking::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();
    }

    public function recentOrders(int $limit = 5): array
    {
        return Booking::with('payment')
            ->latest()
            ->limit($limit)
            ->get()
            ->toArray();
    }
}
