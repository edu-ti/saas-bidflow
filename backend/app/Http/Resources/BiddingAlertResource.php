<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BiddingAlertResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'opportunity_id' => $this->opportunity_id,
            'type' => $this->type,
            'content' => $this->content,
            'raw_data' => $this->raw_data,
            'is_read' => $this->is_read,
            'alert_date' => $this->alert_date,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'opportunity' => new OpportunityResource($this->whenLoaded('opportunity')),
        ];
    }
}
