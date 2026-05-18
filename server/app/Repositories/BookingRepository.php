<?php

namespace App\Repositories;

use App\Models\Booking;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class BookingRepository
{
    public function all(array $filters = []): LengthAwarePaginator
    {
        $query = Booking::with(['user', 'payment'])->latest();

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('tracking_code', 'like', "%{$search}%")
                    ->orWhere('booking_number', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_done']) && $filters['is_done'] !== null) {
            $query->where('is_done', $filters['is_done']);
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function find(int $id): ?Booking
    {
        return Booking::with(['user', 'payment'])->find($id);
    }

    public function findByTrackingCode(string $code): ?Booking
    {
        return Booking::with(['payment'])->where('tracking_code', strtoupper($code))->first();
    }

    public function forUser(int $userId): Collection
    {
        return Booking::with(['payment'])
            ->where('user_id', $userId)
            ->latest()
            ->get();
    }

    public function trashedForUser(int $userId): Collection
    {
        return Booking::onlyTrashed()
            ->with(['payment'])
            ->where('user_id', $userId)
            ->latest('deleted_at')
            ->get();
    }

    public function create(array $data): Booking
    {
        return Booking::create($data);
    }

    public function update(Booking $booking, array $data): Booking
    {
        $booking->update($data);

        return $booking->fresh(['user', 'payment']);
    }

    public function countByStatus(string $status): int
    {
        return Booking::where('status', $status)->count();
    }

    public function totalRevenue(): float
    {
        return (float) Booking::where('status', 'delivered')->sum('total_price');
    }

    public function todayRevenue(): float
    {
        return (float) Booking::where('status', 'delivered')
            ->whereDate('updated_at', today())
            ->sum('total_price');
    }
}
