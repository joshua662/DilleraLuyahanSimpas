<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Service;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class LaundrySeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@mdvlaundry.com',
            'phone' => '09691503988',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Juan Dela Cruz',
            'email' => 'customer@example.com',
            'phone' => '09171234567',
            'password' => Hash::make('password123'),
            'role' => 'customer',
        ]);

        User::updateOrCreate(
            ['email' => 'obaleslorenz@gmail.com'],
            [
                'name' => 'Lorenz Obales',
                'phone' => null,
                'password' => Hash::make('Lorenz'),
                'role' => 'customer',
            ]
        );

        $services = [
            ['name' => 'Wash', 'description' => 'Professional washing with premium detergent', 'price' => 0, 'icon' => 'droplets'],
            ['name' => 'Dry', 'description' => 'Gentle tumble dry for all fabric types', 'price' => 0, 'icon' => 'wind'],
            ['name' => 'Fold', 'description' => 'Neatly folded and ready to wear', 'price' => 0, 'icon' => 'shirt'],
            ['name' => 'Pickup', 'description' => 'Free pickup from your doorstep', 'price' => 0, 'icon' => 'truck'],
            ['name' => 'Delivery', 'description' => 'Fast delivery back to your home', 'price' => 50, 'icon' => 'package'],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }

        Testimonial::create([
            'customer_name' => 'Maria Santos',
            'message' => 'Best laundry service in town! My clothes always come back fresh and perfectly folded.',
            'rating' => 5,
        ]);

        Testimonial::create([
            'customer_name' => 'Pedro Reyes',
            'message' => 'Very convenient pickup and delivery. Highly recommended!',
            'rating' => 5,
        ]);

        $customer = User::where('email', 'customer@example.com')->first();

        $booking = Booking::create([
            'user_id' => $customer->id,
            'full_name' => 'Juan Dela Cruz',
            'phone' => '09171234567',
            'address' => '123 Main St, Luyahan, Simpas',
            'pickup_date' => now()->addDay(),
            'pickup_time' => '10:00',
            'weight' => 8,
            'notes' => 'Handle with care',
            'status' => 'washing',
            'tracking_code' => Booking::generateTrackingCode(),
            'total_price' => 99,
        ]);

        Payment::create([
            'booking_id' => $booking->id,
            'amount' => 99,
            'payment_method' => 'cash',
            'payment_status' => 'pending',
        ]);
    }
}
