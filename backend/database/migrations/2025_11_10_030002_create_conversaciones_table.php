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
        Schema::create('conversaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario1_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('usuario2_id')->constrained('users')->onDelete('cascade');

            // Último mensaje (para ordenar conversaciones)
            $table->foreignId('ultimo_mensaje_id')->nullable()->constrained('mensajes_chat')->onDelete('set null');
            $table->timestamp('ultimo_mensaje_fecha')->nullable();

            // Contadores de mensajes no leídos
            $table->unsignedInteger('no_leidos_usuario1')->default(0);
            $table->unsignedInteger('no_leidos_usuario2')->default(0);

            // Control
            $table->boolean('activa')->default(true);
            $table->timestamps();

            // Constraint único: solo una conversación entre dos usuarios
            $table->unique(['usuario1_id', 'usuario2_id']);

            // Índices
            $table->index('usuario1_id');
            $table->index('usuario2_id');
            $table->index('ultimo_mensaje_fecha');
        });

        Schema::create('mensajes_chat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversacion_id')->constrained('conversaciones')->onDelete('cascade');
            $table->foreignId('remitente_id')->constrained('users')->onDelete('cascade');

            // Contenido
            $table->text('mensaje');
            $table->enum('tipo', ['texto', 'imagen', 'archivo', 'ubicacion', 'audio'])->default('texto');
            $table->json('metadata')->nullable()->comment('Datos adicionales según tipo (URL archivo, coordenadas, etc)');

            // Control de lectura
            $table->boolean('leido')->default(false);
            $table->timestamp('leido_en')->nullable();

            // Control de edición/eliminación
            $table->boolean('editado')->default(false);
            $table->boolean('eliminado')->default(false);

            // Timestamps
            $table->timestamps();

            // Índices
            $table->index('conversacion_id');
            $table->index('remitente_id');
            $table->index(['conversacion_id', 'created_at']); // Para obtener mensajes ordenados
            $table->index(['conversacion_id', 'leido']); // Para contar no leídos
        });

        // Actualizar la foreign key del ultimo_mensaje_id en conversaciones
        Schema::table('conversaciones', function (Blueprint $table) {
            $table->dropForeign(['ultimo_mensaje_id']);
            $table->foreign('ultimo_mensaje_id')
                ->references('id')
                ->on('mensajes_chat')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mensajes_chat');
        Schema::dropIfExists('conversaciones');
    }
};
