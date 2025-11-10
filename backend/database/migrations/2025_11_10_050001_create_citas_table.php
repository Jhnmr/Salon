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
        Schema::create('citas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_cita', 20)->unique()->comment('Ej: SLN-20250515-A3B9');

            // Relaciones
            $table->foreignId('cliente_id')->constrained('clients')->onDelete('restrict');
            $table->foreignId('estilista_id')->constrained('stylists')->onDelete('restrict');
            $table->foreignId('servicio_id')->constrained('services')->onDelete('restrict');
            $table->foreignId('sucursal_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('promocion_id')->nullable()->constrained('promociones')->onDelete('set null');

            // Fecha y hora
            $table->date('fecha');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->unsignedInteger('duracion_minutos')->comment('Duración base del servicio');
            $table->unsignedInteger('duracion_total')->comment('Duración total incluyendo prep y limpieza');

            // Estado del flujo
            $table->enum('estado', [
                'pendiente',
                'confirmada',
                'recordatorio_enviado',
                'en_progreso',
                'completada',
                'cancelada',
                'no_asistio'
            ])->default('pendiente');

            // Precios
            $table->decimal('precio_servicio', 10, 2);
            $table->decimal('precio_descuento', 10, 2)->default(0);
            $table->decimal('monto_descuento', 10, 2)->default(0);
            $table->decimal('propina', 10, 2)->default(0);
            $table->decimal('precio_total', 10, 2);

            // Notas
            $table->text('notas_cliente')->nullable()->comment('Visible para estilista');
            $table->text('notas_internas')->nullable()->comment('Solo para admin');
            $table->text('alergias_especiales')->nullable();

            // Control de confirmación
            $table->boolean('requiere_confirmacion')->default(true);
            $table->enum('confirmada_por', ['cliente', 'estilista', 'admin', 'auto'])->nullable();
            $table->timestamp('confirmada_en')->nullable();

            // Control de cancelación
            $table->timestamp('cancelable_hasta')->nullable()->comment('Límite para cancelar sin penalización');
            $table->timestamp('cancelada_en')->nullable();
            $table->enum('cancelada_por', ['cliente', 'estilista', 'admin', 'sistema'])->nullable();
            $table->text('razon_cancelacion')->nullable();
            $table->unsignedInteger('tiempo_cancelacion')->nullable()->comment('Minutos antes de la cita');
            $table->decimal('penalizacion_cancelacion', 10, 2)->default(0);

            // Completamiento
            $table->timestamp('completada_en')->nullable();
            $table->unsignedInteger('calificacion_servicio')->nullable()->comment('1-5 estrellas');

            // Recordatorios
            $table->boolean('recordatorio_24h_enviado')->default(false);
            $table->timestamp('recordatorio_24h_fecha')->nullable();
            $table->boolean('recordatorio_1h_enviado')->default(false);
            $table->timestamp('recordatorio_1h_fecha')->nullable();
            $table->boolean('recordatorio_llegada_enviado')->default(false);

            // Metadata
            $table->enum('origen', ['web', 'mobile_app', 'llamada_telefonica', 'walk_in'])->default('web');
            $table->string('dispositivo', 50)->nullable();
            $table->string('navegador', 50)->nullable();
            $table->string('ip_creacion', 45)->nullable();

            $table->timestamps();

            // Índices
            $table->index('codigo_cita');
            $table->index('cliente_id');
            $table->index(['estilista_id', 'fecha', 'estado']);
            $table->index(['sucursal_id', 'fecha']);
            $table->index('estado');
            $table->index('fecha');
            $table->index(['fecha', 'hora_inicio']);
            $table->index(['sucursal_id', 'estilista_id', 'fecha', 'estado']);
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
