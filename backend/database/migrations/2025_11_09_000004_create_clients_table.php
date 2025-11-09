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
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('user_id')->unique()->comment('FK a users');

            // Ubicación
            $table->decimal('location_lat', 10, 8)->nullable();
            $table->decimal('location_lng', 11, 8)->nullable();
            $table->text('saved_address')->nullable();

            // Preferencias
            $table->json('preferences')->nullable()->comment('Preferencias de servicios, horarios, etc.');

            // Datos demográficos
            $table->date('birth_date')->nullable();
            $table->enum('gender', [
                'male',
                'female',
                'other',
                'prefer_not_to_say'
            ])->nullable();

            // Estadísticas
            $table->unsignedInteger('total_appointments')->default(0);
            $table->decimal('total_spent', 10, 2)->default(0);

            // Timestamps
            $table->timestamps();

            // Constraints
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            // Índices
            $table->index(['user_id']);
            $table->index(['location_lat', 'location_lng']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
