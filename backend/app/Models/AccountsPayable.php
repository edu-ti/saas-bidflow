<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['company_id', 'supplier_id', 'contact_id', 'reference_title', 'amount', 'due_date', 'payment_date', 'status'])]
class AccountsPayable extends Model
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

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }
}
