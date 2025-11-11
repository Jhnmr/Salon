<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subscription extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'plan_id',
        'status',
        'stripe_subscription_id',
        'stripe_customer_id',
        'trial_ends_at',
        'current_period_start',
        'current_period_end',
        'canceled_at',
        'ended_at',
        'metadata',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'current_period_start' => 'datetime',
        'current_period_end' => 'datetime',
        'canceled_at' => 'datetime',
        'ended_at' => 'datetime',
        'metadata' => 'array',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'is_active',
        'is_on_trial',
        'is_canceled',
        'days_until_renewal',
    ];

    // Estados de suscripción
    const STATUS_ACTIVE = 'active';
    const STATUS_TRIALING = 'trialing';
    const STATUS_PAST_DUE = 'past_due';
    const STATUS_CANCELED = 'canceled';
    const STATUS_UNPAID = 'unpaid';
    const STATUS_INCOMPLETE = 'incomplete';
    const STATUS_INCOMPLETE_EXPIRED = 'incomplete_expired';
    const STATUS_PAUSED = 'paused';

    /**
     * Relación con el usuario
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación con el plan
     */
    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * Verifica si la suscripción está activa
     */
    public function getIsActiveAttribute()
    {
        return in_array($this->status, [self::STATUS_ACTIVE, self::STATUS_TRIALING]);
    }

    /**
     * Verifica si está en período de prueba
     */
    public function getIsOnTrialAttribute()
    {
        return $this->status === self::STATUS_TRIALING
            && $this->trial_ends_at
            && now()->lt($this->trial_ends_at);
    }

    /**
     * Verifica si la suscripción fue cancelada
     */
    public function getIsCanceledAttribute()
    {
        return !is_null($this->canceled_at);
    }

    /**
     * Obtiene días hasta la renovación
     */
    public function getDaysUntilRenewalAttribute()
    {
        if (!$this->current_period_end) {
            return null;
        }

        return now()->diffInDays($this->current_period_end, false);
    }

    /**
     * Scope para suscripciones activas
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', [self::STATUS_ACTIVE, self::STATUS_TRIALING]);
    }

    /**
     * Scope para suscripciones en período de prueba
     */
    public function scopeOnTrial($query)
    {
        return $query->where('status', self::STATUS_TRIALING)
            ->where('trial_ends_at', '>', now());
    }

    /**
     * Scope para suscripciones canceladas
     */
    public function scopeCanceled($query)
    {
        return $query->whereNotNull('canceled_at');
    }

    /**
     * Scope para suscripciones por renovar pronto
     */
    public function scopeRenewingSoon($query, $days = 7)
    {
        return $query->active()
            ->whereBetween('current_period_end', [now(), now()->addDays($days)]);
    }

    /**
     * Scope para suscripciones vencidas
     */
    public function scopeExpired($query)
    {
        return $query->where('current_period_end', '<', now())
            ->whereIn('status', [self::STATUS_PAST_DUE, self::STATUS_UNPAID]);
    }

    /**
     * Verifica si la suscripción ha finalizado
     */
    public function hasEnded()
    {
        return !is_null($this->ended_at) && now()->gte($this->ended_at);
    }

    /**
     * Verifica si la suscripción está en período de gracia
     */
    public function isInGracePeriod()
    {
        return $this->is_canceled
            && $this->current_period_end
            && now()->lt($this->current_period_end);
    }

    /**
     * Cancela la suscripción al final del período actual
     */
    public function cancel()
    {
        if ($this->is_canceled) {
            return false;
        }

        $this->update([
            'canceled_at' => now(),
            'ended_at' => $this->current_period_end,
        ]);

        // TODO: Cancelar en Stripe
        // if ($this->stripe_subscription_id) {
        //     \Stripe\Subscription::update($this->stripe_subscription_id, [
        //         'cancel_at_period_end' => true,
        //     ]);
        // }

        return true;
    }

    /**
     * Cancela inmediatamente la suscripción
     */
    public function cancelImmediately()
    {
        $this->update([
            'status' => self::STATUS_CANCELED,
            'canceled_at' => now(),
            'ended_at' => now(),
        ]);

        // TODO: Cancelar en Stripe inmediatamente
        // if ($this->stripe_subscription_id) {
        //     \Stripe\Subscription::retrieve($this->stripe_subscription_id)->cancel();
        // }

        return true;
    }

    /**
     * Reactiva una suscripción cancelada
     */
    public function resume()
    {
        if (!$this->is_canceled || $this->hasEnded()) {
            return false;
        }

        $this->update([
            'status' => self::STATUS_ACTIVE,
            'canceled_at' => null,
            'ended_at' => null,
        ]);

        // TODO: Reactivar en Stripe
        // if ($this->stripe_subscription_id) {
        //     \Stripe\Subscription::update($this->stripe_subscription_id, [
        //         'cancel_at_period_end' => false,
        //     ]);
        // }

        return true;
    }

    /**
     * Cambia el plan de suscripción
     */
    public function changePlan(Plan $newPlan, $prorate = true)
    {
        $oldPlan = $this->plan;

        $this->update([
            'plan_id' => $newPlan->id,
        ]);

        // TODO: Cambiar plan en Stripe
        // if ($this->stripe_subscription_id) {
        //     \Stripe\Subscription::update($this->stripe_subscription_id, [
        //         'items' => [
        //             ['id' => $this->stripe_subscription_item_id, 'price' => $newPlan->stripe_price_id],
        //         ],
        //         'proration_behavior' => $prorate ? 'create_prorations' : 'none',
        //     ]);
        // }

        // Log de auditoría
        AuditLog::logUpdate($this->user, 'subscriptions', $this->id, [
            'old_plan' => $oldPlan->name,
            'new_plan' => $newPlan->name,
        ]);

        return true;
    }

    /**
     * Renueva la suscripción por un período más
     */
    public function renew()
    {
        $plan = $this->plan;
        $periodDays = $this->getPeriodDays($plan->billing_period);

        $this->update([
            'status' => self::STATUS_ACTIVE,
            'current_period_start' => $this->current_period_end,
            'current_period_end' => $this->current_period_end->addDays($periodDays),
        ]);

        return true;
    }

    /**
     * Obtiene el número de días del período de facturación
     */
    protected function getPeriodDays($billingPeriod)
    {
        switch ($billingPeriod) {
            case Plan::BILLING_MONTHLY:
                return 30;
            case Plan::BILLING_QUARTERLY:
                return 90;
            case Plan::BILLING_YEARLY:
                return 365;
            default:
                return 30;
        }
    }

    /**
     * Verifica si el usuario puede acceder a una característica
     */
    public function canUseFeature($feature)
    {
        if (!$this->is_active) {
            return false;
        }

        return $this->plan->hasFeature($feature);
    }

    /**
     * Verifica si el usuario ha alcanzado el límite de un recurso
     */
    public function hasReachedLimit($resource, $currentUsage)
    {
        if (!$this->is_active) {
            return true;
        }

        $limit = $this->plan->getLimit($resource);

        if ($this->plan->hasUnlimited($resource)) {
            return false;
        }

        return $currentUsage >= $limit;
    }

    /**
     * Obtiene el uso restante de un recurso
     */
    public function getRemainingUsage($resource, $currentUsage)
    {
        if ($this->plan->hasUnlimited($resource)) {
            return -1; // Ilimitado
        }

        $limit = $this->plan->getLimit($resource, 0);
        return max(0, $limit - $currentUsage);
    }

    /**
     * Boot del modelo
     */
    protected static function boot()
    {
        parent::boot();

        // Al crear una suscripción, establecer fechas si no existen
        static::creating(function ($subscription) {
            if (!$subscription->current_period_start) {
                $subscription->current_period_start = now();
            }

            if (!$subscription->current_period_end) {
                $plan = $subscription->plan;
                $periodDays = $subscription->getPeriodDays($plan->billing_period);
                $subscription->current_period_end = now()->addDays($periodDays);
            }

            // Si el plan tiene trial y no se ha establecido
            if ($subscription->plan->trial_days > 0 && !$subscription->trial_ends_at) {
                $subscription->trial_ends_at = now()->addDays($subscription->plan->trial_days);
                $subscription->status = self::STATUS_TRIALING;
            }
        });
    }

    /**
     * Crea una suscripción para un usuario
     */
    public static function createForUser(User $user, Plan $plan, $trialDays = null)
    {
        $trialDays = $trialDays ?? $plan->trial_days;

        return self::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => $trialDays > 0 ? self::STATUS_TRIALING : self::STATUS_ACTIVE,
            'trial_ends_at' => $trialDays > 0 ? now()->addDays($trialDays) : null,
        ]);
    }
}
