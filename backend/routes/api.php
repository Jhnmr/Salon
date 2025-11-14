<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\StylistController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AuditLogController;

/*
|--------------------------------------------------------------------------
| API Routes - Version 1
|--------------------------------------------------------------------------
|
| RESTful API routes for the SALON application with proper authentication,
| authorization, and rate limiting.
|
*/

// ============================================================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================================================

Route::prefix('v1')->group(function () {

    // Authentication Routes (with rate limiting for security)
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,60'); // 5 attempts per hour
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,10'); // 5 attempts per 10 minutes
        Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('throttle:10,1'); // 10 per minute
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,60'); // 3 per hour
        Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,60'); // 5 per hour
    });

    // Public Profile Routes
    Route::prefix('profiles')->group(function () {
        Route::get('/stylists', [ProfileController::class, 'getStylistProfiles']);
        Route::get('/{userId}', [ProfileController::class, 'getByUserId']);
    });

    // Public Service Routes
    Route::prefix('services')->group(function () {
        Route::get('/', [ServiceController::class, 'index']);
        Route::get('/{id}', [ServiceController::class, 'show']);
        Route::get('/category/{category}', [ServiceController::class, 'getByCategory']);
    });

    // Public Branch Routes
    Route::prefix('branches')->group(function () {
        Route::get('/', [BranchController::class, 'index']);
        Route::get('/{id}', [BranchController::class, 'show']);
    });

    // Public Stylist Routes
    Route::prefix('stylists')->group(function () {
        Route::get('/', [StylistController::class, 'index']);
        Route::get('/{id}', [StylistController::class, 'show']);
        Route::get('/{id}/reviews', [StylistController::class, 'reviews']);
    });

    // Public Post Routes (portfolio)
    Route::prefix('posts')->group(function () {
        Route::get('/', [PostController::class, 'index']);
        Route::get('/{id}', [PostController::class, 'show']);
    });

    // Public Availability Routes
    Route::prefix('availability')->group(function () {
        Route::get('/{stylistId}', [AvailabilityController::class, 'show']);
        Route::get('/{stylistId}/{day}', [AvailabilityController::class, 'getByDay']);
    });

    // Public Promotion Routes
    Route::prefix('promotions')->group(function () {
        Route::get('/', [PromotionController::class, 'index']);
        Route::get('/{id}', [PromotionController::class, 'show']);
    });

    // Public Reservation Routes
    Route::get('/reservations/available-slots', [ReservationController::class, 'getAvailableSlots']);

});

// ============================================================================
// AUTHENTICATED ROUTES (JWT Middleware Required)
// ============================================================================

