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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reservation_id')->unique()->comment('FK a reservations (1:1)');
            $table->unsignedInteger('client_id')->comment('FK a users (cliente)');
            $table->unsignedInteger('stylist_id')->comment('FK a users (estilista)');
            $table->unsignedBigInteger('branch_id')->nullable()->comment('FK a branches');

            // Calificaciones
            $table->unsignedTinyInteger('rating')->comment('Rating general 1-5');
            $table->unsignedTinyInteger('rating_punctuality')->nullable()->comment('Puntualidad 1-5');
            $table->unsignedTinyInteger('rating_quality')->nullable()->comment('Calidad 1-5');
            $table->unsignedTinyInteger('rating_friendliness')->nullable()->comment('Amabilidad 1-5');
            $table->unsignedTinyInteger('rating_cleanliness')->nullable()->comment('Limpieza 1-5');

            // Comentario
            $table->text('comment')->nullable();
            $table->text('stylist_response')->nullable()->comment('Respuesta del estilista');
            $table->timestamp('stylist_response_date')->nullable();

            // Fotos
            $table->json('photos')->nullable();

            // Control
            $table->boolean('is_visible')->default(true);
            $table->boolean('is_verified')->default(true)->comment('Verificada por compra');
            $table->boolean('is_reported')->default(false);

            // Interacción
            $table->unsignedInteger('helpful_count')->default(0);
            $table->unsignedInteger('likes_count')->default(0);

            // Timestamps
            $table->timestamps();

            // Constraints
            $table->foreign('reservation_id')
                ->references('id')
                ->on('reservations')
                ->onDelete('cascade');
            $table->foreign('client_id')
                ->references('id')
                ->on('users')
                ->onDelete('restrict');
            $table->foreign('stylist_id')
                ->references('id')
                ->on('users')
                ->onDelete('restrict');
            $table->foreign('branch_id')
                ->references('id')
                ->on('branches')
                ->onDelete('set null');

            // Índices
            $table->index(['stylist_id', 'is_visible']);
            $table->index(['branch_id', 'is_visible']);
            $table->index(['client_id']);
            $table->index(['rating']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
