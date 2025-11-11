<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Payment Model
 *
 * Gestiona todos los pagos procesados en la plataforma
 * Integración con Stripe, PayPal y otros proveedores
 *
 * @property int $id
 * @property string $codigo_transaccion
 * @property int $reservation_id
 * @property int $user_id
 * @property int|null $branch_id
 * @property float $amount_subtotal
 * @property float $amount_tip
 * @property float $amount_discount
 * @property float $amount_tax
 * @property float $amount_total
 * @property string $payment_method
 * @property string $payment_provider
 * @property string|null $stripe_payment_intent_id
 * @property string|null $stripe_charge_id
 * @property string|null $stripe_customer_id
 * @property string|null $paypal_order_id
 * @property string|null $paypal_capture_id
 * @property string $status
 * @property float $commission_platform
 * @property float $commission_percentage
 * @property float $amount_stylist
 * @property float $amount_branch
 * @property \Carbon\Carbon|null $payment_date
 * @property \Carbon\Carbon|null $release_date
 * @property float|null $refund_amount
 * @property \Carbon\Carbon|null $refund_date
 * @property string|null $refund_reason
 * @property int|null $refund_processed_by
 * @property bool $requires_invoice
 * @property bool $invoice_generated
 * @property array|null $metadata
 * @property string|null $client_ip
 * @property string|null $browser
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Payment extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'payments';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'codigo_transaccion',
        'reservation_id',
        'user_id',
        'branch_id',
        'amount_subtotal',
        'amount_tip',
        'amount_discount',
        'amount_tax',
        'amount_total',
        'payment_method',
        'payment_provider',
        'stripe_payment_intent_id',
        'stripe_charge_id',
        'stripe_customer_id',
        'paypal_order_id',
        'paypal_capture_id',
        'status',
        'commission_platform',
        'commission_percentage',
        'amount_stylist',
        'amount_branch',
        'payment_date',
        'release_date',
        'refund_amount',
        'refund_date',
        'refund_reason',
        'refund_processed_by',
        'requires_invoice',
        'invoice_generated',
        'metadata',
        'client_ip',
        'browser',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount_subtotal' => 'decimal:2',
        'amount_tip' => 'decimal:2',
        'amount_discount' => 'decimal:2',
        'amount_tax' => 'decimal:2',
        'amount_total' => 'decimal:2',
        'commission_platform' => 'decimal:2',
        'commission_percentage' => 'decimal:2',
        'amount_stylist' => 'decimal:2',
        'amount_branch' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'release_date' => 'datetime',
        'refund_date' => 'datetime',
        'requires_invoice' => 'boolean',
        'invoice_generated' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Payment statuses
     */
    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';
    public const STATUS_REFUNDED = 'refunded';
    public const STATUS_PARTIALLY_REFUNDED = 'partially_refunded';
    public const STATUS_DISPUTED = 'disputed';
    public const STATUS_CANCELLED = 'cancelled';

    /**
     * Payment methods
     */
    public const METHOD_CREDIT_CARD = 'credit_card';
    public const METHOD_DEBIT_CARD = 'debit_card';
    public const METHOD_CASH = 'cash';
    public const METHOD_BANK_TRANSFER = 'bank_transfer';
    public const METHOD_PAYPAL = 'paypal';
    public const METHOD_DIGITAL_WALLET = 'digital_wallet';
    public const METHOD_CRYPTOCURRENCY = 'cryptocurrency';

    /**
     * Payment providers
     */
    public const PROVIDER_STRIPE = 'stripe';
    public const PROVIDER_PAYPAL = 'paypal';
    public const PROVIDER_MANUAL = 'manual';
    public const PROVIDER_OTHER = 'other';

    /**
     * Get the reservation associated with this payment.
     *
     * @return BelongsTo
     */
    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    /**
     * Get the user (client) who made this payment.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the branch associated with this payment.
     *
     * @return BelongsTo
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the user who processed the refund.
     *
     * @return BelongsTo
     */
    public function refundProcessor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'refund_processed_by');
    }

    /**
     * Get the invoice associated with this payment.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    /**
     * Check if payment is completed
     *
     * @return bool
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if payment is refunded
     *
     * @return bool
     */
    public function isRefunded(): bool
    {
        return in_array($this->status, [self::STATUS_REFUNDED, self::STATUS_PARTIALLY_REFUNDED]);
    }

    /**
     * Check if payment can be refunded
     *
     * @return bool
     */
    public function canBeRefunded(): bool
    {
        return $this->isCompleted() && !$this->isRefunded();
    }
}
