<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

/**
 * Audit Log Controller
 *
 * Provides audit trail and activity logging for administrators
 */
class AuditLogController extends Controller
{
    /**
     * List audit logs (super admin only)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = AuditLog::with('user');

        // Filters
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        if ($request->has('table_name')) {
            $query->where('table_name', $request->table_name);
        }

        if ($request->has('record_id')) {
            $query->where('record_id', $request->record_id);
        }

        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Search by IP address
        if ($request->has('ip_address')) {
            $query->where('ip_address', $request->ip_address);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(50);

        return response()->json([
            'status' => 'success',
            'data' => $logs,
        ], 200);
    }

    /**
     * Get current user's audit logs
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function mine(Request $request)
    {
        $user = $request->user();

        $logs = AuditLog::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $logs,
        ], 200);
    }

    /**
     * Get audit log details
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $id)
    {
        $log = AuditLog::with('user')->find($id);

        if (!$log) {
            return response()->json([
                'status' => 'error',
                'message' => 'Audit log not found',
            ], 404);
        }

        // Include changes summary
        $data = $log->toArray();
        $data['changes'] = $log->getChanges();

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ], 200);
    }

    /**
     * Get audit statistics
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function stats(Request $request)
    {
        $query = AuditLog::query();

        // Apply date range if provided
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $stats = [
            'total_actions' => $query->count(),
            'by_action' => AuditLog::selectRaw('action, COUNT(*) as count')
                ->groupBy('action')
                ->pluck('count', 'action'),
            'by_table' => AuditLog::selectRaw('table_name, COUNT(*) as count')
                ->groupBy('table_name')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->pluck('count', 'table_name'),
            'recent_activity' => $query->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(['id', 'user_id', 'action', 'table_name', 'created_at']),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $stats,
        ], 200);
    }
}
