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

            // Contenido
            $table->string('imagen_url', 500)->comment('URL de la imagen principal');
            $table->string('thumbnail_url', 500)->nullable()->comment('URL del thumbnail optimizado');
            $table->text('descripcion')->nullable();
            $table->json('hashtags')->nullable()->comment('["corte", "tinte", "transformacion"]');

            // Engagement metrics
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comentarios_count')->default(0);
            $table->unsignedInteger('compartidos_count')->default(0);
            $table->unsignedInteger('vistas_count')->default(0);

            // Control y moderación
            $table->boolean('visible')->default(true);
            $table->boolean('destacado')->default(false)->comment('Post destacado en perfil');
            $table->boolean('reportado')->default(false);
            $table->text('razon_reporte')->nullable();

            // Timestamps
            $table->timestamp('fecha_publicacion')->useCurrent();
            $table->timestamps();

            // Índices
            $table->index('estilista_id');
            $table->index('sucursal_id');
            $table->index(['visible', 'destacado']);
            $table->index('fecha_publicacion');
            $table->index('likes_count'); // Para ordenar por popularidad
        });

        // Tabla de likes (muchos a muchos)
        Schema::create('likes_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('posts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            // Un usuario solo puede dar like una vez a un post
            $table->unique(['post_id', 'user_id']);

            // Índices
            $table->index('post_id');
            $table->index('user_id');
        });

        // Tabla de comentarios
        Schema::create('comentarios_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('posts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('comentarios_posts')->onDelete('cascade')->comment('Para respuestas');

            $table->text('contenido');
            $table->boolean('editado')->default(false);
            $table->boolean('reportado')->default(false);
            $table->timestamps();

            // Índices
            $table->index('post_id');
            $table->index('user_id');
            $table->index('parent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comentarios_posts');
        Schema::dropIfExists('likes_posts');
        Schema::dropIfExists('posts');
    }
};
