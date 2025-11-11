<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
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
     * Get branch statistics
     */
    public function stats(int $id)
    {
        $branch = Branch::find($id);

        if (!$branch) {
            return response()->json([
                'status' => 'error',
                'message' => 'Branch not found',
            ], 404);
        }

        $stats = [
            'total_stylists' => $branch->stylists()->count(),
            'active_stylists' => $branch->stylists()->where('is_active', true)->count(),
            'total_services' => $branch->services()->count(),
            'total_payments' => $branch->payments()->count(),
            'total_revenue' => $branch->payments()->where('status', 'completed')->sum('amount_total'),
            'average_rating' => $branch->average_rating,
            'total_reviews' => $branch->total_reviews,
        ];

        return response()->json([
            'status' => 'success',
            'data' => $stats,
        ], 200);
    }
}
