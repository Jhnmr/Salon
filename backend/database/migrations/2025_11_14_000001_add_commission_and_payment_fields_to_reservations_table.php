<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds payment processing and commission tracking fields to reservations table.
     */
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            // Payment fields
            $table->string('payment_intent_id')->nullable()->after('total_price')->comment('Stripe payment intent ID');
            $table->string('promotion_code', 50)->nullable()->after('payment_intent_id')->comment('Applied promotion code');

            // Commission tracking fields
            $table->decimal('total_amount', 10, 2)->nullable()->after('promotion_code')->comment('Total amount after promotions');
            $table->decimal('platform_commission', 10, 2)->nullable()->after('total_amount')->comment('7% platform fee');
            $table->decimal('salon_commission', 10, 2)->nullable()->after('platform_commission')->comment('Salon/branch commission');
            $table->decimal('stylist_earnings', 10, 2)->nullable()->after('salon_commission')->comment('Stylist earnings after commissions');

            // Add indices for performance
            $table->index('payment_intent_id');
            $table->index('promotion_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropIndex(['payment_intent_id']);
            $table->dropIndex(['promotion_code']);

            $table->dropColumn([
                'payment_intent_id',
                'promotion_code',
                'total_amount',
                'platform_commission',
                'salon_commission',
                'stylist_earnings',
            ]);
        });
    }
};
