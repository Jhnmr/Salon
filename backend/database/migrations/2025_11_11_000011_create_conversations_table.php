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
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario1_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('usuario2_id')->constrained('users')->onDelete('cascade');

            $table->unsignedBigInteger('ultimo_mensaje_id')->nullable();
            $table->timestamp('ultimo_mensaje_fecha')->nullable();

            $table->unsignedInteger('no_leidos_usuario1')->default(0);
            $table->unsignedInteger('no_leidos_usuario2')->default(0);

            $table->boolean('activa')->default(true);

            $table->timestamps();

            // Unique constraint to prevent duplicate conversations
            $table->unique(['usuario1_id', 'usuario2_id']);
            $table->index('ultimo_mensaje_fecha');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
