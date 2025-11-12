<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
     * Get audit statistics (Enhanced)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to view audit statistics'
            ], 403);
        }

        try {
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
                'by_user' => AuditLog::selectRaw('user_id, COUNT(*) as count')
                    ->whereNotNull('user_id')
                    ->groupBy('user_id')
                    ->orderBy('count', 'desc')
                    ->limit(10)
                    ->with('user:id,name,email')
                    ->get(),
                'by_ip' => AuditLog::selectRaw('ip_address, COUNT(*) as count')
                    ->whereNotNull('ip_address')
                    ->groupBy('ip_address')
                    ->orderBy('count', 'desc')
                    ->limit(10)
                    ->pluck('count', 'ip_address'),
                'recent_activity' => $query->with('user:id,name,email')
                    ->orderBy('created_at', 'desc')
                    ->limit(20)
                    ->get(['id', 'user_id', 'action', 'table_name', 'record_id', 'ip_address', 'created_at']),
                'hourly_distribution' => AuditLog::selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
                    ->whereDate('created_at', '>=', now()->subDays(7))
                    ->groupBy('hour')
                    ->orderBy('hour')
                    ->pluck('count', 'hour'),
            ];

            return response()->json([
                'status' => 'success',
                'data' => $stats,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error getting audit statistics: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve statistics',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Get audit trail for a specific record
     *
     * GET /audit-logs/record/{tableName}/{recordId}
     *
     * @param string $tableName
     * @param int $recordId
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function recordHistory(string $tableName, int $recordId, Request $request)
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to view audit history'
            ], 403);
        }

        try {
            $logs = AuditLog::with('user:id,name,email')
                ->where('table_name', $tableName)
                ->where('record_id', $recordId)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'table' => $tableName,
                    'record_id' => $recordId,
                    'total_changes' => $logs->count(),
                    'history' => $logs
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error getting record history: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve record history',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Clean old audit logs (Admin only)
     *
     * DELETE /audit-logs/cleanup
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function cleanup(Request $request)
    {
        $user = $request->user();

        if (!$user->isSuperAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only super administrators can cleanup audit logs'
            ], 403);
        }

        try {
            // Delete logs older than 1 year (configurable)
            $daysToKeep = $request->input('days', 365);
            $cutoffDate = now()->subDays($daysToKeep);

            $deletedCount = AuditLog::where('created_at', '<', $cutoffDate)->delete();

            Log::info('Audit logs cleanup completed', [
                'deleted_count' => $deletedCount,
                'cutoff_date' => $cutoffDate,
                'performed_by' => $user->id
            ]);

            return response()->json([
                'status' => 'success',
                'message' => "Deleted {$deletedCount} audit logs older than {$daysToKeep} days",
                'data' => [
                    'deleted_count' => $deletedCount,
                    'cutoff_date' => $cutoffDate
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error cleaning up audit logs: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to cleanup audit logs',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }
}
