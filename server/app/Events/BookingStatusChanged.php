<?php

namespace App\Events;

use App\Models\Booking;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookingStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Booking $booking,
        public string $previousStatus,
        public string $message
    ) {}

    public function broadcastOn(): array
    {
        $channels = [
            new Channel('booking.'.$this->booking->id),
            new Channel('booking.track.'.$this->booking->tracking_code),
        ];

        if ($this->booking->user_id) {
            $channels[] = new PrivateChannel('user.'.$this->booking->user_id);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'booking.status.changed';
    }

    public function broadcastWith(): array
    {
        return [
            'booking_id' => $this->booking->id,
            'tracking_code' => $this->booking->tracking_code,
            'booking_number' => $this->booking->booking_number,
            'status' => $this->booking->status,
            'is_done' => $this->booking->is_done,
            'message' => $this->message,
            'previous_status' => $this->previousStatus,
        ];
    }
}
