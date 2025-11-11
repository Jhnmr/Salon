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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payment_id')->unique()->comment('FK a payments (1:1)');
            $table->unsignedBigInteger('branch_id')->comment('FK a branches');

            // Número de factura
            $table->string('invoice_number', 50)->unique();
            $table->enum('invoice_type', [
                'electronic',
                'manual'
            ])->default('electronic');

            // Hacienda - Específico para Costa Rica
            $table->string('hacienda_key', 100)->nullable()->unique()->comment('Clave única de Hacienda');
            $table->string('hacienda_consecutive', 50)->nullable();
            $table->longText('xml_content')->nullable()->comment('XML para Hacienda');
            $table->longText('xml_signed')->nullable()->comment('XML firmado');
            $table->string('pdf_url', 500)->nullable()->comment('URL del PDF generado');

            // Estado con Hacienda
            $table->enum('hacienda_status', [
                'pending',
                'sent',
                'accepted',
                'rejected'
            ])->default('pending')->index();

            $table->text('hacienda_message')->nullable();
            $table->string('response_code', 20)->nullable();

            // Fechas
            $table->timestamp('issued_at');
            $table->timestamp('sent_to_hacienda_at')->nullable();
            $table->timestamp('hacienda_response_at')->nullable();
            $table->unsignedInteger('send_attempts')->default(0)->comment('Intentos de envío');

            // Timestamps
            $table->timestamps();

            // Constraints
            $table->foreign('payment_id')
                ->references('id')
                ->on('payments')
                ->onDelete('restrict');
            $table->foreign('branch_id')
                ->references('id')
                ->on('branches')
                ->onDelete('restrict');

            // Índices (hacienda_status ya definido inline arriba)
            $table->index(['invoice_number']);
            $table->index(['branch_id', 'issued_at']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
