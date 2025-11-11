<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Client Model
 *
 * Representa un cliente en la plataforma
 * Perfil adicional para usuarios con rol "client"
 *
 * @property int $id
 * @property int $user_id
 * @property float|null $location_lat
 * @property float|null $location_lng
 * @property string|null $saved_address
 * @property array|null $preferences
 * @property \Carbon\Carbon|null $birth_date
 * @property string|null $gender
 * @property int $total_appointments
 * @property float $total_spent
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Client extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'clients';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'location_lat',
        'location_lng',
        'saved_address',
        'preferences',
        'birth_date',
        'gender',
        'total_appointments',
        'total_spent',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'location_lat' => 'decimal:8',
        'location_lng' => 'decimal:8',
        'preferences' => 'array',
        'birth_date' => 'date',
        'total_appointments' => 'integer',
        'total_spent' => 'decimal:2',
    ];

    /**
     * Gender options
     */
    public const GENDER_MALE = 'male';
    public const GENDER_FEMALE = 'female';
    public const GENDER_OTHER = 'other';
    public const GENDER_PREFER_NOT_TO_SAY = 'prefer_not_to_say';

    /**
     * Get the user associated with this client.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all reservations made by this client.
     *
     * @return HasMany
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class, 'user_id', 'user_id');
    }

    /**
     * Get all reviews written by this client.
     *
     * @return HasMany
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'user_id', 'user_id');
    }

    /**
     * Update total spent after a payment
     *
     * @param float $amount
     * @return void
     */
    public function addSpent(float $amount): void
    {
        $this->total_spent += $amount;
        $this->save();
    }

    /**
     * Increment appointment counter
     *
     * @return void
     */
    public function incrementAppointments(): void
    {
        $this->increment('total_appointments');
    }

    /**
     * Get client's preferred services
     *
     * @return array
     */
    public function getPreferredServices(): array
    {
        return $this->preferences['preferred_services'] ?? [];
    }

    /**
     * Check if client is VIP (based on spending)
     *
     * @param float $threshold Default 10000
     * @return bool
     */
    public function isVIP(float $threshold = 10000): bool
    {
        return $this->total_spent >= $threshold;
    }

    /**
     * Get distance from a location
     *
     * @param float $lat
     * @param float $lng
     * @return float|null Distance in kilometers
     */
    public function distanceFrom(float $lat, float $lng): ?float
    {
        if (!$this->location_lat || !$this->location_lng) {
            return null;
        }

        // Haversine formula
        $earthRadius = 6371; // km

        $latFrom = deg2rad($this->location_lat);
        $lngFrom = deg2rad($this->location_lng);
        $latTo = deg2rad($lat);
        $lngTo = deg2rad($lng);

        $latDelta = $latTo - $latFrom;
        $lngDelta = $lngTo - $lngFrom;

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
            cos($latFrom) * cos($latTo) *
            sin($lngDelta / 2) * sin($lngDelta / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
