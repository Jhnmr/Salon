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
        // Create citas table directly
        Schema::create('citas', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('cliente_id')->nullable()->constrained('clients')->onDelete('cascade');
            $table->foreignId('estilista_id')->nullable()->constrained('stylists')->onDelete('cascade');
            $table->foreignId('servicio_id')->nullable()->constrained('services')->onDelete('set null');
            $table->foreignId('sucursal_id')->nullable()->constrained('branches')->onDelete('cascade');

            // Unique appointment code
            $table->string('codigo_cita', 50)->unique()->nullable()->comment('SLN-YYYYMMDD-XXXX');

            // Date and time fields
            $table->date('fecha')->nullable();
            $table->time('hora_inicio')->nullable();
            $table->time('hora_fin')->nullable();
            $table->unsignedInteger('duracion_minutos')->nullable();
            $table->unsignedInteger('duracion_total')->nullable()->comment('Including prep + cleanup');

            // Status
            $table->enum('status', ['pendiente', 'confirmada', 'en_progreso', 'completada', 'cancelada', 'no_asistio'])->default('pendiente');
            $table->boolean('recordatorio_enviado')->default(false);
            $table->timestamp('confirmada_en')->nullable();
            $table->timestamp('completada_en')->nullable();
            $table->unsignedBigInteger('cancelada_por')->nullable()->comment('User ID who cancelled');

            // Pricing
            $table->decimal('precio_servicio', 10, 2)->nullable();
            $table->decimal('precio_descuento', 10, 2)->default(0);
            $table->decimal('monto_descuento', 10, 2)->default(0);
            $table->decimal('propina', 10, 2)->default(0);

            // Notes and special requirements
            $table->text('notas_cliente')->nullable();
            $table->text('notas_internas')->nullable();
            $table->text('alergias_especiales')->nullable();

            // Confirmation settings
            $table->boolean('requiere_confirmacion')->default(true);
            $table->unsignedBigInteger('confirmada_por')->nullable()->comment('User ID who confirmed');

            // Cancellation policy
            $table->timestamp('cancelable_hasta')->nullable();
            $table->decimal('penalizacion_cancelacion', 10, 2)->default(0);

            // Reminder tracking
            $table->boolean('recordatorio_24h_enviado')->default(false);
            $table->boolean('recordatorio_1h_enviado')->default(false);

            // Metadata
            $table->string('origen', 50)->nullable()->comment('web, mobile, admin');
            $table->string('dispositivo', 100)->nullable();
            $table->string('navegador', 100)->nullable();
            $table->ipAddress('ip_creacion')->nullable();

            $table->timestamps();

            // Índices
            $table->index(['fecha', 'hora_inicio']);
            $table->index(['status', 'fecha']);
            $table->index(['recordatorio_enviado']);
            $table->index(['cliente_id']);
            $table->index(['estilista_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('citas');
    }
};
