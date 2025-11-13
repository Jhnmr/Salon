<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Advanced CORS (Cross-Origin Resource Sharing) Middleware
 *
 * Handles CORS preflight and actual requests with configurable:
 * - Allowed origins (from environment variable)
 * - HTTP methods (GET, POST, PUT, DELETE, PATCH, OPTIONS)
 * - Headers (Content-Type, Authorization, etc.)
 * - Credentials support
 * - Max age caching
 *
 * Properly handles OPTIONS preflight requests and adds appropriate
 * headers to all responses.
 *
 * @package App\Http\Middleware
 */
class CorsMiddleware
{
    /**
     * Allowed HTTP methods
     *
     * @var array<int, string>
     */
    protected array $allowedMethods = [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'PATCH',
        'OPTIONS'
    ];

    /**
     * Allowed request headers
     *
     * @var array<int, string>
     */
    protected array $allowedHeaders = [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-CSRF-Token',
        'X-Socket-Id'
    ];

    /**
     * Headers exposed to the browser
     *
     * @var array<int, string>
     */
    protected array $exposedHeaders = [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset'
    ];

    /**
     * Cache duration for preflight requests (in seconds)
     *
     * @var int
     */
    protected int $maxAge = 86400; // 24 hours

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Handle preflight OPTIONS request
        if ($request->isMethod('OPTIONS')) {
            return $this->handlePreflightRequest($request);
        }

        // Process the actual request
        $response = $next($request);

        // Add CORS headers to response
        return $this->addCorsHeaders($request, $response);
    }

    /**
     * Handle CORS preflight OPTIONS request
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function handlePreflightRequest(Request $request): Response
    {
        $response = response('', 200);

        // Add preflight headers
        $this->addCorsHeaders($request, $response);

        // Add specific preflight headers
        $response->headers->set(
            'Access-Control-Allow-Methods',
            implode(', ', $this->allowedMethods)
        );

        $response->headers->set(
            'Access-Control-Allow-Headers',
            implode(', ', $this->allowedHeaders)
        );

        $response->headers->set(
            'Access-Control-Max-Age',
            (string) $this->maxAge
        );

        return $response;
    }

    /**
     * Add CORS headers to response
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Symfony\Component\HttpFoundation\Response  $response
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function addCorsHeaders(Request $request, Response $response): Response
    {
        $origin = $request->header('Origin');

        // Check if origin is allowed
        if ($this->isOriginAllowed($origin)) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        } else {
            // For requests without Origin header or from same origin
            $allowedOrigins = $this->getAllowedOrigins();
            if (!empty($allowedOrigins) && !$origin) {
                // Use first allowed origin as fallback
                $response->headers->set('Access-Control-Allow-Origin', $allowedOrigins[0]);
            }
        }

        // Add exposed headers
        if (!empty($this->exposedHeaders)) {
            $response->headers->set(
                'Access-Control-Expose-Headers',
                implode(', ', $this->exposedHeaders)
            );
        }

        // Vary header to handle caching correctly
        $response->headers->set('Vary', 'Origin', false);

        return $response;
    }

    /**
     * Check if the origin is allowed
     *
     * @param  string|null  $origin
     * @return bool
     */
    protected function isOriginAllowed(?string $origin): bool
    {
        if (!$origin) {
            return false;
        }

        $allowedOrigins = $this->getAllowedOrigins();

        // Check for wildcard
        if (in_array('*', $allowedOrigins)) {
            return true;
        }

        // Check exact match
        if (in_array($origin, $allowedOrigins)) {
            return true;
        }

        // Check pattern match (e.g., *.example.com)
        foreach ($allowedOrigins as $allowedOrigin) {
            if ($this->matchesPattern($origin, $allowedOrigin)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get allowed origins from configuration
     *
     * @return array<int, string>
     */
    protected function getAllowedOrigins(): array
    {
        $origins = config('security.cors.allowed_origins');

        // If not set in config, get from environment variable
        if (empty($origins)) {
            $envOrigins = env('CORS_ALLOWED_ORIGINS', '');

            if (empty($envOrigins)) {
                // Default origins
                return [
                    'https://salon.com',
                    'http://localhost:3000',
                    'http://localhost:5173'
                ];
            }

            // Parse comma-separated origins
            $origins = array_map('trim', explode(',', $envOrigins));
        }

        return array_filter($origins);
    }

    /**
     * Check if origin matches pattern
     *
     * @param  string  $origin
     * @param  string  $pattern
     * @return bool
     */
    protected function matchesPattern(string $origin, string $pattern): bool
    {
        // Convert wildcard pattern to regex
        if (str_contains($pattern, '*')) {
            $regex = '/^' . str_replace(
                ['*', '.'],
                ['.*', '\.'],
                $pattern
            ) . '$/';

            return (bool) preg_match($regex, $origin);
        }

        return false;
    }
}
