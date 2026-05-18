<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Columns now included in create_bookings_table — skip for fresh installs
        if (! Schema::hasTable('bookings')) {
            return;
        }

        Schema::table('bookings', function (Blueprint $table) {
            if (! Schema::hasColumn('bookings', 'booking_number')) {
                $table->string('booking_number', 20)->nullable()->unique()->after('id');
            }
            if (! Schema::hasColumn('bookings', 'is_done')) {
                $table->boolean('is_done')->default(false)->after('status');
            }
            if (! Schema::hasColumn('bookings', 'delivery_rider')) {
                $table->string('delivery_rider')->nullable()->after('is_done');
            }
            if (! Schema::hasColumn('bookings', 'latitude')) {
                $table->decimal('latitude', 10, 7)->nullable();
                $table->decimal('longitude', 10, 7)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'payment_method')) {
                $table->string('payment_method')->default('cash')->after('total_price');
            }
        });
    }

    public function down(): void
    {
        //
    }
};