Route::prefix('v1')->middleware('jwt')->group(function () {

    // Auth Protected Routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/revoke-all', [AuthController::class, 'revokeAll']);
        Route::put('/update-profile', [AuthController::class, 'updateProfile']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);
    });

    // Profile Routes
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::post('/', [ProfileController::class, 'store']);
        Route::put('/', [ProfileController::class, 'update']);
    });

    // ========================================================================
    // POSTS ROUTES (Social Portfolio)
    // ========================================================================
    Route::prefix('posts')->group(function () {
        // Authenticated users can view feed
        Route::get('/feed', [PostController::class, 'feed']);

        // Stylists only - create, update, delete posts
        Route::post('/', [PostController::class, 'store']);
        Route::put('/{id}', [PostController::class, 'update']);
        Route::delete('/{id}', [PostController::class, 'destroy']);

        // All authenticated users can like and comment
        Route::post('/{id}/like', [PostController::class, 'toggleLike']);
        Route::post('/{id}/comment', [PostController::class, 'addComment']);
    });

    // ========================================================================
    // CONVERSATIONS ROUTES (Chat)
    // ========================================================================
    Route::prefix('conversations')->group(function () {
        Route::get('/', [ConversationController::class, 'index']);
        Route::get('/search', [ConversationController::class, 'search']);
        Route::get('/{id}', [ConversationController::class, 'show']);
        Route::post('/', [ConversationController::class, 'store']);
        Route::delete('/{id}', [ConversationController::class, 'destroy']);
        Route::get('/{id}/messages', [ConversationController::class, 'messages']);
        Route::put('/{id}/read', [ConversationController::class, 'markAsRead']);
    });

    // ========================================================================
    // MESSAGES ROUTES (Chat Messages)
    // ========================================================================
    Route::prefix('messages')->group(function () {
        Route::post('/', [MessageController::class, 'store']);
        Route::put('/{id}', [MessageController::class, 'update']);
        Route::delete('/{id}', [MessageController::class, 'destroy']);
        Route::put('/{id}/read', [MessageController::class, 'markAsRead']);
        Route::get('/unread-count', [MessageController::class, 'unreadCount']);
        Route::get('/search', [MessageController::class, 'search']);
    });

    // ========================================================================
    // PROMOTIONS ROUTES (Discounts)
    // ========================================================================
    Route::prefix('promotions')->group(function () {
        // All authenticated users can validate and apply
        Route::post('/validate', [PromotionController::class, 'validate']);
        Route::post('/apply', [PromotionController::class, 'apply']);

        // Admin only - CRUD operations
        Route::post('/', [PromotionController::class, 'store']);
        Route::put('/{id}', [PromotionController::class, 'update']);
        Route::delete('/{id}', [PromotionController::class, 'destroy']);
        Route::get('/{id}/statistics', [PromotionController::class, 'statistics']);
    });

    // ========================================================================
    // RESERVATIONS ROUTES
    // ========================================================================
    Route::prefix('reservations')->group(function () {
        Route::get('/', [ReservationController::class, 'index']);
        Route::get('/{id}', [ReservationController::class, 'show']);
        Route::post('/', [ReservationController::class, 'store']);
        Route::put('/{id}', [ReservationController::class, 'update']);

        // Reservation actions
        Route::post('/check-availability', [ReservationController::class, 'checkAvailability']);
        Route::post('/{id}/cancel', [ReservationController::class, 'cancel']);
        Route::post('/{id}/confirm', [ReservationController::class, 'confirm']);
        Route::post('/{id}/complete', [ReservationController::class, 'complete']);
        Route::post('/{id}/reschedule', [ReservationController::class, 'reschedule']);
    });

    // ========================================================================
    // SERVICES ROUTES (Admin only for CUD operations)
    // ========================================================================
    Route::prefix('services')->group(function () {
        Route::post('/', [ServiceController::class, 'store']);
        Route::put('/{id}', [ServiceController::class, 'update']);
        Route::delete('/{id}', [ServiceController::class, 'destroy']);
    });

    // ========================================================================
    // BRANCHES ROUTES (Admin only for CUD operations)
    // ========================================================================
    Route::prefix('branches')->group(function () {
        Route::post('/', [BranchController::class, 'store']);
        Route::put('/{id}', [BranchController::class, 'update']);
        Route::delete('/{id}', [BranchController::class, 'destroy']);
    });

    // ========================================================================
    // STYLISTS ROUTES
    // ========================================================================
    Route::prefix('stylists')->group(function () {
        Route::post('/', [StylistController::class, 'store']);
        Route::put('/{id}', [StylistController::class, 'update']);
        Route::delete('/{id}', [StylistController::class, 'destroy']);
        Route::get('/{id}/schedule', [StylistController::class, 'schedule']);
    });

    // ========================================================================
    // USERS ROUTES (Admin only)
    // ========================================================================
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/role/{role}', [UserController::class, 'getByRole']);
        Route::get('/statistics', [UserController::class, 'getStatistics']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::put('/{id}', [UserController::class, 'update']);
        Route::delete('/{id}', [UserController::class, 'destroy']);
        Route::post('/{id}/activate', [UserController::class, 'activate']);
        Route::post('/{id}/deactivate', [UserController::class, 'deactivate']);
    });

    // ========================================================================
    // AVAILABILITY ROUTES (Stylist only)
    // ========================================================================
    Route::prefix('availability')->group(function () {
        Route::get('/mine', [AvailabilityController::class, 'myAvailability']);
        Route::post('/', [AvailabilityController::class, 'store']);
        Route::put('/{id}', [AvailabilityController::class, 'update']);
        Route::delete('/{id}', [AvailabilityController::class, 'destroy']);
        Route::post('/bulk-set', [AvailabilityController::class, 'bulkSet']);
    });

    // ========================================================================
    // NOTIFICATIONS ROUTES
    // ========================================================================
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread', [NotificationController::class, 'unread']);
        Route::get('/unread/count', [NotificationController::class, 'unreadCount']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });

    // ========================================================================
    // DASHBOARD ROUTES (Role-based)
    // ========================================================================
    Route::prefix('dashboard')->group(function () {
        // Generic dashboard (auto-detects role)
        Route::get('/', [DashboardController::class, 'index']);
        Route::get('/stats', [DashboardController::class, 'quickStats']);

        // Role-specific dashboards
        Route::get('/client', [DashboardController::class, 'clientDashboard']);
        Route::get('/stylist', [DashboardController::class, 'stylistDashboard']);
        Route::get('/admin', [DashboardController::class, 'adminDashboard']);
        Route::get('/super-admin', [DashboardController::class, 'superAdminDashboard']);

        // Analytics (admin only)
        Route::get('/analytics', [DashboardController::class, 'analytics']);
    });

    // ========================================================================
    // INVOICES ROUTES
    // ========================================================================
    Route::prefix('invoices')->group(function () {
        Route::get('/', [InvoiceController::class, 'index']);
        Route::get('/{id}', [InvoiceController::class, 'show']);
        Route::post('/', [InvoiceController::class, 'store']);
        Route::put('/{id}', [InvoiceController::class, 'update']);
        Route::get('/{id}/download', [InvoiceController::class, 'download']);
    });

    // ========================================================================
    // PAYMENTS ROUTES
    // ========================================================================
    Route::prefix('payments')->group(function () {
        Route::get('/', [PaymentController::class, 'index']);
        Route::get('/{id}', [PaymentController::class, 'show']);
        Route::post('/', [PaymentController::class, 'store']);
        Route::post('/process', [PaymentController::class, 'process']);
        Route::post('/{id}/refund', [PaymentController::class, 'refund']);
        Route::get('/methods', [PaymentController::class, 'paymentMethods']);
    });

    // ========================================================================
    // AUDIT LOGS ROUTES (Admin only)
    // ========================================================================
    Route::prefix('audit-logs')->group(function () {
        Route::get('/', [AuditLogController::class, 'index']);
        Route::get('/{id}', [AuditLogController::class, 'show']);
    });

    // ========================================================================
    // REVIEWS ROUTES
    // ========================================================================
    Route::prefix('reviews')->group(function () {
        Route::post('/', [\App\Http\Controllers\ReviewController::class, 'store']);
        Route::put('/{id}', [\App\Http\Controllers\ReviewController::class, 'update']);
        Route::delete('/{id}', [\App\Http\Controllers\ReviewController::class, 'destroy']);
    });

    // ========================================================================
    // FAVORITES ROUTES
    // ========================================================================
    Route::prefix('favorites')->group(function () {
        Route::get('/', [\App\Http\Controllers\FavoriteController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\FavoriteController::class, 'store']);
        Route::delete('/{id}', [\App\Http\Controllers\FavoriteController::class, 'destroy']);
    });
});

// ============================================================================
// FALLBACK ROUTE
// ============================================================================

Route::fallback(function () {
    return response()->json([
        'success' => false,
        'data' => null,
        'message' => 'API endpoint not found',
    ], 404);
});
