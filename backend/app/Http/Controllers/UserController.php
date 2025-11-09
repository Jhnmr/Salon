<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Get all users (admin only)
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $users = User::with('profile')->get();
        return response()->json(['users' => $users]);
    }

    /**
     * Get users by role (admin only)
     */
    public function getByRole(Request $request, $role)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $users = User::where('role', $role)->with('profile')->get();
        return response()->json(['users' => $users]);
    }

    /**
     * Get a specific user (admin only)
     */
    public function show(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = User::with('profile')->find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json(['user' => $user]);
    }

    /**
     * Update a user (admin only)
     */
    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|unique:users,email,' . $id,
            'role' => 'sometimes|in:admin,stylist,client',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $user->update($request->only('name', 'email', 'role', 'is_active'));
            $user->load('profile');

            return response()->json([
                'message' => 'User updated successfully',
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update user'], 500);
        }
    }

    /**
     * Deactivate a user (admin only)
     */
    public function deactivate(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        try {
            $user->update(['is_active' => false]);
            $user->load('profile');

            return response()->json([
                'message' => 'User deactivated successfully',
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to deactivate user'], 500);
        }
    }

    /**
     * Activate a user (admin only)
     */
    public function activate(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        try {
            $user->update(['is_active' => true]);
            $user->load('profile');

            return response()->json([
                'message' => 'User activated successfully',
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to activate user'], 500);
        }
    }

    /**
     * Delete a user (admin only)
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Prevent admin from deleting themselves
        if ($request->user()->id === (int)$id) {
            return response()->json(['error' => 'Cannot delete yourself'], 400);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        try {
            $user->delete();

            return response()->json(['message' => 'User deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete user'], 500);
        }
    }

    /**
     * Get users statistics (admin only)
     */
    public function getStatistics(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $stats = [
                'total_users' => User::count(),
                'total_clients' => User::where('role', 'client')->count(),
                'total_stylists' => User::where('role', 'stylist')->count(),
                'active_users' => User::where('is_active', true)->count(),
                'inactive_users' => User::where('is_active', false)->count(),
            ];

            return response()->json(['statistics' => $stats]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to get statistics'], 500);
        }
    }
}
