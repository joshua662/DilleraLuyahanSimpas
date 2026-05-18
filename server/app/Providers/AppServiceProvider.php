<?php

namespace App\Providers;

use App\Events\BookingCreated;
use App\Events\BookingStatusChanged;
use App\Listeners\SendBookingStatusNotification;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Event::listen(BookingCreated::class, [SendBookingStatusNotification::class, 'handleBookingCreated']);
        Event::listen(BookingStatusChanged::class, [SendBookingStatusNotification::class, 'handleStatusChanged']);
    }
}
