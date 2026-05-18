<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('booking_number', 20)->nullable()->unique();
            $table->string('full_name');
            $table->string('phone', 20);
            $table->string('email')->nullable();
            $table->text('address');
            $table->date('pickup_date');
            $table->string('pickup_time', 10);
            $table->decimal('weight', 8, 2)->default(8);
            $table->text('notes')->nullable();
            $table->string('status')->default('pending');
            $table->boolean('is_done')->default(false);
            $table->string('delivery_rider')->nullable();
            $table->string('tracking_code', 12)->unique();
            $table->decimal('total_price', 10, 2)->default(99);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('payment_method')->default('cash');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
