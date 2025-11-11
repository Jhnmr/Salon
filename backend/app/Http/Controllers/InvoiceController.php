<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\AuditLog;
use Illuminate\Http\Request;

/**
 * Invoice Controller
 *
 * Manages invoices and Hacienda integration (Costa Rica)
 */
class InvoiceController extends Controller
{
    /**
     * List invoices
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Invoice::with(['payment', 'branch']);

        // Filter by user's payments if not admin
        if (!$user->isAdmin()) {
            $query->whereHas('payment', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        // Filters
        if ($request->has('hacienda_status')) {
            $query->where('hacienda_status', $request->hacienda_status);
        }

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->has('from_date')) {
            $query->whereDate('issued_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('issued_at', '<=', $request->to_date);
        }

        $invoices = $query->orderBy('issued_at', 'desc')->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => $invoices,
        ], 200);
    }

    /**
     * Get invoice details (with PDF download link)
     */
    public function show(int $id, Request $request)
    {
        $invoice = Invoice::with(['payment.user', 'branch'])->find($id);

        if (!$invoice) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invoice not found',
            ], 404);
        }

        // Check authorization
        $user = $request->user();
        if (!$user->isAdmin() && $invoice->payment->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to view this invoice',
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $invoice,
        ], 200);
    }

    /**
     * Resend invoice to Hacienda
     */
    public function resend(int $id, Request $request)
    {
        $invoice = Invoice::find($id);

        if (!$invoice) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invoice not found',
            ], 404);
        }

        if (!$invoice->canResend()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invoice cannot be resent',
            ], 422);
        }

        try {
            // TODO: Implement actual Hacienda API integration
            // For now, just mark as sent
            $oldData = $invoice->toArray();
            $invoice->markAsSent();

            AuditLog::logUpdate('invoices', $invoice->id, $oldData, $invoice->fresh()->toArray());

            return response()->json([
                'status' => 'success',
                'message' => 'Invoice resent to Hacienda',
                'data' => $invoice,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Resend failed',
                'errors' => ['server' => [$e->getMessage()]],
            ], 500);
        }
    }

    /**
     * Get invoice statistics
     */
    public function stats(Request $request)
    {
        $query = Invoice::query();

        // Filter by branch if specified
        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        $stats = [
            'total_invoices' => $query->count(),
            'pending' => $query->where('hacienda_status', Invoice::HACIENDA_PENDING)->count(),
            'sent' => $query->where('hacienda_status', Invoice::HACIENDA_SENT)->count(),
            'accepted' => $query->where('hacienda_status', Invoice::HACIENDA_ACCEPTED)->count(),
            'rejected' => $query->where('hacienda_status', Invoice::HACIENDA_REJECTED)->count(),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $stats,
        ], 200);
    }
}
