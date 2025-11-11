<?php

return [

    /*
    |--------------------------------------------------------------------------
    | JWT Authentication Settings
    |--------------------------------------------------------------------------
    |
    | Here you may configure JWT authentication settings including
    | token TTL, refresh token TTL, algorithm, and key paths.
    |
    */

    /**
     * Secret key for HS256 algorithm (not used with RS256)
     */
    'secret' => env('JWT_SECRET', ''),

    /**
     * Private key path for RS256 algorithm
     */
    'private_key' => storage_path('jwt/private.key'),

    /**
     * Public key path for RS256 algorithm
     */
    'public_key' => storage_path('jwt/public.key'),

    /**
     * JWT algorithm (HS256, HS384, HS512, RS256, RS384, RS512)
     */
    'algorithm' => env('JWT_ALGORITHM', 'RS256'),

    /**
     * Time to live (in seconds) for access tokens
     * Default: 1 hour (3600 seconds)
     */
    'ttl' => env('JWT_TTL', 3600),

    /**
     * Time to live (in seconds) for refresh tokens
     * Default: 7 days (604800 seconds)
     */
    'refresh_ttl' => env('JWT_REFRESH_TTL', 604800),

    /**
     * Leeway time (in seconds) to account for clock skew
     * This helps prevent issues with token validation due to time differences
     */
    'leeway' => env('JWT_LEEWAY', 60),

    /**
     * Token issuer (iss claim)
     */
    'issuer' => env('JWT_ISSUER', 'salon-api'),

    /**
     * Token audience (aud claim)
     */
    'audience' => env('JWT_AUDIENCE', 'salon-app'),

    /**
     * Enable token blacklist (requires Redis)
     */
    'blacklist_enabled' => env('JWT_BLACKLIST_ENABLED', true),

    /**
     * Grace period (in seconds) after token expiration where refresh is still allowed
     */
    'blacklist_grace_period' => env('JWT_BLACKLIST_GRACE_PERIOD', 300),

    /**
     * Header name to look for the JWT token
     */
    'header_name' => 'Authorization',

    /**
     * Prefix for the token in the Authorization header
     * Example: "Bearer {token}"
     */
    'token_prefix' => 'Bearer',

    /**
     * Enable refresh token rotation
     * When enabled, each refresh will invalidate the old refresh token
     * and issue a new one
     */
    'refresh_rotation' => env('JWT_REFRESH_ROTATION', true),

];
