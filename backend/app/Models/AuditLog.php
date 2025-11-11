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
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'old_data' => 'array',
        'new_data' => 'array',
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
}
