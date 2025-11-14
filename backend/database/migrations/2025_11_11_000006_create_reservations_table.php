<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();

            // Foreign keys - Apuntan a users table porque client/stylist son roles
            $table->unsignedBigInteger('client_id')->nullable();
            $table->unsignedBigInteger('stylist_id')->nullable();
            $table->foreignId('service_id')->nullable()->constrained('services')->onDelete('set null');
            $table->foreignId('branch_id')->nullable()->constrained('branches')->onDelete('cascade');

            // Foreign key constraints para client y stylist
            $table->foreign('client_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('stylist_id')->references('id')->on('users')->onDelete('cascade');

            // Unique appointment code
            $table->string('appointment_code', 50)->unique()->nullable()->comment('SLN-YYYYMMDD-XXXX');

            // Date and time fields (compatible con Reservation model)
            $table->dateTime('scheduled_at')->nullable();
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->unsignedInteger('total_duration')->nullable()->comment('Including prep + cleanup');

            // Status - En inglés para consistencia con código
            $table->enum('status', ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])->default('pending');
            $table->boolean('reminder_sent')->default(false);
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->unsignedBigInteger('cancelled_by')->nullable()->comment('User ID who cancelled');

            // Pricing
            $table->decimal('service_price', 10, 2)->nullable();
            $table->decimal('discount_price', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('tip', 10, 2)->default(0);
            $table->decimal('total_price', 10, 2)->nullable();

            // Notes and special requirements
            $table->text('notes')->nullable();
            $table->text('internal_notes')->nullable();
            $table->text('special_allergies')->nullable();

            // Confirmation settings
            $table->boolean('requires_confirmation')->default(true);
            $table->unsignedBigInteger('confirmed_by')->nullable()->comment('User ID who confirmed');

            // Cancellation policy
            $table->timestamp('cancellable_until')->nullable();
            $table->decimal('cancellation_penalty', 10, 2)->default(0);

            // Reminder tracking
            $table->boolean('reminder_24h_sent')->default(false);
            $table->boolean('reminder_1h_sent')->default(false);

            // Metadata
            $table->string('origin', 50)->nullable()->comment('web, mobile, admin');
            $table->string('device', 100)->nullable();
            $table->string('browser', 100)->nullable();
            $table->ipAddress('creation_ip')->nullable();

            $table->timestamps();

            // Índices para rendimiento
            $table->index(['scheduled_at']);
            $table->index(['status', 'scheduled_at']);
            $table->index(['reminder_sent']);
            $table->index(['client_id']);
            $table->index(['stylist_id']);
            $table->index(['service_id']);
            $table->index(['branch_id']);

            // Índice compuesto para búsquedas de disponibilidad
            $table->index(['stylist_id', 'scheduled_at', 'status'], 'idx_stylist_schedule');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
