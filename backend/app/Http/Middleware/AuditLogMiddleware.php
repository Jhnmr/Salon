<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Audit Log Middleware
 *
 * Provides comprehensive audit logging for all API requests.
 *
 * Logs:
 * - User ID (if authenticated)
 * - Action (CREATE, UPDATE, DELETE)
 * - Resource and resource ID
 * - IP address and User Agent
 * - Request method and path
 * - Changes (before/after for updates)
 * - Failed authorization attempts (403)
 * - Timestamp
 *
 * @package App\Http\Middleware
 */
class AuditLogMiddleware
{
    /**
     * Actions that should be logged
     *
     * @var array<string, array<int, string>>
     */
    protected array $loggableActions = [
        'POST' => ['CREATE'],
        'PUT' => ['UPDATE'],
        'PATCH' => ['UPDATE'],
        'DELETE' => ['DELETE'],
    ];

    /**
     * Paths that should be excluded from logging
     *
     * @var array<int, string>
     */
    protected array $excludedPaths = [
        'api/health',
        'api/ping',
        'api/status',
        'up',
        '_ignition',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip logging if disabled in config
        if (!config('security.audit_logging.enabled', true)) {
            return $next($request);
        }

        // Skip excluded paths
        if ($this->shouldSkipLogging($request)) {
            return $next($request);
        }

        // Capture request time
        $startTime = microtime(true);

        // Get old values for UPDATE operations
        $oldValues = null;
        if ($this->isUpdateOperation($request)) {
            $oldValues = $this->captureOldValues($request);
        }

        // Process the request
        $response = $next($request);

        // Log after response (in a try-catch to not break the response)
        try {
            $this->logRequest($request, $response, $oldValues, $startTime);
        } catch (\Exception $e) {
            // Log error but don't break the response
            Log::error('Audit logging failed', [
                'error' => $e->getMessage(),
                'path' => $request->path(),
                'method' => $request->method()
            ]);
        }

        return $response;
    }

