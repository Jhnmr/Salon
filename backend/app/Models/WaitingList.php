<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * WaitingList Model
 *
 * Manages waiting list for fully booked time slots
 */
class WaitingList extends Model
{
    use HasFactory;

    protected $table = 'waiting_lists';

    protected $fillable = [
        'client_id',
        'stylist_id',
        'service_id',
        'branch_id',
        'preferred_date',
        'preferred_time',
        'status',
        'priority',
        'notified_at',
        'expires_at',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'preferred_date' => 'date',
        'notified_at' => 'datetime',
        'expires_at' => 'datetime',
        'priority' => 'integer',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function stylist(): BelongsTo
    {
        return $this->belongsTo(Stylist::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            });
    }

    public function scopeNotified($query)
    {
        return $query->whereNotNull('notified_at');
    }

    public function scopeByPriority($query)
    {
        return $query->orderBy('priority', 'desc')->orderBy('created_at');
    }

    // Helper methods
    public function markAsNotified(): bool
    {
        $this->notified_at = now();
        return $this->save();
    }

    public function markAsConverted(): bool
    {
        $this->status = 'converted';
        return $this->save();
    }
}
