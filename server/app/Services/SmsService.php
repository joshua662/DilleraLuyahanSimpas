<?php

namespace App\Services;

use App\Models\SmsLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    public function send(string $phone, string $message, ?int $bookingId = null): SmsLog
    {
        $normalized = $this->normalizePhone($phone);

        $log = SmsLog::create([
            'booking_id' => $bookingId,
            'phone_number' => $normalized,
            'message' => $message,
            'status' => 'pending',
            'provider' => config('services.sms.provider', 'log'),
        ]);

        if (! config('services.sms.enabled')) {
            Log::info('SMS (dev mode)', [
                'phone' => $normalized,
                'message' => $message,
                'booking_id' => $bookingId,
            ]);
            $log->update(['status' => 'sent', 'provider_response' => 'Logged in development mode']);

            return $log->fresh();
        }

        try {
            $response = $this->dispatch($normalized, $message);
            $log->update([
                'status' => $response['success'] ? 'sent' : 'failed',
                'provider_response' => $response['body'] ?? null,
            ]);
        } catch (\Throwable $e) {
            Log::error('SMS send failed: '.$e->getMessage());
            $log->update([
                'status' => 'failed',
                'provider_response' => $e->getMessage(),
            ]);
        }

        return $log->fresh();
    }

    protected function dispatch(string $phone, string $message): array
    {
        $provider = config('services.sms.provider', 'semaphore');

        if ($provider === 'semaphore') {
            return $this->sendViaSemaphore($phone, $message);
        }

        return $this->sendViaGenericWebhook($phone, $message);
    }

    protected function sendViaSemaphore(string $phone, string $message): array
    {
        $apiKey = config('services.sms.api_key');
        $sender = config('services.sms.sender_name', 'MDVLaundry');

        $response = Http::asForm()->post('https://api.semaphore.co/api/v4/messages', [
            'apikey' => $apiKey,
            'number' => $phone,
            'message' => $message,
            'sendername' => $sender,
        ]);

        return [
            'success' => $response->successful(),
            'body' => $response->body(),
        ];
    }

    protected function sendViaGenericWebhook(string $phone, string $message): array
    {
        $url = config('services.sms.webhook_url');
        if (! $url) {
            throw new \RuntimeException('SMS webhook URL not configured');
        }

        $response = Http::post($url, [
            'phone' => $phone,
            'message' => $message,
        ]);

        return [
            'success' => $response->successful(),
            'body' => $response->body(),
        ];
    }

    protected function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);
        if (str_starts_with($digits, '0')) {
            $digits = '63'.substr($digits, 1);
        }
        if (! str_starts_with($digits, '63') && strlen($digits) === 10) {
            $digits = '63'.$digits;
        }

        return $digits;
    }
}
