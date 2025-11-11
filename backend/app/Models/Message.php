<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'receiver_id',
        'message',
        'attachment_url',
        'attachment_type',
        'read_at',
        'is_system_message',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'is_system_message' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'is_read',
        'time_ago',
    ];

    // Tipos de attachment
    const ATTACHMENT_TYPE_IMAGE = 'image';
    const ATTACHMENT_TYPE_VIDEO = 'video';
    const ATTACHMENT_TYPE_AUDIO = 'audio';
    const ATTACHMENT_TYPE_DOCUMENT = 'document';
    const ATTACHMENT_TYPE_LOCATION = 'location';

    /**
     * Relación con la conversación
     */
    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Relación con el remitente
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Relación con el destinatario
     */
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Verifica si el mensaje fue leído
     */
    public function getIsReadAttribute()
    {
        return !is_null($this->read_at);
    }

    /**
     * Obtiene el tiempo transcurrido desde el envío
     */
    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    /**
     * Boot del modelo para manejar eventos
     */
    protected static function boot()
    {
        parent::boot();

        // Al crear un mensaje, actualizar la conversación
        static::created(function ($message) {
            $message->conversation->updateLastMessage($message);

            // Enviar notificación push al receptor
            $message->sendPushNotification();
        });
    }

    /**
     * Scope para mensajes no leídos
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope para mensajes leídos
     */
    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    /**
     * Scope para mensajes de un usuario específico
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('sender_id', $userId)
                ->orWhere('receiver_id', $userId);
        });
    }

    /**
     * Scope para mensajes enviados por un usuario
     */
    public function scopeSentBy($query, $userId)
    {
        return $query->where('sender_id', $userId);
    }

    /**
     * Scope para mensajes recibidos por un usuario
     */
    public function scopeReceivedBy($query, $userId)
    {
        return $query->where('receiver_id', $userId);
    }

    /**
     * Scope para mensajes con attachments
     */
    public function scopeWithAttachment($query)
    {
        return $query->whereNotNull('attachment_url');
    }

    /**
     * Scope para mensajes de sistema
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system_message', true);
    }

    /**
     * Marca el mensaje como leído
     */
    public function markAsRead()
    {
        if ($this->is_read) {
            return false;
        }

        return $this->update(['read_at' => now()]);
    }

    /**
     * Verifica si el mensaje tiene attachment
     */
    public function hasAttachment()
    {
        return !is_null($this->attachment_url);
    }

    /**
     * Verifica si el attachment es una imagen
     */
    public function isImage()
    {
        return $this->attachment_type === self::ATTACHMENT_TYPE_IMAGE;
    }

    /**
     * Verifica si el attachment es un video
     */
    public function isVideo()
    {
        return $this->attachment_type === self::ATTACHMENT_TYPE_VIDEO;
    }

    /**
     * Verifica si el attachment es audio
     */
    public function isAudio()
    {
        return $this->attachment_type === self::ATTACHMENT_TYPE_AUDIO;
    }

    /**
     * Verifica si el attachment es un documento
     */
    public function isDocument()
    {
        return $this->attachment_type === self::ATTACHMENT_TYPE_DOCUMENT;
    }

    /**
     * Envía notificación push al receptor
     */
    public function sendPushNotification()
    {
        // TODO: Implementar con Firebase Cloud Messaging
        // Este método será implementado en la integración de FCM

        Notification::create([
            'user_id' => $this->receiver_id,
            'type' => 'new_message',
            'title' => 'Nuevo mensaje',
            'message' => $this->sender->name . ': ' . $this->getMessagePreview(),
            'is_read' => false,
        ]);
    }

    /**
     * Obtiene un preview del mensaje (primeros 50 caracteres)
     */
    public function getMessagePreview($length = 50)
    {
        if ($this->hasAttachment()) {
            return '📎 ' . ucfirst($this->attachment_type);
        }

        return strlen($this->message) > $length
            ? substr($this->message, 0, $length) . '...'
            : $this->message;
    }

    /**
     * Crea un mensaje de sistema
     */
    public static function createSystemMessage($conversationId, $message)
    {
        $conversation = Conversation::findOrFail($conversationId);

        return self::create([
            'conversation_id' => $conversationId,
            'sender_id' => $conversation->user1_id,
            'receiver_id' => $conversation->user2_id,
            'message' => $message,
            'is_system_message' => true,
            'read_at' => now(),
        ]);
    }
}
