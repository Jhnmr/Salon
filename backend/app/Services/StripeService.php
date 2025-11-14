<?php

namespace App\Services;

use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\ApiErrorException;
use Illuminate\Support\Facades\Log;

/**
 * Stripe Payment Service
 * Handles all Stripe payment processing
 */
class StripeService
{
    /**
     * Constructor - Initialize Stripe
     */
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create a payment intent
     *
     * @param int $amount Amount in cents
     * @param string $currency Currency code (default: usd)
     * @param array $metadata Additional metadata
     * @return PaymentIntent
     * @throws ApiErrorException
     */
    public function createPaymentIntent(int $amount, string $currency = 'usd', array $metadata = []): PaymentIntent
    {
        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => $amount,
                'currency' => $currency,
                'metadata' => $metadata,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            Log::info('Stripe Payment Intent Created', [
                'payment_intent_id' => $paymentIntent->id,
                'amount' => $amount,
                'currency' => $currency,
            ]);

            return $paymentIntent;
        } catch (ApiErrorException $e) {
            Log::error('Stripe Payment Intent Creation Failed', [
                'error' => $e->getMessage(),
                'amount' => $amount,
                'currency' => $currency,
            ]);
            throw $e;
        }
    }

    /**
     * Confirm a payment intent
     *
     * @param string $paymentIntentId
     * @param string $paymentMethodId
     * @return PaymentIntent
     * @throws ApiErrorException
     */
    public function confirmPaymentIntent(string $paymentIntentId, string $paymentMethodId): PaymentIntent
    {
        try {
            $paymentIntent = PaymentIntent::retrieve($paymentIntentId);
            $paymentIntent->confirm([
                'payment_method' => $paymentMethodId,
            ]);

            Log::info('Stripe Payment Intent Confirmed', [
                'payment_intent_id' => $paymentIntentId,
                'status' => $paymentIntent->status,
            ]);

            return $paymentIntent;
        } catch (ApiErrorException $e) {
            Log::error('Stripe Payment Intent Confirmation Failed', [
                'error' => $e->getMessage(),
                'payment_intent_id' => $paymentIntentId,
            ]);
            throw $e;
        }
    }

    /**
     * Retrieve a payment intent
     *
     * @param string $paymentIntentId
     * @return PaymentIntent
     * @throws ApiErrorException
     */
    public function retrievePaymentIntent(string $paymentIntentId): PaymentIntent
    {
        try {
            return PaymentIntent::retrieve($paymentIntentId);
        } catch (ApiErrorException $e) {
            Log::error('Stripe Payment Intent Retrieval Failed', [
                'error' => $e->getMessage(),
                'payment_intent_id' => $paymentIntentId,
            ]);
            throw $e;
        }
    }

    /**
     * Process a payment with payment method
     *
     * @param int $amount Amount in cents
     * @param string $paymentMethodId Payment method ID from frontend
     * @param array $metadata Additional metadata
     * @return array Payment result
     */
    public function processPayment(int $amount, string $paymentMethodId, array $metadata = []): array
    {
        try {
            // Create payment intent
            $paymentIntent = $this->createPaymentIntent($amount, 'usd', $metadata);

            // Confirm with payment method
            $confirmedIntent = $this->confirmPaymentIntent($paymentIntent->id, $paymentMethodId);

            return [
                'success' => $confirmedIntent->status === 'succeeded',
                'payment_intent_id' => $confirmedIntent->id,
                'status' => $confirmedIntent->status,
                'amount' => $confirmedIntent->amount,
                'currency' => $confirmedIntent->currency,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe Payment Processing Failed', [
                'error' => $e->getMessage(),
                'amount' => $amount,
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Refund a payment
     *
     * @param string $paymentIntentId
     * @param int|null $amount Amount to refund (null for full refund)
     * @return array Refund result
     */
    public function refundPayment(string $paymentIntentId, ?int $amount = null): array
    {
        try {
            $refundData = ['payment_intent' => $paymentIntentId];

            if ($amount !== null) {
                $refundData['amount'] = $amount;
            }

            $refund = \Stripe\Refund::create($refundData);

            Log::info('Stripe Refund Created', [
                'refund_id' => $refund->id,
                'payment_intent_id' => $paymentIntentId,
                'amount' => $amount,
            ]);

            return [
                'success' => true,
                'refund_id' => $refund->id,
                'status' => $refund->status,
                'amount' => $refund->amount,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe Refund Failed', [
                'error' => $e->getMessage(),
                'payment_intent_id' => $paymentIntentId,
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
