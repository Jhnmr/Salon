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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('user_id')->nullable()->comment('Usuario que realizó la acción');
            $table->string('action', 100)->comment('Acción realizada (CREATE, UPDATE, DELETE)');
            $table->string('table_name', 100)->comment('Tabla afectada');
            $table->unsignedBigInteger('record_id')->comment('ID del registro afectado');
            $table->json('old_data')->nullable()->comment('Datos anteriores');
            $table->json('new_data')->nullable()->comment('Datos nuevos');
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent()->index();

            // Constraints
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            // Índices para búsquedas comunes (created_at ya definido inline arriba)
            $table->index(['user_id', 'created_at']);
            $table->index(['table_name', 'record_id']);
            $table->index(['action']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
