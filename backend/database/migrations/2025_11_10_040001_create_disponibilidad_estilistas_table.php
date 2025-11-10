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
        Schema::create('disponibilidad_estilistas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estilista_id')->constrained('stylists')->onDelete('cascade');

            // Día de la semana
            $table->enum('dia_semana', ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']);

            // Horario
            $table->time('hora_inicio')->comment('Ej: 09:00');
            $table->time('hora_fin')->comment('Ej: 18:00');

            // Configuración de slots
            $table->unsignedInteger('duracion_slot')->default(30)->comment('Duración de cada slot en minutos');

            // Control
            $table->boolean('activo')->default(true);
            $table->timestamps();

            // Índices
            $table->index('estilista_id');
            $table->index(['estilista_id', 'dia_semana']);
            $table->index('activo');
        });

        // Tabla de bloqueos de horario (vacaciones, descansos, etc.)
        Schema::create('bloqueos_horario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estilista_id')->constrained('stylists')->onDelete('cascade');

            // Rango de fechas
            $table->dateTime('fecha_inicio');
            $table->dateTime('fecha_fin');

            // Tipo y motivo
            $table->enum('tipo', ['vacaciones', 'personal', 'enfermedad', 'evento', 'otro'])->default('personal');
            $table->string('motivo', 255)->nullable();

            // Opciones
            $table->boolean('todo_el_dia')->default(true);
            $table->boolean('recurrente')->default(false)->comment('Si se repite semanalmente');

            $table->timestamps();

            // Índices
            $table->index('estilista_id');
            $table->index(['estilista_id', 'fecha_inicio', 'fecha_fin']);
            $table->index('tipo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bloqueos_horario');
        Schema::dropIfExists('disponibilidad_estilistas');
    }
};
