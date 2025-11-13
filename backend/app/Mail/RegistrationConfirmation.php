<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class RegistrationConfirmation extends Mailable implements ShouldQueue
{
    use Queueable;

    protected User $user;
    protected string $role;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, string $role = 'client')
    {
        $this->user = $user;
        $this->role = $role;
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
            subject: 'Welcome to SALON - Registration Confirmed',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $roleLabel = $this->role === 'stylist' ? 'Professional' : 'Client';

        return new Content(
            view: 'emails.registration-confirmation',
            with: [
                'name' => $this->user->name,
                'email' => $this->user->email,
                'role' => $roleLabel,
                'loginUrl' => config('app.url') . '/auth/login',
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
