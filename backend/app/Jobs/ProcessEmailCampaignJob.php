<?php

namespace App\Jobs;

use App\Mail\EmailCampaignMail;
use App\Models\EmailCampaign;
use App\Models\EmailRecipient;
use App\Models\Lead;
use App\Models\CompanyClient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Exception;

class ProcessEmailCampaignJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $campaign;

    public function __construct(EmailCampaign $campaign)
    {
        $this->campaign = $campaign;
    }

    public function handle(): void
    {
        $campaign = $this->campaign;
        $campaign->update(['status' => 'sending']);

        $recipientsQuery = null;

        // Determine target audience
        if ($campaign->target_audience === 'all_leads') {
            $recipientsQuery = Lead::where('company_id', $campaign->company_id)->whereNotNull('email');
        } elseif ($campaign->target_audience === 'all_clients') {
            $recipientsQuery = CompanyClient::where('company_id', $campaign->company_id)->whereNotNull('email');
        }

        if ($recipientsQuery) {
            $recipientsQuery->chunk(100, function ($recipients) use ($campaign) {
                foreach ($recipients as $recipient) {
                    // Create recipient record if it doesn't exist
                    $emailRecipient = EmailRecipient::firstOrCreate(
                        [
                            'email_campaign_id' => $campaign->id,
                            'email' => $recipient->email,
                            'company_id' => $campaign->company_id,
                        ],
                        [
                            'name' => $recipient->name,
                            'status' => 'pending',
                        ]
                    );

                    if ($emailRecipient->status === 'pending') {
                        try {
                            Mail::to($recipient->email)->send(new EmailCampaignMail($campaign->subject, $campaign->body, $campaign->image_url));
                            
                            $emailRecipient->update([
                                'status' => 'sent',
                                'sent_at' => now(),
                            ]);
                            
                            $campaign->increment('sent_count');
                        } catch (Exception $e) {
                            $emailRecipient->update([
                                'status' => 'failed',
                                'error' => $e->getMessage(),
                            ]);
                        }
                    }
                }
            });
        }

        $campaign->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }
}
