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
        Schema::create('stylist_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('servicio_id')->constrained('services')->onDelete('cascade');
            $table->foreignId('estilista_id')->constrained('stylists')->onDelete('cascade');

            $table->decimal('precio_personalizado', 10, 2)->nullable();
            $table->unsignedInteger('duracion_personalizada')->nullable(); // In minutes

            $table->boolean('activo')->default(true);

            $table->timestamps();

            // Ensure a stylist can only be assigned to a service once
            $table->unique(['servicio_id', 'estilista_id']);
            $table->index(['estilista_id', 'activo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stylist_services');
    }
};
