<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Reservation;
use App\Models\AuditLog;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Payment Controller
 *
 * Handles payment operations including creation, viewing, and refunds
 * (Stripe integration will be added later)
 */
class PaymentController extends Controller
{
    /**
     * List all payments for authenticated user or all payments (admin)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Payment::with(['reservation', 'user', 'branch']);

        // Filter by user if not admin
        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => $payments,
        ], 200);
    }

    /**
     * Get payment details
     *
     * @param int $id
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $id, Request $request)
    {
        $user = $request->user();

        $payment = Payment::with(['reservation', 'user', 'branch', 'invoice'])->find($id);

        if (!$payment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment not found',
            ], 404);
        }

        // Check authorization
        if (!$user->isAdmin() && $payment->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to view this payment',
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $payment,
        ], 200);
    }

    /**
     * Create a new payment
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reservation_id' => 'required|exists:reservations,id',
            'payment_method' => 'required|in:credit_card,debit_card,cash,bank_transfer,paypal,digital_wallet,cryptocurrency',
            'payment_provider' => 'required|in:stripe,paypal,manual,other',
            'amount_subtotal' => 'required|numeric|min:0',
            'amount_tip' => 'nullable|numeric|min:0',
            'amount_discount' => 'nullable|numeric|min:0',
            'amount_tax' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $reservation = Reservation::find($request->reservation_id);

            // Check if payment already exists for this reservation
            if (Payment::where('reservation_id', $reservation->id)->exists()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment already exists for this reservation',
                ], 422);
            }

            // Calculate totals
            $subtotal = $request->amount_subtotal;
            $tip = $request->amount_tip ?? 0;
            $discount = $request->amount_discount ?? 0;
            $tax = $request->amount_tax ?? 0;
            $total = $subtotal + $tip + $tax - $discount;

            // Calculate commissions (example: 20% platform fee)
            $commissionPercentage = 20; // This should come from config or branch plan
            $commissionPlatform = $total * ($commissionPercentage / 100);
            $amountBranch = $total - $commissionPlatform;
            $amountStylist = $amountBranch * 0.7; // 70% to stylist, 30% to branch

            $payment = Payment::create([
                'codigo_transaccion' => $this->generateTransactionCode(),
                'reservation_id' => $reservation->id,
                'user_id' => $request->user()->id,
                'branch_id' => $reservation->branch_id ?? null,
                'amount_subtotal' => $subtotal,
                'amount_tip' => $tip,
                'amount_discount' => $discount,
                'amount_tax' => $tax,
                'amount_total' => $total,
                'payment_method' => $request->payment_method,
                'payment_provider' => $request->payment_provider,
                'status' => Payment::STATUS_PENDING,
                'commission_platform' => $commissionPlatform,
                'commission_percentage' => $commissionPercentage,
                'amount_stylist' => $amountStylist,
                'amount_branch' => $amountBranch - $amountStylist,
                'requires_invoice' => true,
                'invoice_generated' => false,
                'client_ip' => $request->ip(),
                'browser' => $request->userAgent(),
            ]);

            // Log payment creation
            AuditLog::logCreate('payments', $payment->id, $payment->toArray());

            return response()->json([
                'status' => 'success',
                'message' => 'Payment created successfully',
                'data' => $payment,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment creation failed',
                'errors' => ['server' => [$e->getMessage()]],
            ], 500);
        }
    }

    /**
     * Initiate a refund
     *
     * @param int $id
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function refund(int $id, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'refund_amount' => 'required|numeric|min:0',
            'refund_reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $payment = Payment::find($id);

            if (!$payment) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment not found',
                ], 404);
            }

            if (!$payment->canBeRefunded()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment cannot be refunded',
                ], 422);
            }

            if ($request->refund_amount > $payment->amount_total) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Refund amount exceeds payment total',
                ], 422);
            }

            $oldData = $payment->toArray();

            // Update payment status
            $isPartialRefund = $request->refund_amount < $payment->amount_total;
            $payment->status = $isPartialRefund ? Payment::STATUS_PARTIALLY_REFUNDED : Payment::STATUS_REFUNDED;
            $payment->refund_amount = $request->refund_amount;
            $payment->refund_date = now();
            $payment->refund_reason = $request->refund_reason;
            $payment->refund_processed_by = $request->user()->id;
            $payment->save();

            // Log refund
            AuditLog::logUpdate('payments', $payment->id, $oldData, $payment->toArray());

            return response()->json([
                'status' => 'success',
                'message' => 'Refund processed successfully',
                'data' => $payment,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Refund failed',
                'errors' => ['server' => [$e->getMessage()]],
            ], 500);
        }
    }

    /**
     * Confirm a pending payment
     *
     * POST /payments/{id}/confirm
     *
     * @param int $id
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function confirm(int $id, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'transaction_reference' => 'nullable|string|max:255',
            'metadata' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = $request->user();
            $payment = Payment::find($id);

            if (!$payment) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment not found',
                ], 404);
            }

            // Check authorization
            if (!$user->isAdmin() && $payment->user_id !== $user->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to confirm this payment',
                ], 403);
            }

            if ($payment->status !== Payment::STATUS_PENDING) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment has already been processed',
                ], 422);
            }

            DB::beginTransaction();

            $oldData = $payment->toArray();

            // Update payment
            $payment->status = Payment::STATUS_COMPLETED;
            $payment->transaction_reference = $request->transaction_reference ?? null;
            $payment->processed_at = now();

            if ($request->has('metadata')) {
                $payment->metadata = array_merge($payment->metadata ?? [], $request->metadata);
            }

            $payment->save();

            // Update reservation status
            $reservation = $payment->reservation;
            $reservation->status = 'confirmed';
            $reservation->save();

            // Generate invoice if required
            if ($payment->requires_invoice && !$payment->invoice_generated) {
                Invoice::create([
                    'payment_id' => $payment->id,
                    'branch_id' => $payment->branch_id,
                    'numero_factura' => 'INV-' . str_pad($payment->id, 8, '0', STR_PAD_LEFT),
                    'fecha_emision' => now(),
                    'monto_subtotal' => $payment->amount_subtotal,
                    'monto_impuestos' => $payment->amount_tax,
                    'monto_descuentos' => $payment->amount_discount,
                    'monto_total' => $payment->amount_total,
                    'estado' => 'generada'
                ]);

                $payment->invoice_generated = true;
                $payment->save();
            }

            // Log confirmation
            AuditLog::logUpdate('payments', $payment->id, $oldData, $payment->toArray());

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Payment confirmed successfully',
                'data' => $payment->fresh(['invoice', 'reservation']),
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error confirming payment: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Payment confirmation failed',
                'errors' => ['server' => [$e->getMessage()]],
            ], 500);
        }
    }

    /**
     * Get payment statistics (Admin only)
     *
     * GET /payments/statistics
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function statistics(Request $request)
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to view statistics',
            ], 403);
        }

        try {
            $stats = [
                'total_revenue' => Payment::where('status', Payment::STATUS_COMPLETED)->sum('amount_total'),
                'total_refunded' => Payment::whereIn('status', [Payment::STATUS_REFUNDED, Payment::STATUS_PARTIALLY_REFUNDED])
                    ->sum('refund_amount'),
                'total_pending' => Payment::where('status', Payment::STATUS_PENDING)->sum('amount_total'),
                'payment_count' => Payment::where('status', Payment::STATUS_COMPLETED)->count(),
                'average_transaction' => Payment::where('status', Payment::STATUS_COMPLETED)->avg('amount_total'),
                'average_tip' => Payment::where('status', Payment::STATUS_COMPLETED)->avg('amount_tip'),
                'by_method' => Payment::where('status', Payment::STATUS_COMPLETED)
                    ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount_total) as total'))
                    ->groupBy('payment_method')
                    ->get(),
                'by_provider' => Payment::where('status', Payment::STATUS_COMPLETED)
                    ->select('payment_provider', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount_total) as total'))
                    ->groupBy('payment_provider')
                    ->get(),
                'monthly_revenue' => Payment::where('status', Payment::STATUS_COMPLETED)
                    ->whereYear('created_at', date('Y'))
                    ->select(DB::raw('MONTH(created_at) as month'), DB::raw('SUM(amount_total) as total'))
                    ->groupBy('month')
                    ->orderBy('month')
                    ->get(),
                'platform_commission_total' => Payment::where('status', Payment::STATUS_COMPLETED)
                    ->sum('commission_platform'),
            ];

            return response()->json([
                'status' => 'success',
                'data' => $stats,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error getting payment statistics: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve statistics',
                'errors' => ['server' => [$e->getMessage()]],
            ], 500);
        }
    }

    /**
     * Stripe webhook handler
     *
     * POST /payments/webhook/stripe
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function stripeWebhook(Request $request)
    {
        // TODO: Implement Stripe signature validation
        $payload = $request->all();

        Log::info('Stripe webhook received', ['event' => $payload['type'] ?? 'unknown']);

        try {
            $event = $payload['type'] ?? null;

            switch ($event) {
                case 'payment_intent.succeeded':
                    $this->handleStripePaymentSuccess($payload['data']['object']);
                    break;

                case 'payment_intent.payment_failed':
                    $this->handleStripePaymentFailed($payload['data']['object']);
                    break;

                case 'charge.refunded':
                    $this->handleStripeRefund($payload['data']['object']);
                    break;

                default:
                    Log::info('Unhandled Stripe webhook event: ' . $event);
            }

            return response()->json(['success' => true], 200);

        } catch (\Exception $e) {
            Log::error('Error processing Stripe webhook: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * PayPal webhook handler
     *
     * POST /payments/webhook/paypal
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function paypalWebhook(Request $request)
    {
        // TODO: Implement PayPal signature validation
        $payload = $request->all();

        Log::info('PayPal webhook received', ['event' => $payload['event_type'] ?? 'unknown']);

        try {
            $event = $payload['event_type'] ?? null;

            switch ($event) {
                case 'PAYMENT.CAPTURE.COMPLETED':
                    $this->handlePayPalPaymentSuccess($payload['resource']);
                    break;

                case 'PAYMENT.CAPTURE.DENIED':
                    $this->handlePayPalPaymentFailed($payload['resource']);
                    break;

                default:
                    Log::info('Unhandled PayPal webhook event: ' . $event);
            }

            return response()->json(['success' => true], 200);

        } catch (\Exception $e) {
            Log::error('Error processing PayPal webhook: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Generate unique transaction code
     *
     * @return string
     */
    private function generateTransactionCode(): string
    {
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(8));
        return "PAY-{$date}-{$random}";
    }

    // ============================================
    // PRIVATE WEBHOOK HANDLERS
    // ============================================

    private function handleStripePaymentSuccess($paymentIntent)
    {
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent['id'])->first();

        if ($payment && $payment->status === Payment::STATUS_PENDING) {
            $oldData = $payment->toArray();

            $payment->status = Payment::STATUS_COMPLETED;
            $payment->stripe_charge_id = $paymentIntent['latest_charge'] ?? null;
            $payment->processed_at = now();
            $payment->save();

            AuditLog::logUpdate('payments', $payment->id, $oldData, $payment->toArray());

            Log::info('Stripe payment succeeded', ['payment_id' => $payment->id]);
        }
    }

    private function handleStripePaymentFailed($paymentIntent)
    {
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent['id'])->first();

        if ($payment && $payment->status === Payment::STATUS_PENDING) {
            $oldData = $payment->toArray();

            $payment->status = Payment::STATUS_FAILED;
            $payment->failure_reason = $paymentIntent['last_payment_error']['message'] ?? 'Unknown error';
            $payment->save();

            AuditLog::logUpdate('payments', $payment->id, $oldData, $payment->toArray());

            Log::warning('Stripe payment failed', ['payment_id' => $payment->id, 'reason' => $payment->failure_reason]);
        }
    }

    private function handleStripeRefund($charge)
    {
        $payment = Payment::where('stripe_charge_id', $charge['id'])->first();

        if ($payment && $payment->isCompleted()) {
            $oldData = $payment->toArray();

            $refundAmount = $charge['amount_refunded'] / 100; // Stripe uses cents

            $payment->status = $refundAmount >= $payment->amount_total
                ? Payment::STATUS_REFUNDED
                : Payment::STATUS_PARTIALLY_REFUNDED;
            $payment->refund_amount = $refundAmount;
            $payment->refund_date = now();
            $payment->refund_reason = 'Stripe webhook refund';
            $payment->save();

            AuditLog::logUpdate('payments', $payment->id, $oldData, $payment->toArray());

            Log::info('Stripe refund processed', ['payment_id' => $payment->id, 'amount' => $refundAmount]);
        }
    }

    private function handlePayPalPaymentSuccess($resource)
    {
        $orderId = $resource['supplementary_data']['related_ids']['order_id'] ?? null;

        if (!$orderId) {
            Log::warning('PayPal webhook: Missing order_id');
            return;
        }

        $payment = Payment::where('paypal_order_id', $orderId)->first();

        if ($payment && $payment->status === Payment::STATUS_PENDING) {
            $oldData = $payment->toArray();

            $payment->status = Payment::STATUS_COMPLETED;
            $payment->paypal_capture_id = $resource['id'];
            $payment->processed_at = now();
            $payment->save();

            AuditLog::logUpdate('payments', $payment->id, $oldData, $payment->toArray());

            Log::info('PayPal payment succeeded', ['payment_id' => $payment->id]);
        }
    }

    private function handlePayPalPaymentFailed($resource)
    {
        $orderId = $resource['supplementary_data']['related_ids']['order_id'] ?? null;

        if (!$orderId) {
            Log::warning('PayPal webhook: Missing order_id');
            return;
        }

        $payment = Payment::where('paypal_order_id', $orderId)->first();

        if ($payment && $payment->status === Payment::STATUS_PENDING) {
            $oldData = $payment->toArray();

            $payment->status = Payment::STATUS_FAILED;
            $payment->failure_reason = $resource['status_details']['reason'] ?? 'Unknown PayPal error';
            $payment->save();

            AuditLog::logUpdate('payments', $payment->id, $oldData, $payment->toArray());

            Log::warning('PayPal payment failed', ['payment_id' => $payment->id, 'reason' => $payment->failure_reason]);
        }
    }
}
