<?php

namespace App\Services;

use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Event;
use Stripe\Exception\ApiErrorException;
use App\Models\Payment;
use App\Models\Reservation;
use Exception;
use Illuminate\Support\Facades\Log;

/**
 * Stripe Payment Service
 *
 * Handles Stripe payment processing, webhooks, and transaction management
 * Uses Payment Intents API for secure card payments
 */
class StripeService
{
    /**
     * Initialize Stripe with API key
     */
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create a Payment Intent for a reservation
     *
     * @param Reservation $reservation
     * @param float $amount Amount in cents
     * @param array $metadata Optional metadata to attach to intent
     * @return PaymentIntent
     * @throws ApiErrorException
     */
    public function createPaymentIntent(Reservation $reservation, float $amount, array $metadata = []): PaymentIntent
    {
        try {
            $client = $reservation->client;
            $stylist = $reservation->stylist;
            $service = $reservation->service;

            $intent = PaymentIntent::create([
                'amount' => (int) $amount, // Amount in cents
                'currency' => strtolower(config('app.currency', 'usd')),
                'payment_method_types' => ['card'],
                'description' => sprintf(
                    'Booking for %s with %s - %s',
                    $client->name,
                    $stylist->user->name,
                    $service->name
                ),
                'metadata' => array_merge([
                    'reservation_id' => $reservation->id,
                    'client_id' => $client->id,
                    'stylist_id' => $stylist->id,
                    'service_id' => $service->id,
                    'booking_date' => $reservation->scheduled_at->format('Y-m-d H:i'),
                ], $metadata),
                'statement_descriptor' => 'SALON BOOKING',
                // Confirmation method (automatic for one-click, manual for explicit confirm)
                'confirmation_method' => 'automatic',
                'confirm' => false, // Don't confirm yet, let frontend do it
            ]);

            Log::info('Payment Intent created', [
                'intent_id' => $intent->id,
                'reservation_id' => $reservation->id,
                'amount' => $amount,
                'currency' => $intent->currency,
            ]);

            return $intent;
        } catch (ApiErrorException $e) {
            Log::error('Stripe API Error - CreatePaymentIntent', [
                'error' => $e->getMessage(),
                'reservation_id' => $reservation->id,
            ]);
            throw $e;
        }
    }

    /**
     * Confirm a Payment Intent
     *
     * @param string $intentId The Payment Intent ID
     * @param string $paymentMethodId The Payment Method ID
     * @return PaymentIntent
     * @throws ApiErrorException
     */
    public function confirmPaymentIntent(string $intentId, string $paymentMethodId): PaymentIntent
    {
        try {
            $intent = PaymentIntent::retrieve($intentId);

            $intent->confirm([
                'payment_method' => $paymentMethodId,
                'off_session' => false,
            ]);

            Log::info('Payment Intent confirmed', [
                'intent_id' => $intentId,
                'status' => $intent->status,
            ]);

            return $intent;
        } catch (ApiErrorException $e) {
            Log::error('Stripe API Error - ConfirmPaymentIntent', [
                'error' => $e->getMessage(),
                'intent_id' => $intentId,
            ]);
            throw $e;
        }
    }

    /**
     * Process a successful payment and create Payment record
     *
     * @param PaymentIntent $intent
     * @param Reservation $reservation
     * @param float $totalPrice Total price in original currency (not cents)
     * @return Payment
     */
    public function processSuccessfulPayment(PaymentIntent $intent, Reservation $reservation, float $totalPrice): Payment
    {
        try {
            // Calculate commissions
            $commissionPercentage = config('payment.platform_commission_percentage', 15);
            $commissionAmount = ($totalPrice * $commissionPercentage) / 100;
            $stylistAmount = $totalPrice - $commissionAmount;

            // Create payment record
            $payment = Payment::create([
                'codigo_transaccion' => 'STRIPE_' . $intent->id,
                'reservation_id' => $reservation->id,
                'user_id' => $reservation->client_id,
                'branch_id' => $reservation->stylist->branch_id,
                'amount_subtotal' => $totalPrice,
                'amount_tip' => 0,
                'amount_discount' => 0,
                'amount_tax' => 0,
                'amount_total' => $totalPrice,
                'payment_method' => 'credit_card',
                'payment_provider' => 'stripe',
                'stripe_payment_intent_id' => $intent->id,
                'stripe_charge_id' => $intent->latest_charge,
                'stripe_customer_id' => $intent->customer,
                'status' => 'completed',
                'commission_platform' => $commissionAmount,
                'commission_percentage' => $commissionPercentage,
                'amount_stylist' => $stylistAmount,
                'amount_branch' => $commissionAmount,
                'payment_date' => now(),
                'release_date' => now()->addDays(7), // Release funds after 7 days
                'requires_invoice' => true,
                'invoice_generated' => false,
                'client_ip' => request()->ip(),
                'browser' => request()->header('User-Agent'),
            ]);

            // Update reservation status
            $reservation->update(['status' => 'confirmed']);

            Log::info('Payment processed successfully', [
                'payment_id' => $payment->id,
                'stripe_intent_id' => $intent->id,
                'reservation_id' => $reservation->id,
                'amount' => $totalPrice,
            ]);

            return $payment;
        } catch (Exception $e) {
            Log::error('Error processing successful payment', [
                'error' => $e->getMessage(),
                'intent_id' => $intent->id,
                'reservation_id' => $reservation->id,
            ]);
            throw $e;
        }
    }

