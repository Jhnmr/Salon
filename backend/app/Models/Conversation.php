<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Conversation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user1_id',
        'user2_id',
        'last_message_id',
        'last_message_at',
        'is_active',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'unread_count',
    ];

    /**
     * Relación con el primer participante
     */
    public function user1()
    {
        return $this->belongsTo(User::class, 'user1_id');
    }

    /**
     * Relación con el segundo participante
     */
    public function user2()
    {
        return $this->belongsTo(User::class, 'user2_id');
    }

    /**
     * Relación con el último mensaje
     */
    public function lastMessage()
    {
        return $this->belongsTo(Message::class, 'last_message_id');
    }

    /**
     * Relación con todos los mensajes de la conversación
     */
    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    /**
     * Obtiene el otro participante de la conversación
     */
    public function getOtherUser($userId)
    {
        return $this->user1_id === $userId ? $this->user2 : $this->user1;
    }

    /**
     * Obtiene el ID del otro participante
     */
    public function getOtherUserId($userId)
    {
        return $this->user1_id === $userId ? $this->user2_id : $this->user1_id;
    }

    /**
     * Verifica si un usuario es participante de la conversación
     */
    public function hasParticipant($userId)
    {
        return $this->user1_id === $userId || $this->user2_id === $userId;
    }

    /**
     * Obtiene el número de mensajes no leídos para un usuario
     */
    public function getUnreadCountAttribute()
    {
        if (!auth()->check()) {
            return 0;
        }

        return $this->messages()
            ->where('receiver_id', auth()->id())
            ->whereNull('read_at')
            ->count();
    }

    /**
     * Obtiene el número de mensajes no leídos para un usuario específico
     */
    public function getUnreadCountForUser($userId)
    {
        return $this->messages()
            ->where('receiver_id', $userId)
            ->whereNull('read_at')
            ->count();
    }

    /**
     * Marca todos los mensajes como leídos para un usuario
     */
    public function markAsReadForUser($userId)
    {
        return $this->messages()
            ->where('receiver_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    /**
     * Scope para conversaciones activas
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para conversaciones de un usuario específico
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('user1_id', $userId)
                ->orWhere('user2_id', $userId);
        });
    }

    /**
     * Scope para ordenar por último mensaje
     */
    public function scopeOrderedByLastMessage($query)
    {
        return $query->orderBy('last_message_at', 'desc');
    }

    /**
     * Crea o encuentra una conversación entre dos usuarios
     */
    public static function findOrCreateBetween($user1Id, $user2Id)
    {
        // Asegurar que user1_id sea siempre el menor para evitar duplicados
        $minId = min($user1Id, $user2Id);
        $maxId = max($user1Id, $user2Id);

        return self::firstOrCreate(
            [
                'user1_id' => $minId,
                'user2_id' => $maxId,
            ],
            [
                'is_active' => true,
            ]
        );
    }

    /**
     * Actualiza el último mensaje de la conversación
     */
    public function updateLastMessage(Message $message)
    {
        $this->update([
            'last_message_id' => $message->id,
            'last_message_at' => $message->created_at,
        ]);
    }

    /**
     * Archiva la conversación
     */
    public function archive()
    {
        $this->update(['is_active' => false]);
    }

    /**
     * Restaura la conversación
     */
    public function restore()
    {
        $this->update(['is_active' => true]);
    }
}
