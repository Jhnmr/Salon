<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting Configuration
    |--------------------------------------------------------------------------
    |
    | Configure rate limiting behavior for different route groups.
    | Rate limits use Redis for distributed counting.
    |
    */

    'rate_limiting' => [
        'enabled' => env('RATE_LIMITING_ENABLED', true),

        'limits' => [
            // Authentication routes - 5 requests per minute
            'auth' => [
                'requests' => env('RATE_LIMIT_AUTH_REQUESTS', 5),
                'seconds' => env('RATE_LIMIT_AUTH_SECONDS', 60),
            ],

            // General API routes - 100 requests per minute
            'api' => [
                'requests' => env('RATE_LIMIT_API_REQUESTS', 100),
                'seconds' => env('RATE_LIMIT_API_SECONDS', 60),
            ],

            // Public routes - 100 requests per minute per IP
            'public' => [
                'requests' => env('RATE_LIMIT_PUBLIC_REQUESTS', 100),
                'seconds' => env('RATE_LIMIT_PUBLIC_SECONDS', 60),
            ],

            // Authenticated users - 1000 requests per hour
            'authenticated' => [
                'requests' => env('RATE_LIMIT_AUTHENTICATED_REQUESTS', 1000),
                'seconds' => env('RATE_LIMIT_AUTHENTICATED_SECONDS', 3600),
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Headers Configuration
    |--------------------------------------------------------------------------
    |
    | Configure HTTP security headers to protect against common vulnerabilities.
    |
    */

    'headers' => [
        // Content Security Policy
        'csp' => env('SECURITY_CSP', implode('; ', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://js.stripe.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://api.stripe.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ])),

        // Prevent clickjacking
        'x_frame_options' => env('SECURITY_X_FRAME_OPTIONS', 'DENY'),

        // Prevent MIME type sniffing
        'x_content_type_options' => env('SECURITY_X_CONTENT_TYPE_OPTIONS', 'nosniff'),

        // XSS Protection (for older browsers)
        'x_xss_protection' => env('SECURITY_X_XSS_PROTECTION', '1; mode=block'),

        // HTTP Strict Transport Security
        'hsts' => env('SECURITY_HSTS', 'max-age=31536000; includeSubDomains'),

        // Referrer Policy
        'referrer_policy' => env('SECURITY_REFERRER_POLICY', 'strict-origin-when-cross-origin'),

        // Permissions Policy (formerly Feature Policy)
        'permissions_policy' => env('SECURITY_PERMISSIONS_POLICY', 'geolocation=(), microphone=(), camera=()'),
    ],

    /*
    |--------------------------------------------------------------------------
    | CORS Configuration
    |--------------------------------------------------------------------------
    |
    | Configure Cross-Origin Resource Sharing (CORS) settings.
    |
    */

    'cors' => [
        'enabled' => env('CORS_ENABLED', true),

        // Allowed origins - can be array or comma-separated string in env
        'allowed_origins' => env('CORS_ALLOWED_ORIGINS')
            ? array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS')))
            : [
                'https://salon.com',
                'http://localhost:3000',
                'http://localhost:5173',
            ],

        // Allowed HTTP methods
        'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

        // Allowed headers
        'allowed_headers' => [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
            'X-CSRF-Token',
            'X-Socket-Id',
        ],

        // Exposed headers (visible to browser)
        'exposed_headers' => [
            'X-RateLimit-Limit',
            'X-RateLimit-Remaining',
            'X-RateLimit-Reset',
        ],

        // Allow credentials (cookies, authorization headers)
        'supports_credentials' => true,

        // Preflight cache duration (in seconds)
        'max_age' => env('CORS_MAX_AGE', 86400), // 24 hours
    ],

    /*
    |--------------------------------------------------------------------------
    | Input Sanitization Configuration
    |--------------------------------------------------------------------------
    |
    | Configure input sanitization and XSS prevention settings.
    |
    */

    'input_sanitization' => [
        'enabled' => env('INPUT_SANITIZATION_ENABLED', true),

        // Additional fields to whitelist (won't be sanitized)
        'whitelist' => [],

        // Fields that should be treated as HTML
        'html_fields' => [
            'comment',
            'comments',
            'review',
            'reviews',
            'note',
            'notes',
            'message',
            'description',
            'bio',
            'about',
        ],

        // Fields that contain JSON data
        'json_fields' => [
            'metadata',
            'settings',
            'preferences',
            'data',
            'config',
            'options',
        ],

        // Log sanitization events
        'log_events' => env('INPUT_SANITIZATION_LOG', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Audit Logging Configuration
    |--------------------------------------------------------------------------
    |
    | Configure audit logging for tracking user actions and security events.
    |
    */

    'audit_logging' => [
        'enabled' => env('AUDIT_LOGGING_ENABLED', true),

        // Actions to log
        'log_actions' => ['CREATE', 'UPDATE', 'DELETE', 'AUTHORIZATION_FAILED'],

        // Paths to exclude from audit logging
        'excluded_paths' => [
            'api/health',
            'api/ping',
            'api/status',
            'up',
            '_ignition',
        ],

        // Log GET requests (usually disabled for performance)
        'log_reads' => env('AUDIT_LOG_READS', false),

        // Retention period in days (for cleanup jobs)
        'retention_days' => env('AUDIT_LOG_RETENTION_DAYS', 90),
    ],

    /*
    |--------------------------------------------------------------------------
    | General Security Settings
    |--------------------------------------------------------------------------
    |
    | Additional security configurations.
    |
    */

    // Enable/disable security middleware globally
    'enabled' => env('SECURITY_MIDDLEWARE_ENABLED', true),

    // Log security events
    'log_security_events' => env('LOG_SECURITY_EVENTS', true),

    // Trusted proxies (for proper IP detection)
    'trusted_proxies' => env('TRUSTED_PROXIES', '*'),

    // Force HTTPS in production
    'force_https' => env('FORCE_HTTPS', app()->environment('production')),

];
