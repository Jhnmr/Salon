<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Branch Controller
 *
 * Manages salon branches (sucursales)
 */
class BranchController extends Controller
{
    /**
     * List all branches
     */
    public function index(Request $request)
    {
        $query = Branch::with(['admin', 'stylists']);

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('country')) {
            $query->where('country', $request->country);
        }

        if ($request->has('verified')) {
            $query->where('verified', $request->verified === 'true');
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $branches = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => $branches,
        ], 200);
    }

    /**
     * Get branch details
     */
    public function show(int $id)
    {
        $branch = Branch::with(['admin', 'stylists', 'services'])->find($id);

        if (!$branch) {
            return response()->json([
                'status' => 'error',
                'message' => 'Branch not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $branch,
        ], 200);
    }

    /**
     * Create new branch
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'admin_id' => 'required|exists:users,id',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'country' => 'nullable|string|size:2',
            'currency' => 'nullable|string|size:3',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $branch = Branch::create([
                'name' => $request->name,
                'slug' => Str::slug($request->name) . '-' . Str::random(6),
                'admin_id' => $request->admin_id,
                'phone' => $request->phone,
                'email' => $request->email,
                'address' => $request->address,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'country' => $request->country ?? 'CR',
                'currency' => $request->currency ?? 'CRC',
                'timezone' => $request->timezone ?? 'America/Costa_Rica',
                'status' => Branch::STATUS_PENDING,
                'verified' => false,
            ]);

            AuditLog::logCreate('branches', $branch->id, $branch->toArray());

            return response()->json([
                'status' => 'success',
                'message' => 'Branch created successfully',
                'data' => $branch,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Branch creation failed',
                'errors' => ['server' => [$e->getMessage()]],
            ], 500);
        }
    }

    /**
     * Update branch
     */
    public function update(int $id, Request $request)
    {
        $branch = Branch::find($id);

        if (!$branch) {
            return response()->json([
                'status' => 'error',
                'message' => 'Branch not found',
            ], 404);
        }

        // Check authorization
        $user = $request->user();
        if (!$user->isSuperAdmin() && $branch->admin_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to update this branch',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $oldData = $branch->toArray();
            $branch->update($request->only([
                'name', 'phone', 'email', 'address', 'latitude', 'longitude',
                'description', 'logo', 'photos', 'hours', 'closed_days'
            ]));

            AuditLog::logUpdate('branches', $branch->id, $oldData, $branch->fresh()->toArray());

            return response()->json([
                'status' => 'success',
                'message' => 'Branch updated successfully',
                'data' => $branch,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Update failed',
                'errors' => ['server' => [$e->getMessage()]],
            ], 500);
        }
    }

    /**
     * Delete branch (soft delete)
     */
    public function destroy(int $id, Request $request)
    {
        $branch = Branch::find($id);

        if (!$branch) {
            return response()->json([
                'status' => 'error',
                'message' => 'Branch not found',
            ], 404);
        }

        try {
            AuditLog::logDelete('branches', $branch->id, $branch->toArray());
            $branch->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Branch deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Deletion failed',
                'errors' => ['server' => [$e->getMessage()]],
            ], 500);
        }
    }

    /**
     * Activate branch
     *
     * POST /branches/{id}/activate
     */
    public function activate(int $id, Request $request)
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only administrators can activate branches'
            ], 403);
        }

        try {
            $branch = Branch::findOrFail($id);
            $oldData = $branch->toArray();

            $branch->status = Branch::STATUS_ACTIVE;
            $branch->save();

            AuditLog::logUpdate('branches', $branch->id, $oldData, $branch->toArray());

            return response()->json([
                'status' => 'success',
                'message' => 'Branch activated successfully',
                'data' => $branch
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error activating branch: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to activate branch',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Deactivate branch
     *
     * POST /branches/{id}/deactivate
     */
    public function deactivate(int $id, Request $request)
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only administrators can deactivate branches'
            ], 403);
        }

        try {
            $branch = Branch::findOrFail($id);
            $oldData = $branch->toArray();

            $branch->status = Branch::STATUS_INACTIVE;
            $branch->save();

            AuditLog::logUpdate('branches', $branch->id, $oldData, $branch->toArray());

            return response()->json([
                'status' => 'success',
                'message' => 'Branch deactivated successfully',
                'data' => $branch
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error deactivating branch: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to deactivate branch',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Verify branch
     *
     * POST /branches/{id}/verify
     */
    public function verify(int $id, Request $request)
    {
        $user = $request->user();

        if (!$user->isSuperAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only super administrators can verify branches'
            ], 403);
        }

        try {
            $branch = Branch::findOrFail($id);
            $oldData = $branch->toArray();

            $branch->verified = true;
            $branch->verified_at = now();
            $branch->save();

            AuditLog::logUpdate('branches', $branch->id, $oldData, $branch->toArray());

            return response()->json([
                'status' => 'success',
                'message' => 'Branch verified successfully',
                'data' => $branch
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error verifying branch: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to verify branch',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Get branch statistics (Enhanced)
     */
    public function stats(int $id, Request $request)
    {
        $branch = Branch::find($id);

        if (!$branch) {
            return response()->json([
                'status' => 'error',
                'message' => 'Branch not found',
            ], 404);
        }

        try {
            $stats = [
                'basic' => [
                    'total_stylists' => $branch->stylists()->count(),
                    'active_stylists' => $branch->stylists()->where('is_active', true)->count(),
                    'total_services' => $branch->services()->count(),
                    'active_services' => $branch->services()->where('is_active', true)->count(),
                    'average_rating' => $branch->average_rating ?? 0,
                    'total_reviews' => $branch->total_reviews ?? 0,
                ],
                'financial' => [
                    'total_payments' => $branch->payments()->count(),
                    'completed_payments' => $branch->payments()->where('status', 'completed')->count(),
                    'total_revenue' => $branch->payments()->where('status', 'completed')->sum('amount_total'),
                    'total_commission' => $branch->payments()->where('status', 'completed')->sum('amount_branch'),
                    'pending_revenue' => $branch->payments()->where('status', 'pending')->sum('amount_total'),
                ],
                'reservations' => [
                    'total' => $branch->reservations()->count(),
                    'confirmed' => $branch->reservations()->where('status', 'confirmed')->count(),
                    'completed' => $branch->reservations()->where('status', 'completed')->count(),
                    'cancelled' => $branch->reservations()->where('status', 'cancelled')->count(),
                ],
                'monthly_revenue' => $branch->payments()
                    ->where('status', 'completed')
                    ->whereYear('created_at', date('Y'))
                    ->select(
                        DB::raw('MONTH(created_at) as month'),
                        DB::raw('SUM(amount_total) as total')
                    )
                    ->groupBy('month')
                    ->orderBy('month')
                    ->pluck('total', 'month'),
            ];

            return response()->json([
                'status' => 'success',
                'data' => $stats,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error getting branch statistics: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve statistics',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }
}
