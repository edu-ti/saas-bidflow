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
    public $imageUrl;

    public function __construct($subjectStr, $htmlBody, $imageUrl = null)
    {
        $this->subjectStr = $subjectStr;
        $this->htmlBody = $htmlBody;
        $this->imageUrl = $imageUrl;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectStr,
        );
    }

    public function content(): Content
    {
        $fullBody = $this->htmlBody;
        
        if ($this->imageUrl) {
            $fullBody = '<div style="text-align:center; margin-bottom:20px;"><img src="' . $this->imageUrl . '" style="max-width:100%; border-radius:8px;" /></div>' . $fullBody;
        }

        return new Content(
            htmlString: $fullBody,
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
