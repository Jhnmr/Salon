<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Promotion extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'branch_id',
        'code',
        'title',
        'description',
        'discount_type',
        'discount_value',
        'min_purchase_amount',
        'max_discount_amount',
        'usage_limit',
        'usage_count',
        'user_usage_limit',
        'valid_from',
        'valid_until',
        'applicable_services',
        'applicable_days',
        'is_active',
        'is_first_booking_only',
        'is_public',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'min_purchase_amount' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'usage_limit' => 'integer',
        'usage_count' => 'integer',
        'user_usage_limit' => 'integer',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'applicable_services' => 'array',
        'applicable_days' => 'array',
        'is_active' => 'boolean',
        'is_first_booking_only' => 'boolean',
        'is_public' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    // Tipos de descuento
    const DISCOUNT_TYPE_PERCENTAGE = 'percentage';
    const DISCOUNT_TYPE_FIXED = 'fixed';
    const DISCOUNT_TYPE_FREE_SERVICE = 'free_service';

    /**
     * Relación con la sucursal
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Relación con los servicios aplicables
     */
    public function services()
    {
        return $this->belongsToMany(Service::class, 'promotion_service');
    }

    /**
     * Scope para promociones activas
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where('valid_from', '<=', now())
            ->where('valid_until', '>=', now())
            ->where(function ($q) {
                $q->whereNull('usage_limit')
                    ->orWhereRaw('usage_count < usage_limit');
            });
    }

    /**
     * Scope para promociones públicas
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope para promociones por código
     */
    public function scopeByCode($query, $code)
    {
        return $query->where('code', strtoupper($code));
    }

    /**
     * Valida si la promoción es aplicable
     */
    public function isValid($userId = null, $serviceIds = [], $amount = 0, $isFirstBooking = false)
    {
        $errors = [];

        // Verificar si está activa
        if (!$this->is_active) {
            $errors[] = 'La promoción no está activa';
        }

        // Verificar fechas de validez
        if ($this->valid_from && now()->lt($this->valid_from)) {
            $errors[] = 'La promoción aún no es válida';
        }

        if ($this->valid_until && now()->gt($this->valid_until)) {
            $errors[] = 'La promoción ha expirado';
        }

        // Verificar límite de uso global
        if ($this->usage_limit && $this->usage_count >= $this->usage_limit) {
            $errors[] = 'La promoción ha alcanzado su límite de uso';
        }

        // Verificar monto mínimo de compra
        if ($this->min_purchase_amount && $amount < $this->min_purchase_amount) {
            $errors[] = 'El monto de compra no alcanza el mínimo requerido';
        }

        // Verificar si es solo para primera reserva
        if ($this->is_first_booking_only && !$isFirstBooking) {
            $errors[] = 'Esta promoción es solo para la primera reserva';
        }

        // Verificar servicios aplicables
        if (!empty($this->applicable_services) && !empty($serviceIds)) {
            $hasApplicableService = !empty(array_intersect($this->applicable_services, $serviceIds));
            if (!$hasApplicableService) {
                $errors[] = 'Los servicios seleccionados no aplican para esta promoción';
            }
        }

        // Verificar días aplicables
        if (!empty($this->applicable_days)) {
            $currentDay = now()->dayOfWeek; // 0 = Sunday, 6 = Saturday
            if (!in_array($currentDay, $this->applicable_days)) {
                $errors[] = 'Esta promoción no aplica para el día de hoy';
            }
        }

        // Verificar límite de uso por usuario
        if ($userId && $this->user_usage_limit) {
            $userUsageCount = Payment::where('user_id', $userId)
                ->where('promotion_code', $this->code)
                ->count();

            if ($userUsageCount >= $this->user_usage_limit) {
                $errors[] = 'Has alcanzado el límite de uso de esta promoción';
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * Calcula el descuento aplicable
     */
    public function calculateDiscount($amount)
    {
        $discount = 0;

        switch ($this->discount_type) {
            case self::DISCOUNT_TYPE_PERCENTAGE:
                $discount = $amount * ($this->discount_value / 100);
                break;

            case self::DISCOUNT_TYPE_FIXED:
                $discount = $this->discount_value;
                break;

            case self::DISCOUNT_TYPE_FREE_SERVICE:
                // Para servicio gratis, el descuento es el monto total del servicio
                $discount = $amount;
                break;
        }

        // Aplicar límite máximo de descuento si existe
        if ($this->max_discount_amount && $discount > $this->max_discount_amount) {
            $discount = $this->max_discount_amount;
        }

        // El descuento no puede ser mayor al monto
        return min($discount, $amount);
    }

    /**
     * Incrementa el contador de uso
     */
    public function incrementUsage()
    {
        $this->increment('usage_count');
    }

    /**
     * Verifica si la promoción puede ser usada
     */
    public function canBeUsed()
    {
        return $this->is_active
            && (!$this->usage_limit || $this->usage_count < $this->usage_limit)
            && $this->valid_from <= now()
            && $this->valid_until >= now();
    }

    /**
     * Genera un código único de promoción
     */
    public static function generateUniqueCode($length = 8)
    {
        do {
            $code = strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, $length));
        } while (self::where('code', $code)->exists());

        return $code;
    }

    /**
     * Busca y valida una promoción por código
     */
    public static function findAndValidate($code, $userId = null, $serviceIds = [], $amount = 0, $isFirstBooking = false)
    {
        $promotion = self::byCode($code)->first();

        if (!$promotion) {
            return [
                'valid' => false,
                'errors' => ['Código de promoción no encontrado'],
                'promotion' => null,
            ];
        }

        $validation = $promotion->isValid($userId, $serviceIds, $amount, $isFirstBooking);

        return [
            'valid' => $validation['valid'],
            'errors' => $validation['errors'],
            'promotion' => $promotion,
            'discount' => $validation['valid'] ? $promotion->calculateDiscount($amount) : 0,
        ];
    }
}
