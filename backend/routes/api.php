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

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

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

Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

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
});
