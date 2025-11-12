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
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\StylistController;

// Auth routes (public)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth/refresh', [AuthController::class, 'refresh']);

// Public profile routes
Route::get('/stylists', [ProfileController::class, 'getStylistProfiles']);
Route::get('/profiles/{userId}', [ProfileController::class, 'getByUserId']);

// Public service routes
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{id}', [ServiceController::class, 'show']);
Route::get('/services/category/{category}', [ServiceController::class, 'getByCategory']);

// Public reservation routes
Route::get('/reservations/available-slots', [ReservationController::class, 'getAvailableSlots']);
Route::get('/reservations/stylist/{stylistId}', [ReservationController::class, 'getStylistReservations']);

// Public availability routes
Route::get('/availability/{stylistId}', [AvailabilityController::class, 'show']);
Route::get('/availability/{stylistId}/{day}', [AvailabilityController::class, 'getByDay']);

// Public branch routes
Route::get('/branches', [BranchController::class, 'index']);
Route::get('/branches/{id}', [BranchController::class, 'show']);
Route::get('/branches/{id}/stats', [BranchController::class, 'stats']);

// Public stylist routes
Route::get('/stylists', [StylistController::class, 'index']);
Route::get('/stylists/{id}', [StylistController::class, 'show']);

// Payment webhooks (public - no auth for webhooks)
Route::post('/payments/webhook/stripe', [PaymentController::class, 'stripeWebhook']);
Route::post('/payments/webhook/paypal', [PaymentController::class, 'paypalWebhook']);

Route::middleware('jwt')->group(function () {
    // Auth (protected)
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/auth/revoke-all', [AuthController::class, 'revokeAll']);

    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'store']);

    // Services (admin only for create/update/delete)
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{id}', [ServiceController::class, 'update']);
    Route::delete('/services/{id}', [ServiceController::class, 'destroy']);

    // Reservations
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::get('/reservations/{id}', [ReservationController::class, 'show']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::put('/reservations/{id}', [ReservationController::class, 'update']);
    Route::post('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);

    // Users (admin only)
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/role/{role}', [UserController::class, 'getByRole']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::post('/users/{id}/deactivate', [UserController::class, 'deactivate']);
    Route::post('/users/{id}/activate', [UserController::class, 'activate']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::get('/users/statistics/all', [UserController::class, 'getStatistics']);

    // Availability
    Route::get('/availability/mine', [AvailabilityController::class, 'myAvailability']);
    Route::post('/availability', [AvailabilityController::class, 'store']);
    Route::put('/availability/{id}', [AvailabilityController::class, 'update']);
    Route::delete('/availability/{id}', [AvailabilityController::class, 'destroy']);
    Route::post('/availability/bulk-set', [AvailabilityController::class, 'bulkSet']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::get('/notifications/unread/count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/stats', [DashboardController::class, 'quickStats']);

    // Payments
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::post('/payments/{id}/confirm', [PaymentController::class, 'confirm']);
    Route::post('/payments/{id}/refund', [PaymentController::class, 'refund']);
    Route::get('/payments/statistics', [PaymentController::class, 'statistics']);

    // Invoices
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
    Route::post('/invoices', [InvoiceController::class, 'store']);
    Route::post('/invoices/{id}/send', [InvoiceController::class, 'send']);
    Route::get('/invoices/{id}/download', [InvoiceController::class, 'download']);
    Route::post('/invoices/{id}/cancel', [InvoiceController::class, 'cancel']);
    Route::post('/invoices/{id}/resend', [InvoiceController::class, 'resend']);
    Route::get('/invoices/statistics', [InvoiceController::class, 'stats']);

    // Audit Logs (admin only)
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
    Route::get('/audit-logs/mine', [AuditLogController::class, 'mine']);
    Route::get('/audit-logs/{id}', [AuditLogController::class, 'show']);
    Route::get('/audit-logs/record/{tableName}/{recordId}', [AuditLogController::class, 'recordHistory']);
    Route::get('/audit-logs/statistics', [AuditLogController::class, 'stats']);
    Route::delete('/audit-logs/cleanup', [AuditLogController::class, 'cleanup']);

    // Branches (admin management)
    Route::post('/branches', [BranchController::class, 'store']);
    Route::put('/branches/{id}', [BranchController::class, 'update']);
    Route::delete('/branches/{id}', [BranchController::class, 'destroy']);
    Route::post('/branches/{id}/activate', [BranchController::class, 'activate']);
    Route::post('/branches/{id}/deactivate', [BranchController::class, 'deactivate']);
    Route::post('/branches/{id}/verify', [BranchController::class, 'verify']);

    // Stylists (admin management)
    Route::post('/stylists', [StylistController::class, 'store']);
    Route::put('/stylists/{id}', [StylistController::class, 'update']);
});
