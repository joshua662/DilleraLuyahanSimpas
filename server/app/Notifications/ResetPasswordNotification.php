<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    public function __construct(public string $token) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontend = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');
        $email = urlencode($notifiable->getEmailForPasswordReset());
        $url = "{$frontend}/reset-password?token={$this->token}&email={$email}";

        return (new MailMessage)
            ->subject('Reset Your Password — MD & V Laundry')
            ->line('You requested a password reset.')
            ->action('Reset Password', $url)
            ->line('This link expires in 60 minutes.');
    }
}
