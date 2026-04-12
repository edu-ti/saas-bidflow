<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['company_id', 'organization_id', 'individual_client_id', 'opportunity_id', 'contract_id', 'reference_title', 'amount', 'due_date', 'payment_date', 'status'])]
class AccountsReceivable extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'due_date' => 'datetime',
            'payment_date' => 'datetime',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function individualClient()
    {
        return $this->belongsTo(IndividualClient::class);
    }

    public function opportunity()
    {
        return $this->belongsTo(Opportunity::class);
    }

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }
}
