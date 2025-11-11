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
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sucursal_id')->nullable()->constrained('branches')->onDelete('cascade');

            $table->string('codigo', 50)->unique();
            $table->string('nombre', 255);
            $table->text('descripcion')->nullable();

            $table->enum('tipo', ['porcentaje', 'monto_fijo', 'servicio_gratis']);
            $table->decimal('valor', 10, 2);
            $table->decimal('minimo_compra', 10, 2)->nullable();
            $table->decimal('maximo_descuento', 10, 2)->nullable();

            $table->date('fecha_inicio');
            $table->date('fecha_fin');

            $table->unsignedInteger('usos_maximos')->nullable();
            $table->unsignedInteger('usos_actuales')->default(0);
            $table->unsignedInteger('usos_por_usuario')->default(1);

            $table->json('servicios_aplicables')->nullable();
            $table->json('dias_semana_aplicables')->nullable();

            $table->boolean('activa')->default(true);

            $table->timestamps();

            // Indexes
            $table->index(['codigo', 'activa']);
            $table->index(['sucursal_id', 'activa']);
            $table->index(['fecha_inicio', 'fecha_fin']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
