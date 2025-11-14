<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reservation extends Model
{
    use HasFactory;

    protected $table = 'reservations';

    protected $fillable = [
        'client_id',
        'stylist_id',
        'service_id',
        'branch_id',
        'scheduled_at',
        'duration_minutes',
        'total_duration',
        'status',
        'reminder_sent',
        'confirmed_at',
        'completed_at',
        'cancelled_by',
        'service_price',
        'discount_price',
        'discount_amount',
        'tip',
        'total_price',
        'notes',
        'internal_notes',
        'special_allergies',
        'requires_confirmation',
        'confirmed_by',
        'cancellable_until',
        'cancellation_penalty',
        'reminder_24h_sent',
        'reminder_1h_sent',
        'origin',
        'device',
        'browser',
        'creation_ip',
        'appointment_code',
        // Payment & Commission fields
        'total_amount',
        'platform_commission',
        'salon_commission',
        'stylist_earnings',
        'promotion_code',
        'payment_intent_id',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancellable_until' => 'datetime',
        'total_price' => 'decimal:2',
        'service_price' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tip' => 'decimal:2',
        'cancellation_penalty' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'platform_commission' => 'decimal:2',
        'salon_commission' => 'decimal:2',
        'stylist_earnings' => 'decimal:2',
        'reminder_sent' => 'boolean',
        'requires_confirmation' => 'boolean',
        'reminder_24h_sent' => 'boolean',
        'reminder_1h_sent' => 'boolean',
    ];

    /**
     * Get the client (user) who made the reservation
     */
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Get the stylist assigned to the reservation
     */
    public function stylist()
    {
        return $this->belongsTo(User::class, 'stylist_id');
    }

    /**
     * Get the service for the reservation
     */
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get the branch where reservation is scheduled
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the notifications for this reservation
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Get the payment for this reservation
     */
    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * Get the review for this reservation
     */
    public function review()
    {
        return $this->hasOne(Review::class);
    }

    /**
     * Check if reservation can be cancelled
     */
    public function isCancellable(): bool
    {
        if ($this->status === 'cancelled' || $this->status === 'completed') {
            return false;
        }

        if ($this->cancellable_until && now()->isAfter($this->cancellable_until)) {
            return false;
        }

        return true;
    }

    /**
     * Check if reservation is upcoming
     */
    public function isUpcoming(): bool
    {
        return $this->scheduled_at && $this->scheduled_at->isFuture() &&
               in_array($this->status, ['pending', 'confirmed']);
    }

    /**
     * Scope for upcoming reservations
     */
    public function scopeUpcoming($query)
    {
        return $query->where('scheduled_at', '>', now())
                    ->whereIn('status', ['pending', 'confirmed']);
    }

    /**
     * Scope for past reservations
     */
    public function scopePast($query)
    {
        return $query->where('scheduled_at', '<', now())
                    ->orWhereIn('status', ['completed', 'cancelled', 'no_show']);
    }
}
