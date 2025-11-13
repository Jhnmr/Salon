# Security Middleware Usage Examples

Practical examples for using the security middleware in the SALON application.

## Quick Start

### 1. Run the Enhancement Migration

```bash
php artisan migrate
```

This will add the new fields to the existing `audit_logs` table.

### 2. Configure Environment Variables

Add to your `.env` file:

```env
# Redis for rate limiting
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# CORS Origins
CORS_ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"

# Enable all security features
SECURITY_MIDDLEWARE_ENABLED=true
RATE_LIMITING_ENABLED=true
INPUT_SANITIZATION_ENABLED=true
AUDIT_LOGGING_ENABLED=true
```

## Route Examples

### Authentication Routes with Strict Rate Limiting

```php
// routes/api.php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// Apply strict rate limiting to auth endpoints (5 requests per minute)
Route::middleware('rate.limit.auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);
    Route::post('/password/reset', [AuthController::class, 'resetPassword']);
});

// Example response when rate limit is exceeded:
// HTTP 429 Too Many Requests
// {
//   "message": "Too many requests. Please try again later.",
//   "error": "rate_limit_exceeded",
//   "retry_after": 45,
//   "reset_at": "2025-11-13 15:30:00"
// }
```

### Public API with Standard Rate Limiting

```php
// Public endpoints with 100 requests per minute
Route::middleware('rate.limit.api')->group(function () {
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{id}', [ServiceController::class, 'show']);
    Route::get('/stylists', [StylistController::class, 'index']);
    Route::get('/branches', [BranchController::class, 'index']);
});
```

### Protected Routes with Higher Limits for Authenticated Users

```php
// Authenticated users get 1000 requests per hour
Route::middleware(['jwt', 'rate.limit.authenticated'])->group(function () {

    // User profile
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'update']);

    // Reservations
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/reservations/{id}', [ReservationController::class, 'show']);
    Route::put('/reservations/{id}', [ReservationController::class, 'update']);
    Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);

    // Reviews
    Route::post('/services/{id}/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
});
```

### Admin Routes with Custom Middleware Stack

```php
// Admin endpoints with RBAC and audit logging
Route::middleware(['jwt', 'rbac:admin', 'rate.limit.authenticated'])->prefix('admin')->group(function () {

    // User management
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::post('/users', [AdminUserController::class, 'store']);
    Route::put('/users/{id}', [AdminUserController::class, 'update']);
    Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

    // System settings
    Route::get('/settings', [AdminSettingsController::class, 'index']);
    Route::put('/settings', [AdminSettingsController::class, 'update']);

    // Audit logs (view security events)
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
});
```

## Controller Examples

### Using AuditLog Model

```php
// app/Http/Controllers/AuditLogController.php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Get recent audit logs
     */
    public function index(Request $request)
    {
        $logs = AuditLog::with('user')
            ->when($request->action, fn($q, $action) => $q->action($action))
            ->when($request->user_id, fn($q, $userId) => $q->forUser($userId))
            ->when($request->ip, fn($q, $ip) => $q->fromIp($ip))
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($logs);
    }

    /**
     * Get failed authorization attempts
     */
    public function failedAuthorizations()
    {
        $failed = AuditLog::failedAuthorizations()
            ->recent(24) // Last 24 hours
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'total' => $failed->count(),
            'logs' => $failed
        ]);
    }

    /**
     * Get suspicious activity (multiple failed attempts from same IP)
     */
    public function suspiciousActivity()
    {
        $suspicious = AuditLog::failedAuthorizations()
            ->recent(24)
            ->get()
            ->groupBy('ip_address')
            ->filter(fn($logs) => $logs->count() > 10)
            ->map(fn($logs) => [
                'ip_address' => $logs->first()->ip_address,
                'attempts' => $logs->count(),
                'latest_attempt' => $logs->first()->created_at,
                'user_agents' => $logs->pluck('user_agent')->unique()->values()
            ]);

        return response()->json($suspicious->values());
    }

    /**
     * Get user activity history
     */
    public function userActivity($userId)
    {
        $activity = AuditLog::forUser($userId)
            ->orderBy('created_at', 'desc')
            ->take(100)
            ->get()
            ->map(fn($log) => [
                'action' => $log->action,
                'resource' => $log->table_name,
                'resource_id' => $log->record_id,
                'timestamp' => $log->created_at->toIso8601String(),
                'ip' => $log->ip_address,
                'success' => $log->wasSuccessful(),
                'duration' => $log->getFormattedDuration(),
            ]);

        return response()->json($activity);
    }

    /**
     * Get slow requests
     */
    public function slowRequests()
    {
        $slowRequests = AuditLog::slow(2000) // > 2 seconds
            ->recent(24)
            ->orderBy('duration_ms', 'desc')
            ->get()
            ->map(fn($log) => [
                'path' => $log->request_path,
                'method' => $log->request_method,
                'duration' => $log->getFormattedDuration(),
                'user' => $log->user?->name ?? 'Guest',
                'timestamp' => $log->created_at->toIso8601String(),
            ]);

        return response()->json($slowRequests);
    }
}
```

