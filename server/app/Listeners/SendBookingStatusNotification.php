<?php

namespace App\Listeners;

use App\Events\BookingCreated;
use App\Events\BookingStatusChanged;
use App\Services\BookingNotificationService;

class SendBookingStatusNotification
{
    public function __construct(
        protected BookingNotificationService $notificationService
    ) {}

    public function handleBookingCreated(BookingCreated $event): void
    {
        $this->notificationService->notifyBookingCreated($event->booking);
    }

    public function handleStatusChanged(BookingStatusChanged $event): void
    {
        $this->notificationService->notifyStatusChange(
            $event->booking,
            $event->previousStatus,
            $event->message
        );
    }
}
