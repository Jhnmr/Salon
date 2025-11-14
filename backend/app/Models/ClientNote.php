<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ClientNote Model
 *
 * Private notes about clients (allergies, preferences, history)
 */
class ClientNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'stylist_id',
        'note_type',
        'title',
        'content',
        'is_important',
        'is_private',
        'metadata',
    ];

    protected $casts = [
        'is_important' => 'boolean',
        'is_private' => 'boolean',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function stylist(): BelongsTo
    {
        return $this->belongsTo(Stylist::class);
    }

    // Scopes
    public function scopeImportant($query)
    {
        return $query->where('is_important', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('note_type', $type);
    }

    public function scopeByClient($query, int $clientId)
    {
        return $query->where('client_id', $clientId);
    }
}
