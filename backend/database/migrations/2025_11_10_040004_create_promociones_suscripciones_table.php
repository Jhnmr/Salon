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
        // Tabla de promociones y cupones
        Schema::create('promociones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sucursal_id')->nullable()->constrained('branches')->onDelete('cascade')->comment('NULL = promoción global');

            // Código y descripción
            $table->string('codigo', 50)->unique()->comment('Código del cupón');
            $table->string('nombre', 255);
            $table->text('descripcion')->nullable();

            // Tipo de descuento
            $table->enum('tipo', ['porcentaje', 'monto_fijo', 'servicio_gratis'])->default('porcentaje');
            $table->decimal('valor', 10, 2)->comment('Porcentaje (ej: 20) o monto fijo (ej: 5.00)');

            // Restricciones
            $table->decimal('minimo_compra', 10, 2)->nullable()->comment('Monto mínimo para aplicar');
            $table->decimal('maximo_descuento', 10, 2)->nullable()->comment('Descuento máximo en monto fijo');

            // Vigencia
            $table->date('fecha_inicio');
            $table->date('fecha_fin');

            // Límites de uso
            $table->unsignedInteger('usos_maximos')->nullable()->comment('NULL = ilimitado');
            $table->unsignedInteger('usos_actuales')->default(0);
            $table->unsignedInteger('usos_por_usuario')->default(1);

            // Aplicabilidad
            $table->json('servicios_aplicables')->nullable()->comment('IDs de servicios, NULL = todos');
            $table->json('dias_semana_aplicables')->nullable()->comment('["lunes", "martes"], NULL = todos');

            // Control
            $table->boolean('activa')->default(true);
            $table->timestamps();

            // Índices
            $table->index('codigo');
            $table->index('sucursal_id');
            $table->index(['activa', 'fecha_inicio', 'fecha_fin']);
        });

        // Tabla de suscripciones a planes
        Schema::create('suscripciones_planes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sucursal_id')->constrained('branches')->onDelete('cascade');
            $table->foreignId('plan_id')->constrained('planes')->onDelete('restrict');

            // Estado
            $table->enum('estado', ['activa', 'cancelada', 'suspendida', 'vencida', 'prueba'])->default('activa');

            // Fechas
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->date('fecha_renovacion')->nullable();
            $table->date('fecha_cancelacion')->nullable();
            $table->text('razon_cancelacion')->nullable();

            // Configuración
            $table->boolean('auto_renovar')->default(true);
            $table->enum('periodo', ['mensual', 'anual'])->default('mensual');

            // Pago
            $table->decimal('precio_pagado', 10, 2);
            $table->string('metodo_pago', 50)->nullable();
            $table->string('stripe_subscription_id', 255)->nullable()->unique();

            // Prueba gratis
            $table->boolean('en_prueba')->default(false);
            $table->unsignedInteger('dias_prueba')->default(0);

            $table->timestamps();

            // Índices
            $table->index('sucursal_id');
            $table->index('plan_id');
            $table->index('estado');
            $table->index('fecha_renovacion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suscripciones_planes');
        Schema::dropIfExists('promociones');
    }
};
