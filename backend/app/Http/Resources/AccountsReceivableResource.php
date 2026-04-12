<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountsReceivableResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference_title' => $this->reference_title,
            'organization_id' => $this->organization_id,
            'individual_client_id' => $this->individual_client_id,
            'opportunity_id' => $this->opportunity_id,
            'contract_id' => $this->contract_id,
            'amount' => $this->amount,
            'due_date' => $this->due_date ? $this->due_date->format('Y-m-d') : null,
            'payment_date' => $this->payment_date ? $this->payment_date->format('Y-m-d') : null,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