### Testing Rate Limits in Controller

```php
// app/Http/Controllers/TestController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

class TestController extends Controller
{
    /**
     * Test rate limiting
     */
    public function testRateLimit(Request $request)
    {
        return response()->json([
            'message' => 'Request successful',
            'timestamp' => now()->toIso8601String(),
            'rate_limit' => [
                'limit' => $request->header('X-RateLimit-Limit'),
                'remaining' => $request->header('X-RateLimit-Remaining'),
                'reset' => $request->header('X-RateLimit-Reset'),
            ]
        ]);
    }

    /**
     * Check current rate limit status
     */
    public function checkRateLimit(Request $request)
    {
        $key = 'rate_limit:api:ip:' . $request->ip() . ':route:' . md5($request->path());
        $current = Redis::get($key) ?? 0;
        $ttl = Redis::ttl($key);

        return response()->json([
            'current_count' => (int) $current,
            'resets_in_seconds' => $ttl,
            'resets_at' => now()->addSeconds($ttl)->toIso8601String(),
        ]);
    }
}
```

### Custom Input Sanitization

```php
// app/Http/Controllers/CommentController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;

class CommentController extends Controller
{
    /**
     * Store a comment with automatic sanitization
     */
    public function store(Request $request)
    {
        // Input is automatically sanitized by InputSanitizationMiddleware
        // HTML fields like 'comment' will have special chars converted

        $validated = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'comment' => 'required|string|max:1000',
        ]);

        $comment = Comment::create([
            'user_id' => auth()->id(),
            'post_id' => $validated['post_id'],
            'comment' => $validated['comment'], // Already sanitized
        ]);

        return response()->json($comment, 201);
    }

    /**
     * Store raw content (bypassing sanitization)
     */
    public function storeRaw(Request $request)
    {
        // Use 'raw_' prefix to bypass sanitization
        $validated = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'raw_content' => 'required|string|max:5000',
        ]);

        $comment = Comment::create([
            'user_id' => auth()->id(),
            'post_id' => $validated['post_id'],
            'comment' => $validated['raw_content'], // Not sanitized
        ]);

        return response()->json($comment, 201);
    }
}
```

## Frontend Integration Examples

### Handling Rate Limits

