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
            'daily_payments_total' => $this->dailyPaymentsTotal(),
            'daily_payments_count' => $this->dailyPaymentsCount(),
            'total_revenue' => $this->bookingRepository->totalRevenue(),
            'monthly_payment_total' => $this->monthlyPaymentTotal(),
            'pending_orders' => Booking::whereNotIn('status', ['delivered', 'cancelled', 'done'])->count(),
            'delivered_orders' => Booking::whereIn('status', ['delivered', 'done'])->count(),
            'total_customers' => User::where('role', 'customer')->count(),
        ];
    }

    public function dailyPaymentsTotal(): float
    {
        return (float) Payment::whereDate('created_at', today())->sum('amount');
    }

    public function dailyPaymentsCount(): int
    {
        return Payment::whereDate('created_at', today())->count();
    }

    public function monthlyPaymentTotal(): float
    {
        return (float) Payment::where('payment_status', 'paid')
            ->whereBetween('updated_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('amount');
    }

    public function revenueChart(): array
    {
        $start = now()->subMonths(11)->startOfMonth();
        $end = now()->endOfMonth();

        $rows = Payment::where('payment_status', 'paid')
            ->whereBetween('updated_at', [$start, $end])
            ->select(
                DB::raw("DATE_FORMAT(updated_at, '%Y-%m') as month"),
                DB::raw('SUM(amount) as revenue')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $chart = [];
        for ($date = $start->copy(); $date->lte(now()->startOfMonth()); $date->addMonth()) {
            $key = $date->format('Y-m');
            $chart[] = [
                'date' => $date->format('M Y'),
                'revenue' => (float) ($rows->get($key)?->revenue ?? 0),
            ];
        }

        return $chart;
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
