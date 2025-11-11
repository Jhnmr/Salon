<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'branch_id',
        'category_id',
        'name',
        'description',
        'price',
        'duration_minutes',
        'is_active',
        'image_url',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'duration_minutes' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the category this service belongs to
     */
    public function category()
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id');
    }

    /**
     * Get the branch that offers this service
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the reservations for this service
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Get stylists who offer this service
     */
    public function stylists()
    {
        return $this->belongsToMany(Stylist::class, 'stylist_services')
            ->withPivot(['custom_price', 'custom_duration', 'is_available', 'notes'])
            ->withTimestamps();
    }

    /**
     * Get stylist-service relationships
     */
    public function stylistServices()
    {
        return $this->hasMany(StylistService::class);
    }

    /**
     * Get available stylists for this service
     */
    public function availableStylists()
    {
        return $this->belongsToMany(Stylist::class, 'stylist_services')
            ->wherePivot('is_available', true)
            ->withPivot(['custom_price', 'custom_duration'])
            ->withTimestamps();
    }

    /**
     * Get promotions that apply to this service
     */
    public function promotions()
    {
        return $this->belongsToMany(Promotion::class, 'promotion_service');
    }

    /**
     * Scope for active services
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for services by category
     */
    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Scope for services by branch
     */
    public function scopeByBranch($query, $branchId)
    {
        return $query->where('branch_id', $branchId);
    }

    /**
     * Scope ordered by sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')
            ->orderBy('name', 'asc');
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute()
    {
        return '$' . number_format($this->price, 2);
    }

    /**
     * Get formatted duration
     */
    public function getFormattedDurationAttribute()
    {
        $hours = floor($this->duration_minutes / 60);
        $minutes = $this->duration_minutes % 60;

        if ($hours > 0 && $minutes > 0) {
            return "{$hours}h {$minutes}min";
        } elseif ($hours > 0) {
            return "{$hours}h";
        } else {
            return "{$minutes}min";
        }
    }
}
