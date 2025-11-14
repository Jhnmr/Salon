<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * BranchHoliday Model
 *
 * Tracks holidays and closures for branches
 */
class BranchHoliday extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'name',
        'date',
        'is_recurring',
        'closure_type',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'is_recurring' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    // Scopes
    public function scopeUpcoming($query)
    {
        return $query->where('date', '>=', now())->orderBy('date');
    }

    public function scopeRecurring($query)
    {
        return $query->where('is_recurring', true);
    }

    public function scopeByBranch($query, int $branchId)
    {
        return $query->where('branch_id', $branchId);
    }

    // Helper methods
    public function isToday(): bool
    {
        return $this->date->isToday();
    }
}
