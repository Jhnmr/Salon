<?php

namespace App\Http\Controllers;

use App\Models\Promotion;
use App\Models\Reservation;
use App\Http\Requests\ValidatePromotionRequest;
use App\Http\Requests\StorePromotionRequest;
use App\Http\Requests\UpdatePromotionRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * Controller for managing promotions and discounts
 *
 * @package App\Http\Controllers
 */
class PromotionController extends Controller
{
    /**
     * List active promotions
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->input('per_page', 15);
            $branchId = $request->input('branch_id');
            $isPublic = $request->input('is_public');
            $includeExpired = $request->boolean('include_expired', false);

            $query = Promotion::with('branch:id,name');

            // Filter by branch
            if ($branchId) {
                $query->where('branch_id', $branchId);
            }

            // Filter by public/private
            if ($isPublic !== null) {
                $query->where('is_public', filter_var($isPublic, FILTER_VALIDATE_BOOLEAN));
            }

            // Only active promotions unless specifically requested
            if (!$includeExpired) {
                $query->active();
            } else {
                $query->where('is_active', true);
            }

            // Admin can see all, regular users see only public
            if (!$request->user() || $request->user()->role !== 'admin') {
                $query->public();
            }

            $promotions = $query->orderBy('valid_from', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $promotions,
                'message' => 'Promotions retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve promotions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to retrieve promotions',
            ], 500);
        }
    }

    /**
     * Get a specific promotion
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $promotion = Promotion::with('branch:id,name,address')->find($id);

            if (!$promotion) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Promotion not found',
                ], 404);
            }

            // Only public promotions visible to non-admins
            if (!$promotion->is_public && (!$request->user() || $request->user()->role !== 'admin')) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Promotion not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $promotion,
                'message' => 'Promotion retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve promotion: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to retrieve promotion',
            ], 500);
        }
    }

    /**
     * Validate a promotion code
     *
     * @param ValidatePromotionRequest $request
     * @return JsonResponse
     */
    public function validate(ValidatePromotionRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $code = $request->code;
            $serviceIds = $request->service_ids ?? [];
            $amount = $request->amount ?? 0;

            // Check if this is the user's first booking
            $isFirstBooking = Reservation::where('client_id', $user->id)
                ->where('status', 'completed')
                ->count() === 0;

            // Find and validate the promotion
            $result = Promotion::findAndValidate(
                $code,
                $user->id,
                $serviceIds,
                $amount,
                $isFirstBooking
            );

            if (!$result['valid']) {
                return response()->json([
                    'success' => false,
                    'data' => [
                        'valid' => false,
                        'errors' => $result['errors'],
                    ],
                    'message' => 'Promotion code is not valid',
                ], 400);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'valid' => true,
                    'promotion' => $result['promotion'],
                    'discount' => $result['discount'],
                    'final_amount' => max(0, $amount - $result['discount']),
                ],
                'message' => 'Promotion code is valid',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to validate promotion: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to validate promotion',
            ], 500);
        }
    }

    /**
     * Create a new promotion (admin only)
     *
     * @param StorePromotionRequest $request
     * @return JsonResponse
     */
    public function store(StorePromotionRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            // Set defaults
            $data['usage_count'] = 0;
            $data['is_active'] = $data['is_active'] ?? true;
            $data['is_public'] = $data['is_public'] ?? true;
            $data['is_first_booking_only'] = $data['is_first_booking_only'] ?? false;

            $promotion = Promotion::create($data);
            $promotion->load('branch:id,name');

            return response()->json([
                'success' => true,
                'data' => $promotion,
                'message' => 'Promotion created successfully',
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create promotion: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to create promotion',
            ], 500);
        }
    }

    /**
     * Update a promotion (admin only)
     *
     * @param UpdatePromotionRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdatePromotionRequest $request, int $id): JsonResponse
    {
        try {
            $promotion = Promotion::find($id);

            if (!$promotion) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Promotion not found',
                ], 404);
            }

            $data = $request->validated();

            // Remove empty values
            $data = array_filter($data, function ($value) {
                return $value !== null;
            });

            $promotion->update($data);
            $promotion->load('branch:id,name');

            return response()->json([
                'success' => true,
                'data' => $promotion,
                'message' => 'Promotion updated successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to update promotion: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to update promotion',
            ], 500);
        }
    }

    /**
     * Delete a promotion (admin only)
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            // Check authorization
            if (!$request->user() || !in_array($request->user()->role, ['admin', 'super_admin'])) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $promotion = Promotion::find($id);

            if (!$promotion) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Promotion not found',
                ], 404);
            }

            // Soft delete
            $promotion->delete();

            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Promotion deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to delete promotion: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to delete promotion',
            ], 500);
        }
    }

    /**
     * Get promotion statistics (admin only)
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function statistics(Request $request, int $id): JsonResponse
    {
        try {
            // Check authorization
            if (!$request->user() || !in_array($request->user()->role, ['admin', 'super_admin'])) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $promotion = Promotion::find($id);

            if (!$promotion) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Promotion not found',
                ], 404);
            }

            // Get usage statistics
            $usageByUser = \App\Models\Payment::where('promotion_code', $promotion->code)
                ->selectRaw('user_id, COUNT(*) as usage_count, SUM(discount_amount) as total_discount')
                ->groupBy('user_id')
                ->with('user:id,name,email')
                ->get();

            $totalRevenue = \App\Models\Payment::where('promotion_code', $promotion->code)
                ->sum('amount');

            $totalDiscount = \App\Models\Payment::where('promotion_code', $promotion->code)
                ->sum('discount_amount');

            $statistics = [
                'promotion' => $promotion,
                'total_usage' => $promotion->usage_count,
                'usage_by_user' => $usageByUser,
                'total_revenue' => $totalRevenue,
                'total_discount' => $totalDiscount,
                'remaining_usage' => $promotion->usage_limit ? ($promotion->usage_limit - $promotion->usage_count) : null,
                'days_remaining' => $promotion->valid_until ? now()->diffInDays($promotion->valid_until, false) : null,
            ];

            return response()->json([
                'success' => true,
                'data' => $statistics,
                'message' => 'Promotion statistics retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to get promotion statistics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to get promotion statistics',
            ], 500);
        }
    }

    /**
     * Apply a promotion to a booking (internal use)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function apply(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $code = $request->input('code');
            $amount = $request->input('amount', 0);

            if (!$code || !$amount) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Code and amount are required',
                ], 400);
            }

            $promotion = Promotion::byCode($code)->first();

            if (!$promotion) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Invalid promotion code',
                ], 404);
            }

            if (!$promotion->canBeUsed()) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Promotion cannot be used at this time',
                ], 400);
            }

            $discount = $promotion->calculateDiscount($amount);
            $finalAmount = max(0, $amount - $discount);

            return response()->json([
                'success' => true,
                'data' => [
                    'promotion' => $promotion,
                    'original_amount' => $amount,
                    'discount' => $discount,
                    'final_amount' => $finalAmount,
                ],
                'message' => 'Promotion applied successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to apply promotion: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to apply promotion',
            ], 500);
        }
    }
}
