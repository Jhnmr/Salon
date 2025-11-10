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
        Schema::create('metodos_pago_guardados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Tipo y proveedor
            $table->enum('tipo', ['tarjeta', 'paypal', 'wallet'])->default('tarjeta');
            $table->string('proveedor', 50)->comment('stripe, paypal, etc');

            // Token seguro (NO almacenar datos reales de tarjeta)
            $table->string('token_pago', 255)->comment('Token del proveedor de pago');

            // Información de visualización (para UI)
            $table->string('ultimos_4_digitos', 4)->nullable();
            $table->string('marca_tarjeta', 50)->nullable()->comment('visa, mastercard, amex, etc');
            $table->string('fecha_expiracion', 7)->nullable()->comment('MM/YYYY');
            $table->string('nombre_titular', 255)->nullable();

            // Control
            $table->boolean('es_predeterminado')->default(false);
            $table->boolean('activo')->default(true);

            $table->timestamps();

            // Índices
            $table->index('user_id');
            $table->index(['user_id', 'es_predeterminado']);
            $table->index('activo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('metodos_pago_guardados');
    }
};
