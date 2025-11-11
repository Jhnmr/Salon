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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_transaccion', 100)->unique()->comment('Código único de transacción');

            // Relaciones críticas
            $table->unsignedBigInteger('reservation_id')->unique()->comment('FK a reservations (1:1)');
            $table->unsignedInteger('user_id')->comment('FK a users (cliente)');
            $table->unsignedInteger('branch_id')->nullable()->comment('FK a branches (sucursal)');

            // Montos
            $table->decimal('amount_subtotal', 10, 2)->comment('Monto base del servicio');
            $table->decimal('amount_tip', 10, 2)->default(0)->comment('Propina');
            $table->decimal('amount_discount', 10, 2)->default(0)->comment('Descuento aplicado');
            $table->decimal('amount_tax', 10, 2)->default(0)->comment('Impuestos');
            $table->decimal('amount_total', 10, 2)->comment('Monto total a pagar');

            // Método y proveedor de pago
            $table->enum('payment_method', [
                'credit_card',
                'debit_card',
                'cash',
                'bank_transfer',
                'paypal',
                'digital_wallet',
                'cryptocurrency'
            ])->comment('Método de pago utilizado');

            $table->enum('payment_provider', [
                'stripe',
                'paypal',
                'manual',
                'other'
            ])->comment('Proveedor del pago');

            // IDs externos de proveedores
            $table->string('stripe_payment_intent_id', 255)->nullable()->index();
            $table->string('stripe_charge_id', 255)->nullable()->index();
            $table->string('stripe_customer_id', 255)->nullable();
            $table->string('paypal_order_id', 255)->nullable()->index();
            $table->string('paypal_capture_id', 255)->nullable();

            // Estado del pago
            $table->enum('status', [
                'pending',
                'processing',
                'completed',
                'failed',
                'refunded',
                'partially_refunded',
                'disputed',
                'cancelled'
            ])->default('pending')->index();

            // Comisiones y distribución (modelo de negocio)
            $table->decimal('commission_platform', 10, 2)->comment('Comisión para plataforma');
            $table->decimal('commission_percentage', 5, 2)->comment('Porcentaje de comisión del plan');
            $table->decimal('amount_stylist', 10, 2)->comment('Monto que recibe el estilista');
            $table->decimal('amount_branch', 10, 2)->comment('Monto que recibe la sucursal');

            // Fechas importantes
            $table->timestamp('payment_date')->nullable()->comment('Fecha en que se procesó el pago');
            $table->timestamp('release_date')->nullable()->comment('Fecha en que se libera el dinero a la sucursal');

            // Reembolsos
            $table->decimal('refund_amount', 10, 2)->nullable();
            $table->timestamp('refund_date')->nullable();
            $table->text('refund_reason')->nullable();
            $table->unsignedInteger('refund_processed_by')->nullable()->comment('FK a users');

            // Facturación
            $table->boolean('requires_invoice')->default(true);
            $table->boolean('invoice_generated')->default(false);

            // Metadata y seguridad
            $table->json('metadata')->nullable()->comment('Datos adicionales del provider');
            $table->ipAddress('client_ip')->nullable();
            $table->string('browser', 255)->nullable();

            // Timestamps y soft delete
            $table->timestamps();

            // Constraints
            $table->foreign('reservation_id')
                ->references('id')
                ->on('reservations')
                ->onDelete('restrict');
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('restrict');

            // Índices para queries comunes (algunos ya definidos inline arriba)
            $table->index(['codigo_transaccion']);
            $table->index(['user_id']);
            $table->index(['status', 'payment_date']);
            $table->index(['payment_provider', 'status']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
