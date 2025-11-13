<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Advanced Rate Limiting Middleware
 *
 * Provides Redis-based rate limiting with different limits for:
 * - Public routes (100 requests/minute per IP)
 * - Authenticated users (1000 requests/hour)
 * - Authentication routes (5 requests/minute)
 * - API routes (100 requests/minute)
 *
 * Adds standard rate limit headers and returns 429 status when exceeded.
 *
 * @package App\Http\Middleware
 */
class RateLimitMiddleware
{
    /**
     * Rate limit configurations for different route groups
     *
     * @var array<string, array{requests: int, seconds: int}>
     */
    protected array $limits = [
        'auth' => ['requests' => 5, 'seconds' => 60],           // 5 requests per minute
        'api' => ['requests' => 100, 'seconds' => 60],          // 100 requests per minute
        'public' => ['requests' => 100, 'seconds' => 60],       // 100 requests per minute
        'authenticated' => ['requests' => 1000, 'seconds' => 3600], // 1000 requests per hour
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $group  Rate limit group (auth, api, public, authenticated)
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string $group = 'api'): Response
    {
        // Skip rate limiting if disabled in config
        if (!config('security.rate_limiting.enabled', true)) {
            return $next($request);
        }

        // Determine the rate limit configuration
        $limit = $this->limits[$group] ?? $this->limits['api'];

        // Generate unique key for this request
        $key = $this->resolveRequestKey($request, $group);

        // Get current count from Redis
        try {
            $current = (int) Redis::get($key) ?? 0;
            $remaining = max(0, $limit['requests'] - $current);

            // Check if limit exceeded
            if ($current >= $limit['requests']) {
                $resetTime = Redis::ttl($key);

                // Log rate limit violation
                Log::warning('Rate limit exceeded', [
                    'ip' => $request->ip(),
                    'user_id' => $request->user()?->id,
                    'group' => $group,
                    'path' => $request->path(),
                    'reset_in' => $resetTime
                ]);

                return $this->buildRateLimitResponse(
                    $limit['requests'],
                    0,
                    time() + $resetTime,
                    $resetTime
                );
            }

            // Increment counter
            Redis::incr($key);

            // Set expiration if this is first request
            if ($current === 0) {
                Redis::expire($key, $limit['seconds']);
            }

            // Get TTL for reset time
            $ttl = Redis::ttl($key);
            $resetTime = time() + $ttl;

            // Process request
            $response = $next($request);

            // Add rate limit headers
            return $this->addRateLimitHeaders(
                $response,
                $limit['requests'],
                $remaining - 1, // Subtract 1 for current request
                $resetTime
            );

        } catch (\Exception $e) {
            // Log error but don't block request
            Log::error('Rate limit middleware error', [
                'error' => $e->getMessage(),
                'ip' => $request->ip(),
                'path' => $request->path()
            ]);

            // Allow request to proceed on Redis failure
            return $next($request);
        }
    }

    /**
     * Generate a unique cache key for the request
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $group
     * @return string
     */
    protected function resolveRequestKey(Request $request, string $group): string
    {
        $user = $request->user();

        // For authenticated users, use user ID for better tracking
        if ($user && $group === 'authenticated') {
            return sprintf(
                'rate_limit:%s:user:%s',
                $group,
                $user->id
            );
        }

        // For unauthenticated or specific route groups, use IP + route
        return sprintf(
            'rate_limit:%s:ip:%s:route:%s',
            $group,
            $request->ip(),
            md5($request->path())
        );
    }

    /**
     * Add rate limit headers to response
     *
     * @param  \Symfony\Component\HttpFoundation\Response  $response
     * @param  int  $limit
     * @param  int  $remaining
     * @param  int  $resetTime
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function addRateLimitHeaders(
        Response $response,
        int $limit,
        int $remaining,
        int $resetTime
    ): Response {
        $response->headers->set('X-RateLimit-Limit', (string) $limit);
        $response->headers->set('X-RateLimit-Remaining', (string) max(0, $remaining));
        $response->headers->set('X-RateLimit-Reset', (string) $resetTime);

        return $response;
    }

    /**
     * Build a rate limit exceeded response
     *
     * @param  int  $limit
     * @param  int  $remaining
     * @param  int  $resetTime
     * @param  int  $retryAfter
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function buildRateLimitResponse(
        int $limit,
        int $remaining,
        int $resetTime,
        int $retryAfter
    ): Response {
        $response = response()->json([
            'message' => 'Too many requests. Please try again later.',
            'error' => 'rate_limit_exceeded',
            'retry_after' => $retryAfter,
            'reset_at' => date('Y-m-d H:i:s', $resetTime)
        ], 429);

        $response->headers->set('X-RateLimit-Limit', (string) $limit);
        $response->headers->set('X-RateLimit-Remaining', (string) $remaining);
        $response->headers->set('X-RateLimit-Reset', (string) $resetTime);
        $response->headers->set('Retry-After', (string) $retryAfter);

        return $response;
    }
}
