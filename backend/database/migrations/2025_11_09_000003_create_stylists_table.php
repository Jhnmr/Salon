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
        Schema::create('stylists', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique()->comment('FK a users'); // Fixed: changed from unsignedInteger
            $table->unsignedBigInteger('branch_id')->nullable()->comment('FK a branches');

            // Información profesional
            $table->text('bio')->nullable();
            $table->string('specialty', 255)->nullable()->comment('Especialidad principal');
            $table->unsignedInteger('years_experience')->nullable();
            $table->json('certifications')->nullable()->comment('JSON array de certificaciones');

            // Configuración de comisiones
            $table->decimal('commission_percentage', 5, 2)->default(70)->comment('% que recibe el estilista');
            $table->boolean('tips_enabled')->default(true);

            // Ratings y reseñas
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->unsignedInteger('total_reviews')->default(0);
            $table->unsignedInteger('total_services_completed')->default(0);

            // Disponibilidad
            $table->boolean('is_active')->default(true);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            // Timestamps
            $table->timestamps();

            // Constraints
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
            $table->foreign('branch_id')
                ->references('id')
                ->on('branches')
                ->onDelete('set null');

            // Índices
            $table->index(['user_id']);
            $table->index(['branch_id']);
            $table->index(['average_rating']);
            $table->index(['is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stylists');
    }
};
