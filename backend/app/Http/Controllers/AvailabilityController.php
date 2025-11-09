<?php

namespace App\Http\Controllers;

use App\Models\Availability;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AvailabilityController extends Controller
{
    /**
     * Get stylist's availability
     */
    public function show(Request $request, $stylistId)
    {
        $availabilities = Availability::where('stylist_id', $stylistId)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return response()->json(['availabilities' => $availabilities]);
    }

    /**
     * Get current user's availability (if stylist)
     */
    public function myAvailability(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'stylist') {
            return response()->json(['error' => 'Only stylists can have availability'], 403);
        }

        $availabilities = Availability::where('stylist_id', $user->id)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return response()->json(['availabilities' => $availabilities]);
    }

    /**
     * Create or update availability for stylist
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'stylist') {
            return response()->json(['error' => 'Only stylists can set availability'], 403);
        }

        $validator = Validator::make($request->all(), [
            'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_available' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Check if this availability already exists
            $availability = Availability::where('stylist_id', $user->id)
                ->where('day_of_week', $request->day_of_week)
                ->where('start_time', $request->start_time)
                ->where('end_time', $request->end_time)
                ->first();

            if ($availability) {
                // Update existing availability
                $availability->update(['is_available' => $request->get('is_available', true)]);
            } else {
                // Create new availability
                $availability = Availability::create([
                    'stylist_id' => $user->id,
                    'day_of_week' => $request->day_of_week,
                    'start_time' => $request->start_time,
                    'end_time' => $request->end_time,
                    'is_available' => $request->get('is_available', true),
                ]);
            }

            return response()->json([
                'message' => 'Availability saved successfully',
                'availability' => $availability,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to save availability'], 500);
        }
    }

    /**
     * Update availability
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $availability = Availability::find($id);

        if (!$availability) {
            return response()->json(['error' => 'Availability not found'], 404);
        }

        // Check if user is owner or admin
        if ($user->id !== $availability->stylist_id && $user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'day_of_week' => 'sometimes|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i',
            'is_available' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $availability->update($request->only('day_of_week', 'start_time', 'end_time', 'is_available'));

            return response()->json([
                'message' => 'Availability updated successfully',
                'availability' => $availability,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update availability'], 500);
        }
    }

    /**
     * Delete availability
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $availability = Availability::find($id);

        if (!$availability) {
            return response()->json(['error' => 'Availability not found'], 404);
        }

        // Check if user is owner or admin
        if ($user->id !== $availability->stylist_id && $user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $availability->delete();

            return response()->json(['message' => 'Availability deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete availability'], 500);
        }
    }

    /**
     * Get availability by day of week for a stylist
     */
    public function getByDay($stylistId, $day)
    {
        $availabilities = Availability::where('stylist_id', $stylistId)
            ->where('day_of_week', $day)
            ->where('is_available', true)
            ->orderBy('start_time')
            ->get();

        return response()->json(['availabilities' => $availabilities]);
    }

    /**
     * Bulk set availability for a stylist (admin feature)
     */
    public function bulkSet(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'stylist_id' => 'required|exists:users,id',
            'availabilities' => 'required|array',
            'availabilities.*.day_of_week' => 'required|string',
            'availabilities.*.start_time' => 'required|date_format:H:i',
            'availabilities.*.end_time' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Delete existing availabilities for this stylist
            Availability::where('stylist_id', $request->stylist_id)->delete();

            // Create new availabilities
            foreach ($request->availabilities as $avail) {
                Availability::create([
                    'stylist_id' => $request->stylist_id,
                    'day_of_week' => $avail['day_of_week'],
                    'start_time' => $avail['start_time'],
                    'end_time' => $avail['end_time'],
                    'is_available' => true,
                ]);
            }

            return response()->json([
                'message' => 'Availability set successfully',
                'count' => count($request->availabilities),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to set availability'], 500);
        }
    }
}
