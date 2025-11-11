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
            $table->string('name', 50)->unique()->comment('client, stylist, admin, super_admin');
            $table->string('display_name', 100)->comment('Display name for UI');
            $table->text('description')->nullable();
            $table->boolean('is_system_role')->default(true)->comment('System roles cannot be deleted');
            $table->timestamps();

            // Índices
            $table->index(['name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
