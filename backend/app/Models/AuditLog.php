<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * AuditLog Model
 *
 * Registra todas las acciones importantes realizadas en el sistema
 * para auditoría y trazabilidad
 *
 * @property int $id
 * @property int|null $user_id
 * @property string $action
 * @property string $table_name
 * @property int $record_id
 * @property array|null $old_data
 * @property array|null $new_data
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property \Carbon\Carbon $created_at
 */
class AuditLog extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'audit_logs';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'action',
        'table_name',
        'record_id',
        'old_data',
        'new_data',
        'ip_address',
        'user_agent',
        'request_method',
        'request_path',
        'status_code',
        'duration_ms',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'old_data' => 'array',
        'new_data' => 'array',
        'metadata' => 'array',
        'status_code' => 'integer',
        'duration_ms' => 'float',
        'created_at' => 'datetime',
    ];

    /**
     * Action types
     */
    public const ACTION_CREATE = 'CREATE';
    public const ACTION_UPDATE = 'UPDATE';
    public const ACTION_DELETE = 'DELETE';
    public const ACTION_LOGIN = 'LOGIN';
    public const ACTION_LOGOUT = 'LOGOUT';
    public const ACTION_FAILED_LOGIN = 'FAILED_LOGIN';

    /**
     * Get the user who performed this action.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Log an action
     *
     * @param string $action
     * @param string $tableName
     * @param int $recordId
     * @param array|null $oldData
     * @param array|null $newData
     * @param int|null $userId
     * @return self
     */
    public static function logAction(
        string $action,
        string $tableName,
        int $recordId,
        ?array $oldData = null,
        ?array $newData = null,
        ?int $userId = null
    ): self {
        return self::create([
            'user_id' => $userId ?? auth()->id(),
            'action' => $action,
            'table_name' => $tableName,
            'record_id' => $recordId,
            'old_data' => $oldData,
            'new_data' => $newData,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Log a create action
     *
     * @param string $tableName
     * @param int $recordId
     * @param array $data
     * @return self
     */
    public static function logCreate(string $tableName, int $recordId, array $data): self
    {
        return self::logAction(self::ACTION_CREATE, $tableName, $recordId, null, $data);
    }

    /**
     * Log an update action
     *
     * @param string $tableName
     * @param int $recordId
     * @param array $oldData
     * @param array $newData
     * @return self
     */
    public static function logUpdate(string $tableName, int $recordId, array $oldData, array $newData): self
    {
        return self::logAction(self::ACTION_UPDATE, $tableName, $recordId, $oldData, $newData);
    }

    /**
     * Log a delete action
     *
     * @param string $tableName
     * @param int $recordId
     * @param array $data
     * @return self
     */
    public static function logDelete(string $tableName, int $recordId, array $data): self
    {
        return self::logAction(self::ACTION_DELETE, $tableName, $recordId, $data, null);
    }

    /**
     * Log a login action
     *
     * @param int $userId
     * @return self
     */
    public static function logLogin(int $userId): self
    {
        return self::logAction(self::ACTION_LOGIN, 'users', $userId, null, null, $userId);
    }

    /**
     * Log a logout action
     *
     * @param int $userId
     * @return self
     */
    public static function logLogout(int $userId): self
    {
        return self::logAction(self::ACTION_LOGOUT, 'users', $userId, null, null, $userId);
    }

    /**
     * Log a failed login attempt
     *
     * @param string $email
     * @return self
     */
    public static function logFailedLogin(string $email): self
    {
        return self::create([
            'user_id' => null,
            'action' => self::ACTION_FAILED_LOGIN,
            'table_name' => 'users',
            'record_id' => 0,
            'old_data' => null,
            'new_data' => ['email' => $email],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Log a password reset request
     *
     * @param int $userId
     * @param string|null $ipAddress
     * @return self
     */
    public static function logPasswordResetRequest(int $userId, ?string $ipAddress = null): self
    {
        return self::create([
            'user_id' => $userId,
            'action' => 'password_reset_requested',
            'table_name' => 'users',
            'record_id' => $userId,
            'old_data' => null,
            'new_data' => null,
            'ip_address' => $ipAddress ?? request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Log a completed password reset
     *
     * @param int $userId
     * @param string|null $ipAddress
     * @return self
     */
    public static function logPasswordResetCompleted(int $userId, ?string $ipAddress = null): self
    {
        return self::create([
            'user_id' => $userId,
            'action' => 'password_reset_completed',
            'table_name' => 'users',
            'record_id' => $userId,
            'old_data' => null,
            'new_data' => null,
            'ip_address' => $ipAddress ?? request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Get changes between old and new data
     *
     * @return array
     */
    public function getChanges(): array
    {
        if (!$this->old_data || !$this->new_data) {
            return [];
        }

        $changes = [];
        foreach ($this->new_data as $key => $newValue) {
            $oldValue = $this->old_data[$key] ?? null;
            if ($oldValue !== $newValue) {
                $changes[$key] = [
                    'old' => $oldValue,
                    'new' => $newValue,
                ];
            }
        }

        return $changes;
    }

    /**
     * Scope a query to filter by request method.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $method
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRequestMethod($query, string $method)
    {
        return $query->where('request_method', strtoupper($method));
    }

    /**
     * Scope a query to filter by request path.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $path
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRequestPath($query, string $path)
    {
        return $query->where('request_path', 'like', "%{$path}%");
    }

    /**
     * Scope a query to filter by status code.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  int  $statusCode
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeStatusCode($query, int $statusCode)
    {
        return $query->where('status_code', $statusCode);
    }

    /**
     * Scope a query to filter by successful requests (2xx status codes).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSuccessful($query)
    {
        return $query->whereBetween('status_code', [200, 299]);
    }

    /**
     * Scope a query to filter by failed requests (4xx and 5xx status codes).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFailed($query)
    {
        return $query->where('status_code', '>=', 400);
    }

    /**
     * Scope a query to filter by slow requests (above threshold).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  float  $thresholdMs  Default: 1000ms (1 second)
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSlow($query, float $thresholdMs = 1000)
    {
        return $query->where('duration_ms', '>', $thresholdMs);
    }

    /**
     * Check if the request was successful (2xx status code).
     *
     * @return bool
     */
    public function wasSuccessful(): bool
    {
        return $this->status_code >= 200 && $this->status_code < 300;
    }

    /**
     * Check if the request was slow (above threshold).
     *
     * @param  float  $thresholdMs  Default: 1000ms (1 second)
     * @return bool
     */
    public function wasSlow(float $thresholdMs = 1000): bool
    {
        return $this->duration_ms > $thresholdMs;
    }

    /**
     * Get a human-readable duration.
     *
     * @return string
     */
    public function getFormattedDuration(): string
    {
        if (!$this->duration_ms) {
            return 'N/A';
        }

        if ($this->duration_ms < 1000) {
            return round($this->duration_ms, 2) . 'ms';
        }

        return round($this->duration_ms / 1000, 2) . 's';
    }

    /**
     * Clean up old audit logs based on retention policy.
     *
     * @param  int|null  $days  Number of days to retain (defaults to config)
     * @return int  Number of deleted records
     */
    public static function cleanOldLogs(?int $days = null): int
    {
        $days = $days ?? config('security.audit_logging.retention_days', 90);

        return static::where('created_at', '<', now()->subDays($days))->delete();
    }
}
