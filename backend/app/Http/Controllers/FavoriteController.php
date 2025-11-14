<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FavoriteController extends Controller
{
    /**
     * Get all favorites for authenticated user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();

        try {
            $favorites = Favorite::where('user_id', $user->id)
                ->with(['stylist' => function ($query) {
                    $query->select('id', 'name', 'email');
                }])
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => ['favorites' => $favorites],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve favorites',
                'errors' => ['server' => ['An error occurred']],
            ], 500);
        }
    }

    /**
     * Add a stylist to favorites
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'stylist_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Verify the user is a stylist
            $stylist = User::find($request->stylist_id);
            if ($stylist->role !== 'stylist') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User is not a stylist',
                ], 400);
            }

            // Check if already favorited
            $existing = Favorite::where('user_id', $user->id)
                ->where('stylist_id', $request->stylist_id)
                ->first();

            if ($existing) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Stylist is already in favorites',
                ], 400);
            }

            $favorite = Favorite::create([
                'user_id' => $user->id,
                'stylist_id' => $request->stylist_id,
            ]);

            $favorite->load('stylist');

            return response()->json([
                'status' => 'success',
                'message' => 'Stylist added to favorites',
                'data' => ['favorite' => $favorite],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to add favorite',
                'errors' => ['server' => ['An error occurred']],
            ], 500);
        }
    }

    /**
     * Remove a stylist from favorites
     *
     * @param int $id - Favorite ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $favorite = Favorite::find($id);

        if (!$favorite) {
            return response()->json([
                'status' => 'error',
                'message' => 'Favorite not found',
            ], 404);
        }

        // Only the owner can delete their favorite
        if ($favorite->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to remove this favorite',
            ], 403);
        }

        try {
            $favorite->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Stylist removed from favorites',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to remove favorite',
                'errors' => ['server' => ['An error occurred']],
            ], 500);
        }
    }
}
