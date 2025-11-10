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
        // Tabla para almacenar refresh tokens
        Schema::create('refresh_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('token_hash', 64)->unique()->comment('SHA256 hash del token');
            $table->timestamp('expires_at');
            $table->timestamp('created_at');

            // Índices
            $table->index('user_id');
            $table->index('token_hash');
            $table->index('expires_at');
        });

        // Tabla para blacklist de tokens revocados
        Schema::create('token_blacklist', function (Blueprint $table) {
            $table->id();
            $table->string('token_hash', 64)->unique()->comment('SHA256 hash del token');
            $table->timestamp('created_at');

            // Índice
            $table->index('token_hash');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('token_blacklist');
        Schema::dropIfExists('refresh_tokens');
    }
};