    /**
     * Determine if the request should be logged
     *
     * @param  \Illuminate\Http\Request  $request
     * @return bool
     */
    protected function shouldSkipLogging(Request $request): bool
    {
        // Skip GET requests
        if ($request->isMethod('GET')) {
            return true;
        }

        // Skip OPTIONS requests
        if ($request->isMethod('OPTIONS')) {
            return true;
        }

        // Check excluded paths
        $path = $request->path();
        foreach ($this->excludedPaths as $excludedPath) {
            if (str_starts_with($path, $excludedPath)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if request is an update operation
     *
     * @param  \Illuminate\Http\Request  $request
     * @return bool
     */
    protected function isUpdateOperation(Request $request): bool
    {
        return in_array($request->method(), ['PUT', 'PATCH']);
    }

    /**
     * Capture old values before update
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>|null
     */
    protected function captureOldValues(Request $request): ?array
    {
        // Extract resource info from path
        $resourceInfo = $this->extractResourceInfo($request);

        if (!$resourceInfo['table'] || !$resourceInfo['id']) {
            return null;
        }

        try {
            // Fetch current record
            $record = DB::table($resourceInfo['table'])
                ->where('id', $resourceInfo['id'])
                ->first();

            return $record ? (array) $record : null;
        } catch (\Exception $e) {
            Log::warning('Failed to capture old values for audit', [
                'error' => $e->getMessage(),
                'table' => $resourceInfo['table'],
                'id' => $resourceInfo['id']
            ]);

            return null;
        }
    }

    /**
     * Log the request to audit_logs table
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Symfony\Component\HttpFoundation\Response  $response
     * @param  array<string, mixed>|null  $oldValues
     * @param  float  $startTime
     * @return void
     */
    protected function logRequest(
        Request $request,
        Response $response,
        ?array $oldValues,
        float $startTime
    ): void {
        $method = $request->method();
        $statusCode = $response->getStatusCode();

        // Only log certain actions
        if (!isset($this->loggableActions[$method]) && $statusCode !== 403) {
            return;
        }

        // Extract resource information
        $resourceInfo = $this->extractResourceInfo($request);

        // Determine action
        $action = $this->loggableActions[$method][0] ?? 'UNKNOWN';

        // Prepare changes data for UPDATE operations
        $changes = null;
        if ($action === 'UPDATE' && $oldValues) {
            $newValues = $request->all();
            $changes = $this->detectChanges($oldValues, $newValues);
        }

        // Log failed authorization attempts
        if ($statusCode === 403) {
            $action = 'AUTHORIZATION_FAILED';
        }

        // Calculate request duration
        $duration = round((microtime(true) - $startTime) * 1000, 2); // in milliseconds

        // Prepare old_data and new_data for the existing table structure
        $oldData = null;
        $newData = null;

        if ($action === 'UPDATE' && $changes) {
            $oldData = array_column($changes, 'old', 'field');
            $newData = array_column($changes, 'new', 'field');
        } elseif ($action === 'CREATE') {
            $newData = $request->all();
        } elseif ($action === 'DELETE' && $oldValues) {
            $oldData = $oldValues;
        }

        // Insert audit log using existing table structure
        DB::table('audit_logs')->insert([
            'user_id' => $request->user()?->id,
            'action' => $action,
            'table_name' => $resourceInfo['resource'] ?? 'unknown',
            'record_id' => $resourceInfo['id'] ?? 0,
            'old_data' => $oldData ? json_encode($oldData) : null,
            'new_data' => $newData ? json_encode($newData) : null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'request_method' => $method,
            'request_path' => $request->path(),
            'status_code' => $statusCode,
            'duration_ms' => $duration,
            'metadata' => json_encode([
                'referer' => $request->header('referer'),
                'query_params' => $request->query(),
            ]),
            'created_at' => now(),
        ]);
    }

    /**
     * Extract resource information from request path
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array{resource: string|null, table: string|null, id: int|string|null}
     */
    protected function extractResourceInfo(Request $request): array
    {
        $path = $request->path();
        $segments = explode('/', $path);

        // Try to extract resource from path (e.g., api/v1/users/123)
        $resource = null;
        $id = null;
        $table = null;

        // Look for pattern: api/resource/id or api/v1/resource/id
        if (count($segments) >= 3) {
            // Find resource name (usually after 'api' or 'api/v1')
            $resourceIndex = 1;
            if (isset($segments[1]) && str_starts_with($segments[1], 'v')) {
                $resourceIndex = 2;
            }

            if (isset($segments[$resourceIndex])) {
                $resource = $segments[$resourceIndex];
                $table = $resource; // Assume table name matches resource name
            }

            // Try to find ID (numeric segment after resource)
            if (isset($segments[$resourceIndex + 1]) && is_numeric($segments[$resourceIndex + 1])) {
                $id = $segments[$resourceIndex + 1];
            }
        }

        // Try to get ID from route parameter
        if (!$id) {
            $routeId = $request->route('id') ?? $request->route('userId') ?? $request->route('resourceId');
            if ($routeId) {
                $id = $routeId;
            }
        }

        return [
            'resource' => $resource,
            'table' => $table,
            'id' => $id,
        ];
    }

    /**
     * Detect changes between old and new values
     *
     * @param  array<string, mixed>  $oldValues
     * @param  array<string, mixed>  $newValues
     * @return array<string, array{old: mixed, new: mixed}>
     */
    protected function detectChanges(array $oldValues, array $newValues): array
    {
        $changes = [];
        $sensitiveFields = ['password', 'password_confirmation', 'current_password', 'token', 'secret'];

        foreach ($newValues as $key => $newValue) {
            // Skip sensitive fields
            if (in_array($key, $sensitiveFields)) {
                continue;
            }

            // Skip if old value doesn't exist
            if (!array_key_exists($key, $oldValues)) {
                continue;
            }

            $oldValue = $oldValues[$key];

            // Compare values
            if ($oldValue !== $newValue) {
                $changes[$key] = [
                    'old' => $oldValue,
                    'new' => $newValue,
                ];
            }
        }

        return $changes;
    }
}
