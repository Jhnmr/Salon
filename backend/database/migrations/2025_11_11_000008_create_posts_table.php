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
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estilista_id')->constrained('stylists')->onDelete('cascade');
            $table->foreignId('sucursal_id')->constrained('branches')->onDelete('cascade');

            // Media
            $table->string('imagen_url', 500);
            $table->string('thumbnail_url', 500)->nullable();

            // Content
            $table->text('descripcion')->nullable();
            $table->json('hashtags')->nullable();

            // Engagement metrics
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comentarios_count')->default(0);
            $table->unsignedInteger('compartidos_count')->default(0);
            $table->unsignedInteger('vistas_count')->default(0);

            // Status
            $table->boolean('visible')->default(true);
            $table->boolean('destacado')->default(false);
            $table->boolean('reportado')->default(false);

            $table->timestamp('fecha_publicacion')->useCurrent();
            $table->timestamps();

            // Indexes
            $table->index(['estilista_id', 'visible', 'fecha_publicacion']);
            $table->index(['sucursal_id', 'visible']);
            $table->index('destacado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
