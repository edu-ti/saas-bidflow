<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class BankReconciliation extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'company_id', 'bank_account_id', 'file_name', 'status',
        'total_transactions', 'matched_transactions',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function bankAccount()
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function items()
    {
        return $this->hasMany(BankReconciliationItem::class, 'reconciliation_id');
    }
}
