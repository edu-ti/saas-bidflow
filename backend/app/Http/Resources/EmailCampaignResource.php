<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmailCampaignResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subject' => $this->subject,
            'html_body' => $this->html_body,
            'target_audience' => $this->target_audience ?? [],
            'status' => $this->status,
            'sent_at' => $this->sent_at ? $this->sent_at->format('Y-m-d H:i:s') : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
