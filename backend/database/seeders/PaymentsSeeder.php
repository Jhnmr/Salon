<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Service;
use App\Models\Stylist;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Str;

class PaymentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('💳 Seeding Payments...');

        // Clear existing payments
        Payment::query()->delete();

        $faker = Faker::create('es_ES');

        // Get all completed and confirmed reservations
        $reservations = Reservation::with(['service.branch', 'client', 'stylist'])
            ->whereIn('status', ['completed', 'confirmed'])
            ->get();

        if ($reservations->isEmpty()) {
            $this->command->warn('⚠️  No completed/confirmed reservations found.');
            return;
        }

        $count = 0;

        foreach ($reservations as $reservation) {
            $service = $reservation->service;
            $stylist = Stylist::where('user_id', $reservation->stylist_id)->first();

            if (!$service || !$stylist) {
                continue;
            }

            // Calculate amounts
            $subtotal = floatval($service->price);

            // Random tip (30% of customers leave tips, 10-20% of service price)
            $tip = $faker->boolean(30) ? $subtotal * $faker->randomFloat(2, 0.10, 0.20) : 0;

            // Tax calculation based on country
            $branch = $service->branch;
            $taxRate = match ($branch->country ?? 'Costa Rica') {
                'Costa Rica' => 0.13, // 13% IVA
                'Mexico' => 0.16,     // 16% IVA
                'Colombia' => 0.19,   // 19% IVA
                default => 0.13,
            };
            $tax = $subtotal * $taxRate;

            // No discount for now
            $discount = 0;

            $total = $subtotal + $tip + $tax - $discount;

            // Commission calculation
            $commissionPercentage = floatval($stylist->commission_percentage ?? 60);
            $platformCommission = $subtotal * 0.10; // Platform takes 10%
            $amountStylist = $subtotal * ($commissionPercentage / 100);
            $amountBranch = $subtotal - $amountStylist - $platformCommission;

            // Payment status: 95% completed, 5% refunded (for completed reservations)
            $paymentStatus = Payment::STATUS_PENDING;
            $refundAmount = null;
            $refundDate = null;
            $refundReason = null;

            if ($reservation->status === 'completed') {
                // 95% completed, 5% refunded
                if ($faker->boolean(5)) {
                    $paymentStatus = Payment::STATUS_REFUNDED;
                    $refundAmount = $total;
                    $refundDate = $reservation->scheduled_at->copy()->addDays($faker->numberBetween(1, 5));
                    $refundReasons = [
                        'Cliente insatisfecho con el servicio',
                        'Error en el cobro',
                        'Cancelación fuera de tiempo',
                        'Problema con el servicio prestado',
                        'Solicitud del cliente'
                    ];
                    $refundReason = $faker->randomElement($refundReasons);
                } else {
                    $paymentStatus = Payment::STATUS_COMPLETED;
                }
            }

            // Payment method distribution
            $methods = [
                Payment::METHOD_CREDIT_CARD => 60,  // 60%
                Payment::METHOD_DEBIT_CARD => 25,   // 25%
                Payment::METHOD_CASH => 10,         // 10%
                Payment::METHOD_PAYPAL => 5,        // 5%
            ];
            $method = $faker->randomElement(array_merge(
                array_fill(0, 60, Payment::METHOD_CREDIT_CARD),
                array_fill(0, 25, Payment::METHOD_DEBIT_CARD),
                array_fill(0, 10, Payment::METHOD_CASH),
                array_fill(0, 5, Payment::METHOD_PAYPAL)
            ));

            // Payment provider
            $provider = match ($method) {
                Payment::METHOD_CASH => Payment::PROVIDER_MANUAL,
                Payment::METHOD_PAYPAL => Payment::PROVIDER_PAYPAL,
                default => Payment::PROVIDER_STRIPE,
            };

            // Generate Stripe/PayPal IDs
            $stripePaymentIntentId = $provider === Payment::PROVIDER_STRIPE
                ? 'pi_test_' . Str::random(24)
                : null;

            $stripeChargeId = $provider === Payment::PROVIDER_STRIPE
                ? 'ch_test_' . Str::random(24)
                : null;

            $paypalOrderId = $provider === Payment::PROVIDER_PAYPAL
                ? strtoupper(Str::random(17))
                : null;

            $paypalCaptureId = $provider === Payment::PROVIDER_PAYPAL
                ? strtoupper(Str::random(17))
                : null;

            // Payment and release dates
            $paymentDate = $reservation->status === 'completed'
                ? $reservation->scheduled_at->addHours(2)
                : null;

            $releaseDate = $paymentDate
                ? $paymentDate->copy()->addDays(7) // 7 days after payment
                : null;

            // Metadata
            $metadata = [
                'reservation_id' => $reservation->id,
                'service_name' => $service->name,
                'stylist_name' => $reservation->stylist->name ?? 'Unknown',
                'appointment_date' => $reservation->scheduled_at->toDateString(),
            ];

            Payment::create([
                'codigo_transaccion' => 'TXN-' . now()->format('Ymd') . '-' . strtoupper(Str::random(8)),
                'reservation_id' => $reservation->id,
                'user_id' => $reservation->client_id,
                'branch_id' => $branch->id,
                'amount_subtotal' => $subtotal,
                'amount_tip' => $tip,
                'amount_discount' => $discount,
                'amount_tax' => $tax,
                'amount_total' => $total,
                'payment_method' => $method,
                'payment_provider' => $provider,
                'stripe_payment_intent_id' => $stripePaymentIntentId,
                'stripe_charge_id' => $stripeChargeId,
                'stripe_customer_id' => $provider === Payment::PROVIDER_STRIPE ? 'cus_test_' . Str::random(14) : null,
                'paypal_order_id' => $paypalOrderId,
                'paypal_capture_id' => $paypalCaptureId,
                'status' => $paymentStatus,
                'commission_platform' => $platformCommission,
                'commission_percentage' => $commissionPercentage,
                'amount_stylist' => $amountStylist,
                'amount_branch' => $amountBranch,
                'payment_date' => $paymentDate,
                'release_date' => $releaseDate,
                'refund_amount' => $refundAmount,
                'refund_date' => $refundDate,
                'refund_reason' => $refundReason,
                'refund_processed_by' => $refundAmount ? 1 : null, // Admin user ID
                'requires_invoice' => true,
                'invoice_generated' => false, // Will be updated by InvoicesSeeder
                'metadata' => $metadata,
                'client_ip' => $faker->ipv4,
                'browser' => $faker->userAgent,
                'created_at' => $reservation->scheduled_at,
                'updated_at' => now(),
            ]);

            $count++;
        }

        $completedCount = Payment::where('status', Payment::STATUS_COMPLETED)->count();
        $refundedCount = Payment::where('status', Payment::STATUS_REFUNDED)->count();
        $pendingCount = Payment::where('status', Payment::STATUS_PENDING)->count();

        $this->command->info('✅ ' . $count . ' payments created');
        $this->command->info('   - ' . $completedCount . ' completed (' . round($completedCount/$count*100) . '%)');
        $this->command->info('   - ' . $refundedCount . ' refunded (' . round($refundedCount/$count*100) . '%)');
        $this->command->info('   - ' . $pendingCount . ' pending (' . round($pendingCount/$count*100) . '%)');
        $this->command->info('   Average payment: $' . number_format(Payment::avg('amount_total'), 2));
    }
}
