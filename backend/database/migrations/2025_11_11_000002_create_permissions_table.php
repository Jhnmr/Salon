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
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique()->comment('Permission identifier (e.g., create_cita)');
            $table->string('display_name', 150)->comment('Display name for UI');
            $table->text('description')->nullable();
            $table->string('resource', 50)->comment('Resource (e.g., cita, user, service)');
            $table->string('action', 50)->comment('Action (e.g., create, read, update, delete)');
            $table->string('group', 50)->nullable()->comment('Permission group for organization');
            $table->timestamps();

            // Índices
            $table->index(['name']);
            $table->index(['resource', 'action']);
            $table->index(['group']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};
