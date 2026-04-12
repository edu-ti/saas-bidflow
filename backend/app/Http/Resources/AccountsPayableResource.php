<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountsPayableResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference_title' => $this->reference_title,
            'supplier_id' => $this->supplier_id,
            'contact_id' => $this->contact_id,
            'amount' => $this->amount,
            'due_date' => $this->due_date ? $this->due_date->format('Y-m-d') : null,
            'payment_date' => $this->payment_date ? $this->payment_date->format('Y-m-d') : null,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
