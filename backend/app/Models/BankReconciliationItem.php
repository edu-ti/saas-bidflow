<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankReconciliationItem extends Model
{
    protected $fillable = [
        'reconciliation_id', 'transaction_date', 'amount', 'description',
        'fitid', 'type', 'payable_id', 'receivable_id', 'match_status',
    ];

    protected function casts(): array
    {
        return [
            'amount'           => 'decimal:2',
            'transaction_date' => 'date',
        ];
    }

    public function reconciliation()
    {
        return $this->belongsTo(BankReconciliation::class, 'reconciliation_id');
    }

    public function payable()
    {
        return $this->belongsTo(AccountsPayable::class, 'payable_id');
    }

    public function receivable()
    {
        return $this->belongsTo(AccountsReceivable::class, 'receivable_id');
    }
}
