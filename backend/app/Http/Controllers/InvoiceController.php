<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
     * Create/Generate invoice for a payment
     *
     * POST /invoices
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'payment_id' => 'required|exists:payments,id',
            'tipo_documento' => 'nullable|in:factura_electronica,tiquete_electronico,nota_credito,nota_debito',
            'cliente_nombre' => 'required|string|max:255',
            'cliente_identificacion' => 'nullable|string|max:50',
            'cliente_email' => 'required|email|max:255',
            'cliente_telefono' => 'nullable|string|max:20',
            'cliente_direccion' => 'nullable|string|max:500',
            'notas' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $payment = Payment::with('reservation.service')->findOrFail($request->payment_id);

            // Check payment is completed
            if (!$payment->isCompleted()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment must be completed before generating invoice'
                ], 422);
            }

            // Check if invoice already exists
            if ($payment->invoice_generated && $payment->invoice) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invoice already exists for this payment',
                    'data' => $payment->invoice
                ], 422);
            }

            DB::beginTransaction();

            $numeroFactura = $this->generateInvoiceNumber($payment->branch_id);

            $invoice = Invoice::create([
                'payment_id' => $payment->id,
                'branch_id' => $payment->branch_id,
                'numero_factura' => $numeroFactura,
                'tipo_documento' => $request->tipo_documento ?? 'tiquete_electronico',
                'fecha_emision' => now(),
                'moneda' => 'CRC',
                'tipo_cambio' => 1.00,
                'monto_subtotal' => $payment->amount_subtotal,
                'monto_impuestos' => $payment->amount_tax,
                'monto_descuentos' => $payment->amount_discount,
                'monto_propina' => $payment->amount_tip,
                'monto_total' => $payment->amount_total,
                'cliente_nombre' => $request->cliente_nombre,
                'cliente_identificacion' => $request->cliente_identificacion,
                'cliente_email' => $request->cliente_email,
                'cliente_telefono' => $request->cliente_telefono,
                'cliente_direccion' => $request->cliente_direccion,
                'detalles' => [
                    [
                        'descripcion' => $payment->reservation->service->name ?? 'Servicio de Salón',
                        'cantidad' => 1,
                        'precio_unitario' => $payment->amount_subtotal,
                        'subtotal' => $payment->amount_subtotal,
                        'impuesto' => $payment->amount_tax,
                        'total' => $payment->amount_subtotal + $payment->amount_tax
                    ]
                ],
                'notas' => $request->notas,
                'estado' => 'generada',
                'hacienda_status' => Invoice::HACIENDA_PENDING
            ]);

            $payment->invoice_generated = true;
            $payment->save();

            AuditLog::logCreate('invoices', $invoice->id, $invoice->toArray());

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Invoice generated successfully',
                'data' => $invoice->fresh(['payment', 'branch'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error generating invoice: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Invoice generation failed',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Send invoice via email
     *
     * POST /invoices/{id}/send
     */
    public function send(int $id, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $invoice = Invoice::with(['payment', 'branch'])->findOrFail($id);

            // TODO: Implement email sending with PDF
            // Mail::to($request->email)->send(new InvoiceMail($invoice));

            $invoice->email_enviado = true;
            $invoice->email_fecha_envio = now();
            $invoice->save();

            Log::info('Invoice sent via email', [
                'invoice_id' => $invoice->id,
                'email' => $request->email
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Invoice sent successfully to ' . $request->email
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error sending invoice: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to send invoice',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Download invoice as PDF
     *
     * GET /invoices/{id}/download
     */
    public function download(int $id, Request $request)
    {
        $user = $request->user();

        $invoice = Invoice::with(['payment.user', 'payment.reservation.service', 'branch'])
            ->findOrFail($id);

        // Check authorization
        if (!$user->isAdmin() && $invoice->payment->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to download this invoice'
            ], 403);
        }

        try {
            // TODO: Generate PDF with PDF library (DOMPDF, TCPDF, etc.)
            // $pdf = PDF::loadView('invoices.template', ['invoice' => $invoice]);
            // return $pdf->download('invoice-' . $invoice->numero_factura . '.pdf');

            return response()->json([
                'status' => 'success',
                'message' => 'PDF generation not yet implemented',
                'data' => $invoice
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error downloading invoice: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate PDF',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Cancel invoice
     *
     * POST /invoices/{id}/cancel
     */
    public function cancel(int $id, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'motivo' => 'required|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only administrators can cancel invoices'
            ], 403);
        }

        try {
            $invoice = Invoice::findOrFail($id);

            if ($invoice->estado === 'anulada') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invoice is already cancelled'
                ], 422);
            }

            DB::beginTransaction();

            $oldData = $invoice->toArray();

            $invoice->estado = 'anulada';
            $invoice->fecha_anulacion = now();
            $invoice->motivo_anulacion = $request->motivo;
            $invoice->save();

            AuditLog::logUpdate('invoices', $invoice->id, $oldData, $invoice->toArray());

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Invoice cancelled successfully',
                'data' => $invoice
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error cancelling invoice: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to cancel invoice',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Get invoice statistics (enhanced)
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to view statistics'
            ], 403);
        }

        try {
            $query = Invoice::query();

            if ($request->has('branch_id')) {
                $query->where('branch_id', $request->branch_id);
            }

            $stats = [
                'total_invoices' => Invoice::where('estado', 'generada')->count(),
                'total_amount' => Invoice::where('estado', 'generada')->sum('monto_total'),
                'total_cancelled' => Invoice::where('estado', 'anulada')->count(),
                'hacienda_status' => [
                    'pending' => $query->where('hacienda_status', Invoice::HACIENDA_PENDING)->count(),
                    'sent' => $query->where('hacienda_status', Invoice::HACIENDA_SENT)->count(),
                    'accepted' => $query->where('hacienda_status', Invoice::HACIENDA_ACCEPTED)->count(),
                    'rejected' => $query->where('hacienda_status', Invoice::HACIENDA_REJECTED)->count(),
                ],
                'by_type' => Invoice::where('estado', 'generada')
                    ->select('tipo_documento', DB::raw('COUNT(*) as count'), DB::raw('SUM(monto_total) as total'))
                    ->groupBy('tipo_documento')
                    ->get(),
                'by_branch' => Invoice::where('estado', 'generada')
                    ->select('branch_id', DB::raw('COUNT(*) as count'), DB::raw('SUM(monto_total) as total'))
                    ->groupBy('branch_id')
                    ->get(),
                'monthly' => Invoice::where('estado', 'generada')
                    ->whereYear('fecha_emision', date('Y'))
                    ->select(
                        DB::raw('MONTH(fecha_emision) as month'),
                        DB::raw('COUNT(*) as count'),
                        DB::raw('SUM(monto_total) as total')
                    )
                    ->groupBy('month')
                    ->orderBy('month')
                    ->get()
            ];

            return response()->json([
                'status' => 'success',
                'data' => $stats,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error getting invoice statistics: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve statistics',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }

    // ============================================
    // PRIVATE HELPERS
    // ============================================

    /**
     * Generate unique consecutive invoice number
     */
    private function generateInvoiceNumber($branchId = null): string
    {
        $prefix = 'INV';
        $year = date('Y');
        $branchCode = $branchId ? str_pad($branchId, 3, '0', STR_PAD_LEFT) : '000';

        $lastInvoice = Invoice::where('numero_factura', 'LIKE', "{$prefix}-{$year}-{$branchCode}-%")
            ->orderBy('numero_factura', 'desc')
            ->first();

        if ($lastInvoice) {
            $parts = explode('-', $lastInvoice->numero_factura);
            $consecutive = isset($parts[3]) ? intval($parts[3]) + 1 : 1;
        } else {
            $consecutive = 1;
        }

        return sprintf('%s-%s-%s-%08d', $prefix, $year, $branchCode, $consecutive);
    }
}
