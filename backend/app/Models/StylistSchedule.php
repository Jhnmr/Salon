<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * StylistSchedule Model
 *
 * Default weekly schedule for stylists
 */
class StylistSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'stylist_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_available',
        'break_start',
        'break_end',
        'notes',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function stylist(): BelongsTo
    {
        return $this->belongsTo(Stylist::class);
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeByDay($query, int $dayOfWeek)
    {
        return $query->where('day_of_week', $dayOfWeek);
    }

    public function scopeByStylist($query, int $stylistId)
    {
        return $query->where('stylist_id', $stylistId);
    }

    // Helper methods
    public function isWorkingDay(): bool
    {
        return $this->is_available && $this->start_time && $this->end_time;
    }
}
