<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StylistService extends Model
{
    use HasFactory;

    protected $table = 'stylist_services';

    protected $fillable = [
        'stylist_id',
        'service_id',
        'custom_price',
        'custom_duration',
        'is_available',
        'notes',
    ];

    protected $casts = [
        'custom_price' => 'decimal:2',
        'custom_duration' => 'integer',
        'is_available' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'final_price',
        'final_duration',
    ];

    /**
     * Relación con el estilista
     */
    public function stylist()
    {
        return $this->belongsTo(Stylist::class);
    }

    /**
     * Relación con el servicio
     */
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Obtiene el precio final (custom o del servicio base)
     */
    public function getFinalPriceAttribute()
    {
        return $this->custom_price ?? $this->service->price;
    }

    /**
     * Obtiene la duración final (custom o del servicio base)
     */
    public function getFinalDurationAttribute()
    {
        return $this->custom_duration ?? $this->service->duration_minutes;
    }

    /**
     * Scope para servicios disponibles
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope para servicios de un estilista
     */
    public function scopeForStylist($query, $stylistId)
    {
        return $query->where('stylist_id', $stylistId);
    }

    /**
     * Scope para un servicio específico
     */
    public function scopeForService($query, $serviceId)
    {
        return $query->where('service_id', $serviceId);
    }

    /**
     * Verifica si el precio es personalizado
     */
    public function hasCustomPrice()
    {
        return !is_null($this->custom_price);
    }

    /**
     * Verifica si la duración es personalizada
     */
    public function hasCustomDuration()
    {
        return !is_null($this->custom_duration);
    }

    /**
     * Obtiene el porcentaje de diferencia con el precio base
     */
    public function getPriceDiscountPercentage()
    {
        if (!$this->hasCustomPrice()) {
            return 0;
        }

        $basePrice = $this->service->price;
        if ($basePrice == 0) {
            return 0;
        }

        return round((($basePrice - $this->custom_price) / $basePrice) * 100, 2);
    }

    /**
     * Verifica si hay descuento
     */
    public function hasDiscount()
    {
        return $this->hasCustomPrice() && $this->custom_price < $this->service->price;
    }

    /**
     * Verifica si hay recargo
     */
    public function hasSurcharge()
    {
        return $this->hasCustomPrice() && $this->custom_price > $this->service->price;
    }

    /**
     * Habilita el servicio para el estilista
     */
    public function enable()
    {
        $this->update(['is_available' => true]);
    }

    /**
     * Deshabilita el servicio para el estilista
     */
    public function disable()
    {
        $this->update(['is_available' => false]);
    }

    /**
     * Establece un precio personalizado
     */
    public function setCustomPrice($price)
    {
        $this->update(['custom_price' => $price]);
    }

    /**
     * Elimina el precio personalizado (volver al precio base)
     */
    public function removeCustomPrice()
    {
        $this->update(['custom_price' => null]);
    }

    /**
     * Establece una duración personalizada
     */
    public function setCustomDuration($minutes)
    {
        $this->update(['custom_duration' => $minutes]);
    }

    /**
     * Elimina la duración personalizada (volver a la duración base)
     */
    public function removeCustomDuration()
    {
        $this->update(['custom_duration' => null]);
    }

    /**
     * Busca o crea la relación estilista-servicio
     */
    public static function findOrCreateForStylist($stylistId, $serviceId, $available = true)
    {
        return self::firstOrCreate(
            [
                'stylist_id' => $stylistId,
                'service_id' => $serviceId,
            ],
            [
                'is_available' => $available,
            ]
        );
    }

    /**
     * Sincroniza los servicios de un estilista
     */
    public static function syncForStylist($stylistId, array $serviceIds)
    {
        // Deshabilitar todos los servicios actuales
        self::where('stylist_id', $stylistId)->update(['is_available' => false]);

        // Habilitar o crear los servicios proporcionados
        foreach ($serviceIds as $serviceId) {
            $stylistService = self::findOrCreateForStylist($stylistId, $serviceId);
            $stylistService->enable();
        }
    }

    /**
     * Obtiene los servicios disponibles de un estilista con sus precios
     */
    public static function getAvailableServicesForStylist($stylistId)
    {
        return self::where('stylist_id', $stylistId)
            ->where('is_available', true)
            ->with('service.category')
            ->get()
            ->map(function ($stylistService) {
                return [
                    'id' => $stylistService->service->id,
                    'name' => $stylistService->service->name,
                    'description' => $stylistService->service->description,
                    'category' => $stylistService->service->category->name ?? null,
                    'base_price' => $stylistService->service->price,
                    'price' => $stylistService->final_price,
                    'has_custom_price' => $stylistService->hasCustomPrice(),
                    'has_discount' => $stylistService->hasDiscount(),
                    'discount_percentage' => $stylistService->getPriceDiscountPercentage(),
                    'base_duration' => $stylistService->service->duration_minutes,
                    'duration' => $stylistService->final_duration,
                    'has_custom_duration' => $stylistService->hasCustomDuration(),
                    'notes' => $stylistService->notes,
                ];
            });
    }

    /**
     * Obtiene el precio y duración para un servicio específico de un estilista
     */
    public static function getPricingForStylist($stylistId, $serviceId)
    {
        $stylistService = self::where('stylist_id', $stylistId)
            ->where('service_id', $serviceId)
            ->where('is_available', true)
            ->with('service')
            ->first();

        if (!$stylistService) {
            return null;
        }

        return [
            'price' => $stylistService->final_price,
            'duration' => $stylistService->final_duration,
            'is_available' => true,
        ];
    }

    /**
     * Verifica si un estilista ofrece un servicio
     */
    public static function stylistOffersService($stylistId, $serviceId)
    {
        return self::where('stylist_id', $stylistId)
            ->where('service_id', $serviceId)
            ->where('is_available', true)
            ->exists();
    }
}
