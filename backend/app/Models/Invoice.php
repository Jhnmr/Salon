<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Invoice Model
 *
 * Factura electrónica generada para cada pago
 * Integración con Hacienda (Costa Rica)
 *
 * @property int $id
 * @property int $payment_id
 * @property int $branch_id
 * @property string $invoice_number
 * @property string $invoice_type
 * @property string|null $hacienda_key
 * @property string|null $hacienda_consecutive
 * @property string|null $xml_content
 * @property string|null $xml_signed
 * @property string|null $pdf_url
 * @property string $hacienda_status
 * @property string|null $hacienda_message
 * @property string|null $response_code
 * @property \Carbon\Carbon $issued_at
 * @property \Carbon\Carbon|null $sent_to_hacienda_at
 * @property \Carbon\Carbon|null $hacienda_response_at
 * @property int $send_attempts
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Invoice extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'invoices';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'payment_id',
        'branch_id',
        'invoice_number',
        'invoice_type',
        'hacienda_key',
        'hacienda_consecutive',
        'xml_content',
        'xml_signed',
        'pdf_url',
        'hacienda_status',
        'hacienda_message',
        'response_code',
        'issued_at',
        'sent_to_hacienda_at',
        'hacienda_response_at',
        'send_attempts',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'issued_at' => 'datetime',
        'sent_to_hacienda_at' => 'datetime',
        'hacienda_response_at' => 'datetime',
        'send_attempts' => 'integer',
    ];

    /**
     * Invoice types
     */
    public const TYPE_ELECTRONIC = 'electronic';
    public const TYPE_MANUAL = 'manual';

    /**
     * Hacienda statuses
     */
    public const HACIENDA_PENDING = 'pending';
    public const HACIENDA_SENT = 'sent';
    public const HACIENDA_ACCEPTED = 'accepted';
    public const HACIENDA_REJECTED = 'rejected';

    /**
     * Get the payment associated with this invoice.
     *
     * @return BelongsTo
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Get the branch that issued this invoice.
     *
     * @return BelongsTo
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Check if invoice is pending
     *
     * @return bool
     */
    public function isPending(): bool
    {
        return $this->hacienda_status === self::HACIENDA_PENDING;
    }

    /**
     * Check if invoice is accepted by Hacienda
     *
     * @return bool
     */
    public function isAccepted(): bool
    {
        return $this->hacienda_status === self::HACIENDA_ACCEPTED;
    }

    /**
     * Check if invoice is rejected by Hacienda
     *
     * @return bool
     */
    public function isRejected(): bool
    {
        return $this->hacienda_status === self::HACIENDA_REJECTED;
    }

    /**
     * Mark invoice as sent to Hacienda
     *
     * @return void
     */
    public function markAsSent(): void
    {
        $this->hacienda_status = self::HACIENDA_SENT;
        $this->sent_to_hacienda_at = now();
        $this->send_attempts++;
        $this->save();
    }

    /**
     * Mark invoice as accepted by Hacienda
     *
     * @param string $message
     * @param string|null $responseCode
     * @return void
     */
    public function markAsAccepted(string $message = '', ?string $responseCode = null): void
    {
        $this->hacienda_status = self::HACIENDA_ACCEPTED;
        $this->hacienda_response_at = now();
        $this->hacienda_message = $message;
        $this->response_code = $responseCode;
        $this->save();
    }

    /**
     * Mark invoice as rejected by Hacienda
     *
     * @param string $message
     * @param string|null $responseCode
     * @return void
     */
    public function markAsRejected(string $message, ?string $responseCode = null): void
    {
        $this->hacienda_status = self::HACIENDA_REJECTED;
        $this->hacienda_response_at = now();
        $this->hacienda_message = $message;
        $this->response_code = $responseCode;
        $this->save();
    }

    /**
     * Check if invoice can be resent
     *
     * @param int $maxAttempts
     * @return bool
     */
    public function canResend(int $maxAttempts = 3): bool
    {
        return $this->send_attempts < $maxAttempts && !$this->isAccepted();
    }

    /**
     * Generate next invoice number
     *
     * @param int $branchId
     * @return string
     */
    public static function generateInvoiceNumber(int $branchId): string
    {
        $date = now()->format('Ymd');
        $lastInvoice = self::where('branch_id', $branchId)
            ->whereDate('created_at', now())
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastInvoice ? intval(substr($lastInvoice->invoice_number, -4)) + 1 : 1;

        return sprintf('INV-%d-%s-%04d', $branchId, $date, $sequence);
    }
}
