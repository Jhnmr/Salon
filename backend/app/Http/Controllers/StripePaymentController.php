<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;

/**
 * Stripe Payment Controller
 *
 * Handles Stripe-specific payment operations:
 * - Creating Payment Intents
 * - Confirming payments
 * - Processing webhooks
 * - Managing refunds
 */
class StripePaymentController extends Controller
{
    protected StripeService $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
        $this->middleware('auth:api');
    }

    /**
     * Create a Payment Intent for a reservation
     *
     * POST /api/v1/payments/stripe/create-intent
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function createPaymentIntent(Request $request): JsonResponse
    {
        try {
            // Validate request
            $validated = $request->validate([
                'reservation_id' => 'required|integer|exists:reservations,id',
            ]);

            $user = $request->user();
            $reservationId = $validated['reservation_id'];

            // Get reservation
            $reservation = Reservation::with(['client', 'stylist', 'service'])
                ->find($reservationId);

            // Verify user owns this reservation
            if ($reservation->client_id !== $user->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized: You do not own this reservation',
                ], 403);
            }

            // Verify reservation status is pending
            if ($reservation->status !== 'pending') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Reservation must be in pending status to create payment',
                ], 400);
            }

            // Calculate amount in cents
            $totalPrice = $reservation->total_price ?? 0;
            if ($totalPrice <= 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid reservation price',
                ], 400);
            }

            $amountCents = (int) ($totalPrice * 100);

            // Create Payment Intent
            $intent = $this->stripeService->createPaymentIntent(
                $reservation,
                $amountCents,
                [
                    'client_name' => $user->name,
                    'client_email' => $user->email,
                ]
            );

            return response()->json([
                'status' => 'success',
                'data' => [
                    'client_secret' => $intent->client_secret,
                    'payment_intent_id' => $intent->id,
                    'amount' => $totalPrice,
                    'currency' => $intent->currency,
                ],
            ], 200);

        } catch (ApiErrorException $e) {
            Log::error('Stripe API error in createPaymentIntent', [
                'error' => $e->getMessage(),
                'request_id' => $e->getHttpRequestIdHeader(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Payment processing error: ' . $e->getMessage(),
            ], 400);

        } catch (\Exception $e) {
            Log::error('Error creating payment intent', [
                'error' => $e->getMessage(),
                'reservation_id' => $validated['reservation_id'] ?? null,
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while creating payment intent',
            ], 500);
        }
    }

    /**
     * Confirm a Payment Intent
     *
     * POST /api/v1/payments/stripe/confirm
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function confirmPayment(Request $request): JsonResponse
    {
        try {
            // Validate request
            $validated = $request->validate([
                'payment_intent_id' => 'required|string',
                'payment_method_id' => 'required|string',
                'reservation_id' => 'required|integer|exists:reservations,id',
            ]);

            $user = $request->user();
            $reservationId = $validated['reservation_id'];

            // Get reservation
            $reservation = Reservation::with(['client', 'stylist', 'service'])
                ->find($reservationId);

            // Verify user owns this reservation
            if ($reservation->client_id !== $user->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized',
                ], 403);
            }

            // Confirm Payment Intent
            $intent = $this->stripeService->confirmPaymentIntent(
                $validated['payment_intent_id'],
                $validated['payment_method_id']
            );

            // Check if payment succeeded
            if ($intent->status === 'succeeded') {
                // Process the payment
                $totalPrice = $reservation->total_price ?? 0;
                $payment = $this->stripeService->processSuccessfulPayment(
                    $intent,
                    $reservation,
                    $totalPrice
                );

                return response()->json([
                    'status' => 'success',
                    'message' => 'Payment successful',
                    'data' => [
                        'payment_id' => $payment->id,
                        'payment_intent_id' => $intent->id,
                        'reservation_id' => $reservation->id,
                        'amount' => $totalPrice,
                    ],
                ], 200);
            }

            // Payment is pending (3D Secure, etc.)
            if ($intent->status === 'requires_action') {
                return response()->json([
                    'status' => 'requires_action',
                    'message' => 'Additional action required',
                    'data' => [
                        'client_secret' => $intent->client_secret,
                        'status' => $intent->status,
                    ],
                ], 200);
            }

            // Payment failed
            return response()->json([
                'status' => 'error',
                'message' => 'Payment could not be processed',
                'data' => [
                    'status' => $intent->status,
                    'error' => $intent->last_payment_error?->message,
                ],
            ], 400);

        } catch (ApiErrorException $e) {
            Log::error('Stripe API error in confirmPayment', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Payment processing error',
            ], 400);

        } catch (\Exception $e) {
            Log::error('Error confirming payment', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while processing payment',
            ], 500);
        }
    }

    /**
     * Get Stripe public key for frontend
     *
     * GET /api/v1/payments/stripe/public-key
     *
     * @return JsonResponse
     */
    public function getPublicKey(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'publishable_key' => $this->stripeService->getPublishableKey(),
            ],
        ], 200);
    }

    /**
     * Handle Stripe webhook
     *
     * POST /webhooks/stripe
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function webhook(Request $request): JsonResponse
    {
        try {
            $payload = $request->getContent();
            $signature = $request->header('Stripe-Signature');

            // Handle webhook event
            $event = $this->stripeService->handleWebhookEvent($payload, $signature);

            // Process different event types
            switch ($event->type) {
                case 'payment_intent.succeeded':
                    $this->stripeService->handlePaymentIntentSucceeded($event->data->object);
                    break;

                case 'payment_intent.payment_failed':
                    $this->stripeService->handlePaymentIntentPaymentFailed($event->data->object);
                    break;

                case 'charge.refunded':
                    // Handle refund webhook if needed
                    Log::info('Refund webhook received', [
                        'charge_id' => $event->data->object->id,
                    ]);
                    break;
            }

            return response()->json(['received' => true], 200);

        } catch (\Exception $e) {
            Log::error('Webhook processing error', [
                'error' => $e->getMessage(),
            ]);

            // Always return 200 to prevent Stripe from retrying
            return response()->json(['error' => 'Webhook error'], 200);
        }
    }

    /**
     * Refund a payment
     *
     * POST /api/v1/payments/{id}/refund
     *
     * @param Request $request
     * @param int $paymentId
     * @return JsonResponse
     */
    public function refundPayment(Request $request, int $paymentId): JsonResponse
    {
        try {
            $user = $request->user();

            // Get payment
            $payment = \App\Models\Payment::find($paymentId);

            if (!$payment) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment not found',
                ], 404);
            }

            // Check authorization (admin or payment owner)
            if (!$user->isAdmin() && $payment->user_id !== $user->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized',
                ], 403);
            }

            // Check if payment is refundable
            if ($payment->status !== 'completed') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Only completed payments can be refunded',
                ], 400);
            }

            // Validate Stripe charge ID
            if (!$payment->stripe_charge_id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment not processable via Stripe',
                ], 400);
            }

            // Get refund reason from request
            $reason = $request->input('reason', 'client_request');

            // Process refund
            $result = $this->stripeService->refundPayment(
                $payment->stripe_charge_id,
                null, // Full refund
                $reason
            );

            if ($result['success']) {
                // Update payment record
                $payment->update([
                    'status' => 'refunded',
                    'refund_amount' => $payment->amount_total,
                    'refund_date' => now(),
                    'refund_reason' => $reason,
                ]);

                // Update reservation status
                if ($payment->reservation) {
                    $payment->reservation->update(['status' => 'cancelled']);
                }

                return response()->json([
                    'status' => 'success',
                    'message' => 'Refund processed successfully',
                    'data' => $result,
                ], 200);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Refund failed',
                    'error' => $result['error'],
                ], 400);
            }

        } catch (\Exception $e) {
            Log::error('Error refunding payment', [
                'error' => $e->getMessage(),
                'payment_id' => $paymentId,
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while processing refund',
            ], 500);
        }
    }
}
