<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Models\Payment;
use App\Models\Reservation;
use Stripe\Webhook as StripeWebhook;
use Stripe\Exception\SignatureVerificationException;

/**
 * WebhookController
 *
 * Handles webhooks from payment providers (Stripe, PayPal)
 */
class WebhookController extends Controller
{
    /**
     * Handle Stripe webhooks
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function stripe(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            // Verify webhook signature
            $event = StripeWebhook::constructEvent(
                $payload,
                $sigHeader,
                $webhookSecret
            );

            Log::info('Stripe webhook received', [
                'type' => $event->type,
                'id' => $event->id,
            ]);

            // Handle different event types
            switch ($event->type) {
                case 'payment_intent.succeeded':
                    $this->handlePaymentIntentSucceeded($event->data->object);
                    break;

                case 'payment_intent.payment_failed':
                    $this->handlePaymentIntentFailed($event->data->object);
                    break;

                case 'charge.refunded':
                    $this->handleChargeRefunded($event->data->object);
                    break;

                case 'charge.succeeded':
                    $this->handleChargeSucceeded($event->data->object);
                    break;

                case 'charge.failed':
                    $this->handleChargeFailed($event->data->object);
                    break;

                case 'payment_method.attached':
                    $this->handlePaymentMethodAttached($event->data->object);
                    break;

                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                case 'customer.subscription.deleted':
                    $this->handleSubscriptionEvent($event->type, $event->data->object);
                    break;

                default:
                    Log::info('Unhandled Stripe webhook event', ['type' => $event->type]);
            }

            return response()->json(['received' => true], 200);

        } catch (SignatureVerificationException $e) {
            Log::error('Stripe webhook signature verification failed', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Invalid signature'], 400);

        } catch (\Exception $e) {
            Log::error('Stripe webhook processing error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * Handle PayPal webhooks
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function paypal(Request $request): JsonResponse
    {
        $payload = $request->all();

        Log::info('PayPal webhook received', [
            'event_type' => $payload['event_type'] ?? 'unknown',
            'id' => $payload['id'] ?? null,
        ]);

        try {
            // Verify PayPal webhook signature
            if (!$this->verifyPayPalWebhook($request)) {
                return response()->json(['error' => 'Invalid signature'], 400);
            }

            $eventType = $payload['event_type'] ?? null;
            $resource = $payload['resource'] ?? [];

            // Handle different event types
            switch ($eventType) {
                case 'PAYMENT.CAPTURE.COMPLETED':
                    $this->handlePayPalPaymentCompleted($resource);
                    break;

                case 'PAYMENT.CAPTURE.DENIED':
                case 'PAYMENT.CAPTURE.DECLINED':
                    $this->handlePayPalPaymentFailed($resource);
                    break;

                case 'PAYMENT.CAPTURE.REFUNDED':
                    $this->handlePayPalRefund($resource);
                    break;

                default:
                    Log::info('Unhandled PayPal webhook event', ['type' => $eventType]);
            }

            return response()->json(['received' => true], 200);

        } catch (\Exception $e) {
            Log::error('PayPal webhook processing error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * Handle successful Stripe payment intent
     */
    protected function handlePaymentIntentSucceeded($paymentIntent): void
    {
        $payment = Payment::where('payment_intent_id', $paymentIntent->id)->first();

        if ($payment) {
            $payment->update([
                'status' => 'completed',
                'transaction_id' => $paymentIntent->id,
                'metadata' => array_merge($payment->metadata ?? [], [
                    'payment_intent' => $paymentIntent->toArray(),
                ]),
            ]);

            // Update reservation status
            if ($payment->reservation) {
                $payment->reservation->update(['status' => 'confirmed']);
            }

            Log::info('Payment intent succeeded', ['payment_id' => $payment->id]);
        }
    }

    /**
     * Handle failed Stripe payment intent
     */
    protected function handlePaymentIntentFailed($paymentIntent): void
    {
        $payment = Payment::where('payment_intent_id', $paymentIntent->id)->first();

        if ($payment) {
            $payment->update([
                'status' => 'failed',
                'metadata' => array_merge($payment->metadata ?? [], [
                    'failure_reason' => $paymentIntent->last_payment_error->message ?? 'Unknown error',
                ]),
            ]);

            // Update reservation status
            if ($payment->reservation) {
                $payment->reservation->update(['status' => 'cancelled']);
            }

            Log::warning('Payment intent failed', ['payment_id' => $payment->id]);
        }
    }

