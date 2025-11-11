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
        Schema::table('services', function (Blueprint $table) {
            // Pricing
            $table->decimal('precio_descuento', 10, 2)->nullable()->after('price')->comment('Discounted price');
            $table->decimal('monto_deposito', 10, 2)->default(0)->after('precio_descuento')->comment('Required deposit');
            $table->boolean('requiere_deposito')->default(false)->after('monto_deposito');

            // Time estimates
            $table->unsignedInteger('tiempo_preparacion')->default(0)->after('duration')->comment('Preparation time in minutes');
            $table->unsignedInteger('tiempo_limpieza')->default(0)->after('tiempo_preparacion')->comment('Cleanup time in minutes');

            // Media and display
            $table->string('foto', 500)->nullable()->after('description')->comment('Main photo URL');
            $table->unsignedInteger('orden')->default(0)->after('foto')->comment('Display order');
            $table->boolean('visible')->default(true)->after('orden')->comment('Visible to customers');

            // Tags for search and filtering
            $table->json('tags')->nullable()->after('visible')->comment('Service tags array');

            // Category relation
            $table->unsignedBigInteger('categoria_id')->nullable()->after('tags')->comment('FK to service_categories');

            // Índices
            $table->index(['visible', 'orden']);
            $table->index(['categoria_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn([
                'precio_descuento', 'monto_deposito', 'requiere_deposito',
                'tiempo_preparacion', 'tiempo_limpieza',
                'foto', 'orden', 'visible',
                'tags', 'categoria_id'
            ]);
        });
    }
};
