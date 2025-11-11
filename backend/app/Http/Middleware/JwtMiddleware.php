<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\JWTService;
use Symfony\Component\HttpFoundation\Response;

/**
 * JWT Authentication Middleware
 *
 * Validates JWT tokens and authenticates users
 */
class JwtMiddleware
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
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get Authorization header
        $authHeader = $request->header('Authorization');

        if (!$authHeader) {
            return response()->json([
                'status' => 'error',
                'message' => 'Authorization header not found',
                'errors' => ['auth' => ['No authorization token provided']],
            ], 401);
        }

        // Extract token
        $token = $this->jwtService->extractTokenFromHeader($authHeader);

        if (!$token) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid authorization header format',
                'errors' => ['auth' => ['Authorization header must be in format: Bearer {token}']],
            ], 401);
        }

        // Validate token and get user
        try {
            $decoded = $this->jwtService->decode($token);
            $user = $this->jwtService->validateToken($token);

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found',
                    'errors' => ['auth' => ['User associated with token does not exist']],
                ], 401);
            }

            // Check if user is active
            if (!$user->is_active) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User account is inactive',
                    'errors' => ['auth' => ['Your account has been deactivated']],
                ], 403);
            }

            // Inject user and token data into request
            $request->setUserResolver(function () use ($user) {
                return $user;
            });

            // Add decoded token data to request for potential use in controllers
            $request->merge([
                '_jwt_user_id' => $decoded->sub,
                '_jwt_role' => $decoded->role ?? null,
                '_jwt_jti' => $decoded->jti,
                '_jwt_iat' => $decoded->iat,
                '_jwt_exp' => $decoded->exp,
            ]);

            return $next($request);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token validation failed',
                'errors' => ['auth' => [$e->getMessage()]],
            ], 401);
        }
    }
}
