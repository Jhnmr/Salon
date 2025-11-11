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
        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('estilista_id')->constrained('stylists')->onDelete('cascade');

            $table->text('notas')->nullable();

            $table->timestamps();

            // Ensure a client can only favorite a stylist once
            $table->unique(['cliente_id', 'estilista_id']);
            $table->index('estilista_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favorites');
    }
};
