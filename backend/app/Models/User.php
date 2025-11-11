<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the user's profile
     */
    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    /**
     * Get the user's client profile (if role is client)
     */
    public function client()
    {
        return $this->hasOne(Client::class);
    }

    /**
     * Get the user's stylist profile (if role is stylist)
     */
    public function stylist()
    {
        return $this->hasOne(Stylist::class);
    }

    /**
     * Get branches administered by this user (if role is admin)
     */
    public function administeredBranches()
    {
        return $this->hasMany(Branch::class, 'admin_id');
    }

    /**
     * Get the user's reservations (if client)
     */
    public function clientReservations()
    {
        return $this->hasMany(Reservation::class, 'client_id');
    }

    /**
     * Get the user's reservations (if stylist)
     */
    public function stylistReservations()
    {
        return $this->hasMany(Reservation::class, 'stylist_id');
    }

    /**
     * Get the user's availability (if stylist)
     */
    public function availabilities()
    {
        return $this->hasMany(Availability::class, 'stylist_id');
    }

    /**
     * Get the user's notifications
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Get all payments made by this user
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get all reviews written by this user
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get all audit logs for this user
     */
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    /**
     * Get the user's roles (RBAC)
     */
    public function roles()
    {
        return $this->belongsToMany(
            Role::class,
            'user_roles',
            'user_id',
            'role_id'
        )->withTimestamps();
    }

    /**
     * Get conversations where user participates
     */
    public function conversations()
    {
        return Conversation::where(function($q) {
            $q->where('user1_id', $this->id)
              ->orWhere('user2_id', $this->id);
        })->orderBy('last_message_at', 'desc');
    }

    /**
     * Get messages sent by this user
     */
    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * Get messages received by this user
     */
    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    /**
     * Get all messages (sent and received)
     */
    public function messages()
    {
        return Message::where('sender_id', $this->id)
            ->orWhere('receiver_id', $this->id)
            ->orderBy('created_at', 'desc');
    }

    /**
     * Get user's active subscription
     */
    public function subscription()
    {
        return $this->hasOne(Subscription::class)
            ->whereIn('status', ['active', 'trialing'])
            ->latest();
    }

    /**
     * Get all subscriptions (including past)
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get user's saved payment methods
     */
    public function savedPaymentMethods()
    {
        return $this->hasMany(SavedPaymentMethod::class);
    }

    /**
     * Get user's default payment method
     */
    public function defaultPaymentMethod()
    {
        return $this->hasOne(SavedPaymentMethod::class)
            ->where('is_default', true);
    }

    /**
     * Get posts liked by this user
     */
    public function likedPosts()
    {
        return $this->belongsToMany(Post::class, 'likes_posts')
            ->withTimestamps();
    }

    /**
     * Get comments written by this user
     */
    public function comments()
    {
        return $this->hasMany(ComentarioPost::class);
    }

    /**
     * Check if user has a specific role
     *
     * @param string $roleName
     * @return bool
     */
    public function hasRole(string $roleName): bool
    {
        return $this->roles()->where('name', $roleName)->exists();
    }

    /**
     * Check if user has any of the given roles
     *
     * @param array $roles
     * @return bool
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()->whereIn('name', $roles)->exists();
    }

    /**
     * Check if user has all of the given roles
     *
     * @param array $roles
     * @return bool
     */
    public function hasAllRoles(array $roles): bool
    {
        $count = $this->roles()->whereIn('name', $roles)->count();
        return $count === count($roles);
    }

    /**
     * Check if user has a specific permission
     *
     * @param string $permissionName
     * @return bool
     */
    public function hasPermissionTo(string $permissionName): bool
    {
        // Check if any of user's roles have this permission
        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permissionName) {
                $query->where('name', $permissionName);
            })
            ->exists();
    }

    /**
     * Check if user has any of the given permissions
     *
     * @param array $permissions
     * @return bool
     */
    public function hasAnyPermission(array $permissions): bool
    {
        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permissions) {
                $query->whereIn('name', $permissions);
            })
            ->exists();
    }

    /**
     * Check if user has all of the given permissions
     *
     * @param array $permissions
     * @return bool
     */
    public function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->hasPermissionTo($permission)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Assign a role to user
     *
     * @param int|Role $role
     * @return void
     */
    public function assignRole($role): void
    {
        $roleId = $role instanceof Role ? $role->id : $role;
        $this->roles()->syncWithoutDetaching([$roleId]);
    }

    /**
     * Remove a role from user
     *
     * @param int|Role $role
     * @return void
     */
    public function removeRole($role): void
    {
        $roleId = $role instanceof Role ? $role->id : $role;
        $this->roles()->detach($roleId);
    }

    /**
     * Sync roles for user
     *
     * @param array $roleIds
     * @return void
     */
    public function syncRoles(array $roleIds): void
    {
        $this->roles()->sync($roleIds);
    }

    /**
     * Check if user is super admin
     *
     * @return bool
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole(Role::ROLE_SUPER_ADMIN);
    }

    /**
     * Check if user is admin
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->hasAnyRole([Role::ROLE_ADMIN, Role::ROLE_SUPER_ADMIN]);
    }

    /**
     * Check if user is client
     *
     * @return bool
     */
    public function isClient(): bool
    {
        return $this->hasRole(Role::ROLE_CLIENT);
    }

    /**
     * Check if user is stylist
     *
     * @return bool
     */
    public function isStylist(): bool
    {
        return $this->hasRole(Role::ROLE_STYLIST);
    }

    /**
     * Get all permissions for user (from all their roles)
     *
     * @return \Illuminate\Support\Collection
     */
    public function getAllPermissions()
    {
        return $this->roles()
            ->with('permissions')
            ->get()
            ->pluck('permissions')
            ->flatten()
            ->unique('id');
    }
}
