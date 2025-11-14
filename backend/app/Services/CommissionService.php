<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\Reservation;
use Illuminate\Support\Facades\Log;

/**
 * Commission Calculation Service
 * Handles commission distribution for reservations
 */
class CommissionService
{
    /**
     * Platform commission percentage (fixed at 7%)
     */
    const PLATFORM_COMMISSION = 0.07;

    /**
     * Calculate commissions for a reservation
     *
     * @param float $totalAmount Total reservation amount
     * @param int $branchId Branch ID
     * @return array Commission breakdown
     */
    public function calculateCommissions(float $totalAmount, int $branchId): array
    {
        // Get branch to determine salon commission rate
        $branch = Branch::find($branchId);

        // Default salon commission is 30% if not specified
        $salonCommissionRate = $branch->commission_rate ?? 0.30;

        // Calculate each portion
        $platformCommission = $totalAmount * self::PLATFORM_COMMISSION;
        $salonCommission = $totalAmount * $salonCommissionRate;
        $stylistEarnings = $totalAmount - $platformCommission - $salonCommission;

        // Ensure no negative values
        if ($stylistEarnings < 0) {
            Log::warning('Stylist earnings negative, adjusting commissions', [
                'total_amount' => $totalAmount,
                'branch_id' => $branchId,
                'salon_rate' => $salonCommissionRate,
            ]);

            // Adjust: Platform gets fixed 7%, rest split between salon and stylist
            $platformCommission = $totalAmount * self::PLATFORM_COMMISSION;
            $remainingAmount = $totalAmount - $platformCommission;
            $salonCommission = $remainingAmount * ($salonCommissionRate / (1 - self::PLATFORM_COMMISSION));
            $stylistEarnings = $remainingAmount - $salonCommission;
        }

        return [
            'total_amount' => round($totalAmount, 2),
            'platform_commission' => round($platformCommission, 2),
            'platform_percentage' => self::PLATFORM_COMMISSION * 100,
            'salon_commission' => round($salonCommission, 2),
            'salon_percentage' => $salonCommissionRate * 100,
            'stylist_earnings' => round($stylistEarnings, 2),
            'stylist_percentage' => round((1 - self::PLATFORM_COMMISSION - $salonCommissionRate) * 100, 2),
        ];
    }

    /**
     * Apply commission calculation to a reservation
     *
     * @param Reservation $reservation
     * @param float $totalAmount
     * @return Reservation
     */
    public function applyToReservation(Reservation $reservation, float $totalAmount): Reservation
    {
        $commissions = $this->calculateCommissions($totalAmount, $reservation->branch_id);

        // Update reservation with commission data
        $reservation->update([
            'total_amount' => $commissions['total_amount'],
            'platform_commission' => $commissions['platform_commission'],
            'salon_commission' => $commissions['salon_commission'],
            'stylist_earnings' => $commissions['stylist_earnings'],
        ]);

        Log::info('Commissions calculated for reservation', [
            'reservation_id' => $reservation->id,
            'total' => $commissions['total_amount'],
            'platform' => $commissions['platform_commission'],
            'salon' => $commissions['salon_commission'],
            'stylist' => $commissions['stylist_earnings'],
        ]);

        return $reservation;
    }

    /**
     * Calculate commissions with promotion discount
     *
     * @param float $originalAmount Original amount before discount
     * @param float $discountAmount Discount amount
     * @param int $branchId Branch ID
     * @return array Commission breakdown
     */
    public function calculateWithPromotion(float $originalAmount, float $discountAmount, int $branchId): array
    {
        $finalAmount = $originalAmount - $discountAmount;

        $commissions = $this->calculateCommissions($finalAmount, $branchId);

        $commissions['original_amount'] = round($originalAmount, 2);
        $commissions['discount_amount'] = round($discountAmount, 2);
        $commissions['final_amount'] = round($finalAmount, 2);

        return $commissions;
    }

    /**
     * Get commission summary for reporting
     *
     * @param array $reservations Array of reservations
     * @return array Summary statistics
     */
    public function getSummary(array $reservations): array
    {
        $totalRevenue = 0;
        $totalPlatformCommission = 0;
        $totalSalonCommission = 0;
        $totalStylistEarnings = 0;

        foreach ($reservations as $reservation) {
            $totalRevenue += $reservation->total_amount ?? 0;
            $totalPlatformCommission += $reservation->platform_commission ?? 0;
            $totalSalonCommission += $reservation->salon_commission ?? 0;
            $totalStylistEarnings += $reservation->stylist_earnings ?? 0;
        }

        return [
            'total_revenue' => round($totalRevenue, 2),
            'platform_commission' => round($totalPlatformCommission, 2),
            'salon_commission' => round($totalSalonCommission, 2),
            'stylist_earnings' => round($totalStylistEarnings, 2),
            'reservation_count' => count($reservations),
            'average_booking' => count($reservations) > 0 ? round($totalRevenue / count($reservations), 2) : 0,
        ];
    }
}
