<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    /**
     * Get user profile
     */
    public function show(Request $request)
    {
        $profile = Profile::where('user_id', $request->user()->id)->first();

        if (!$profile) {
            return response()->json(['error' => 'Profile not found'], 404);
        }

        return response()->json(['profile' => $profile]);
    }

    /**
     * Create or update user profile
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:500',
            'avatar_url' => 'nullable|string|url',
            'specialization' => 'nullable|string|max:255',
            'experience_years' => 'nullable|integer|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $profile = Profile::updateOrCreate(
            ['user_id' => $request->user()->id],
            $request->only('phone', 'bio', 'avatar_url', 'specialization', 'experience_years')
        );

        return response()->json([
            'message' => 'Profile updated successfully',
            'profile' => $profile,
        ]);
    }

    /**
     * Get profile by user ID (for viewing other profiles)
     */
    public function getByUserId($userId)
    {
        $profile = Profile::where('user_id', $userId)->first();

        if (!$profile) {
            return response()->json(['error' => 'Profile not found'], 404);
        }

        return response()->json(['profile' => $profile]);
    }

    /**
     * Get all stylists with their profiles
     */
    public function getStylistProfiles()
    {
        $stylists = Profile::whereHas('user', function ($query) {
            $query->where('role', 'stylist')->where('is_active', true);
        })->get();

        return response()->json(['stylists' => $stylists]);
    }
}
