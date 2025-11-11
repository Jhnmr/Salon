<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Review Model
 *
 * Reseñas y calificaciones de servicios y estilistas
 *
 * @property int $id
 * @property int $user_id
 * @property int $reservation_id
 * @property int|null $stylist_id
 * @property int|null $branch_id
 * @property int $rating
 * @property string|null $comment
 * @property string|null $response
 * @property \Carbon\Carbon|null $responded_at
 * @property bool $is_verified
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Review extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'reviews';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'reservation_id',
        'stylist_id',
        'branch_id',
        'rating',
        'comment',
        'response',
        'responded_at',
        'is_verified',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'rating' => 'integer',
        'responded_at' => 'datetime',
        'is_verified' => 'boolean',
    ];

    /**
     * Rating constraints
     */
    public const MIN_RATING = 1;
    public const MAX_RATING = 5;

    /**
     * Get the user who wrote this review.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the reservation associated with this review.
     *
     * @return BelongsTo
     */
    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    /**
     * Get the stylist being reviewed.
     *
     * @return BelongsTo
     */
    public function stylist(): BelongsTo
    {
        return $this->belongsTo(Stylist::class);
    }

    /**
     * Get the branch being reviewed.
     *
     * @return BelongsTo
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Check if review has a response
     *
     * @return bool
     */
    public function hasResponse(): bool
    {
        return !empty($this->response);
    }

    /**
     * Add a response to this review
     *
     * @param string $response
     * @return void
     */
    public function addResponse(string $response): void
    {
        $this->response = $response;
        $this->responded_at = now();
        $this->save();
    }

    /**
     * Verify this review
     *
     * @return void
     */
    public function verify(): void
    {
        $this->is_verified = true;
        $this->save();
    }

    /**
     * Check if rating is positive (4 or 5 stars)
     *
     * @return bool
     */
    public function isPositive(): bool
    {
        return $this->rating >= 4;
    }

    /**
     * Check if rating is negative (1 or 2 stars)
     *
     * @return bool
     */
    public function isNegative(): bool
    {
        return $this->rating <= 2;
    }

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // After creating a review, update related models' ratings
        static::created(function ($review) {
            if ($review->stylist_id) {
                $stylist = Stylist::find($review->stylist_id);
                if ($stylist) {
                    $stylist->updateRating($review->rating);
                }
            }

            if ($review->branch_id) {
                $branch = Branch::find($review->branch_id);
                if ($branch) {
                    $totalRating = $branch->average_rating * $branch->total_reviews;
                    $branch->total_reviews++;
                    $branch->average_rating = ($totalRating + $review->rating) / $branch->total_reviews;
                    $branch->save();
                }
            }
        });
    }
}
