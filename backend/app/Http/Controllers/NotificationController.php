<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    /**
     * Get user's notifications
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = Notification::where('user_id', $user->id)
            ->with('reservation')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['notifications' => $notifications]);
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();

        $count = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        return response()->json(['unread_count' => $count]);
    }

    /**
     * Get unread notifications
     */
    public function unread(Request $request)
    {
        $user = $request->user();

        $notifications = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->with('reservation')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['notifications' => $notifications]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        // Check if user is owner
        if ($request->user()->id !== $notification->user_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $notification->update(['is_read' => true]);

            return response()->json([
                'message' => 'Notification marked as read',
                'notification' => $notification,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to mark notification as read'], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        try {
            Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->update(['is_read' => true]);

            return response()->json(['message' => 'All notifications marked as read']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to mark notifications as read'], 500);
        }
    }

    /**
     * Delete a notification
     */
    public function destroy(Request $request, $id)
    {
        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        // Check if user is owner
        if ($request->user()->id !== $notification->user_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $notification->delete();

            return response()->json(['message' => 'Notification deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete notification'], 500);
        }
    }

    /**
     * Create a notification (internal use)
     */
    public static function createNotification($userId, $type, $title, $message, $reservationId = null)
    {
        try {
            Notification::create([
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'reservation_id' => $reservationId,
                'sent_at' => now(),
            ]);
        } catch (\Exception $e) {
            // Log error but don't break the main operation
            \Log::error('Failed to create notification: ' . $e->getMessage());
        }
    }

    /**
     * Clear old notifications (cleanup method)
     */
    public static function clearOldNotifications($days = 30)
    {
        try {
            $date = \Carbon\Carbon::now()->subDays($days);
            Notification::where('created_at', '<', $date)
                ->where('is_read', true)
                ->delete();
        } catch (\Exception $e) {
            \Log::error('Failed to clear old notifications: ' . $e->getMessage());
        }
    }
}
