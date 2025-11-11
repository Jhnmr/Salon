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
        Schema::create('schedule_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estilista_id')->constrained('stylists')->onDelete('cascade');

            $table->dateTime('fecha_inicio');
            $table->dateTime('fecha_fin');

            $table->enum('tipo', ['vacaciones', 'personal', 'enfermedad', 'otro'])->default('personal');
            $table->string('motivo', 255)->nullable();

            $table->boolean('todo_el_dia')->default(true);
            $table->boolean('recurrente')->default(false);

            $table->timestamps();

            // Indexes
            $table->index(['estilista_id', 'fecha_inicio', 'fecha_fin']);
            $table->index('tipo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedule_blocks');
    }
};
