<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OpportunityResource extends JsonResource
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
            'title' => $this->title,
            'type' => $this->type,
            'funnel_stage_id' => $this->funnel_stage_id,
            'user_id' => $this->user_id,
            'organization_id' => $this->organization_id,
            'supplier_id' => $this->supplier_id,
            'value' => $this->value,
            'pre_proposal_number' => $this->pre_proposal_number,
            'notes' => $this->notes,
            'bidding_metadata' => $this->bidding_metadata,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
