<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Reservation;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
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
}
