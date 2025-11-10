<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->unique()->comment('Nombre descriptivo del permiso');
            $table->string('slug', 100)->unique()->comment('Identificador único del permiso');
            $table->string('recurso', 50)->comment('Recurso al que aplica (users, citas, pagos, etc)');
            $table->string('accion', 50)->comment('Acción permitida (create, read, update, delete, list)');
            $table->text('descripcion')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();

            // Índices
            $table->index('slug');
            $table->index(['recurso', 'accion']);
            $table->index('activo');
        });

        // Tabla pivot rol-permiso (muchos a muchos)
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            $table->foreignId('permission_id')->constrained('permissions')->onDelete('cascade');
            $table->timestamps();

            // Constraint único: un rol no puede tener el mismo permiso dos veces
            $table->unique(['role_id', 'permission_id']);

            // Índices
            $table->index('role_id');
            $table->index('permission_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
    }
};
