<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Store a new review for a completed reservation
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'reservation_id' => 'required|exists:reservations,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
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

            // Verify user is the client of this reservation
            if ($reservation->client_id !== $user->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to review this reservation',
                ], 403);
            }

            // Can only review completed reservations
            if ($reservation->status !== 'completed') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Can only review completed reservations',
                ], 400);
            }

            // Check if already reviewed
            if ($reservation->review) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This reservation has already been reviewed',
                ], 400);
            }

            $review = Review::create([
                'reservation_id' => $request->reservation_id,
                'stylist_id' => $reservation->stylist_id,
                'client_id' => $user->id,
                'rating' => $request->rating,
                'comment' => $request->comment,
                'is_approved' => true, // Auto-approve for now
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Review created successfully',
                'data' => ['review' => $review],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create review',
                'errors' => ['server' => ['An error occurred']],
            ], 500);
        }
    }

    /**
     * Update an existing review
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $review = Review::find($id);

        if (!$review) {
            return response()->json([
                'status' => 'error',
                'message' => 'Review not found',
            ], 404);
        }

        // Only the client who created the review can update it
        if ($review->client_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to update this review',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'sometimes|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $review->update($request->only(['rating', 'comment']));

            return response()->json([
                'status' => 'success',
                'message' => 'Review updated successfully',
                'data' => ['review' => $review],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update review',
                'errors' => ['server' => ['An error occurred']],
            ], 500);
        }
    }

    /**
     * Delete a review
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $review = Review::find($id);

        if (!$review) {
            return response()->json([
                'status' => 'error',
                'message' => 'Review not found',
            ], 404);
        }

        // Only the client who created it or admin can delete
        if ($review->client_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to delete this review',
            ], 403);
        }

        try {
            $review->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Review deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete review',
                'errors' => ['server' => ['An error occurred']],
            ], 500);
        }
    }
}
