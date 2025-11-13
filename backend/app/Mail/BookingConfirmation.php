<?php

namespace App\Mail;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class BookingConfirmation extends Mailable implements ShouldQueue
{
    use Queueable;

    protected Reservation $reservation;

    /**
     * Create a new message instance.
     */
    public function __construct(Reservation $reservation)
    {
        $this->reservation = $reservation;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(
                config('mail.from.address', 'noreply@salon.app'),
                config('mail.from.name', 'SALON')
            ),
            subject: 'Booking Confirmed - Your Appointment is Scheduled',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $client = $this->reservation->client;
        $stylist = $this->reservation->stylist;
        $service = $this->reservation->service;

        return new Content(
            view: 'emails.booking-confirmation',
            with: [
                'clientName' => $client->user->name,
                'stylistName' => $stylist->user->name,
                'serviceName' => $service->name,
                'servicePrice' => $service->price,
                'appointmentDate' => $this->reservation->scheduled_at->format('l, F j, Y'),
                'appointmentTime' => $this->reservation->scheduled_at->format('h:i A'),
                'reservationId' => $this->reservation->id,
                'appUrl' => config('app.url'),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
