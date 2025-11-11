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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
            $table->unsignedBigInteger('relacionado_id')->nullable()->comment('ID genérico relacionado');

            $table->enum('tipo', ['cita', 'pago', 'mensaje', 'sistema', 'promocion', 'resena']);
            $table->string('titulo', 255);
            $table->text('mensaje');
            $table->string('icono', 100)->nullable();
            $table->string('url_destino', 500)->nullable();
            $table->json('metadata')->nullable();

            $table->boolean('leida')->default(false);
            $table->timestamp('leida_en')->nullable();
            $table->boolean('push_enviado')->default(false);
            $table->boolean('email_enviado')->default(false);
            $table->boolean('sms_enviado')->default(false);

            $table->timestamps();

            $table->index(['usuario_id', 'leida', 'created_at']);
            $table->index(['tipo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