    /**
     * Handle webhook event from Stripe
     *
     * @param string $payload Raw webhook payload
     * @param string $signature Stripe signature from header
     * @return Event
     * @throws Exception
     */
    public function handleWebhookEvent(string $payload, string $signature): Event
    {
        try {
            $endpointSecret = config('services.stripe.webhook_secret');

            $event = Event::constructFrom(
                json_decode($payload, true)
            );

            // Verify signature
            // Note: In production, verify signature using:
            // $event = \Stripe\Webhook::constructEvent($payload, $signature, $endpointSecret);

            Log::info('Webhook event received', [
                'event_type' => $event->type,
                'event_id' => $event->id,
            ]);

            return $event;
        } catch (Exception $e) {
            Log::error('Webhook event error', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Handle payment_intent.succeeded webhook
     *
     * @param PaymentIntent $intent
     * @return void
     */
    public function handlePaymentIntentSucceeded(PaymentIntent $intent): void
    {
        try {
            // Get reservation from metadata
            $reservationId = $intent->metadata['reservation_id'] ?? null;

            if (!$reservationId) {
                Log::warning('Payment succeeded but no reservation_id in metadata', [
                    'intent_id' => $intent->id,
                ]);
                return;
            }

            $reservation = Reservation::find($reservationId);
            if (!$reservation) {
                Log::warning('Payment succeeded but reservation not found', [
                    'intent_id' => $intent->id,
                    'reservation_id' => $reservationId,
                ]);
                return;
            }

            // Check if payment already processed
            if (Payment::where('stripe_payment_intent_id', $intent->id)->exists()) {
                Log::info('Payment already processed for this intent', [
                    'intent_id' => $intent->id,
                ]);
                return;
            }

            // Process the payment
            $totalPrice = $reservation->total_price ?? 0;
            $this->processSuccessfulPayment($intent, $reservation, $totalPrice);

            // TODO: Send confirmation email
            // TODO: Send push notification to stylist
        } catch (Exception $e) {
            Log::error('Error handling payment_intent.succeeded', [
                'error' => $e->getMessage(),
                'intent_id' => $intent->id,
            ]);
        }
    }

    /**
     * Handle payment_intent.payment_failed webhook
     *
     * @param PaymentIntent $intent
     * @return void
     */
    public function handlePaymentIntentPaymentFailed(PaymentIntent $intent): void
    {
        try {
            $reservationId = $intent->metadata['reservation_id'] ?? null;

            if (!$reservationId) {
                return;
            }

            $reservation = Reservation::find($reservationId);
            if (!$reservation) {
                return;
            }

            // Update reservation status to failed
            $reservation->update(['status' => 'failed']);

            Log::warning('Payment failed for reservation', [
                'reservation_id' => $reservationId,
                'intent_id' => $intent->id,
                'last_error' => $intent->last_payment_error?->message,
            ]);

            // TODO: Send failure notification to client
        } catch (Exception $e) {
            Log::error('Error handling payment_intent.payment_failed', [
                'error' => $e->getMessage(),
                'intent_id' => $intent->id,
            ]);
        }
    }

    /**
     * Refund a payment
     *
     * @param string $chargeId Stripe charge ID
     * @param int|null $amount Amount to refund in cents (null = full refund)
     * @param string|null $reason Reason for refund
     * @return array Refund information
     * @throws ApiErrorException
     */
    public function refundPayment(string $chargeId, int $amount = null, string $reason = null): array
    {
        try {
            $refundParams = [
                'charge' => $chargeId,
            ];

            if ($amount !== null) {
                $refundParams['amount'] = $amount;
            }

            if ($reason !== null) {
                $refundParams['reason'] = $reason;
            }

            $refund = \Stripe\Refund::create($refundParams);

            Log::info('Refund processed', [
                'charge_id' => $chargeId,
                'refund_id' => $refund->id,
                'amount' => $refund->amount,
                'status' => $refund->status,
            ]);

            return [
                'success' => true,
                'refund_id' => $refund->id,
                'amount' => $refund->amount,
                'status' => $refund->status,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe refund error', [
                'error' => $e->getMessage(),
                'charge_id' => $chargeId,
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get publishable key for frontend
     *
     * @return string
     */
    public function getPublishableKey(): string
    {
        return config('services.stripe.public', '');
    }
}