    /**
     * Handle Stripe charge succeeded
     */
    protected function handleChargeSucceeded($charge): void
    {
        Log::info('Stripe charge succeeded', ['charge_id' => $charge->id]);
    }

    /**
     * Handle Stripe charge failed
     */
    protected function handleChargeFailed($charge): void
    {
        Log::warning('Stripe charge failed', [
            'charge_id' => $charge->id,
            'failure_message' => $charge->failure_message ?? 'Unknown',
        ]);
    }

    /**
     * Handle Stripe charge refunded
     */
    protected function handleChargeRefunded($charge): void
    {
        $payment = Payment::where('transaction_id', $charge->payment_intent)->first();

        if ($payment) {
            $payment->update([
                'status' => 'refunded',
                'refunded_at' => now(),
                'refund_amount' => $charge->amount_refunded / 100,
            ]);

            Log::info('Charge refunded', ['payment_id' => $payment->id]);
        }
    }

    /**
     * Handle Stripe payment method attached
     */
    protected function handlePaymentMethodAttached($paymentMethod): void
    {
        Log::info('Payment method attached', [
            'payment_method_id' => $paymentMethod->id,
            'customer' => $paymentMethod->customer,
        ]);
    }

    /**
     * Handle Stripe subscription events
     */
    protected function handleSubscriptionEvent(string $eventType, $subscription): void
    {
        Log::info('Subscription event', [
            'type' => $eventType,
            'subscription_id' => $subscription->id,
            'status' => $subscription->status,
        ]);
    }

    /**
     * Handle PayPal payment completed
     */
    protected function handlePayPalPaymentCompleted(array $resource): void
    {
        $transactionId = $resource['id'] ?? null;

        if (!$transactionId) {
            return;
        }

        $payment = Payment::where('transaction_id', $transactionId)
            ->orWhere('payment_intent_id', $transactionId)
            ->first();

        if ($payment) {
            $payment->update([
                'status' => 'completed',
                'metadata' => array_merge($payment->metadata ?? [], [
                    'paypal_resource' => $resource,
                ]),
            ]);

            if ($payment->reservation) {
                $payment->reservation->update(['status' => 'confirmed']);
            }

            Log::info('PayPal payment completed', ['payment_id' => $payment->id]);
        }
    }

    /**
     * Handle PayPal payment failed
     */
    protected function handlePayPalPaymentFailed(array $resource): void
    {
        $transactionId = $resource['id'] ?? null;

        if (!$transactionId) {
            return;
        }

        $payment = Payment::where('transaction_id', $transactionId)
            ->orWhere('payment_intent_id', $transactionId)
            ->first();

        if ($payment) {
            $payment->update([
                'status' => 'failed',
                'metadata' => array_merge($payment->metadata ?? [], [
                    'failure_reason' => $resource['status_details']['reason'] ?? 'Unknown',
                ]),
            ]);

            if ($payment->reservation) {
                $payment->reservation->update(['status' => 'cancelled']);
            }

            Log::warning('PayPal payment failed', ['payment_id' => $payment->id]);
        }
    }

    /**
     * Handle PayPal refund
     */
    protected function handlePayPalRefund(array $resource): void
    {
        $captureId = $resource['links'][0]['href'] ?? null;

        if ($captureId) {
            // Extract capture ID from URL
            preg_match('/captures\/(.+)/', $captureId, $matches);
            $captureId = $matches[1] ?? null;
        }

        if ($captureId) {
            $payment = Payment::where('transaction_id', $captureId)->first();

            if ($payment) {
                $payment->update([
                    'status' => 'refunded',
                    'refunded_at' => now(),
                    'refund_amount' => ($resource['amount']['value'] ?? 0),
                ]);

                Log::info('PayPal refund processed', ['payment_id' => $payment->id]);
            }
        }
    }

    /**
     * Verify PayPal webhook signature
     */
    protected function verifyPayPalWebhook(Request $request): bool
    {
        // PayPal webhook verification implementation
        // This requires PayPal SDK and certificate verification
        // For now, we'll return true as a placeholder

        // TODO: Implement proper PayPal webhook verification
        // https://developer.paypal.com/docs/api-basics/notifications/webhooks/notification-messages/#verify-signature

        return true;
    }
}
