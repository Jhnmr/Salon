<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'duration_minutes',
        'category',
        'is_active',
    ];

    /**
     * Get the reservations for this service
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
