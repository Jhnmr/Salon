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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();

            $table->decimal('precio_mensual', 10, 2);
            $table->decimal('precio_anual', 10, 2);

            $table->unsignedInteger('max_estilistas')->nullable();
            $table->unsignedInteger('max_sucursales')->nullable();

            $table->decimal('comision_plataforma', 5, 2)->default(7.00); // 7% default

            $table->json('features')->nullable(); // Array of feature strings
            $table->unsignedInteger('orden')->default(0);

            $table->boolean('destacado')->default(false);
            $table->boolean('activo')->default(true);

            $table->timestamps();

            // Indexes
            $table->index(['activo', 'orden']);
            $table->index('destacado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
