# Security Middleware Documentation

Comprehensive security middleware system for the SALON Laravel application.

## Table of Contents

- [Overview](#overview)
- [Middleware Components](#middleware-components)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Security Best Practices](#security-best-practices)

## Overview

This security system provides five comprehensive middleware components to protect your application:

1. **RateLimitMiddleware** - Advanced Redis-based rate limiting
2. **SecurityHeadersMiddleware** - Comprehensive HTTP security headers
3. **CorsMiddleware** - Advanced CORS handling
4. **InputSanitizationMiddleware** - Input sanitization and XSS prevention
5. **AuditLogMiddleware** - Comprehensive audit logging

## Middleware Components

### 1. RateLimitMiddleware

Provides Redis-based rate limiting with different limits for various route groups.

**Features:**
- Redis-based distributed rate limiting
- Multiple rate limit configurations per route group
- Automatic header injection (X-RateLimit-*)
- 429 responses with retry-after when limit exceeded
- Separate limits for authenticated vs unauthenticated users

**Rate Limit Groups:**
- `auth` - 5 requests per minute (login, registration)
- `api` - 100 requests per minute (general API routes)
- `public` - 100 requests per minute per IP
- `authenticated` - 1000 requests per hour (logged-in users)

**Usage:**
```php
// In routes/api.php
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('rate.limit.auth');

Route::middleware(['jwt', 'rate.limit.authenticated'])->group(function () {
    Route::get('/profile', [UserController::class, 'profile']);
});
```

**Headers Added:**
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - Unix timestamp when limit resets
- `Retry-After` - Seconds to wait (when limit exceeded)

### 2. SecurityHeadersMiddleware

Adds comprehensive HTTP security headers to protect against common vulnerabilities.

**Headers Implemented:**

| Header | Value | Purpose |
|--------|-------|---------|
| Content-Security-Policy | Configurable CSP | Prevent XSS and injection attacks |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-XSS-Protection | 1; mode=block | Enable XSS protection (legacy browsers) |
| Strict-Transport-Security | max-age=31536000 | Force HTTPS connections |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer information |
| Permissions-Policy | geolocation=(), microphone=(), camera=() | Disable browser features |

**Default CSP:**
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://js.stripe.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self' https://api.stripe.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self'
```

**Customization:**
Configure via `config/security.php` or environment variables:
```env
SECURITY_X_FRAME_OPTIONS=SAMEORIGIN
SECURITY_CSP="default-src 'self'"
```

### 3. CorsMiddleware

Advanced CORS (Cross-Origin Resource Sharing) handling with configurable origins.

**Features:**
- Configurable allowed origins (supports wildcards)
- Proper preflight OPTIONS handling
- Credentials support
- Exposed headers for rate limiting info
- 24-hour preflight caching

**Configuration:**
```env
CORS_ENABLED=true
CORS_ALLOWED_ORIGINS="https://salon.com,http://localhost:3000,http://localhost:5173"
CORS_MAX_AGE=86400
```

**Allowed by Default:**
- **Methods:** GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Headers:** Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-Token
- **Exposed Headers:** X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- **Credentials:** Enabled

**Wildcard Support:**
```env
# Allow all subdomains of salon.com
CORS_ALLOWED_ORIGINS="https://*.salon.com,http://localhost:3000"
```

### 4. InputSanitizationMiddleware

Sanitizes all user input to prevent XSS attacks and injection vulnerabilities.

**Features:**
- Trims all string inputs
- Removes null bytes
- HTML entity encoding for specific fields
- Smart whitelisting (passwords, raw_ fields)
- Preserves JSON fields
- Logs sanitization events

**Sanitization Rules:**

1. **All String Fields:**
   - Trim whitespace
   - Remove null bytes (\0)

2. **HTML Fields** (comment, review, note, message, description, bio, about):
   - Convert special characters with `htmlspecialchars()`
   - ENT_QUOTES | ENT_HTML5 encoding

3. **Whitelisted Fields** (not sanitized):
   - `password`, `password_confirmation`, `current_password`, `new_password`
   - Fields starting with `raw_`
   - Fields in `config('security.input_sanitization.whitelist')`

4. **JSON Fields** (preserved as-is):
   - `metadata`, `settings`, `preferences`, `data`, `config`, `options`

**Configuration:**
```env
INPUT_SANITIZATION_ENABLED=true
INPUT_SANITIZATION_LOG=true
```

**Custom Whitelist:**
```php
// config/security.php
'input_sanitization' => [
    'whitelist' => [
        'custom_field',
        'another_field',
    ],
],
```

### 5. AuditLogMiddleware

Comprehensive audit logging for tracking user actions and security events.

**Features:**
- Logs CREATE, UPDATE, DELETE actions
- Tracks failed authorization attempts (403)
- Captures before/after changes for updates
- Records IP address, user agent, request details
- Measures request duration
- Stores metadata (referer, query params)

**Logged Information:**
- `user_id` - Authenticated user (null for public)
- `action` - CREATE, UPDATE, DELETE, AUTHORIZATION_FAILED
- `resource` - Resource type (users, posts, etc.)
- `resource_id` - ID of affected resource
- `ip_address` - Client IP
- `user_agent` - Browser/client info
- `request_method` - HTTP method
- `request_path` - Request URI
- `status_code` - HTTP response code
- `duration_ms` - Request duration
- `changes` - JSON before/after values (updates only)
- `metadata` - Additional context
- `created_at` - Timestamp

**Configuration:**
```env
AUDIT_LOGGING_ENABLED=true
AUDIT_LOG_READS=false
AUDIT_LOG_RETENTION_DAYS=90
```

**Excluded Paths:**
- Health checks: `/api/health`, `/api/ping`, `/api/status`, `/up`
- Debug routes: `/_ignition`
- GET requests (unless `AUDIT_LOG_READS=true`)

**Query Examples:**
```php
// Get user's recent actions
DB::table('audit_logs')
    ->where('user_id', $userId)
    ->orderBy('created_at', 'desc')
    ->limit(50)
    ->get();

// Find failed authorization attempts
DB::table('audit_logs')
    ->where('action', 'AUTHORIZATION_FAILED')
    ->where('created_at', '>', now()->subHours(24))
    ->get();

// Track changes to specific resource
DB::table('audit_logs')
    ->where('resource', 'users')
    ->where('resource_id', 123)
    ->where('action', 'UPDATE')
    ->get();
```

## Installation & Setup

### 1. Run Migration

Create the audit_logs table:

```bash
php artisan migrate
```

### 2. Configure Environment

Copy variables from `.env.example` to your `.env` file:

```bash
# Copy security configuration section
grep -A 30 "# Security Configuration" .env.example >> .env
```

### 3. Verify Redis Connection

The rate limiting middleware requires Redis:

```env
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

Test Redis connection:
```bash
php artisan tinker
>>> Redis::ping()
# Should return: "+PONG"
```

### 4. Configure CORS Origins

Update allowed origins for your frontend:

```env
CORS_ALLOWED_ORIGINS="https://yourdomain.com,http://localhost:3000"
```

## Configuration

All middleware can be configured via `config/security.php` or environment variables.

### Rate Limiting

```php
// config/security.php
'rate_limiting' => [
    'enabled' => env('RATE_LIMITING_ENABLED', true),
    'limits' => [
        'auth' => [
            'requests' => env('RATE_LIMIT_AUTH_REQUESTS', 5),
            'seconds' => env('RATE_LIMIT_AUTH_SECONDS', 60),
        ],
        // ...
    ],
],
```

### Security Headers

```php
'headers' => [
    'csp' => env('SECURITY_CSP', '...'),
    'x_frame_options' => env('SECURITY_X_FRAME_OPTIONS', 'DENY'),
    // ...
],
```

### CORS

```php
'cors' => [
    'enabled' => env('CORS_ENABLED', true),
    'allowed_origins' => [...],
    'allowed_methods' => [...],
    // ...
],
```

### Input Sanitization

```php
'input_sanitization' => [
    'enabled' => env('INPUT_SANITIZATION_ENABLED', true),
    'whitelist' => [],
    'html_fields' => [...],
    'json_fields' => [...],
],
```

### Audit Logging

```php
'audit_logging' => [
    'enabled' => env('AUDIT_LOGGING_ENABLED', true),
    'log_actions' => ['CREATE', 'UPDATE', 'DELETE', 'AUTHORIZATION_FAILED'],
    'excluded_paths' => [...],
    'retention_days' => env('AUDIT_LOG_RETENTION_DAYS', 90),
],
```

## Usage Examples

### Route-Specific Rate Limiting

```php
// routes/api.php

// Authentication routes with strict rate limiting
Route::middleware('rate.limit.auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/password/reset', [PasswordController::class, 'reset']);
});

// Public API with standard rate limiting
Route::middleware('rate.limit.api')->group(function () {
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/stylists', [StylistController::class, 'index']);
});

// Authenticated users with higher limits
Route::middleware(['jwt', 'rate.limit.authenticated'])->group(function () {
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'update']);
    Route::get('/reservations', [ReservationController::class, 'index']);
});
```

### Selective Middleware Application

```php
// Apply only specific middleware to certain routes
Route::middleware(['cors', 'security.headers'])->group(function () {
    Route::get('/public/info', [InfoController::class, 'index']);
});

// Skip audit logging for specific routes
Route::withoutMiddleware('audit.log')->group(function () {
    Route::get('/debug/info', [DebugController::class, 'info']);
});
```

### Testing Rate Limits

```bash
# Test rate limiting with curl
for i in {1..10}; do
  curl -i http://localhost:8000/api/login \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"password"}'
  echo "\n---\n"
done
```

### Viewing Audit Logs

```php
// Create an AuditLog model
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id', 'action', 'resource', 'resource_id',
        'ip_address', 'user_agent', 'request_method', 'request_path',
        'status_code', 'duration_ms', 'changes', 'metadata'
    ];

    protected $casts = [
        'changes' => 'array',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

// Query audit logs
$recentActions = AuditLog::with('user')
    ->where('created_at', '>', now()->subDay())
    ->orderBy('created_at', 'desc')
    ->get();

// Find suspicious activity
$failedAuth = AuditLog::where('action', 'AUTHORIZATION_FAILED')
    ->where('created_at', '>', now()->subHours(24))
    ->groupBy('ip_address')
    ->havingRaw('COUNT(*) > 10')
    ->get();
```

## Security Best Practices

### 1. Rate Limiting

- **Adjust limits based on your traffic patterns**
  - Monitor Redis for memory usage
  - Use tighter limits on authentication routes
  - Consider user-based vs IP-based limits

- **Monitor rate limit violations**
  ```php
  // Check logs for rate limit abuse
  grep "Rate limit exceeded" storage/logs/laravel.log
  ```

### 2. Security Headers

- **Test CSP thoroughly before production**
  - Use browser console to check for violations
  - Start with `Content-Security-Policy-Report-Only` header
  - Add domains as needed for third-party services

- **Enable HSTS only after verifying HTTPS**
  ```env
  # Only in production with valid SSL
  FORCE_HTTPS=true
  ```

### 3. CORS

- **Never use wildcard (*) in production**
  ```env
  # BAD - don't do this in production
  CORS_ALLOWED_ORIGINS="*"

  # GOOD - explicitly list allowed origins
  CORS_ALLOWED_ORIGINS="https://salon.com,https://www.salon.com"
  ```

- **Use environment-specific origins**
  ```env
  # .env.local
  CORS_ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"

  # .env.production
  CORS_ALLOWED_ORIGINS="https://salon.com,https://app.salon.com"
  ```

### 4. Input Sanitization

- **Whitelist sensitive fields carefully**
  - Only whitelist when absolutely necessary
  - Document why each field is whitelisted

- **Review sanitization logs regularly**
  ```bash
  # Check what's being sanitized
  grep "Input sanitization applied" storage/logs/laravel.log
  ```

### 5. Audit Logging

- **Set up log retention policy**
  ```php
  // Create a scheduled command to clean old logs
  // app/Console/Commands/CleanAuditLogs.php
  DB::table('audit_logs')
      ->where('created_at', '<', now()->subDays(config('security.audit_logging.retention_days')))
      ->delete();
  ```

- **Monitor for security events**
  ```php
  // Set up alerts for failed authorization attempts
  $recentFailures = DB::table('audit_logs')
      ->where('action', 'AUTHORIZATION_FAILED')
      ->where('created_at', '>', now()->subMinutes(5))
      ->count();

  if ($recentFailures > 10) {
      // Send alert to security team
  }
  ```

- **Regular security audits**
  - Review audit logs weekly
  - Check for unusual patterns
  - Monitor IP addresses with high failure rates

### 6. Redis Security

- **Secure Redis connection**
  ```env
  REDIS_PASSWORD=your-strong-password
  ```

- **Monitor Redis memory**
  ```bash
  redis-cli info memory
  ```

- **Set up Redis persistence**
  - Configure RDB or AOF for data durability
  - Ensure rate limit counters survive restarts

### 7. Environment Configuration

- **Use different settings per environment**
  ```env
  # Development - lenient
  RATE_LIMIT_API_REQUESTS=1000
  AUDIT_LOGGING_ENABLED=false

  # Production - strict
  RATE_LIMIT_API_REQUESTS=100
  AUDIT_LOGGING_ENABLED=true
  ```

- **Never commit sensitive values**
  - Keep `.env` out of version control
  - Use Laravel's `config:cache` in production

## Troubleshooting

### Rate Limiting Issues

**Problem:** Rate limits not working
```bash
# Check Redis connection
php artisan tinker
>>> Redis::ping()

# Check if rate limiting is enabled
>>> config('security.rate_limiting.enabled')
```

**Problem:** Rate limits too strict
```env
# Temporarily increase limits for testing
RATE_LIMIT_API_REQUESTS=1000
```

### CORS Issues

**Problem:** CORS errors in browser console
```bash
# Check allowed origins
>>> config('security.cors.allowed_origins')

# Verify Origin header matches
curl -H "Origin: http://localhost:3000" http://localhost:8000/api/services -v
```

### Audit Logging Issues

**Problem:** Audit logs not being created
```bash
# Check if table exists
php artisan migrate:status

# Check if logging is enabled
>>> config('security.audit_logging.enabled')

# Check logs for errors
tail -f storage/logs/laravel.log | grep "Audit logging failed"
```

## Performance Considerations

- **Redis for Rate Limiting:** Minimal overhead, O(1) operations
- **Security Headers:** Negligible overhead, added to response headers only
- **CORS:** Small overhead for preflight requests, cached for 24 hours
- **Input Sanitization:** Moderate overhead on POST/PUT/PATCH requests
- **Audit Logging:** Highest overhead, uses database insert per logged request

**Optimization Tips:**
- Use database queue for audit logging in high-traffic scenarios
- Consider async logging with Laravel queues
- Monitor audit_logs table size and implement archival strategy
- Use Redis persistence to avoid recalculating rate limits

## Support

For issues or questions:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Review middleware configuration: `config/security.php`
3. Verify environment variables in `.env`
4. Test individual middleware in isolation

---

**Version:** 1.0.0
**Last Updated:** 2025-11-13
**Laravel Version:** 11.x
