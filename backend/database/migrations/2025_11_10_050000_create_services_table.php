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
        Schema::create('services', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');
            $table->foreignId('categoria_id')->nullable()->constrained('categorias_servicios')->onDelete('set null');

            // Información básica
            $table->string('name', 255);
            $table->text('description')->nullable();

            // Precios
            $table->decimal('price', 10, 2);
            $table->decimal('precio_descuento', 10, 2)->nullable()->comment('Precio con descuento');
            $table->boolean('requiere_deposito')->default(false);
            $table->decimal('monto_deposito', 10, 2)->nullable();

            // Duración
            $table->unsignedInteger('duration_minutes');
            $table->unsignedInteger('tiempo_preparacion')->default(0)->comment('Minutos de preparación');
            $table->unsignedInteger('tiempo_limpieza')->default(0)->comment('Minutos de limpieza');

            // Media
            $table->string('foto', 500)->nullable()->comment('URL de la foto del servicio');

            // Organización
            $table->boolean('is_active')->default(true);
            $table->integer('orden')->default(0)->comment('Orden de visualización');
            $table->boolean('visible')->default(true)->comment('Visible en catálogo');

            // Tags para búsqueda y filtrado
            $table->json('tags')->nullable()->comment('["cortes", "hombre", "popular"]');

            $table->timestamps();

            // Índices
            $table->index('branch_id');
            $table->index('categoria_id');
            $table->index(['branch_id', 'is_active', 'visible']);
            $table->index('orden');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
