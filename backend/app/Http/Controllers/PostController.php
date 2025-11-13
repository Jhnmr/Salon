<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\LikePost;
use App\Models\ComentarioPost;
use App\Models\Stylist;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * Controller for managing social portfolio posts
 *
 * @package App\Http\Controllers
 */
class PostController extends Controller
{
    /**
     * List posts with pagination and filters
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->input('per_page', 15);
            $stylistId = $request->input('stylist_id');
            $branchId = $request->input('branch_id');
            $tag = $request->input('tag');
            $isPortfolio = $request->input('is_portfolio');
            $search = $request->input('search');

            $query = Post::with(['stylist.user', 'stylist.branch'])
                ->published()
                ->latest('published_at');

            // Apply filters
            if ($stylistId) {
                $query->where('stylist_id', $stylistId);
            }

            if ($branchId) {
                $query->whereHas('stylist', function ($q) use ($branchId) {
                    $q->where('branch_id', $branchId);
                });
            }

            if ($tag) {
                $query->withTag($tag);
            }

            if ($isPortfolio !== null) {
                $query->where('is_portfolio', filter_var($isPortfolio, FILTER_VALIDATE_BOOLEAN));
            }

            if ($search) {
                $query->where('caption', 'like', "%{$search}%");
            }

            $posts = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $posts,
                'message' => 'Posts retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve posts: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to retrieve posts',
            ], 500);
        }
    }

    /**
     * Get a specific post with likes and comments
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $post = Post::with([
                'stylist.user',
                'stylist.branch',
                'likes.user',
                'comentarios.user',
            ])->find($id);

            if (!$post) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Post not found',
                ], 404);
            }

            // Check if post is visible (unless owner or admin)
            if (!$post->is_visible && auth()->check()) {
                $user = auth()->user();
                if ($user->id !== $post->stylist->user_id && $user->role !== 'admin') {
                    return response()->json([
                        'success' => false,
                        'data' => null,
                        'message' => 'Post not found',
                    ], 404);
                }
            }

            return response()->json([
                'success' => true,
                'data' => $post,
                'message' => 'Post retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve post: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to retrieve post',
            ], 500);
        }
    }

    /**
     * Create a new post (only stylists)
     *
     * @param StorePostRequest $request
     * @return JsonResponse
     */
    public function store(StorePostRequest $request): JsonResponse
    {
        try {
            $user = $request->user();

            // Get stylist profile
            $stylist = Stylist::where('user_id', $user->id)->first();

            if (!$stylist) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Stylist profile not found',
                ], 404);
            }

            // Handle image upload
            $imageUrl = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('posts', 'public');
                $imageUrl = Storage::url($imagePath);
            }

            // Handle multiple images
            $images = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $imagePath = $image->store('posts', 'public');
                    $images[] = Storage::url($imagePath);
                }
            }

            // Create post
            $post = Post::create([
                'stylist_id' => $stylist->id,
                'caption' => $request->caption,
                'image_url' => $imageUrl,
                'images' => !empty($images) ? $images : null,
                'tags' => $request->tags ?? [],
                'is_portfolio' => $request->boolean('is_portfolio', false),
                'is_visible' => $request->boolean('is_visible', true),
                'published_at' => $request->published_at ?? now(),
            ]);

            $post->load(['stylist.user', 'stylist.branch']);

            return response()->json([
                'success' => true,
                'data' => $post,
                'message' => 'Post created successfully',
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create post: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to create post',
            ], 500);
        }
    }

    /**
     * Update a post
     *
     * @param UpdatePostRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdatePostRequest $request, int $id): JsonResponse
    {
        try {
            $post = Post::find($id);

            if (!$post) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Post not found',
                ], 404);
            }

            // Update data
            $data = $request->only(['caption', 'tags', 'is_portfolio', 'is_visible']);

            // Handle new image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($post->image_url) {
                    $oldImagePath = str_replace('/storage/', '', $post->image_url);
                    Storage::disk('public')->delete($oldImagePath);
                }

                $imagePath = $request->file('image')->store('posts', 'public');
                $data['image_url'] = Storage::url($imagePath);
            }

            // Handle multiple images
            if ($request->hasFile('images')) {
                // Delete old images if exist
                if ($post->images) {
                    foreach ($post->images as $oldImage) {
                        $oldImagePath = str_replace('/storage/', '', $oldImage);
                        Storage::disk('public')->delete($oldImagePath);
                    }
                }

                $images = [];
                foreach ($request->file('images') as $image) {
                    $imagePath = $image->store('posts', 'public');
                    $images[] = Storage::url($imagePath);
                }
                $data['images'] = $images;
            }

            $post->update($data);
            $post->load(['stylist.user', 'stylist.branch']);

            return response()->json([
                'success' => true,
                'data' => $post,
                'message' => 'Post updated successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to update post: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to update post',
            ], 500);
        }
    }

    /**
     * Delete a post
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $post = Post::find($id);

            if (!$post) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Post not found',
                ], 404);
            }

            $user = $request->user();

            // Check authorization - only owner or admin can delete
            if ($post->stylist->user_id !== $user->id && $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Unauthorized to delete this post',
                ], 403);
            }

            // Delete images from storage
            if ($post->image_url) {
                $imagePath = str_replace('/storage/', '', $post->image_url);
                Storage::disk('public')->delete($imagePath);
            }

            if ($post->images) {
                foreach ($post->images as $image) {
                    $imagePath = str_replace('/storage/', '', $image);
                    Storage::disk('public')->delete($imagePath);
                }
            }

            // Soft delete the post
            $post->delete();

            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Post deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to delete post: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to delete post',
            ], 500);
        }
    }

    /**
     * Toggle like on a post
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function toggleLike(Request $request, int $id): JsonResponse
    {
        try {
            $post = Post::find($id);

            if (!$post) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Post not found',
                ], 404);
            }

            $user = $request->user();

            // Check if user already liked the post
            $like = LikePost::where('post_id', $post->id)
                ->where('user_id', $user->id)
                ->first();

            if ($like) {
                // Unlike - remove the like
                $like->delete();
                $post->decrementLikes();
                $isLiked = false;
                $message = 'Post unliked successfully';
            } else {
                // Like - add the like
                LikePost::create([
                    'post_id' => $post->id,
                    'user_id' => $user->id,
                ]);
                $post->incrementLikes();
                $isLiked = true;
                $message = 'Post liked successfully';
            }

            $post->refresh();

            return response()->json([
                'success' => true,
                'data' => [
                    'is_liked' => $isLiked,
                    'likes_count' => $post->likes_count,
                ],
                'message' => $message,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to toggle like: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to toggle like',
            ], 500);
        }
    }

    /**
     * Add a comment to a post
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function addComment(Request $request, int $id): JsonResponse
    {
        try {
            $post = Post::find($id);

            if (!$post) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Post not found',
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'comentario' => 'required|string|max:500',
                'parent_id' => 'nullable|exists:comentario_posts,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'data' => $validator->errors(),
                    'message' => 'Validation failed',
                ], 422);
            }

            $user = $request->user();

            $comment = ComentarioPost::create([
                'post_id' => $post->id,
                'user_id' => $user->id,
                'comentario' => $request->comentario,
                'parent_id' => $request->parent_id,
            ]);

            // Increment comments count only for top-level comments
            if (!$request->parent_id) {
                $post->incrementComments();
            }

            $comment->load('user');

            return response()->json([
                'success' => true,
                'data' => $comment,
                'message' => 'Comment added successfully',
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to add comment: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to add comment',
            ], 500);
        }
    }

    /**
     * Get posts from stylists the user follows or favorites
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function feed(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $perPage = $request->input('per_page', 15);

            // Get favorite stylists
            $favoriteStylistIds = $user->favorites()
                ->where('favorable_type', Stylist::class)
                ->pluck('favorable_id')
                ->toArray();

            $query = Post::with(['stylist.user', 'stylist.branch'])
                ->published();

            if (!empty($favoriteStylistIds)) {
                $query->whereIn('stylist_id', $favoriteStylistIds);
            }

            $posts = $query->latest('published_at')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $posts,
                'message' => 'Feed retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve feed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to retrieve feed',
            ], 500);
        }
    }
}
