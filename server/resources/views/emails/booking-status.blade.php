<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>{{ $title }}</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0c2d6b;">{{ $title }}</h2>
        <p>{{ $message }}</p>
        <hr>
        <p><strong>Booking #:</strong> {{ $booking->booking_number }}</p>
        <p><strong>Tracking Code:</strong> {{ $booking->tracking_code }}</p>
        <p><strong>Status:</strong> {{ ucfirst(str_replace('_', ' ', $booking->status)) }}</p>
        <p style="color: #666; font-size: 12px;">MD & V Laundry Shop</p>
    </div>
</body>
</html>
