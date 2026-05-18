<?php

use Illuminate\Database\Migrations\Migration;

/** Legacy migration — status column is now a string in create_bookings_table */
return new class extends Migration
{
    public function up(): void
    {
        // No-op: fresh installs use string status from the start
    }

    public function down(): void
    {
        //
    }
};
