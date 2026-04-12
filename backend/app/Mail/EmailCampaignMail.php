<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class EmailCampaignMail extends Mailable
{
    use Queueable, SerializesModels;

    public $subjectStr;
    public $htmlBody;

    public function __construct($subjectStr, $htmlBody)
    {
        $this->subjectStr = $subjectStr;
        $this->htmlBody = $htmlBody;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectStr,
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->htmlBody,
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
