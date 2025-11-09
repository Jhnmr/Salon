<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ReservationController;

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
});
