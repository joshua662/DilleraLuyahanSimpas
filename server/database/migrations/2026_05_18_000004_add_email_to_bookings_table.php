<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('bookings') && ! Schema::hasColumn('bookings', 'email')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->string('email')->nullable()->after('phone');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('bookings', 'email')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropColumn('email');
            });
        }
    }
};
