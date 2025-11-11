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
        Schema::create('saved_payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');

            $table->enum('tipo', ['tarjeta', 'paypal', 'wallet']);
            $table->string('proveedor', 50);
            $table->string('token_pago', 255); // Should be encrypted in application
            $table->string('ultimos_4_digitos', 4)->nullable();
            $table->string('marca_tarjeta', 50)->nullable();
            $table->string('fecha_expiracion', 7)->nullable(); // MM/YYYY
            $table->string('nombre_titular', 255)->nullable();

            $table->boolean('es_predeterminado')->default(false);
            $table->boolean('activo')->default(true);

            $table->timestamps();

            // Indexes
            $table->index(['usuario_id', 'activo']);
            $table->index('es_predeterminado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saved_payment_methods');
    }
};
