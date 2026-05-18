<?php

namespace App\Services;

use App\Enums\BookingStatus;
use App\Events\BookingCreated;
use App\Events\BookingStatusChanged;
use App\Models\Booking;
use App\Models\Payment;
use App\Repositories\BookingRepository;

class BookingService
{
    public function __construct(
        protected BookingRepository $repository,
        protected BookingNotificationService $notificationService
    ) {}

    public function createBooking(array $data, ?int $userId = null): Booking
    {
        $weight = (float) ($data['weight'] ?? 8);
        $totalPrice = Booking::calculatePrice($weight);

        $booking = $this->repository->create([
            'user_id' => $userId,
            'booking_number' => Booking::generateBookingNumber(),
            'full_name' => $data['full_name'],
            'phone' => $data['phone'],
            'email' => $data['email'] ?? null,
            'address' => $data['address'],
            'pickup_date' => $data['pickup_date'],
            'pickup_time' => $data['pickup_time'],
            'weight' => $weight,
            'notes' => $data['notes'] ?? null,
            'status' => BookingStatus::Pending->value,
            'tracking_code' => Booking::generateTrackingCode(),
            'total_price' => $totalPrice,
            'payment_method' => $data['payment_method'] ?? 'cash',
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'is_done' => false,
        ]);

        Payment::create([
            'booking_id' => $booking->id,
            'amount' => $totalPrice,
            'payment_method' => $data['payment_method'] ?? 'cash',
            'payment_status' => 'pending',
        ]);

        $booking = $booking->load('payment', 'user');
        event(new BookingCreated($booking));

        return $booking;
    }

    public function updateBooking(Booking $booking, array $data): Booking
    {
        if (! $booking->canEdit()) {
            throw new \InvalidArgumentException('Booking can no longer be edited.');
        }

        $weight = (float) ($data['weight'] ?? $booking->weight);
        $updates = [
            'full_name' => $data['full_name'] ?? $booking->full_name,
            'phone' => $data['phone'] ?? $booking->phone,
            'address' => $data['address'] ?? $booking->address,
            'pickup_date' => $data['pickup_date'] ?? $booking->pickup_date,
            'pickup_time' => $data['pickup_time'] ?? $booking->pickup_time,
            'weight' => $weight,
            'notes' => $data['notes'] ?? $booking->notes,
            'payment_method' => $data['payment_method'] ?? $booking->payment_method,
            'latitude' => $data['latitude'] ?? $booking->latitude,
            'longitude' => $data['longitude'] ?? $booking->longitude,
            'total_price' => Booking::calculatePrice($weight),
        ];

        return $this->repository->update($booking, $updates);
    }

    public function updateStatus(Booking $booking, string $status, ?string $deliveryRider = null): Booking
    {
        $previous = $booking->status;
        $updates = ['status' => $status];
        if ($deliveryRider !== null) {
            $updates['delivery_rider'] = $deliveryRider;
        }
        if ($status === BookingStatus::Done->value) {
            $updates['is_done'] = true;
        }

        $updated = $this->repository->update($booking, $updates);
        $statusEnum = BookingStatus::tryFrom($status);
        $message = $statusEnum?->notificationMessage() ?? "Status updated to {$status}";

        event(new BookingStatusChanged($updated, $previous, $message));

        return $updated;
    }

    public function markDone(Booking $booking, bool $done = true): Booking
    {
        $previous = $booking->status;
        $updates = ['is_done' => $done];
        if ($done) {
            $updates['status'] = BookingStatus::Done->value;
        }

        $updated = $this->repository->update($booking, $updates);
        $message = $done
            ? 'Your laundry is finished and ready for pickup/delivery.'
            : 'Your order has been marked as not done yet. We will continue processing.';

        if ($done) {
            $this->notificationService->notifyFinished($updated);
        } else {
            event(new BookingStatusChanged($updated, $previous, $message));
        }

        return $updated;
    }

    public function adminCancelBooking(Booking $booking): Booking
    {
        if ($booking->isFinished()) {
            throw new \InvalidArgumentException('Cannot cancel a finished booking.');
        }

        $updated = $this->repository->update($booking, [
            'status' => BookingStatus::Cancelled->value,
            'is_done' => false,
        ]);
        $this->notificationService->notifyCancelled($updated);

        return $updated;
    }

    public function cancelBooking(Booking $booking): Booking
    {
        if (! $booking->canCancel()) {
            throw new \InvalidArgumentException('Booking cannot be cancelled at this stage.');
        }

        return $this->updateStatus($booking, BookingStatus::Cancelled->value);
    }

    public function deleteBooking(Booking $booking): void
    {
        $booking->payment()?->delete();
        $booking->delete();
    }

    public function trashCancelledBooking(Booking $booking, int $userId): Booking
    {
        if ($booking->user_id !== $userId) {
            throw new \InvalidArgumentException('Unauthorized.');
        }

        if (! $booking->canDelete()) {
            throw new \InvalidArgumentException('Only cancelled bookings can be moved to trash.');
        }

        $booking->delete();

        return $booking;
    }

    public function restoreBooking(Booking $booking, int $userId): Booking
    {
        if ($booking->user_id !== $userId) {
            throw new \InvalidArgumentException('Unauthorized.');
        }

        if (! $booking->trashed()) {
            throw new \InvalidArgumentException('Booking is not in trash.');
        }

        $booking->restore();

        return $booking->fresh(['payment', 'user']);
    }

    public function forceDeleteBooking(Booking $booking, int $userId): void
    {
        if ($booking->user_id !== $userId) {
            throw new \InvalidArgumentException('Unauthorized.');
        }

        if (! $booking->trashed()) {
            throw new \InvalidArgumentException('Move booking to trash before permanent delete.');
        }

        $booking->payment()?->delete();
        $booking->forceDelete();
    }
}
