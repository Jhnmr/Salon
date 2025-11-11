<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LikePost extends Model
{
    use HasFactory;

    protected $table = 'likes_posts';

    protected $fillable = [
        'post_id',
        'user_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Relación con el post
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Relación con el usuario que dio like
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Boot del modelo para manejar eventos
     */
    protected static function boot()
    {
        parent::boot();

        // Al crear un like, incrementar el contador en el post
        static::created(function ($like) {
            $like->post->incrementLikes();
        });

        // Al eliminar un like, decrementar el contador en el post
        static::deleted(function ($like) {
            $like->post->decrementLikes();
        });
    }

    /**
     * Toggle like para un usuario y post
     */
    public static function toggle($postId, $userId)
    {
        $like = self::where('post_id', $postId)
            ->where('user_id', $userId)
            ->first();

        if ($like) {
            $like->delete();
            return ['liked' => false, 'message' => 'Like removed'];
        } else {
            self::create([
                'post_id' => $postId,
                'user_id' => $userId,
            ]);
            return ['liked' => true, 'message' => 'Post liked'];
        }
    }

    /**
     * Verifica si un usuario le dio like a un post
     */
    public static function hasLiked($postId, $userId)
    {
        return self::where('post_id', $postId)
            ->where('user_id', $userId)
            ->exists();
    }
}