```javascript
// React/Vue example for handling rate limits

async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
                ...options.headers
            }
        });

        // Check rate limit headers
        const rateLimit = {
            limit: response.headers.get('X-RateLimit-Limit'),
            remaining: response.headers.get('X-RateLimit-Remaining'),
            reset: response.headers.get('X-RateLimit-Reset')
        };

        // Handle rate limit exceeded
        if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const data = await response.json();

            throw new RateLimitError(
                data.message,
                retryAfter,
                data.reset_at
            );
        }

        return {
            data: await response.json(),
            rateLimit
        };

    } catch (error) {
        if (error instanceof RateLimitError) {
            // Show rate limit message to user
            showNotification(
                `Too many requests. Please wait ${error.retryAfter} seconds.`,
                'warning'
            );

            // Optionally retry after delay
            await sleep(error.retryAfter * 1000);
            return apiRequest(url, options);
        }

        throw error;
    }
}

class RateLimitError extends Error {
    constructor(message, retryAfter, resetAt) {
        super(message);
        this.retryAfter = parseInt(retryAfter);
        this.resetAt = resetAt;
    }
}
```

### CORS Configuration

```javascript
// Frontend API client configuration

const API_BASE_URL = process.env.REACT_APP_API_URL;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Required for CORS with credentials
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor for auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 429) {
            // Handle rate limit
            const retryAfter = error.response.headers['retry-after'];
            console.warn(`Rate limited. Retry after ${retryAfter}s`);
        }
        return Promise.reject(error);
    }
);
```

## Console Commands

### Cleanup Old Audit Logs

```php
// app/Console/Commands/CleanAuditLogs.php

namespace App\Console\Commands;

use App\Models\AuditLog;
use Illuminate\Console\Command;

class CleanAuditLogs extends Command
{
    protected $signature = 'audit:clean {--days= : Days to retain (default: config value)}';
    protected $description = 'Clean up old audit logs based on retention policy';

    public function handle()
    {
        $days = $this->option('days')
            ? (int) $this->option('days')
            : config('security.audit_logging.retention_days', 90);

        $this->info("Cleaning audit logs older than {$days} days...");

        $deleted = AuditLog::cleanOldLogs($days);

        $this->info("Successfully deleted {$deleted} old audit log entries.");

        return 0;
    }
}
```

Schedule in `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    // Clean audit logs weekly
    $schedule->command('audit:clean')->weekly();
}
```

### Generate Security Report

```php
// app/Console/Commands/SecurityReport.php

namespace App\Console\Commands;

use App\Models\AuditLog;
use Illuminate\Console\Command;

class SecurityReport extends Command
{
    protected $signature = 'security:report {--days=7}';
    protected $description = 'Generate security report for the last N days';

    public function handle()
    {
        $days = (int) $this->option('days');
        $since = now()->subDays($days);

        $this->info("Security Report - Last {$days} Days");
        $this->newLine();

        // Failed authorization attempts
        $failedAuth = AuditLog::where('action', 'AUTHORIZATION_FAILED')
            ->where('created_at', '>', $since)
            ->count();

        $this->line("Failed Authorization Attempts: {$failedAuth}");

        // Unique IPs with failed attempts
        $uniqueIps = AuditLog::where('action', 'AUTHORIZATION_FAILED')
            ->where('created_at', '>', $since)
            ->distinct('ip_address')
            ->count('ip_address');

        $this->line("Unique IPs with failures: {$uniqueIps}");

        // Total requests
        $totalRequests = AuditLog::where('created_at', '>', $since)->count();
        $this->line("Total Requests: {$totalRequests}");

        // Slow requests (> 2 seconds)
        $slowRequests = AuditLog::where('duration_ms', '>', 2000)
            ->where('created_at', '>', $since)
            ->count();

        $this->line("Slow Requests (>2s): {$slowRequests}");

        // Failed requests (4xx, 5xx)
        $failedRequests = AuditLog::where('status_code', '>=', 400)
            ->where('created_at', '>', $since)
            ->count();

        $this->line("Failed Requests (4xx/5xx): {$failedRequests}");

        // Top suspicious IPs
        $this->newLine();
        $this->line("Top 5 IPs by Failed Authorizations:");

        $topIps = AuditLog::where('action', 'AUTHORIZATION_FAILED')
            ->where('created_at', '>', $since)
            ->get()
            ->groupBy('ip_address')
            ->map(fn($logs) => $logs->count())
            ->sortDesc()
            ->take(5);

        foreach ($topIps as $ip => $count) {
            $this->line("  {$ip}: {$count} attempts");
        }

        return 0;
    }
}
```

