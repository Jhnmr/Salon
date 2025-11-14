<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ReservationController extends Controller
{
    /**
     * Get user's reservations
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'client') {
            $reservations = Reservation::where('client_id', $user->id)
                ->with(['service', 'stylist'])
                ->orderBy('scheduled_at', 'desc')
                ->get();
        } elseif ($user->role === 'stylist') {
            $reservations = Reservation::where('stylist_id', $user->id)
                ->with(['service', 'client'])
                ->orderBy('scheduled_at', 'desc')
                ->get();
        } else {
            // Admin can see all
            $reservations = Reservation::with(['service', 'client', 'stylist'])
                ->orderBy('scheduled_at', 'desc')
                ->get();
        }

        return response()->json(['reservations' => $reservations]);
    }

    /**
     * Get specific reservation
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $reservation = Reservation::with(['service', 'client', 'stylist'])->find($id);

        if (!$reservation) {
            return response()->json(['error' => 'Reservation not found'], 404);
        }

        // Authorization: Only client, assigned stylist, or admin can view
        $isClient = $user->id === $reservation->client_id;
        $isStylist = $user->id === $reservation->stylist_id;
        $isAdmin = $user->role === 'admin';

        if (!$isClient && !$isStylist && !$isAdmin) {
            return response()->json([
                'error' => 'Unauthorized to view this reservation'
            ], 403);
        }

        return response()->json(['reservation' => $reservation]);
    }

    /**
     * Create a new reservation with payment processing
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Only clients can create reservations
        if ($user->role !== 'client') {
            return response()->json(['error' => 'Only clients can create reservations'], 403);
        }

        $validator = Validator::make($request->all(), [
            'service_id' => 'required|exists:services,id',
            'stylist_id' => 'nullable|exists:users,id',
            'scheduled_at' => 'required|date|after:now',
            'payment_method_id' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'promotion_code' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Check if service exists and is active
            $service = Service::find($request->service_id);
            if (!$service || !$service->is_active) {
                return response()->json(['error' => 'Service not available'], 404);
            }

            // Check if stylist is valid if provided
            $stylist = null;
            if ($request->stylist_id) {
                $stylist = \App\Models\User::find($request->stylist_id);
                if (!$stylist || $stylist->role !== 'stylist' || !$stylist->is_active) {
                    return response()->json(['error' => 'Invalid stylist'], 404);
                }
            }

            // Get branch_id from stylist or service
            $branchId = $stylist->branch_id ?? $service->branch_id ?? 1;

            // Calculate final amount (with promotion if provided)
            $originalAmount = $request->amount;
            $discountAmount = 0;
            $finalAmount = $originalAmount;
            $promotionCode = null;

            if ($request->promotion_code) {
                // Validate promotion code
                $promotion = \App\Models\Promotion::where('code', strtoupper($request->promotion_code))
                    ->where('is_active', true)
                    ->where('valid_from', '<=', now())
                    ->where('valid_until', '>=', now())
                    ->first();

                if ($promotion && $promotion->uses_count < $promotion->max_uses) {
                    $discountAmount = $promotion->discount_type === 'percentage'
                        ? ($originalAmount * $promotion->discount_value / 100)
                        : $promotion->discount_value;

                    $finalAmount = max(0, $originalAmount - $discountAmount);
                    $promotionCode = $promotion->code;

                    // Increment promotion usage
                    $promotion->increment('uses_count');
                }
            }

            // Process payment with Stripe
            $stripeService = new \App\Services\StripeService();
            $amountInCents = (int) ($finalAmount * 100);

            $paymentResult = $stripeService->processPayment(
                $amountInCents,
                $request->payment_method_id,
                [
                    'user_id' => $user->id,
                    'service_id' => $service->id,
                    'stylist_id' => $request->stylist_id,
                    'branch_id' => $branchId,
                ]
            );

            if (!$paymentResult['success']) {
                return response()->json([
                    'error' => 'Payment failed',
                    'message' => $paymentResult['error'] ?? 'Unable to process payment'
                ], 400);
            }

            // Calculate commissions
            $commissionService = new \App\Services\CommissionService();
            $commissions = $commissionService->calculateCommissions($finalAmount, $branchId);

            // Create reservation with commission data
            $reservation = Reservation::create([
                'client_id' => $user->id,
                'stylist_id' => $request->stylist_id,
                'service_id' => $request->service_id,
                'branch_id' => $branchId,
                'scheduled_at' => $request->scheduled_at,
                'status' => 'confirmed', // Auto-confirm on successful payment
                'notes' => $request->notes,
                'total_amount' => $commissions['total_amount'],
                'platform_commission' => $commissions['platform_commission'],
                'salon_commission' => $commissions['salon_commission'],
                'stylist_earnings' => $commissions['stylist_earnings'],
                'promotion_code' => $promotionCode,
                'payment_intent_id' => $paymentResult['payment_intent_id'],
                'service_price' => $originalAmount,
                'discount_amount' => $discountAmount,
                'total_price' => $finalAmount,
            ]);

            // Create payment record
            \App\Models\Payment::create([
                'codigo_transaccion' => 'TXN-' . strtoupper(uniqid()),
                'reservation_id' => $reservation->id,
                'user_id' => $user->id,
                'branch_id' => $branchId,
                'amount_subtotal' => $originalAmount,
                'amount_discount' => $discountAmount,
                'amount_tax' => 0,
                'amount_total' => $finalAmount,
                'payment_method' => \App\Models\Payment::METHOD_CREDIT_CARD,
                'payment_provider' => \App\Models\Payment::PROVIDER_STRIPE,
                'stripe_payment_intent_id' => $paymentResult['payment_intent_id'],
                'status' => \App\Models\Payment::STATUS_COMPLETED,
                'commission_platform' => $commissions['platform_commission'],
                'commission_percentage' => $commissions['platform_percentage'],
                'amount_stylist' => $commissions['stylist_earnings'],
                'amount_branch' => $commissions['salon_commission'],
                'payment_date' => now(),
                'client_ip' => $request->ip(),
                'browser' => $request->userAgent(),
                'metadata' => [
                    'promotion_code' => $promotionCode,
                    'original_amount' => $originalAmount,
                    'discount_amount' => $discountAmount,
                ],
            ]);

            $reservation->load(['service', 'stylist', 'client', 'payment']);

            // Create notification for stylist
            if ($stylist) {
                \App\Models\Notification::create([
                    'user_id' => $stylist->id,
                    'type' => 'new_reservation',
                    'title' => 'New Reservation',
                    'message' => 'You have a new reservation from ' . $user->name . ' for ' .
                                $service->name . ' on ' . Carbon::parse($request->scheduled_at)->format('M d, Y \a\t h:i A'),
                    'is_read' => false,
                ]);
            }

            return response()->json([
                'message' => 'Reservation created and payment processed successfully',
                'reservation' => $reservation,
                'payment' => [
                    'amount' => $finalAmount,
                    'status' => 'completed',
                    'payment_intent_id' => $paymentResult['payment_intent_id'],
                ],
                'commissions' => $commissions,
            ], 201);
        } catch (\Stripe\Exception\ApiErrorException $e) {
            Log::error('Stripe payment error', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);
            return response()->json([
                'error' => 'Payment processing failed',
                'message' => $e->getMessage()
            ], 400);
        } catch (\Exception $e) {
            Log::error('Reservation creation error', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);
            return response()->json([
                'error' => 'Failed to create reservation',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update reservation (stylist can confirm, client/admin can update details)
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['error' => 'Reservation not found'], 404);
        }

        // Check authorization
        $isOwner = $user->id === $reservation->client_id;
        $isStylist = $user->id === $reservation->stylist_id;
        $isAdmin = $user->role === 'admin';

        if (!$isOwner && !$isStylist && !$isAdmin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'stylist_id' => 'nullable|exists:users,id',
            'scheduled_at' => 'nullable|date|after:now',
            'status' => 'nullable|in:pending,confirmed,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $data = $request->only('notes');

            if ($request->has('status')) {
                // Only stylist or admin can change status
                if (!$isStylist && !$isAdmin) {
                    return response()->json(['error' => 'Unauthorized to change status'], 403);
                }
                $data['status'] = $request->status;
            }

            if ($request->has('scheduled_at') && $isOwner) {
                $data['scheduled_at'] = $request->scheduled_at;
            }

            if ($request->has('stylist_id') && $isAdmin) {
                $data['stylist_id'] = $request->stylist_id;
            }

            $reservation->update($data);
            $reservation->load(['service', 'stylist', 'client']);

            return response()->json([
                'message' => 'Reservation updated successfully',
                'reservation' => $reservation,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update reservation'], 500);
        }
    }

    /**
     * Cancel reservation with 24-hour policy
     */
    public function cancel(Request $request, $id)
    {
        $user = $request->user();
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Reservation not found'
            ], 404);
        }

        // Check authorization - client or admin can cancel
        if ($user->id !== $reservation->client_id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Unauthorized'
            ], 403);
        }

        if ($reservation->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Reservation already cancelled'
            ], 400);
        }

        try {
            // Check 24-hour cancellation policy
            $hoursUntilReservation = now()->diffInHours($reservation->scheduled_at, false);

            if ($hoursUntilReservation < 24 && $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'data' => [
                        'hours_until_reservation' => $hoursUntilReservation,
                        'cancellation_policy' => 'Cancellations must be made at least 24 hours in advance'
                    ],
                    'message' => 'Cannot cancel reservation within 24 hours of scheduled time'
                ], 400);
            }

            $reservation->update([
                'status' => 'cancelled',
                'notes' => ($reservation->notes ? $reservation->notes . "\n" : '') .
                          'Cancelled by ' . $user->name . ' at ' . now()->toDateTimeString()
            ]);
            $reservation->load(['service', 'stylist', 'client']);

            return response()->json([
                'success' => true,
                'data' => $reservation,
                'message' => 'Reservation cancelled successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to cancel reservation'
            ], 500);
        }
    }

    /**
     * Confirm a reservation (stylist or admin only)
     */
    public function confirm(Request $request, $id)
    {
        $user = $request->user();
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Reservation not found'
            ], 404);
        }

        // Only stylist assigned or admin can confirm
        if ($user->id !== $reservation->stylist_id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Unauthorized to confirm this reservation'
            ], 403);
        }

        if ($reservation->status !== 'pending') {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Only pending reservations can be confirmed'
            ], 400);
        }

        try {
            $reservation->update(['status' => 'confirmed']);
            $reservation->load(['service', 'stylist', 'client']);

            // Create notification for client
            \App\Models\Notification::create([
                'user_id' => $reservation->client_id,
                'type' => 'reservation_confirmed',
                'title' => 'Reservation Confirmed',
                'message' => 'Your reservation for ' . $reservation->service->name .
                           ' on ' . $reservation->scheduled_at->format('M d, Y \a\t h:i A') .
                           ' has been confirmed.',
                'is_read' => false,
            ]);

            return response()->json([
                'success' => true,
                'data' => $reservation,
                'message' => 'Reservation confirmed successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to confirm reservation'
            ], 500);
        }
    }

    /**
     * Mark a reservation as completed (stylist or admin only)
     */
    public function complete(Request $request, $id)
    {
        $user = $request->user();
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Reservation not found'
            ], 404);
        }

        // Only stylist assigned or admin can mark as complete
        if ($user->id !== $reservation->stylist_id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Unauthorized to complete this reservation'
            ], 403);
        }

        if (!in_array($reservation->status, ['confirmed', 'pending'])) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Only confirmed or pending reservations can be completed'
            ], 400);
        }

        try {
            $reservation->update(['status' => 'completed']);
            $reservation->load(['service', 'stylist', 'client']);

            // Create notification for client
            \App\Models\Notification::create([
                'user_id' => $reservation->client_id,
                'type' => 'reservation_completed',
                'title' => 'Service Completed',
                'message' => 'Your service with ' . $reservation->stylist->name . ' has been completed. Please leave a review!',
                'is_read' => false,
            ]);

            return response()->json([
                'success' => true,
                'data' => $reservation,
                'message' => 'Reservation marked as completed successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to complete reservation'
            ], 500);
        }
    }

    /**
     * Check availability for a specific time slot
     */
    public function checkAvailability(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'stylist_id' => 'required|exists:users,id',
            'service_id' => 'required|exists:services,id',
            'scheduled_at' => 'required|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'data' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        try {
            $service = Service::find($request->service_id);
            $scheduledAt = Carbon::parse($request->scheduled_at);
            $endTime = $scheduledAt->copy()->addMinutes($service->duration_minutes);

            // Check for conflicting reservations
            $conflicting = Reservation::where('stylist_id', $request->stylist_id)
                ->where('status', '!=', 'cancelled')
                ->where(function ($query) use ($scheduledAt, $endTime) {
                    $query->whereBetween('scheduled_at', [$scheduledAt, $endTime])
                        ->orWhere(function ($q) use ($scheduledAt, $endTime) {
                            $q->where('scheduled_at', '<=', $scheduledAt)
                              ->whereRaw('DATE_ADD(scheduled_at, INTERVAL (SELECT duration_minutes FROM services WHERE services.id = reservations.service_id) MINUTE) > ?', [$scheduledAt]);
                        });
                })
                ->exists();

            if ($conflicting) {
                return response()->json([
                    'success' => false,
                    'data' => [
                        'available' => false,
                        'reason' => 'Time slot is already booked'
                    ],
                    'message' => 'Time slot is not available',
                ], 200);
            }

            // Check if within business hours
            $hour = $scheduledAt->hour;
            if ($hour < 9 || $hour >= 18) {
                return response()->json([
                    'success' => false,
                    'data' => [
                        'available' => false,
                        'reason' => 'Outside business hours (9 AM - 6 PM)'
                    ],
                    'message' => 'Time slot is not available',
                ], 200);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'available' => true,
                    'slot_start' => $scheduledAt->toIso8601String(),
                    'slot_end' => $endTime->toIso8601String(),
                    'duration_minutes' => $service->duration_minutes
                ],
                'message' => 'Time slot is available',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to check availability'
            ], 500);
        }
    }

    /**
     * Get reservations for a stylist
     */
    public function getStylistReservations($stylistId)
    {
        $reservations = Reservation::where('stylist_id', $stylistId)
            ->with(['service', 'client'])
            ->where('status', '!=', 'cancelled')
            ->orderBy('scheduled_at')
            ->get();

        return response()->json(['reservations' => $reservations]);
    }

    /**
     * Get available slots for a service
     */
    public function getAvailableSlots(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'service_id' => 'required|exists:services,id',
            'stylist_id' => 'nullable|exists:users,id',
            'date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $service = Service::find($request->service_id);
            $date = Carbon::parse($request->date);

            // Simple slot generation (every 30 minutes, working hours 9 AM - 6 PM)
            $slots = [];
            $start = $date->copy()->setHour(9)->setMinute(0)->setSecond(0);
            $end = $date->copy()->setHour(18)->setMinute(0)->setSecond(0);

            while ($start < $end) {
                $slotEnd = $start->copy()->addMinutes($service->duration_minutes);

                if ($slotEnd <= $end) {
                    // Check if slot is available (no conflicting reservations)
                    $conflicting = Reservation::where('status', '!=', 'cancelled')
                        ->whereBetween('scheduled_at', [$start, $slotEnd->copy()->subMinute()])
                        ->count();

                    if ($conflicting === 0) {
                        $slots[] = [
                            'start' => $start->toIso8601String(),
                            'end' => $slotEnd->toIso8601String(),
                        ];
                    }
                }

                $start->addMinutes(30);
            }

            return response()->json(['slots' => $slots]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to get available slots'], 500);
        }
    }

    /**
     * Reschedule a reservation to a new date/time
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function reschedule(Request $request, $id)
    {
        $user = $request->user();
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Reservation not found'
            ], 404);
        }

        // Check authorization - client or admin can reschedule
        if ($user->id !== $reservation->client_id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Unauthorized to reschedule this reservation'
            ], 403);
        }

        // Can't reschedule cancelled or completed reservations
        if (in_array($reservation->status, ['cancelled', 'completed', 'no_show'])) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Cannot reschedule ' . $reservation->status . ' reservations'
            ], 400);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'scheduled_at' => 'required|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'data' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        try {
            $newScheduledAt = Carbon::parse($request->scheduled_at);

            // Check if within business hours
            $hour = $newScheduledAt->hour;
            if ($hour < 9 || $hour >= 18) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'New time must be within business hours (9 AM - 6 PM)'
                ], 400);
            }

            // Get service duration
            $service = $reservation->service;
            $endTime = $newScheduledAt->copy()->addMinutes($service->duration_minutes);

            // Check for conflicting reservations at new time
            $conflicting = Reservation::where('stylist_id', $reservation->stylist_id)
                ->where('id', '!=', $id) // Exclude current reservation
                ->where('status', '!=', 'cancelled')
                ->where(function ($query) use ($newScheduledAt, $endTime) {
                    $query->whereBetween('scheduled_at', [$newScheduledAt, $endTime])
                        ->orWhere(function ($q) use ($newScheduledAt, $endTime) {
                            $q->where('scheduled_at', '<=', $newScheduledAt)
                              ->whereRaw('DATE_ADD(scheduled_at, INTERVAL (SELECT duration_minutes FROM services WHERE services.id = reservations.service_id) MINUTE) > ?', [$newScheduledAt]);
                        });
                })
                ->exists();

            if ($conflicting) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'The selected time slot is not available'
                ], 400);
            }

            // Update reservation
            $oldScheduledAt = $reservation->scheduled_at;
            $reservation->update([
                'scheduled_at' => $newScheduledAt,
                'status' => 'pending', // Reset to pending on reschedule
                'confirmed_at' => null,
            ]);

            $reservation->load(['service', 'stylist', 'client']);

            // Create notification for stylist
            \App\Models\Notification::create([
                'user_id' => $reservation->stylist_id,
                'type' => 'reservation_rescheduled',
                'title' => 'Reservation Rescheduled',
                'message' => 'A reservation has been rescheduled from ' .
                           $oldScheduledAt->format('M d, Y \a\t h:i A') . ' to ' .
                           $newScheduledAt->format('M d, Y \a\t h:i A'),
                'is_read' => false,
            ]);

            return response()->json([
                'success' => true,
                'data' => $reservation,
                'message' => 'Reservation rescheduled successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to reschedule reservation'
            ], 500);
        }
    }
}
