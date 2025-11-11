<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Permission Model
 *
 * Represents permissions in the RBAC system
 *
 * @property int $id
 * @property string $name
 * @property string $display_name
 * @property string|null $description
 * @property string $resource
 * @property string $action
 * @property string|null $group
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Permission extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'permissions';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'display_name',
        'description',
        'resource',
        'action',
        'group',
    ];

    /**
     * Permission actions
     */
    public const ACTION_CREATE = 'create';
    public const ACTION_READ = 'read';
    public const ACTION_UPDATE = 'update';
    public const ACTION_DELETE = 'delete';
    public const ACTION_MANAGE = 'manage'; // Full control

    /**
     * Permission resources
     */
    public const RESOURCE_CITA = 'cita';
    public const RESOURCE_USER = 'user';
    public const RESOURCE_SERVICE = 'service';
    public const RESOURCE_BRANCH = 'branch';
    public const RESOURCE_PAYMENT = 'payment';
    public const RESOURCE_INVOICE = 'invoice';
    public const RESOURCE_REVIEW = 'review';
    public const RESOURCE_NOTIFICATION = 'notification';
    public const RESOURCE_AUDIT_LOG = 'audit_log';
    public const RESOURCE_DASHBOARD = 'dashboard';

    /**
     * Get all roles that have this permission.
     *
     * @return BelongsToMany
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(
            Role::class,
            'role_permissions',
            'permission_id',
            'role_id'
        )->withTimestamps();
    }

    /**
     * Get permission by name
     *
     * @param string $name
     * @return self|null
     */
    public static function findByName(string $name): ?self
    {
        return self::where('name', $name)->first();
    }

    /**
     * Get permissions by resource
     *
     * @param string $resource
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getByResource(string $resource)
    {
        return self::where('resource', $resource)->get();
    }

    /**
     * Get permissions by action
     *
     * @param string $action
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getByAction(string $action)
    {
        return self::where('action', $action)->get();
    }

    /**
     * Get permissions by group
     *
     * @param string $group
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getByGroup(string $group)
    {
        return self::where('group', $group)->get();
    }

    /**
     * Create a permission name from resource and action
     *
     * @param string $resource
     * @param string $action
     * @return string
     */
    public static function makePermissionName(string $resource, string $action): string
    {
        return "{$action}_{$resource}";
    }

    /**
     * Check if permission allows an action
     *
     * @param string $actionToCheck
     * @return bool
     */
    public function allows(string $actionToCheck): bool
    {
        // 'manage' permission allows all actions
        if ($this->action === self::ACTION_MANAGE) {
            return true;
        }

        return $this->action === $actionToCheck;
    }
}
