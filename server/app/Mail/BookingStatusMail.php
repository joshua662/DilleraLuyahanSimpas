<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public string $notificationTitle,
        public string $notificationMessage
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->notificationTitle.' - MD & V Laundry',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: view('emails.booking-status', [
                'booking' => $this->booking,
                'title' => $this->notificationTitle,
                'message' => $this->notificationMessage,
            ])->render(),
        );
    }
}
