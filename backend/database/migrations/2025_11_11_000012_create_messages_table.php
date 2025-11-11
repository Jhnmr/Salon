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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversacion_id')->constrained('conversations')->onDelete('cascade');
            $table->foreignId('remitente_id')->constrained('users')->onDelete('cascade');

            $table->text('mensaje');
            $table->enum('tipo', ['texto', 'imagen', 'archivo', 'ubicacion'])->default('texto');
            $table->json('metadata')->nullable();

            $table->boolean('leido')->default(false);
            $table->timestamp('leido_en')->nullable();
            $table->boolean('editado')->default(false);
            $table->boolean('eliminado')->default(false);

            $table->timestamps();

            // Indexes
            $table->index(['conversacion_id', 'created_at']);
            $table->index(['remitente_id', 'leido']);
        });

        // Add foreign key constraint for ultimo_mensaje_id in conversations
        Schema::table('conversations', function (Blueprint $table) {
            $table->foreign('ultimo_mensaje_id')->references('id')->on('messages')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['ultimo_mensaje_id']);
        });

        Schema::dropIfExists('messages');
    }
};
