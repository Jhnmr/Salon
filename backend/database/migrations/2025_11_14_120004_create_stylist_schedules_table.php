<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stylist_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stylist_id')->constrained('stylists')->onDelete('cascade');

            $table->tinyInteger('day_of_week')->comment('0=Sunday, 1=Monday, ..., 6=Saturday');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->boolean('is_available')->default(true);
            $table->time('break_start')->nullable();
            $table->time('break_end')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('stylist_id');
            $table->index('day_of_week');
            $table->index('is_available');
            $table->unique(['stylist_id', 'day_of_week']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stylist_schedules');
    }
};
