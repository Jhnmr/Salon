<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Profile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone',
        'bio',
        'avatar_url',
        'specialization',
        'experience_years',
        'rating',
    ];

    /**
     * Get the user associated with the profile
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
