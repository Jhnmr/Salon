<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Conversation;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Requests\UpdateMessageRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

/**
 * Controller for managing chat messages
 *
 * @package App\Http\Controllers
 */
class MessageController extends Controller
{
    /**
     * Send a new message
     *
     * @param StoreMessageRequest $request
     * @return JsonResponse
     */
    public function store(StoreMessageRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $conversationId = $request->conversation_id;

            // Get conversation
            $conversation = Conversation::find($conversationId);

            if (!$conversation) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Conversation not found',
                ], 404);
            }

            // Check authorization - user must be a participant
            if (!$conversation->hasParticipant($user->id)) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Unauthorized to send message in this conversation',
                ], 403);
            }

            // Get receiver ID
            $receiverId = $conversation->getOtherUserId($user->id);

            // Handle attachment upload
            $attachmentUrl = null;
            $attachmentType = null;

            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $attachmentType = $request->attachment_type ?? $this->detectAttachmentType($file);

                $path = $file->store('messages/' . $attachmentType, 'public');
                $attachmentUrl = Storage::url($path);
            }

            // Create message
            $message = Message::create([
                'conversation_id' => $conversationId,
                'sender_id' => $user->id,
                'receiver_id' => $receiverId,
                'message' => $request->message,
                'attachment_url' => $attachmentUrl,
                'attachment_type' => $attachmentType,
            ]);

            // Load relationships
            $message->load(['sender:id,name,email', 'receiver:id,name,email']);

            // The Message model's boot method will automatically update the conversation's last_message

            return response()->json([
                'success' => true,
                'data' => $message,
                'message' => 'Message sent successfully',
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to send message: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to send message',
            ], 500);
        }
    }

    /**
     * Edit a message
     *
     * @param UpdateMessageRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateMessageRequest $request, int $id): JsonResponse
    {
        try {
            $message = Message::find($id);

            if (!$message) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Message not found',
                ], 404);
            }

            // Check if message can be edited (within 15 minutes)
            if ($message->created_at->diffInMinutes(now()) > 15) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Messages can only be edited within 15 minutes of sending',
                ], 400);
            }

            // Update message
            $message->update([
                'message' => $request->message,
            ]);

            $message->load(['sender:id,name,email', 'receiver:id,name,email']);

            return response()->json([
                'success' => true,
                'data' => $message,
                'message' => 'Message updated successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to update message: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to update message',
            ], 500);
        }
    }

    /**
     * Delete a message
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $message = Message::find($id);

            if (!$message) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Message not found',
                ], 404);
            }

            // Check authorization - only sender can delete
            if ($message->sender_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Unauthorized to delete this message',
                ], 403);
            }

            // Delete attachment from storage if exists
            if ($message->attachment_url) {
                $attachmentPath = str_replace('/storage/', '', $message->attachment_url);
                Storage::disk('public')->delete($attachmentPath);
            }

            // Soft delete the message
            $message->delete();

            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Message deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to delete message: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to delete message',
            ], 500);
        }
    }

    /**
     * Mark a message as read
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $message = Message::find($id);

            if (!$message) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Message not found',
                ], 404);
            }

            // Check authorization - only receiver can mark as read
            if ($message->receiver_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Unauthorized',
                ], 403);
            }

            // Mark as read
            if (!$message->is_read) {
                $message->markAsRead();
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'is_read' => true,
                    'read_at' => $message->read_at,
                ],
                'message' => 'Message marked as read',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to mark message as read: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to mark message as read',
            ], 500);
        }
    }

    /**
     * Get unread messages count
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function unreadCount(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $unreadCount = Message::where('receiver_id', $user->id)
                ->unread()
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'unread_count' => $unreadCount,
                ],
                'message' => 'Unread count retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to get unread count: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to get unread count',
            ], 500);
        }
    }

    /**
     * Search messages
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $query = $request->input('query');
            $conversationId = $request->input('conversation_id');
            $perPage = $request->input('per_page', 50);

            if (empty($query)) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Search query is required',
                ], 400);
            }

            $messagesQuery = Message::forUser($user->id)
                ->where('message', 'like', "%{$query}%")
                ->with(['sender:id,name,email', 'receiver:id,name,email', 'conversation']);

            // Filter by conversation if specified
            if ($conversationId) {
                $messagesQuery->where('conversation_id', $conversationId);
            }

            $messages = $messagesQuery->latest()->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $messages,
                'message' => 'Search results retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to search messages: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to search messages',
            ], 500);
        }
    }

    /**
     * Detect attachment type from file
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @return string
     */
    private function detectAttachmentType($file): string
    {
        $mimeType = $file->getMimeType();

        if (str_starts_with($mimeType, 'image/')) {
            return Message::ATTACHMENT_TYPE_IMAGE;
        } elseif (str_starts_with($mimeType, 'video/')) {
            return Message::ATTACHMENT_TYPE_VIDEO;
        } elseif (str_starts_with($mimeType, 'audio/')) {
            return Message::ATTACHMENT_TYPE_AUDIO;
        } else {
            return Message::ATTACHMENT_TYPE_DOCUMENT;
        }
    }
}
