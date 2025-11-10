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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50)->unique()->comment('Nombre del rol');
            $table->string('slug', 50)->unique()->comment('Identificador único del rol');
            $table->text('descripcion')->nullable();
            $table->boolean('activo')->default(true);
            $table->integer('nivel')->default(0)->comment('Nivel jerárquico del rol');
            $table->timestamps();

            // Índices
            $table->index('slug');
            $table->index('activo');
        });

        // Tabla pivot usuario-rol (muchos a muchos)
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            $table->timestamp('asignado_en')->useCurrent();
            $table->foreignId('asignado_por')->nullable()->constrained('users')->onDelete('set null');

            // Constraint único: un usuario no puede tener el mismo rol dos veces
            $table->unique(['user_id', 'role_id']);

            // Índices
            $table->index('user_id');
            $table->index('role_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('roles');
    }
};
