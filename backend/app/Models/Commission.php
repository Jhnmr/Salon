<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Commission Model
 *
 * Tracks commission payments to stylists
 */
class Commission extends Model
{
    use HasFactory;

    protected $fillable = [
        'stylist_id',
        'reservation_id',
        'payment_id',
        'service_amount',
        'commission_rate',
        'commission_amount',
        'platform_fee',
        'branch_amount',
        'status',
        'paid_at',
        'payment_method',
        'transaction_id',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'service_amount' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'branch_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function stylist(): BelongsTo
    {
        return $this->belongsTo(Stylist::class);
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    // Scopes
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeByStylist($query, int $stylistId)
    {
        return $query->where('stylist_id', $stylistId);
    }

    // Helper methods
    public function markAsPaid(string $transactionId = null): bool
    {
        $this->status = 'paid';
        $this->paid_at = now();
        if ($transactionId) {
            $this->transaction_id = $transactionId;
        }
        return $this->save();
    }
}
