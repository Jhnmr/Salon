<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ScheduleBlock extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'stylist_id',
        'title',
        'description',
        'start_datetime',
        'end_datetime',
        'is_recurring',
        'recurrence_pattern',
        'recurrence_end_date',
        'reason',
        'is_all_day',
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'recurrence_end_date' => 'date',
        'is_recurring' => 'boolean',
        'is_all_day' => 'boolean',
        'recurrence_pattern' => 'array',
        'deleted_at' => 'datetime',
    ];

    // Razones de bloqueo
    const REASON_VACATION = 'vacation';
    const REASON_SICK_LEAVE = 'sick_leave';
    const REASON_PERSONAL = 'personal';
    const REASON_TRAINING = 'training';
    const REASON_EVENT = 'event';
    const REASON_MAINTENANCE = 'maintenance';
    const REASON_OTHER = 'other';

    // Patrones de recurrencia
    const RECURRENCE_DAILY = 'daily';
    const RECURRENCE_WEEKLY = 'weekly';
    const RECURRENCE_MONTHLY = 'monthly';

    /**
     * Relación con el estilista
     */
    public function stylist()
    {
        return $this->belongsTo(Stylist::class);
    }

    /**
     * Relación con el usuario (a través del estilista)
     */
    public function user()
    {
        return $this->hasOneThrough(
            User::class,
            Stylist::class,
            'id',
            'id',
            'stylist_id',
            'user_id'
        );
    }

    /**
     * Scope para bloqueos activos
     */
    public function scopeActive($query)
    {
        return $query->where('end_datetime', '>=', now());
    }

    /**
     * Scope para bloqueos en un rango de fechas
     */
    public function scopeInRange($query, $startDate, $endDate)
    {
        return $query->where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('start_datetime', [$startDate, $endDate])
                ->orWhereBetween('end_datetime', [$startDate, $endDate])
                ->orWhere(function ($q2) use ($startDate, $endDate) {
                    $q2->where('start_datetime', '<=', $startDate)
                        ->where('end_datetime', '>=', $endDate);
                });
        });
    }

    /**
     * Scope para bloqueos de un estilista
     */
    public function scopeForStylist($query, $stylistId)
    {
        return $query->where('stylist_id', $stylistId);
    }

    /**
     * Scope para bloqueos por razón
     */
    public function scopeByReason($query, $reason)
    {
        return $query->where('reason', $reason);
    }

    /**
     * Scope para bloqueos recurrentes
     */
    public function scopeRecurring($query)
    {
        return $query->where('is_recurring', true);
    }

    /**
     * Scope para bloqueos de día completo
     */
    public function scopeAllDay($query)
    {
        return $query->where('is_all_day', true);
    }

    /**
     * Verifica si el bloqueo está activo en una fecha/hora específica
     */
    public function isActiveAt($datetime)
    {
        $datetime = is_string($datetime) ? \Carbon\Carbon::parse($datetime) : $datetime;

        // Verificar bloqueo simple
        if ($datetime->between($this->start_datetime, $this->end_datetime)) {
            return true;
        }

        // Verificar bloqueos recurrentes
        if ($this->is_recurring && $this->recurrence_end_date) {
            if ($datetime->lt($this->start_datetime) || $datetime->gt($this->recurrence_end_date)) {
                return false;
            }

            return $this->matchesRecurrencePattern($datetime);
        }

        return false;
    }

    /**
     * Verifica si una fecha coincide con el patrón de recurrencia
     */
    protected function matchesRecurrencePattern($datetime)
    {
        if (!$this->is_recurring || !$this->recurrence_pattern) {
            return false;
        }

        $pattern = $this->recurrence_pattern;

        switch ($pattern['type'] ?? null) {
            case self::RECURRENCE_DAILY:
                // Se repite cada N días
                $interval = $pattern['interval'] ?? 1;
                $daysDiff = $this->start_datetime->diffInDays($datetime);
                return $daysDiff % $interval === 0;

            case self::RECURRENCE_WEEKLY:
                // Se repite en días específicos de la semana
                $daysOfWeek = $pattern['days_of_week'] ?? [];
                return in_array($datetime->dayOfWeek, $daysOfWeek);

            case self::RECURRENCE_MONTHLY:
                // Se repite en días específicos del mes
                $daysOfMonth = $pattern['days_of_month'] ?? [];
                return in_array($datetime->day, $daysOfMonth);

            default:
                return false;
        }
    }

    /**
     * Obtiene todos los bloqueos (incluyendo instancias de recurrencias) en un rango
     */
    public function getOccurrencesInRange($startDate, $endDate)
    {
        $occurrences = [];
        $startDate = is_string($startDate) ? \Carbon\Carbon::parse($startDate) : $startDate;
        $endDate = is_string($endDate) ? \Carbon\Carbon::parse($endDate) : $endDate;

        if (!$this->is_recurring) {
            // Bloqueo simple: una sola ocurrencia
            if ($this->start_datetime->lte($endDate) && $this->end_datetime->gte($startDate)) {
                $occurrences[] = [
                    'start' => $this->start_datetime,
                    'end' => $this->end_datetime,
                ];
            }

            return $occurrences;
        }

        // Bloqueo recurrente: generar ocurrencias
        $current = max($this->start_datetime, $startDate);
        $end = min($this->recurrence_end_date ?? $endDate, $endDate);

        while ($current->lte($end)) {
            if ($this->matchesRecurrencePattern($current)) {
                $occurrences[] = [
                    'start' => $current->copy(),
                    'end' => $current->copy()->addMinutes(
                        $this->start_datetime->diffInMinutes($this->end_datetime)
                    ),
                ];
            }

            // Avanzar según el tipo de recurrencia
            $pattern = $this->recurrence_pattern;
            switch ($pattern['type'] ?? null) {
                case self::RECURRENCE_DAILY:
                    $current->addDays($pattern['interval'] ?? 1);
                    break;
                case self::RECURRENCE_WEEKLY:
                    $current->addDay();
                    break;
                case self::RECURRENCE_MONTHLY:
                    $current->addDay();
                    break;
                default:
                    break 2; // Salir del while
            }
        }

        return $occurrences;
    }

    /**
     * Verifica si hay conflicto con otro bloqueo o cita
     */
    public function hasConflict($startDatetime, $endDatetime, $stylistId = null)
    {
        $stylistId = $stylistId ?? $this->stylist_id;

        // Verificar conflictos con otros bloqueos
        $hasBlockConflict = self::where('stylist_id', $stylistId)
            ->where('id', '!=', $this->id ?? 0)
            ->where(function ($q) use ($startDatetime, $endDatetime) {
                $q->whereBetween('start_datetime', [$startDatetime, $endDatetime])
                    ->orWhereBetween('end_datetime', [$startDatetime, $endDatetime])
                    ->orWhere(function ($q2) use ($startDatetime, $endDatetime) {
                        $q2->where('start_datetime', '<=', $startDatetime)
                            ->where('end_datetime', '>=', $endDatetime);
                    });
            })
            ->exists();

        if ($hasBlockConflict) {
            return true;
        }

        // Verificar conflictos con citas existentes
        $hasCitaConflict = Reservation::where('stylist_id', $stylistId)
            ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
            ->where(function ($q) use ($startDatetime, $endDatetime) {
                $q->whereBetween('scheduled_at', [$startDatetime, $endDatetime])
                    ->orWhere(function ($q2) use ($startDatetime, $endDatetime) {
                        // Asumir duración de 1 hora si no está especificada
                        $q2->where('scheduled_at', '<=', $startDatetime);
                        // TODO: agregar verificación con duración real del servicio
                    });
            })
            ->exists();

        return $hasCitaConflict;
    }

    /**
     * Cancela todas las citas que coincidan con este bloqueo
     */
    public function cancelConflictingAppointments($reason = 'Schedule block created')
    {
        $appointments = Reservation::where('stylist_id', $this->stylist_id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereBetween('scheduled_at', [$this->start_datetime, $this->end_datetime])
            ->get();

        foreach ($appointments as $appointment) {
            $appointment->update([
                'status' => 'cancelled',
                'notes' => ($appointment->notes ?? '') . "\n" . $reason,
            ]);

            // Enviar notificación al cliente
            Notification::create([
                'user_id' => $appointment->client_id,
                'type' => 'appointment_cancelled',
                'title' => 'Cita cancelada',
                'message' => 'Tu cita ha sido cancelada: ' . $reason,
                'reservation_id' => $appointment->id,
            ]);
        }

        return $appointments->count();
    }
}
