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

    /**
     * Get client-specific dashboard
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function clientDashboard(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'client') {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Unauthorized - Client access only'
            ], 403);
        }

        return $this->getClientDashboard($user);
    }

    /**
     * Get stylist-specific dashboard
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function stylistDashboard(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'stylist') {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Unauthorized - Stylist access only'
            ], 403);
        }

        return $this->getStylistDashboard($user);
    }

    /**
     * Get admin-specific dashboard
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function adminDashboard(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Unauthorized - Admin access only'
            ], 403);
        }

        return $this->getAdminDashboard($user);
    }

    /**
     * Get super admin dashboard with platform-wide metrics
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function superAdminDashboard(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Unauthorized - Super Admin access only'
            ], 403);
        }

        try {
            $today = Carbon::today();

            // Platform-wide statistics
            $totalUsers = User::count();
            $activeUsers = User::where('is_active', true)->count();
            $newUsersThisMonth = User::whereBetween('created_at', [
                $today->copy()->startOfMonth(),
                $today->copy()->endOfMonth()
            ])->count();

            // Branches statistics
            $totalBranches = \App\Models\Branch::count();
            $activeBranches = \App\Models\Branch::where('is_active', true)->count();

            // Services statistics
            $totalServices = Service::count();
            $activeServices = Service::where('is_active', true)->count();

            // Reservations statistics
            $totalReservations = Reservation::count();
            $todayReservations = Reservation::whereDate('scheduled_at', $today)->count();
            $monthReservations = Reservation::whereBetween('scheduled_at', [
                $today->copy()->startOfMonth(),
                $today->copy()->endOfMonth()
            ])->count();

            // Revenue statistics (from payments)
            $monthRevenue = \App\Models\Payment::whereBetween('created_at', [
                $today->copy()->startOfMonth(),
                $today->copy()->endOfMonth()
            ])->where('status', 'completed')->sum('amount');

            $totalRevenue = \App\Models\Payment::where('status', 'completed')->sum('amount');

            // Top performing branches
            $topBranches = \App\Models\Branch::withCount(['stylists', 'posts'])
                ->orderBy('stylists_count', 'desc')
                ->limit(5)
                ->get();

            // Recent activities
            $recentReservations = Reservation::with(['client', 'stylist', 'service'])
                ->latest()
                ->limit(10)
                ->get();

            // Growth metrics (comparing to last month)
            $lastMonthUsers = User::whereBetween('created_at', [
                $today->copy()->subMonth()->startOfMonth(),
                $today->copy()->subMonth()->endOfMonth()
            ])->count();

            $userGrowth = $lastMonthUsers > 0
                ? round((($newUsersThisMonth - $lastMonthUsers) / $lastMonthUsers) * 100, 2)
                : 0;

            return response()->json([
                'success' => true,
                'data' => [
                    'user_type' => 'super_admin',
                    'platform_stats' => [
                        'total_users' => $totalUsers,
                        'active_users' => $activeUsers,
                        'new_users_this_month' => $newUsersThisMonth,
                        'user_growth_percentage' => $userGrowth,
                    ],
                    'branches' => [
                        'total' => $totalBranches,
                        'active' => $activeBranches,
                        'top_branches' => $topBranches,
                    ],
                    'services' => [
                        'total' => $totalServices,
                        'active' => $activeServices,
                    ],
                    'reservations' => [
                        'total' => $totalReservations,
                        'today' => $todayReservations,
                        'this_month' => $monthReservations,
                    ],
                    'revenue' => [
                        'total' => $totalRevenue,
                        'this_month' => $monthRevenue,
                    ],
                    'recent_activities' => $recentReservations,
                ],
                'message' => 'Super admin dashboard data retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to load super admin dashboard: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get analytics data for charts and reports
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function analytics(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Unauthorized - Admin access only'
            ], 403);
        }

        try {
            $period = $request->input('period', 'month'); // week, month, year
            $today = Carbon::today();

            switch ($period) {
                case 'week':
                    $start = $today->copy()->startOfWeek();
                    $end = $today->copy()->endOfWeek();
                    break;
                case 'year':
                    $start = $today->copy()->startOfYear();
                    $end = $today->copy()->endOfYear();
                    break;
                case 'month':
                default:
                    $start = $today->copy()->startOfMonth();
                    $end = $today->copy()->endOfMonth();
                    break;
            }

            // Daily reservations data
            $reservationsData = [];
            $currentDate = $start->copy();
            while ($currentDate <= $end) {
                $count = Reservation::whereDate('scheduled_at', $currentDate)->count();
                $reservationsData[] = [
                    'date' => $currentDate->format('Y-m-d'),
                    'count' => $count,
                ];
                $currentDate->addDay();
            }

            // Service popularity
            $popularServices = Reservation::select('service_id')
                ->selectRaw('COUNT(*) as booking_count')
                ->whereBetween('scheduled_at', [$start, $end])
                ->groupBy('service_id')
                ->orderBy('booking_count', 'desc')
                ->limit(10)
                ->with('service')
                ->get();

            // Revenue by day
            $revenueData = [];
            $currentDate = $start->copy();
            while ($currentDate <= $end) {
                $revenue = \App\Models\Payment::whereDate('created_at', $currentDate)
                    ->where('status', 'completed')
                    ->sum('amount');
                $revenueData[] = [
                    'date' => $currentDate->format('Y-m-d'),
                    'revenue' => $revenue,
                ];
                $currentDate->addDay();
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => $period,
                    'start_date' => $start->format('Y-m-d'),
                    'end_date' => $end->format('Y-m-d'),
                    'reservations' => $reservationsData,
                    'popular_services' => $popularServices,
                    'revenue' => $revenueData,
                ],
                'message' => 'Analytics data retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Failed to load analytics: ' . $e->getMessage()
            ], 500);
        }
    }
}
