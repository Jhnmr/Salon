<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'stylist_id',
        'caption',
        'image_url',
        'images',
        'tags',
        'is_portfolio',
        'is_visible',
        'likes_count',
        'comments_count',
        'published_at',
    ];

    protected $casts = [
        'images' => 'array',
        'tags' => 'array',
        'is_portfolio' => 'boolean',
        'is_visible' => 'boolean',
        'likes_count' => 'integer',
        'comments_count' => 'integer',
        'published_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'is_liked',
        'time_ago',
    ];

    /**
     * Relación con el estilista dueño del post
     */
    public function stylist()
    {
        return $this->belongsTo(Stylist::class);
    }

    /**
     * Relación con los likes del post
     */
    public function likes()
    {
        return $this->hasMany(LikePost::class);
    }

    /**
     * Relación con los comentarios del post
     */
    public function comentarios()
    {
        return $this->hasMany(ComentarioPost::class)->whereNull('parent_id');
    }

    /**
     * Todos los comentarios incluyendo respuestas
     */
    public function allComentarios()
    {
        return $this->hasMany(ComentarioPost::class);
    }

    /**
     * Verifica si el usuario autenticado le dio like al post
     */
    public function getIsLikedAttribute()
    {
        if (!auth()->check()) {
            return false;
        }

        return $this->likes()
            ->where('user_id', auth()->id())
            ->exists();
    }

    /**
     * Obtiene el tiempo transcurrido desde la publicación
     */
    public function getTimeAgoAttribute()
    {
        if (!$this->published_at) {
            return null;
        }

        return $this->published_at->diffForHumans();
    }

    /**
     * Scope para posts publicados
     */
    public function scopePublished($query)
    {
        return $query->where('is_visible', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /**
     * Scope para posts de portafolio
     */
    public function scopePortfolio($query)
    {
        return $query->where('is_portfolio', true);
    }

    /**
     * Scope para buscar por tags
     */
    public function scopeWithTag($query, $tag)
    {
        return $query->whereJsonContains('tags', $tag);
    }

    /**
     * Scope para posts populares (más likes)
     */
    public function scopePopular($query, $limit = 10)
    {
        return $query->orderBy('likes_count', 'desc')->limit($limit);
    }

    /**
     * Scope para posts recientes
     */
    public function scopeRecent($query, $limit = 20)
    {
        return $query->orderBy('published_at', 'desc')->limit($limit);
    }

    /**
     * Incrementa el contador de likes
     */
    public function incrementLikes()
    {
        $this->increment('likes_count');
    }

    /**
     * Decrementa el contador de likes
     */
    public function decrementLikes()
    {
        $this->decrement('likes_count');
    }

    /**
     * Incrementa el contador de comentarios
     */
    public function incrementComments()
    {
        $this->increment('comments_count');
    }

    /**
     * Decrementa el contador de comentarios
     */
    public function decrementComments()
    {
        $this->decrement('comments_count');
    }

    /**
     * Publica el post
     */
    public function publish()
    {
        $this->update([
            'is_visible' => true,
            'published_at' => now(),
        ]);
    }

    /**
     * Despublica el post
     */
    public function unpublish()
    {
        $this->update([
            'is_visible' => false,
        ]);
    }

    /**
     * Añade un tag al post
     */
    public function addTag($tag)
    {
        $tags = $this->tags ?? [];
        if (!in_array($tag, $tags)) {
            $tags[] = $tag;
            $this->update(['tags' => $tags]);
        }
    }

    /**
     * Elimina un tag del post
     */
    public function removeTag($tag)
    {
        $tags = $this->tags ?? [];
        $tags = array_values(array_filter($tags, fn($t) => $t !== $tag));
        $this->update(['tags' => $tags]);
    }
}
