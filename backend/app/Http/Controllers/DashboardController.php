<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Reservation;
use App\Models\Service;
use App\Models\Notification;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard data based on user role
     */
    public function index(Request $request)
    {
        $user = $request->user();

        switch ($user->role) {
            case 'client':
                return $this->getClientDashboard($user);
            case 'stylist':
                return $this->getStylistDashboard($user);
            case 'admin':
                return $this->getAdminDashboard($user);
            default:
                return response()->json(['error' => 'Invalid user role'], 400);
        }
    }

    /**
     * Get client dashboard data
     */
    private function getClientDashboard(User $user)
    {
        try {
            $today = Carbon::today();
            $nextMonth = $today->copy()->addMonth();

            // Reservations summary
            $totalReservations = Reservation::where('client_id', $user->id)->count();
            $upcomingReservations = Reservation::where('client_id', $user->id)
                ->where('scheduled_at', '>=', $today)
                ->where('status', '!=', 'cancelled')
                ->orderBy('scheduled_at')
                ->limit(5)
                ->with(['service', 'stylist'])
                ->get();

            $pastReservations = Reservation::where('client_id', $user->id)
                ->where('scheduled_at', '<', $today)
                ->where('status', 'completed')
                ->count();

            // Notifications
            $unreadNotifications = Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();

            $recentNotifications = Notification::where('user_id', $user->id)
                ->with('reservation')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            // Favorite services (most booked)
            $favoriteServices = Reservation::where('client_id', $user->id)
                ->select('service_id')
                ->groupBy('service_id')
                ->orderByRaw('COUNT(*) DESC')
                ->limit(3)
                ->with('service')
                ->get();

            return response()->json([
                'user_type' => 'client',
                'summary' => [
                    'total_reservations' => $totalReservations,
                    'completed_reservations' => $pastReservations,
                    'unread_notifications' => $unreadNotifications,
                ],
                'upcoming_reservations' => $upcomingReservations,
                'recent_notifications' => $recentNotifications,
                'favorite_services' => $favoriteServices,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to load client dashboard'], 500);
        }
    }

    /**
     * Get stylist dashboard data
     */
    private function getStylistDashboard(User $user)
    {
        try {
            $today = Carbon::today();

            // Reservations summary
            $totalReservations = Reservation::where('stylist_id', $user->id)->count();
            $todayReservations = Reservation::where('stylist_id', $user->id)
                ->whereDate('scheduled_at', $today)
                ->where('status', '!=', 'cancelled')
                ->orderBy('scheduled_at')
                ->with(['service', 'client'])
                ->get();

            $upcomingReservations = Reservation::where('stylist_id', $user->id)
                ->where('scheduled_at', '>', $today)
                ->where('status', '!=', 'cancelled')
                ->orderBy('scheduled_at')
                ->limit(5)
                ->with(['service', 'client'])
                ->get();

            $completedReservations = Reservation::where('stylist_id', $user->id)
                ->where('status', 'completed')
                ->count();

            // Earnings/revenue (simple count, not actual amounts)
            $monthlyReservations = Reservation::where('stylist_id', $user->id)
                ->whereBetween('scheduled_at', [
                    $today->copy()->startOfMonth(),
                    $today->copy()->endOfMonth()
                ])
                ->where('status', 'completed')
                ->count();

            // Notifications
            $unreadNotifications = Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();

            // Profile info
            $profile = $user->profile;

            return response()->json([
                'user_type' => 'stylist',
                'summary' => [
                    'total_reservations' => $totalReservations,
                    'completed_reservations' => $completedReservations,
                    'monthly_reservations' => $monthlyReservations,
                    'unread_notifications' => $unreadNotifications,
                ],
                'today_reservations' => $todayReservations,
                'upcoming_reservations' => $upcomingReservations,
                'profile' => [
                    'rating' => $profile?->rating ?? 0,
                    'specialization' => $profile?->specialization,
                    'experience_years' => $profile?->experience_years,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to load stylist dashboard'], 500);
        }
    }

    /**
     * Get admin dashboard data
     */
    private function getAdminDashboard(User $user)
    {
        try {
            $today = Carbon::today();

            // Users statistics
            $totalUsers = User::count();
            $totalClients = User::where('role', 'client')->count();
            $totalStylists = User::where('role', 'stylist')->count();
            $activeUsers = User::where('is_active', true)->count();
            $inactiveUsers = User::where('is_active', false)->count();

            // Reservations statistics
            $totalReservations = Reservation::count();
            $pendingReservations = Reservation::where('status', 'pending')->count();
            $confirmedReservations = Reservation::where('status', 'confirmed')->count();
            $completedReservations = Reservation::where('status', 'completed')->count();
            $cancelledReservations = Reservation::where('status', 'cancelled')->count();

            // Today's reservations
            $todayReservations = Reservation::whereDate('scheduled_at', $today)
                ->where('status', '!=', 'cancelled')
                ->count();

            // Services statistics
            $totalServices = Service::count();
            $activeServices = Service::where('is_active', true)->count();

            // Monthly data for chart
            $monthStart = $today->copy()->startOfMonth();
            $monthEnd = $today->copy()->endOfMonth();

            $monthlyReservations = [];
            $currentDate = $monthStart->copy();
            while ($currentDate <= $monthEnd) {
                $count = Reservation::whereDate('scheduled_at', $currentDate)->count();
                $monthlyReservations[] = [
                    'date' => $currentDate->format('Y-m-d'),
                    'count' => $count,
                ];
                $currentDate->addDay();
            }

            // Recent reservations
            $recentReservations = Reservation::with(['client', 'stylist', 'service'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            // Top stylists
            $topStylists = Reservation::select('stylist_id')
                ->where('status', 'completed')
                ->groupBy('stylist_id')
                ->orderByRaw('COUNT(*) DESC')
                ->limit(5)
                ->with('stylist')
                ->get();

            return response()->json([
                'user_type' => 'admin',
                'users' => [
                    'total' => $totalUsers,
                    'clients' => $totalClients,
                    'stylists' => $totalStylists,
                    'active' => $activeUsers,
                    'inactive' => $inactiveUsers,
                ],
                'reservations' => [
                    'total' => $totalReservations,
                    'pending' => $pendingReservations,
                    'confirmed' => $confirmedReservations,
                    'completed' => $completedReservations,
                    'cancelled' => $cancelledReservations,
                    'today' => $todayReservations,
                ],
                'services' => [
                    'total' => $totalServices,
                    'active' => $activeServices,
                ],
                'monthly_data' => $monthlyReservations,
                'recent_reservations' => $recentReservations,
                'top_stylists' => $topStylists,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to load admin dashboard: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get quick stats for any authenticated user
     */
    public function quickStats(Request $request)
    {
        $user = $request->user();

        try {
            $stats = [
                'user_id' => $user->id,
                'user_role' => $user->role,
                'user_name' => $user->name,
            ];

            if ($user->role === 'client') {
                $stats['upcoming_reservations'] = Reservation::where('client_id', $user->id)
                    ->where('scheduled_at', '>=', Carbon::today())
                    ->where('status', '!=', 'cancelled')
                    ->count();
            } elseif ($user->role === 'stylist') {
                $stats['todays_reservations'] = Reservation::where('stylist_id', $user->id)
                    ->whereDate('scheduled_at', Carbon::today())
                    ->where('status', '!=', 'cancelled')
                    ->count();
            }

            $stats['unread_notifications'] = Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();

            return response()->json(['stats' => $stats]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to load statistics'], 500);
        }
    }
}
