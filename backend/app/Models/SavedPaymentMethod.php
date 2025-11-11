<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SavedPaymentMethod extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'payment_method_id',
        'payment_provider',
        'type',
        'last_four',
        'brand',
        'exp_month',
        'exp_year',
        'cardholder_name',
        'billing_address',
        'is_default',
        'metadata',
    ];

    protected $casts = [
        'exp_month' => 'integer',
        'exp_year' => 'integer',
        'is_default' => 'boolean',
        'billing_address' => 'array',
        'metadata' => 'array',
        'deleted_at' => 'datetime',
    ];

    protected $hidden = [
        'payment_method_id', // ID del proveedor (Stripe, PayPal) - sensible
    ];

    protected $appends = [
        'is_expired',
        'formatted_expiry',
        'display_name',
    ];

    // Proveedores de pago
    const PROVIDER_STRIPE = 'stripe';
    const PROVIDER_PAYPAL = 'paypal';
    const PROVIDER_MANUAL = 'manual';

    // Tipos de método de pago
    const TYPE_CARD = 'card';
    const TYPE_BANK_ACCOUNT = 'bank_account';
    const TYPE_PAYPAL = 'paypal';
    const TYPE_OTHER = 'other';

    /**
     * Relación con el usuario
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación con los pagos realizados con este método
     */
    public function payments()
    {
        return $this->hasMany(Payment::class, 'saved_payment_method_id');
    }

    /**
     * Verifica si el método de pago está expirado
     */
    public function getIsExpiredAttribute()
    {
        if (!$this->exp_month || !$this->exp_year) {
            return false;
        }

        $now = now();
        $expiryDate = \Carbon\Carbon::createFromDate($this->exp_year, $this->exp_month, 1)->endOfMonth();

        return $now->gt($expiryDate);
    }

    /**
     * Obtiene la fecha de expiración formateada
     */
    public function getFormattedExpiryAttribute()
    {
        if (!$this->exp_month || !$this->exp_year) {
            return null;
        }

        return sprintf('%02d/%02d', $this->exp_month, $this->exp_year % 100);
    }

    /**
     * Obtiene un nombre de display para el método de pago
     */
    public function getDisplayNameAttribute()
    {
        if ($this->type === self::TYPE_CARD) {
            $brand = $this->brand ? ucfirst($this->brand) : 'Card';
            return "{$brand} ****{$this->last_four}";
        } elseif ($this->type === self::TYPE_PAYPAL) {
            return "PayPal";
        } elseif ($this->type === self::TYPE_BANK_ACCOUNT) {
            return "Bank ****{$this->last_four}";
        }

        return ucfirst($this->type);
    }

    /**
     * Scope para métodos de pago activos (no expirados)
     */
    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('exp_year')
                ->orWhere(function ($q2) {
                    $q2->where('exp_year', '>', now()->year)
                        ->orWhere(function ($q3) {
                            $q3->where('exp_year', '=', now()->year)
                                ->where('exp_month', '>=', now()->month);
                        });
                });
        });
    }

    /**
     * Scope para métodos de pago de un usuario
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope para métodos de pago por defecto
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope para métodos de pago por proveedor
     */
    public function scopeByProvider($query, $provider)
    {
        return $query->where('payment_provider', $provider);
    }

    /**
     * Scope para métodos de pago por tipo
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Boot del modelo para manejar eventos
     */
    protected static function boot()
    {
        parent::boot();

        // Al establecer como default, remover default de otros métodos del mismo usuario
        static::saving(function ($paymentMethod) {
            if ($paymentMethod->is_default) {
                self::where('user_id', $paymentMethod->user_id)
                    ->where('id', '!=', $paymentMethod->id ?? 0)
                    ->update(['is_default' => false]);
            }
        });
    }

    /**
     * Establece este método como default
     */
    public function setAsDefault()
    {
        // Remover default de otros métodos
        self::where('user_id', $this->user_id)
            ->where('id', '!=', $this->id)
            ->update(['is_default' => false]);

        // Establecer este como default
        $this->update(['is_default' => true]);
    }

    /**
     * Valida si el método de pago puede ser usado
     */
    public function canBeUsed()
    {
        return !$this->is_expired && !$this->trashed();
    }

    /**
     * Obtiene el método de pago default de un usuario
     */
    public static function getDefaultForUser($userId)
    {
        return self::where('user_id', $userId)
            ->where('is_default', true)
            ->active()
            ->first();
    }

    /**
     * Crea un método de pago desde un PaymentIntent de Stripe
     */
    public static function createFromStripe($userId, $paymentMethod)
    {
        return self::create([
            'user_id' => $userId,
            'payment_method_id' => $paymentMethod->id,
            'payment_provider' => self::PROVIDER_STRIPE,
            'type' => $paymentMethod->type,
            'last_four' => $paymentMethod->card->last4 ?? null,
            'brand' => $paymentMethod->card->brand ?? null,
            'exp_month' => $paymentMethod->card->exp_month ?? null,
            'exp_year' => $paymentMethod->card->exp_year ?? null,
            'billing_address' => [
                'line1' => $paymentMethod->billing_details->address->line1 ?? null,
                'line2' => $paymentMethod->billing_details->address->line2 ?? null,
                'city' => $paymentMethod->billing_details->address->city ?? null,
                'state' => $paymentMethod->billing_details->address->state ?? null,
                'postal_code' => $paymentMethod->billing_details->address->postal_code ?? null,
                'country' => $paymentMethod->billing_details->address->country ?? null,
            ],
            'metadata' => [
                'fingerprint' => $paymentMethod->card->fingerprint ?? null,
                'funding' => $paymentMethod->card->funding ?? null,
            ],
        ]);
    }

    /**
     * Desvincula el método de pago del proveedor (Stripe, PayPal)
     */
    public function detachFromProvider()
    {
        if ($this->payment_provider === self::PROVIDER_STRIPE && $this->payment_method_id) {
            try {
                // TODO: Implementar integración con Stripe
                // \Stripe\PaymentMethod::retrieve($this->payment_method_id)->detach();
            } catch (\Exception $e) {
                \Log::error('Error detaching payment method from Stripe: ' . $e->getMessage());
            }
        }

        $this->delete();
    }
}
