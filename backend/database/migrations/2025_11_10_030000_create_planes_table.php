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
        Schema::create('planes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->comment('Nombre del plan (Basic, Premium, Enterprise)');
            $table->string('slug', 100)->unique();
            $table->text('descripcion')->nullable();

            // Precios
            $table->decimal('precio_mensual', 10, 2)->comment('Precio en USD por mes');
            $table->decimal('precio_anual', 10, 2)->comment('Precio en USD por año');
            $table->decimal('descuento_anual', 5, 2)->default(0)->comment('% de descuento en plan anual');

            // Límites
            $table->unsignedInteger('max_estilistas')->default(5)->comment('Máximo de estilistas permitidos');
            $table->unsignedInteger('max_sucursales')->default(1)->comment('Máximo de sucursales permitidas');
            $table->unsignedInteger('max_servicios')->default(50)->comment('Máximo de servicios permitidos');

            // Comisiones
            $table->decimal('comision_plataforma', 5, 2)->default(7.00)->comment('% de comisión por transacción');

            // Features (JSON)
            $table->json('features')->nullable()->comment('{"analytics": true, "api_access": false, "priority_support": true}');

            // Display
            $table->integer('orden')->default(0)->comment('Orden de visualización');
            $table->boolean('destacado')->default(false)->comment('Si es el plan recomendado');
            $table->boolean('activo')->default(true);
            $table->boolean('visible')->default(true)->comment('Si se muestra en la página de precios');

            // Timestamps
            $table->timestamps();

            // Índices
            $table->index('slug');
            $table->index(['activo', 'visible']);
            $table->index('orden');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('planes');
    }
};