## Testing Examples

### PHPUnit Tests

```php
// tests/Feature/SecurityMiddlewareTest.php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Redis;

class SecurityMiddlewareTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Redis::flushAll(); // Clear rate limit counters
    }

    /** @test */
    public function rate_limit_blocks_after_threshold()
    {
        // Make requests up to limit
        for ($i = 0; $i < 100; $i++) {
            $response = $this->getJson('/api/services');
            $response->assertStatus(200);
        }

        // 101st request should be rate limited
        $response = $this->getJson('/api/services');
        $response->assertStatus(429)
            ->assertJsonStructure([
                'message',
                'error',
                'retry_after',
                'reset_at'
            ]);
    }

    /** @test */
    public function security_headers_are_present()
    {
        $response = $this->getJson('/api/services');

        $response->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-XSS-Protection', '1; mode=block')
            ->assertHeader('Content-Security-Policy');
    }

    /** @test */
    public function cors_headers_allow_configured_origins()
    {
        $response = $this->getJson('/api/services', [
            'Origin' => 'http://localhost:3000'
        ]);

        $response->assertHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
            ->assertHeader('Access-Control-Allow-Credentials', 'true');
    }

    /** @test */
    public function input_sanitization_removes_xss()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/comments', [
            'post_id' => 1,
            'comment' => '<script>alert("xss")</script>Hello'
        ]);

        // Script tags should be encoded
        $this->assertStringContainsString('&lt;script&gt;', $response['comment']);
        $this->assertStringNotContainsString('<script>', $response['comment']);
    }

    /** @test */
    public function audit_log_records_actions()
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/reservations', [
            'service_id' => 1,
            'date' => '2025-11-20',
            'time' => '10:00'
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'action' => 'CREATE',
            'table_name' => 'reservations',
            'request_method' => 'POST'
        ]);
    }
}
```

## Monitoring & Alerts

### Laravel Telescope Integration

```php
// In AppServiceProvider or separate monitoring service

use App\Models\AuditLog;
use Illuminate\Support\Facades\Log;

// Monitor for suspicious activity
AuditLog::created(function ($log) {
    // Alert on multiple failed authorizations
    if ($log->action === 'AUTHORIZATION_FAILED') {
        $recentFailures = AuditLog::where('ip_address', $log->ip_address)
            ->where('action', 'AUTHORIZATION_FAILED')
            ->where('created_at', '>', now()->subMinutes(5))
            ->count();

        if ($recentFailures > 5) {
            Log::channel('security')->alert('Multiple failed authorization attempts', [
                'ip' => $log->ip_address,
                'count' => $recentFailures,
                'user_agent' => $log->user_agent
            ]);

            // Optionally send notification
            // Notification::route('slack', config('logging.slack.webhook'))
            //     ->notify(new SecurityAlert($log));
        }
    }
});
```

## Production Checklist

Before deploying to production:

- [ ] Run `php artisan migrate` to add audit log fields
- [ ] Configure Redis for rate limiting
- [ ] Set proper `CORS_ALLOWED_ORIGINS` in production `.env`
- [ ] Enable `FORCE_HTTPS=true` in production
- [ ] Review and adjust rate limits for your traffic patterns
- [ ] Set up monitoring for failed authorization attempts
- [ ] Configure audit log cleanup schedule
- [ ] Test CORS from your frontend domain
- [ ] Verify security headers with tools like securityheaders.com
- [ ] Set up alerts for suspicious activity
- [ ] Document any custom whitelist additions

## Additional Resources

- [Laravel Security Best Practices](https://laravel.com/docs/11.x/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Mozilla Security Headers](https://infosec.mozilla.org/guidelines/web_security)
- [SecurityHeaders.com](https://securityheaders.com/) - Test your security headers

---

**Last Updated:** 2025-11-13
