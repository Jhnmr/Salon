<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'stylist_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con el cliente
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Relación con el estilista
     */
    public function stylist()
    {
        return $this->belongsTo(Stylist::class);
    }

    /**
     * Relación con el usuario cliente
     */
    public function user()
    {
        return $this->hasOneThrough(
            User::class,
            Client::class,
            'id',
            'id',
            'client_id',
            'user_id'
        );
    }

    /**
     * Scope para favoritos de un cliente
     */
    public function scopeForClient($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    /**
     * Scope para favoritos de un estilista
     */
    public function scopeForStylist($query, $stylistId)
    {
        return $query->where('stylist_id', $stylistId);
    }

    /**
     * Verifica si un cliente tiene a un estilista como favorito
     */
    public static function isFavorite($clientId, $stylistId)
    {
        return self::where('client_id', $clientId)
            ->where('stylist_id', $stylistId)
            ->exists();
    }

    /**
     * Toggle favorito (añadir o quitar)
     */
    public static function toggle($clientId, $stylistId)
    {
        $favorite = self::where('client_id', $clientId)
            ->where('stylist_id', $stylistId)
            ->first();

        if ($favorite) {
            $favorite->delete();
            return [
                'favorite' => false,
                'message' => 'Estilista removido de favoritos',
            ];
        } else {
            self::create([
                'client_id' => $clientId,
                'stylist_id' => $stylistId,
            ]);

            // Notificar al estilista
            $stylist = Stylist::find($stylistId);
            if ($stylist) {
                Notification::create([
                    'user_id' => $stylist->user_id,
                    'type' => 'new_favorite',
                    'title' => 'Nuevo favorito',
                    'message' => 'Un cliente te ha añadido a favoritos',
                ]);
            }

            return [
                'favorite' => true,
                'message' => 'Estilista añadido a favoritos',
            ];
        }
    }

    /**
     * Obtiene los IDs de estilistas favoritos de un cliente
     */
    public static function getStylistIds($clientId)
    {
        return self::where('client_id', $clientId)
            ->pluck('stylist_id')
            ->toArray();
    }

    /**
     * Obtiene el número de clientes que tienen a un estilista como favorito
     */
    public static function countForStylist($stylistId)
    {
        return self::where('stylist_id', $stylistId)->count();
    }

    /**
     * Obtiene los estilistas favoritos de un cliente con sus datos
     */
    public static function getFavoriteStylistsForClient($clientId)
    {
        return self::where('client_id', $clientId)
            ->with(['stylist.user.profile', 'stylist.branch'])
            ->get()
            ->pluck('stylist');
    }
}
