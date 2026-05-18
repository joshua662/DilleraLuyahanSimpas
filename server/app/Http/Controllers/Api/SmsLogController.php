<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SmsLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SmsLogController extends Controller
{
    public function myLogs(Request $request): JsonResponse
    {
        $bookingIds = $request->user()->bookings()->pluck('id');

        $logs = SmsLog::query()
            ->whereIn('booking_id', $bookingIds)
            ->with('booking:id,booking_number,tracking_code,status')
            ->latest()
            ->limit(50)
            ->get();

        return response()->json(['sms_logs' => $logs]);
    }
}
