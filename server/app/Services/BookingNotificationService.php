<?php

namespace App\Services;

use App\Enums\BookingStatus;
use App\Events\NotificationSent;
use App\Mail\BookingStatusMail;
use App\Models\Booking;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class BookingNotificationService
{
    public function __construct(
        protected SmsService $smsService
    ) {}

    public function notifyBookingCreated(Booking $booking): void
    {
        $title = 'Booking Received';
        $message = "Your booking {$booking->booking_number} has been received. We will confirm the pickup schedule soon. Track with code: {$booking->tracking_code}";

        $this->storeForUser($booking->user_id, $booking, $title, $message, 'booking_created');
        $this->notifyAdmins('New Booking', "New booking from {$booking->full_name} ({$booking->booking_number})", $booking);
        $this->sendEmail($booking, $title, $message);

        if ($booking->user_id) {
            event(new NotificationSent($booking->user_id, [
                'title' => $title,
                'message' => $message,
                'booking_id' => $booking->id,
            ]));
        }
    }

    public function notifyStatusChange(Booking $booking, string $previousStatus, ?string $customMessage = null): void
    {
        $status = BookingStatus::tryFrom($booking->status);
        $title = 'Order Update: '.($status?->label() ?? ucfirst(str_replace('_', ' ', $booking->status)));
        $message = $customMessage ?? ($status?->smsMessage() ?? "Your booking status is now: {$booking->status}");

        if ($booking->isFinished()) {
            $title = 'Laundry Finished';
            $message = 'Your laundry is finished and ready for pickup/delivery.';
        }

        $this->storeForUser($booking->user_id, $booking, $title, $message, 'status_update');
        $this->sendEmail($booking, $title, $message);
        $this->sendSms($booking, $message);

        if ($booking->user_id) {
            event(new NotificationSent($booking->user_id, [
                'title' => $title,
                'message' => $message,
                'booking_id' => $booking->id,
            ]));
        }
    }

    public function notifyFinished(Booking $booking): void
    {
        $message = 'Your laundry is finished and ready for pickup/delivery.';
        $this->notifyStatusChange($booking, $booking->status, $message);
    }

    public function notifyCancelled(Booking $booking): void
    {
        $message = 'Your laundry booking has been cancelled. Contact us if you have questions.';
        $this->notifyStatusChange($booking, $booking->status, $message);
    }

    protected function sendSms(Booking $booking, string $message): void
    {
        if (! $booking->phone) {
            return;
        }

        try {
            $this->smsService->send($booking->phone, $message, $booking->id);
        } catch (\Throwable $e) {
            Log::warning('SMS notification failed: '.$e->getMessage());
        }
    }

    protected function storeForUser(?int $userId, Booking $booking, string $title, string $message, string $type): void
    {
        if (! $userId) {
            return;
        }

        $exists = UserNotification::where('user_id', $userId)
            ->where('booking_id', $booking->id)
            ->where('type', $type)
            ->where('title', $title)
            ->exists();

        if ($exists) {
            return;
        }

        UserNotification::create([
            'user_id' => $userId,
            'booking_id' => $booking->id,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'is_read' => false,
        ]);
    }

    protected function notifyAdmins(string $title, string $message, Booking $booking): void
    {
        User::where('role', 'admin')->each(function (User $admin) use ($title, $message, $booking) {
            UserNotification::create([
                'user_id' => $admin->id,
                'booking_id' => $booking->id,
                'title' => $title,
                'message' => $message,
                'type' => 'admin_alert',
                'is_read' => false,
            ]);
        });
    }

    protected function sendEmail(Booking $booking, string $title, string $message): void
    {
        $email = $booking->email ?? $booking->user?->email;
        if (! $email) {
            return;
        }

        try {
            Mail::to($email)->send(new BookingStatusMail($booking, $title, $message));
        } catch (\Throwable $e) {
            Log::warning('Booking email failed: '.$e->getMessage());
        }
    }
}
