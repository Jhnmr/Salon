<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'reservation_id',
        'is_read',
        'sent_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'sent_at' => 'datetime',
    ];

    /**
     * Get the user associated with this notification
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the reservation associated with this notification
     */
    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }
}
