<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AuditLog;
use App\Services\JWTService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Auth\Events\Registered;

/**
 * Authentication Controller
 *
 * Handles user registration, login, logout, and token refresh
 * Uses JWT RS256 for authentication
 */
class AuthController extends Controller
{
    /**
     * @var JWTService
     */
    protected JWTService $jwtService;

    /**
     * Constructor
     *
     * @param JWTService $jwtService
     */
    public function __construct(JWTService $jwtService)
    {
        $this->jwtService = $jwtService;
    }

    /**
     * Register a new user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:client,stylist,admin',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'is_active' => true,
            ]);

            event(new Registered($user));

            // Log registration
            AuditLog::logCreate('users', $user->id, $user->only(['name', 'email', 'role']));

            // Generate JWT tokens
            $tokens = $this->jwtService->generateTokenPair($user);

            return response()->json([
                'status' => 'success',
                'message' => 'User registered successfully',
                'data' => [
                    'user' => $user->only(['id', 'name', 'email', 'role', 'is_active']),
                    'access_token' => $tokens['access_token'],
                    'refresh_token' => $tokens['refresh_token'],
                    'token_type' => $tokens['token_type'],
                    'expires_in' => $tokens['expires_in'],
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Registration failed',
                'errors' => ['server' => ['An error occurred during registration']],
            ], 500);
        }
    }

    /**
     * Login a user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            // Log failed login attempt
            AuditLog::logFailedLogin($request->email);

            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials',
                'errors' => ['auth' => ['The provided credentials are incorrect']],
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'User account is inactive',
                'errors' => ['auth' => ['Your account has been deactivated']],
            ], 403);
        }

        // Generate JWT tokens
        $tokens = $this->jwtService->generateTokenPair($user);

        // Log successful login
        AuditLog::logLogin($user->id);

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => [
                'user' => $user->only(['id', 'name', 'email', 'role', 'is_active']),
                'access_token' => $tokens['access_token'],
                'refresh_token' => $tokens['refresh_token'],
                'token_type' => $tokens['token_type'],
                'expires_in' => $tokens['expires_in'],
            ],
        ], 200);
    }

    /**
     * Logout a user (blacklist current token)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        try {
            $jti = $request->input('_jwt_jti');

            if ($jti) {
                // Blacklist the current token
                $this->jwtService->blacklistToken($jti);
            }

            // Log logout
            $user = $request->user();
            if ($user) {
                AuditLog::logLogout($user->id);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Logged out successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Logout failed',
                'errors' => ['server' => [$e->getMessage()]],
            ], 500);
        }
    }

    /**
     * Refresh access token using refresh token
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'refresh_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $tokens = $this->jwtService->refresh($request->refresh_token);

            return response()->json([
                'status' => 'success',
                'message' => 'Token refreshed successfully',
                'data' => $tokens,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token refresh failed',
                'errors' => ['auth' => [$e->getMessage()]],
            ], 401);
        }
    }

    /**
     * Get authenticated user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => $user->only(['id', 'name', 'email', 'role', 'is_active']),
            ],
        ], 200);
    }

    /**
     * Revoke all tokens for a user (logout from all devices)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function revokeAll(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found',
                ], 404);
            }

            $this->jwtService->revokeAllUserTokens($user->id);

            return response()->json([
                'status' => 'success',
                'message' => 'All tokens revoked successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to revoke tokens',
                'errors' => ['server' => [$e->getMessage()]],
            ], 500);
        }
    }
}
