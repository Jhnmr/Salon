<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ComentarioPost extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'comentarios_posts';

    protected $fillable = [
        'post_id',
        'user_id',
        'parent_id',
        'content',
        'is_visible',
        'likes_count',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
        'likes_count' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'is_edited',
        'time_ago',
    ];

    /**
     * Relación con el post
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Relación con el usuario autor del comentario
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación con el comentario padre (para threading)
     */
    public function parent()
    {
        return $this->belongsTo(ComentarioPost::class, 'parent_id');
    }

    /**
     * Relación con las respuestas (comentarios hijos)
     */
    public function replies()
    {
        return $this->hasMany(ComentarioPost::class, 'parent_id')
            ->where('is_visible', true)
            ->orderBy('created_at', 'asc');
    }

    /**
     * Todas las respuestas incluyendo ocultas
     */
    public function allReplies()
    {
        return $this->hasMany(ComentarioPost::class, 'parent_id');
    }

    /**
     * Verifica si el comentario fue editado
     */
    public function getIsEditedAttribute()
    {
        return $this->created_at->ne($this->updated_at);
    }

    /**
     * Obtiene el tiempo transcurrido desde la creación
     */
    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    /**
     * Scope para comentarios visibles
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    /**
     * Scope para comentarios de nivel superior (no son respuestas)
     */
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope para respuestas
     */
    public function scopeReplies($query)
    {
        return $query->whereNotNull('parent_id');
    }

    /**
     * Boot del modelo para manejar eventos
     */
    protected static function boot()
    {
        parent::boot();

        // Al crear un comentario, incrementar el contador en el post
        static::created(function ($comentario) {
            $comentario->post->incrementComments();
        });

        // Al eliminar un comentario, decrementar el contador en el post
        static::deleted(function ($comentario) {
            $comentario->post->decrementComments();

            // Eliminar todas las respuestas en cascada
            $comentario->allReplies()->each(function ($reply) {
                $reply->delete();
            });
        });
    }

    /**
     * Verifica si el comentario es una respuesta
     */
    public function isReply()
    {
        return !is_null($this->parent_id);
    }

    /**
     * Verifica si el comentario tiene respuestas
     */
    public function hasReplies()
    {
        return $this->replies()->exists();
    }

    /**
     * Cuenta el número de respuestas
     */
    public function repliesCount()
    {
        return $this->replies()->count();
    }

    /**
     * Oculta el comentario
     */
    public function hide()
    {
        $this->update(['is_visible' => false]);
    }

    /**
     * Muestra el comentario
     */
    public function show()
    {
        $this->update(['is_visible' => true]);
    }

    /**
     * Verifica si el usuario puede editar el comentario
     */
    public function canEdit($userId)
    {
        return $this->user_id === $userId;
    }

    /**
     * Verifica si el usuario puede eliminar el comentario
     */
    public function canDelete($userId)
    {
        // El autor puede eliminar, o el dueño del post, o un admin
        $user = User::find($userId);

        return $this->user_id === $userId
            || $this->post->stylist->user_id === $userId
            || $user->isSuperAdmin();
    }
}
