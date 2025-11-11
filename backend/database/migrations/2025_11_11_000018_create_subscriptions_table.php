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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sucursal_id')->constrained('branches')->onDelete('cascade');
            $table->foreignId('plan_id')->constrained('plans')->onDelete('restrict');

            $table->enum('estado', ['activa', 'cancelada', 'suspendida', 'vencida', 'prueba'])->default('prueba');

            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->date('fecha_renovacion')->nullable();
            $table->date('fecha_cancelacion')->nullable();
            $table->text('razon_cancelacion')->nullable();

            $table->boolean('auto_renovar')->default(true);
            $table->enum('periodo', ['mensual', 'anual'])->default('mensual');

            $table->decimal('precio_pagado', 10, 2);
            $table->string('metodo_pago', 50)->nullable();
            $table->string('stripe_subscription_id', 255)->nullable();

            $table->boolean('en_prueba')->default(false);
            $table->unsignedInteger('dias_prueba')->default(0);

            $table->timestamps();

            // Indexes
            $table->index(['sucursal_id', 'estado']);
            $table->index(['estado', 'fecha_renovacion']);
            $table->index('stripe_subscription_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
