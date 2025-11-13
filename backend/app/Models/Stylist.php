<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Stylist Model
 *
 * Representa un estilista/profesional de belleza en la plataforma
 * Un estilista está asociado a un User y puede pertenecer a una Branch
 *
 * @property int $id
 * @property int $user_id
 * @property int|null $branch_id
 * @property string|null $bio
 * @property string|null $specialty
 * @property int|null $years_experience
 * @property array|null $certifications
 * @property float $commission_percentage
 * @property bool $tips_enabled
 * @property float $average_rating
 * @property int $total_reviews
 * @property int $total_services_completed
 * @property bool $is_active
 * @property \Carbon\Carbon|null $start_date
 * @property \Carbon\Carbon|null $end_date
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Stylist extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'stylists';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'branch_id',
        'bio',
        'specialty',
        'specialties',
        'years_experience',
        'certifications',
        'commission_percentage',
        'tips_enabled',
        'average_rating',
        'total_reviews',
        'total_services_completed',
        'is_active',
        'is_featured',
        'start_date',
        'end_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'specialties' => 'array',
        'certifications' => 'array',
        'commission_percentage' => 'decimal:2',
        'tips_enabled' => 'boolean',
        'average_rating' => 'decimal:2',
        'total_reviews' => 'integer',
        'total_services_completed' => 'integer',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get the user associated with this stylist.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the branch where this stylist works.
     *
     * @return BelongsTo
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get all availability slots for this stylist.
     *
     * @return HasMany
     */
    public function availabilities(): HasMany
    {
        return $this->hasMany(Availability::class, 'user_id', 'user_id');
    }

    /**
     * Get all services this stylist can perform through pivot table.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function services()
    {
        return $this->belongsToMany(Service::class, 'stylist_services')
            ->withPivot(['custom_price', 'custom_duration', 'is_available', 'notes'])
            ->withTimestamps();
    }

    /**
     * Get stylist-service relationships (for custom pricing)
     */
    public function stylistServices()
    {
        return $this->hasMany(StylistService::class);
    }

    /**
     * Get only available services for this stylist
     */
    public function availableServices()
    {
        return $this->belongsToMany(Service::class, 'stylist_services')
            ->wherePivot('is_available', true)
            ->withPivot(['custom_price', 'custom_duration', 'notes'])
            ->withTimestamps();
    }

    /**
     * Get all portfolio posts from this stylist
     */
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Get published posts
     */
    public function publishedPosts()
    {
        return $this->hasMany(Post::class)
            ->where('is_visible', true)
            ->whereNotNull('published_at')
            ->orderBy('published_at', 'desc');
    }

    /**
     * Get portfolio posts specifically
     */
    public function portfolioPosts()
    {
        return $this->hasMany(Post::class)
            ->where('is_portfolio', true)
            ->where('is_visible', true)
            ->orderBy('published_at', 'desc');
    }

    /**
     * Get schedule blocks (vacations, time off, etc.)
     */
    public function scheduleBlocks()
    {
        return $this->hasMany(ScheduleBlock::class);
    }

    /**
     * Get active schedule blocks
     */
    public function activeScheduleBlocks()
    {
        return $this->hasMany(ScheduleBlock::class)
            ->where('end_datetime', '>=', now());
    }

    /**
     * Get clients who favorited this stylist
     */
    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    /**
     * Get clients who favorited this stylist (with client data)
     */
    public function favoritedByClients()
    {
        return $this->belongsToMany(Client::class, 'favorites')
            ->withTimestamps();
    }

    /**
     * Get all reviews for this stylist
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get all reservations for this stylist
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'stylist_id', 'user_id');
    }

    /**
     * Check if stylist is active
     *
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->is_active === true;
    }

    /**
     * Check if stylist is available on a given date
     *
     * @param string $date
     * @return bool
     */
    public function isAvailableOn(string $date): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $checkDate = \Carbon\Carbon::parse($date);

        if ($this->start_date && $checkDate->lt($this->start_date)) {
            return false;
        }

        if ($this->end_date && $checkDate->gt($this->end_date)) {
            return false;
        }

        return true;
    }

    /**
     * Update rating after a new review
     *
     * @param float $newRating
     * @return void
     */
    public function updateRating(float $newRating): void
    {
        $currentTotal = $this->average_rating * $this->total_reviews;
        $this->total_reviews++;
        $this->average_rating = ($currentTotal + $newRating) / $this->total_reviews;
        $this->save();
    }

    /**
     * Increment completed services counter
     *
     * @return void
     */
    public function incrementServicesCompleted(): void
    {
        $this->increment('total_services_completed');
    }
}
