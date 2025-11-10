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
        // Tabla pivot: servicios que ofrece cada estilista
        Schema::create('servicios_estilistas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('servicio_id')->constrained('services')->onDelete('cascade');
            $table->foreignId('estilista_id')->constrained('stylists')->onDelete('cascade');

            // Personalización
            $table->decimal('precio_personalizado', 10, 2)->nullable()->comment('Precio especial para este estilista');
            $table->unsignedInteger('duracion_personalizada')->nullable()->comment('Duración personalizada en minutos');

            // Control
            $table->boolean('activo')->default(true);
            $table->timestamps();

            // Un servicio-estilista debe ser único
            $table->unique(['servicio_id', 'estilista_id']);

            // Índices
            $table->index('servicio_id');
            $table->index('estilista_id');
            $table->index('activo');
        });

        // Tabla de favoritos (clientes que guardan estilistas favoritos)
        Schema::create('favoritos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('estilista_id')->constrained('stylists')->onDelete('cascade');
            $table->text('notas')->nullable()->comment('Notas personales del cliente');
            $table->timestamps();

            // Un cliente no puede tener duplicados del mismo estilista
            $table->unique(['cliente_id', 'estilista_id']);

            // Índices
            $table->index('cliente_id');
            $table->index('estilista_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favoritos');
        Schema::dropIfExists('servicios_estilistas');
    }
};
