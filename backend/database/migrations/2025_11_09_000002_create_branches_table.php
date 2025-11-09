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
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('admin_id')->comment('FK a users (admin de sucursal)');
            $table->unsignedInteger('plan_id')->nullable()->comment('FK a plans (plan de suscripción)');

            // Información básica
            $table->string('name', 255)->comment('Nombre de la sucursal');
            $table->string('slug', 255)->unique()->comment('URL-friendly slug');
            $table->text('description')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('whatsapp', 20)->nullable();
            $table->string('email', 255)->nullable();

            // Ubicación
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Branding
            $table->string('logo', 500)->nullable()->comment('URL del logo');
            $table->json('photos')->nullable()->comment('JSON array de fotos');

            // Horarios
            $table->json('hours')->nullable()->comment('Horarios de operación por día');
            $table->json('closed_days')->nullable()->comment('Días cerrados');
            $table->string('timezone', 50)->default('America/Costa_Rica');

            // Configuración regional
            $table->string('country', 2)->default('CR')->comment('ISO 3166-1 alpha-2');
            $table->string('currency', 3)->default('CRC')->comment('ISO 4217');
            $table->json('supported_languages')->nullable();

            // Estado
            $table->enum('status', [
                'pending',
                'approved',
                'suspended'
            ])->default('pending')->index();

            $table->decimal('average_rating', 3, 2)->default(0)->comment('Rating promedio');
            $table->unsignedInteger('total_reviews')->default(0);
            $table->boolean('verified')->default(false);

            // Dates de control
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->text('suspension_reason')->nullable();

            // Configuración JSON (personalización)
            $table->json('settings')->nullable()->comment('Configuración específica de la sucursal');

            // Timestamps
            $table->timestamps();

            // Constraints
            $table->foreign('admin_id')
                ->references('id')
                ->on('users')
                ->onDelete('restrict');

            // Índices
            $table->index(['status', 'country']);
            $table->index(['admin_id']);
            $table->index(['verified']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branches');
    }
};
