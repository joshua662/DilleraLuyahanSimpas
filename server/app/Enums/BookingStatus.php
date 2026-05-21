<?php

namespace App\Enums;

enum BookingStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case PickupScheduled = 'pickup_scheduled';
    case PickedUp = 'picked_up';
    case Washing = 'washing';
    case Drying = 'drying';
    case Folding = 'folding';
    case OutForDelivery = 'out_for_delivery';
    case Delivered = 'delivered';
    case Done = 'done';
    case Cancelled = 'cancelled';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function finished(): array
    {
        return [self::Done->value, self::Delivered->value];
    }

    public static function cancellable(): array
    {
        return array_values(array_filter(
            self::values(),
            fn (string $v) => ! in_array($v, [...self::finished(), self::Cancelled->value], true)
        ));
    }

    public static function editable(): array
    {
        return self::cancellable();
    }

    public static function trackerFlow(): array
    {
        return [
            self::Pending,
            self::Confirmed,
            self::PickupScheduled,
            self::PickedUp,
            self::Washing,
            self::Drying,
            self::Folding,
            self::OutForDelivery,
            self::Done,
        ];
    }

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Confirmed => 'Confirmed',
            self::PickupScheduled => 'Pickup Scheduled',
            self::PickedUp => 'Picked Up',
            self::Washing => 'Washing',
            self::Drying => 'Drying',
            self::Folding => 'Folding',
            self::OutForDelivery => 'Out for Delivery',
            self::Delivered => 'Delivered',
            self::Done => 'Finished',
            self::Cancelled => 'Cancelled',
        };
    }

    public function smsMessage(): string
    {
        return match ($this) {
            self::Pending => 'Your laundry booking has been received and is pending confirmation.',
            self::Confirmed => 'Your laundry booking is confirmed. We will send your pickup schedule soon.',
            self::PickupScheduled => 'Pickup has been scheduled for your laundry order.',
            self::PickedUp => 'Your laundry has been picked up and is on the way to our shop.',
            self::Washing => 'Your laundry is now washing.',
            self::Drying => 'Your laundry is now drying.',
            self::Folding => 'Your laundry is now folding.',
            self::OutForDelivery => 'Your laundry is out for delivery.',
            self::Delivered => 'Your laundry has been delivered. Thank you!',
            self::Done => 'Your laundry order is finished.',
            self::Cancelled => 'Your booking has been cancelled.',
        };
    }

    public function notificationMessage(): string
    {
        return $this->smsMessage();
    }
}
