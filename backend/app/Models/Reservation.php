<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'stylist_id',
        'service_id',
        'scheduled_at',
        'status',
        'notes',
        'total_price',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'total_price' => 'decimal:2',
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
     * Get the notifications for this reservation
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
