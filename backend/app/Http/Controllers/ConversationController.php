<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Http\Requests\StoreConversationRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * Controller for managing chat conversations
 *
 * @package App\Http\Controllers
 */
class ConversationController extends Controller
{
    /**
     * List user's conversations
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $perPage = $request->input('per_page', 15);

            $conversations = Conversation::forUser($user->id)
                ->active()
                ->orderedByLastMessage()
                ->with([
                    'user1:id,name,email',
                    'user2:id,name,email',
                    'lastMessage'
                ])
                ->paginate($perPage);

            // Transform conversations to include the other participant
            $conversations->getCollection()->transform(function ($conversation) use ($user) {
                $otherUser = $conversation->getOtherUser($user->id);
                $conversation->other_user = $otherUser;
                $conversation->unread_count = $conversation->getUnreadCountForUser($user->id);
                return $conversation;
            });

            return response()->json([
                'success' => true,
                'data' => $conversations,
                'message' => 'Conversations retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve conversations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to retrieve conversations',
            ], 500);
        }
    }

    /**
     * Get conversation details
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();

            $conversation = Conversation::with([
                'user1:id,name,email',
                'user2:id,name,email',
            ])->find($id);

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
                    'message' => 'Unauthorized to view this conversation',
                ], 403);
            }

            // Add other user info
            $otherUser = $conversation->getOtherUser($user->id);
            $conversation->other_user = $otherUser;
            $conversation->unread_count = $conversation->getUnreadCountForUser($user->id);

            return response()->json([
                'success' => true,
                'data' => $conversation,
                'message' => 'Conversation retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve conversation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to retrieve conversation',
            ], 500);
        }
    }

    /**
     * Start a new conversation
     *
     * @param StoreConversationRequest $request
     * @return JsonResponse
     */
    public function store(StoreConversationRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $receiverId = $request->receiver_id;

            // Check if receiver exists and is active
            $receiver = User::find($receiverId);
            if (!$receiver || !$receiver->is_active) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Receiver not found or inactive',
                ], 404);
            }

            // Find or create conversation
            $conversation = Conversation::findOrCreateBetween($user->id, $receiverId);

            // If a message was provided, create it
            if ($request->has('message') && !empty($request->message)) {
                $message = Message::create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $user->id,
                    'receiver_id' => $receiverId,
                    'message' => $request->message,
                ]);

                $conversation->updateLastMessage($message);
            }

            $conversation->load(['user1', 'user2', 'lastMessage']);
            $conversation->other_user = $conversation->getOtherUser($user->id);

            return response()->json([
                'success' => true,
                'data' => $conversation,
                'message' => 'Conversation started successfully',
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create conversation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to create conversation',
            ], 500);
        }
    }

    /**
     * Delete/archive a conversation
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();

            $conversation = Conversation::find($id);

            if (!$conversation) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Conversation not found',
                ], 404);
            }

            // Check authorization
            if (!$conversation->hasParticipant($user->id)) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Unauthorized to delete this conversation',
                ], 403);
            }

            // Archive instead of hard delete
            $conversation->archive();

            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Conversation deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to delete conversation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to delete conversation',
            ], 500);
        }
    }

    /**
     * Get messages in a conversation (paginated)
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function messages(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $perPage = $request->input('per_page', 50);

            $conversation = Conversation::find($id);

            if (!$conversation) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Conversation not found',
                ], 404);
            }

            // Check authorization
            if (!$conversation->hasParticipant($user->id)) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Unauthorized to view messages',
                ], 403);
            }

            $messages = $conversation->messages()
                ->with(['sender:id,name,email', 'receiver:id,name,email'])
                ->latest()
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $messages,
                'message' => 'Messages retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve messages: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to retrieve messages',
            ], 500);
        }
    }

    /**
     * Mark all messages in conversation as read
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();

            $conversation = Conversation::find($id);

            if (!$conversation) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Conversation not found',
                ], 404);
            }

            // Check authorization
            if (!$conversation->hasParticipant($user->id)) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Unauthorized',
                ], 403);
            }

            // Mark all messages as read for this user
            $updatedCount = $conversation->markAsReadForUser($user->id);

            return response()->json([
                'success' => true,
                'data' => [
                    'messages_marked' => $updatedCount,
                ],
                'message' => 'Messages marked as read successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to mark messages as read: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to mark messages as read',
            ], 500);
        }
    }

    /**
     * Search conversations
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $query = $request->input('query');
            $perPage = $request->input('per_page', 15);

            if (empty($query)) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Search query is required',
                ], 400);
            }

            // Search by participant name
            $conversations = Conversation::forUser($user->id)
                ->active()
                ->where(function ($q) use ($query, $user) {
                    $q->whereHas('user1', function ($userQuery) use ($query, $user) {
                        if ($user->id !== auth()->id()) {
                            $userQuery->where('name', 'like', "%{$query}%");
                        }
                    })
                    ->orWhereHas('user2', function ($userQuery) use ($query, $user) {
                        if ($user->id !== auth()->id()) {
                            $userQuery->where('name', 'like', "%{$query}%");
                        }
                    });
                })
                ->with(['user1', 'user2', 'lastMessage'])
                ->orderedByLastMessage()
                ->paginate($perPage);

            // Transform conversations
            $conversations->getCollection()->transform(function ($conversation) use ($user) {
                $conversation->other_user = $conversation->getOtherUser($user->id);
                return $conversation;
            });

            return response()->json([
                'success' => true,
                'data' => $conversations,
                'message' => 'Search results retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to search conversations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to search conversations',
            ], 500);
        }
    }
}
