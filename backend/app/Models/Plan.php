<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Plan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'currency',
        'billing_period',
        'trial_days',
        'features',
        'limits',
        'is_active',
        'is_popular',
        'stripe_price_id',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'trial_days' => 'integer',
        'features' => 'array',
        'limits' => 'array',
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
        'sort_order' => 'integer',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'formatted_price',
        'monthly_price',
    ];

    // Períodos de facturación
    const BILLING_MONTHLY = 'monthly';
    const BILLING_QUARTERLY = 'quarterly';
    const BILLING_YEARLY = 'yearly';
    const BILLING_LIFETIME = 'lifetime';

    // Tipos de plan predefinidos
    const PLAN_FREE = 'free';
    const PLAN_BASIC = 'basic';
    const PLAN_PRO = 'pro';
    const PLAN_PREMIUM = 'premium';

    /**
     * Relación con las suscripciones
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Relación con suscripciones activas
     */
    public function activeSubscriptions()
    {
        return $this->hasMany(Subscription::class)->where('status', 'active');
    }

    /**
     * Obtiene el precio formateado con moneda
     */
    public function getFormattedPriceAttribute()
    {
        $symbols = [
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
            'CRC' => '₡',
        ];

        $symbol = $symbols[$this->currency] ?? $this->currency;

        return $symbol . number_format($this->price, 2);
    }

    /**
     * Obtiene el precio mensual equivalente
     */
    public function getMonthlyPriceAttribute()
    {
        switch ($this->billing_period) {
            case self::BILLING_MONTHLY:
                return $this->price;
            case self::BILLING_QUARTERLY:
                return $this->price / 3;
            case self::BILLING_YEARLY:
                return $this->price / 12;
            case self::BILLING_LIFETIME:
                return 0;
            default:
                return $this->price;
        }
    }

    /**
     * Scope para planes activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para planes populares
     */
    public function scopePopular($query)
    {
        return $query->where('is_popular', true);
    }

    /**
     * Scope para planes por período de facturación
     */
    public function scopeByPeriod($query, $period)
    {
        return $query->where('billing_period', $period);
    }

    /**
     * Scope ordenado por sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc');
    }

    /**
     * Verifica si el plan tiene una característica específica
     */
    public function hasFeature($feature)
    {
        return in_array($feature, $this->features ?? []);
    }

    /**
     * Obtiene el límite de un recurso específico
     */
    public function getLimit($resource, $default = null)
    {
        return $this->limits[$resource] ?? $default;
    }

    /**
     * Verifica si el plan tiene límite ilimitado para un recurso
     */
    public function hasUnlimited($resource)
    {
        $limit = $this->getLimit($resource);
        return $limit === null || $limit === -1 || $limit === 'unlimited';
    }

    /**
     * Obtiene el número de suscriptores activos
     */
    public function subscribersCount()
    {
        return $this->activeSubscriptions()->count();
    }

    /**
     * Calcula el descuento vs plan mensual
     */
    public function getDiscountPercentage()
    {
        if ($this->billing_period === self::BILLING_MONTHLY) {
            return 0;
        }

        // Buscar el plan mensual equivalente
        $monthlyPlan = self::where('slug', 'like', '%monthly%')
            ->orWhere('billing_period', self::BILLING_MONTHLY)
            ->first();

        if (!$monthlyPlan) {
            return 0;
        }

        $monthlyTotal = $monthlyPlan->price * $this->getMonthsInPeriod();
        $discount = (($monthlyTotal - $this->price) / $monthlyTotal) * 100;

        return round($discount, 0);
    }

    /**
     * Obtiene el número de meses en el período de facturación
     */
    protected function getMonthsInPeriod()
    {
        switch ($this->billing_period) {
            case self::BILLING_MONTHLY:
                return 1;
            case self::BILLING_QUARTERLY:
                return 3;
            case self::BILLING_YEARLY:
                return 12;
            default:
                return 1;
        }
    }

    /**
     * Genera un slug único para el plan
     */
    public static function generateUniqueSlug($name)
    {
        $slug = \Illuminate\Support\Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        while (self::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Boot del modelo
     */
    protected static function boot()
    {
        parent::boot();

        // Generar slug automáticamente si no existe
        static::creating(function ($plan) {
            if (!$plan->slug) {
                $plan->slug = self::generateUniqueSlug($plan->name);
            }
        });
    }

    /**
     * Crea los planes por defecto del sistema
     */
    public static function createDefaultPlans()
    {
        $plans = [
            [
                'name' => 'Free',
                'slug' => self::PLAN_FREE,
                'description' => 'Plan gratuito para comenzar',
                'price' => 0,
                'currency' => 'USD',
                'billing_period' => self::BILLING_MONTHLY,
                'trial_days' => 0,
                'features' => [
                    'Hasta 10 citas por mes',
                    'Perfil básico',
                    'Soporte por email',
                ],
                'limits' => [
                    'appointments_per_month' => 10,
                    'photos' => 5,
                    'services' => 3,
                ],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Basic',
                'slug' => self::PLAN_BASIC,
                'description' => 'Para estilistas independientes',
                'price' => 29.99,
                'currency' => 'USD',
                'billing_period' => self::BILLING_MONTHLY,
                'trial_days' => 14,
                'features' => [
                    'Citas ilimitadas',
                    'Hasta 20 fotos de portafolio',
                    'Calendario avanzado',
                    'Estadísticas básicas',
                    'Soporte prioritario',
                ],
                'limits' => [
                    'appointments_per_month' => -1,
                    'photos' => 20,
                    'services' => 10,
                ],
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Pro',
                'slug' => self::PLAN_PRO,
                'description' => 'Para profesionales serios',
                'price' => 49.99,
                'currency' => 'USD',
                'billing_period' => self::BILLING_MONTHLY,
                'trial_days' => 14,
                'features' => [
                    'Todo en Basic',
                    'Fotos ilimitadas',
                    'Servicios ilimitados',
                    'Analytics avanzado',
                    'Sin comisión de plataforma',
                    'API access',
                    'Soporte 24/7',
                ],
                'limits' => [
                    'appointments_per_month' => -1,
                    'photos' => -1,
                    'services' => -1,
                ],
                'is_active' => true,
                'is_popular' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Premium',
                'slug' => self::PLAN_PREMIUM,
                'description' => 'Para salones y equipos',
                'price' => 99.99,
                'currency' => 'USD',
                'billing_period' => self::BILLING_MONTHLY,
                'trial_days' => 30,
                'features' => [
                    'Todo en Pro',
                    'Múltiples estilistas',
                    'Gestión de sucursales',
                    'Reportes personalizados',
                    'White label',
                    'Account manager dedicado',
                ],
                'limits' => [
                    'appointments_per_month' => -1,
                    'photos' => -1,
                    'services' => -1,
                    'stylists' => 10,
                    'branches' => 3,
                ],
                'is_active' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($plans as $planData) {
            self::firstOrCreate(
                ['slug' => $planData['slug']],
                $planData
            );
        }
    }
}
