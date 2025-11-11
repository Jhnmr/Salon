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
        // First, rename the table
        Schema::rename('reservations', 'citas');

        // Then add missing fields
        Schema::table('citas', function (Blueprint $table) {
            // Unique appointment code
            $table->string('codigo_cita', 50)->unique()->nullable()->after('id')->comment('SLN-YYYYMMDD-XXXX');

            // Separate date and time fields
            $table->date('fecha')->nullable()->after('codigo_cita');
            $table->time('hora_inicio')->nullable()->after('fecha');
            $table->time('hora_fin')->nullable()->after('hora_inicio');
            $table->unsignedInteger('duracion_minutos')->nullable()->after('hora_fin');
            $table->unsignedInteger('duracion_total')->nullable()->after('duracion_minutos')->comment('Including prep + cleanup');

            // Status and confirmations
            $table->boolean('recordatorio_enviado')->default(false)->after('status');
            $table->timestamp('confirmada_en')->nullable()->after('recordatorio_enviado');
            $table->timestamp('completada_en')->nullable()->after('confirmada_en');
            $table->unsignedInteger('cancelada_por')->nullable()->after('completada_en')->comment('User ID who cancelled');

            // Pricing
            $table->decimal('precio_servicio', 10, 2)->nullable()->after('cancelada_por');
            $table->decimal('precio_descuento', 10, 2)->default(0)->after('precio_servicio');
            $table->decimal('monto_descuento', 10, 2)->default(0)->after('precio_descuento');
            $table->decimal('propina', 10, 2)->default(0)->after('monto_descuento');

            // Notes and special requirements
            $table->text('notas_cliente')->nullable()->after('propina');
            $table->text('notas_internas')->nullable()->after('notas_cliente');
            $table->text('alergias_especiales')->nullable()->after('notas_internas');

            // Confirmation settings
            $table->boolean('requiere_confirmacion')->default(true)->after('alergias_especiales');
            $table->unsignedInteger('confirmada_por')->nullable()->after('requiere_confirmacion')->comment('User ID who confirmed');

            // Cancellation policy
            $table->timestamp('cancelable_hasta')->nullable()->after('confirmada_por');
            $table->decimal('penalizacion_cancelacion', 10, 2)->default(0)->after('cancelable_hasta');

            // Reminder tracking
            $table->boolean('recordatorio_24h_enviado')->default(false)->after('recordatorio_enviado');
            $table->boolean('recordatorio_1h_enviado')->default(false)->after('recordatorio_24h_enviado');

            // Metadata
            $table->string('origen', 50)->nullable()->after('recordatorio_1h_enviado')->comment('web, mobile, admin');
            $table->string('dispositivo', 100)->nullable()->after('origen');
            $table->string('navegador', 100)->nullable()->after('dispositivo');
            $table->ipAddress('ip_creacion')->nullable()->after('navegador');

            // Índices
            $table->index(['fecha', 'hora_inicio']);
            $table->index(['status', 'fecha']);
            $table->index(['recordatorio_enviado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('citas', function (Blueprint $table) {
            $table->dropColumn([
                'codigo_cita', 'fecha', 'hora_inicio', 'hora_fin', 'duracion_minutos', 'duracion_total',
                'recordatorio_enviado', 'confirmada_en', 'completada_en', 'cancelada_por',
                'precio_servicio', 'precio_descuento', 'monto_descuento', 'propina',
                'notas_cliente', 'notas_internas', 'alergias_especiales',
                'requiere_confirmacion', 'confirmada_por', 'cancelable_hasta', 'penalizacion_cancelacion',
                'recordatorio_24h_enviado', 'recordatorio_1h_enviado',
                'origen', 'dispositivo', 'navegador', 'ip_creacion'
            ]);
        });

        // Rename back
        Schema::rename('citas', 'reservations');
    }
};
