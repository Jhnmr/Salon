<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Security Headers Middleware
 *
 * Adds comprehensive security headers to all responses to protect against
 * common web vulnerabilities including XSS, clickjacking, MIME sniffing,
 * and other security threats.
 *
 * Headers implemented:
 * - Content-Security-Policy (CSP)
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - X-XSS-Protection
 * - Strict-Transport-Security (HSTS)
 * - Referrer-Policy
 * - Permissions-Policy
 *
 * @package App\Http\Middleware
 */
class SecurityHeadersMiddleware
{
    /**
     * Security headers configuration
     *
     * @var array<string, string>
     */
    protected array $headers = [];

    /**
     * Initialize security headers from configuration
     */
    public function __construct()
    {
        $this->headers = [
            // Content Security Policy - Restricts resource loading
            'Content-Security-Policy' => config(
                'security.headers.csp',
                implode('; ', [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-inline' https://js.stripe.com",
                    "style-src 'self' 'unsafe-inline'",
                    "img-src 'self' data: https:",
                    "font-src 'self' data:",
                    "connect-src 'self' https://api.stripe.com",
                    "frame-ancestors 'none'",
                    "base-uri 'self'",
                    "form-action 'self'"
                ])
            ),

            // Prevent clickjacking attacks
            'X-Frame-Options' => config('security.headers.x_frame_options', 'DENY'),

            // Prevent MIME type sniffing
            'X-Content-Type-Options' => config('security.headers.x_content_type_options', 'nosniff'),

            // Enable XSS protection in older browsers
            'X-XSS-Protection' => config('security.headers.x_xss_protection', '1; mode=block'),

            // Force HTTPS connections
            'Strict-Transport-Security' => config(
                'security.headers.hsts',
                'max-age=31536000; includeSubDomains'
            ),

            // Control referrer information
            'Referrer-Policy' => config(
                'security.headers.referrer_policy',
                'strict-origin-when-cross-origin'
            ),

            // Control browser features and APIs
            'Permissions-Policy' => config(
                'security.headers.permissions_policy',
                'geolocation=(), microphone=(), camera=()'
            ),
        ];
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Add all security headers to response
        foreach ($this->headers as $key => $value) {
            if (!empty($value)) {
                $response->headers->set($key, $value);
            }
        }

        // Add additional headers for API responses
        if ($request->is('api/*')) {
            // Remove X-Powered-By header to hide server information
            $response->headers->remove('X-Powered-By');

            // Add API-specific headers
            $response->headers->set('X-Content-Type-Options', 'nosniff');
            $response->headers->set('X-Robots-Tag', 'noindex, nofollow');
        }

        return $response;
    }
}
