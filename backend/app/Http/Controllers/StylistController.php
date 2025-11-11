<?php

namespace App\Http\Controllers;

use App\Models\Stylist;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Stylist Controller
 *
 * Manages stylist profiles and operations
 */
class StylistController extends Controller
{
    /**
     * List all stylists with filters
     */
    public function index(Request $request)
    {
        $query = Stylist::with(['user', 'branch']);

        // Filters
        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active === 'true');
        }

        if ($request->has('specialty')) {
            $query->where('specialty', 'like', '%' . $request->specialty . '%');
        }

        if ($request->has('min_rating')) {
            $query->where('average_rating', '>=', $request->min_rating);
        }

        // Search by name
        if ($request->has('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        $stylists = $query->orderBy('average_rating', 'desc')->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => $stylists,
        ], 200);
    }

    /**
     * Get stylist profile with portfolio
     */
    public function show(int $id)
    {
        $stylist = Stylist::with(['user', 'branch', 'availabilities'])->find($id);

        if (!$stylist) {
            return response()->json([
                'status' => 'error',
                'message' => 'Stylist not found',
            ], 404);
        }

        // Get reviews for this stylist
        $reviews = \App\Models\Review::where('stylist_id', $id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $data = $stylist->toArray();
        $data['recent_reviews'] = $reviews;

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ], 200);
    }

    /**
     * Get stylist reviews
     */
    public function reviews(int $id)
    {
        $stylist = Stylist::find($id);

        if (!$stylist) {
            return response()->json([
                'status' => 'error',
                'message' => 'Stylist not found',
            ], 404);
        }

        $reviews = \App\Models\Review::where('stylist_id', $id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => $reviews,
        ], 200);
    }

    /**
     * Create review for stylist
     */
    public function createReview(int $id, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'reservation_id' => 'required|exists:reservations,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $stylist = Stylist::find($id);

            if (!$stylist) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Stylist not found',
                ], 404);
            }

            $review = \App\Models\Review::create([
                'user_id' => $request->user()->id,
                'reservation_id' => $request->reservation_id,
                'stylist_id' => $stylist->id,
                'branch_id' => $stylist->branch_id,
                'rating' => $request->rating,
                'comment' => $request->comment,
                'is_verified' => false,
            ]);

            AuditLog::logCreate('reviews', $review->id, $review->toArray());

            return response()->json([
                'status' => 'success',
                'message' => 'Review created successfully',
                'data' => $review,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Review creation failed',
                'errors' => ['server' => [$e->getMessage()]],
            ], 500);
        }
    }

    /**
     * Update stylist availability
     */
    public function updateAvailability(int $id, Request $request)
    {
        $stylist = Stylist::find($id);

        if (!$stylist) {
            return response()->json([
                'status' => 'error',
                'message' => 'Stylist not found',
            ], 404);
        }

        // Check authorization
        $user = $request->user();
        if ($stylist->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'is_active' => 'required|boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $oldData = $stylist->toArray();
            $stylist->update($request->only(['is_active', 'start_date', 'end_date']));

            AuditLog::logUpdate('stylists', $stylist->id, $oldData, $stylist->fresh()->toArray());

            return response()->json([
                'status' => 'success',
                'message' => 'Availability updated successfully',
                'data' => $stylist,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Update failed',
                'errors' => ['server' => [$e->getMessage()]],
            ], 500);
        }
    }
}
