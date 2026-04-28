<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankReconciliationItem extends Model
{
    protected $fillable = [
        'reconciliation_id', 'transaction_date', 'amount', 'description',
        'fitid', 'type', 'matched_statement_id', 'match_status',
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

    public function matchedStatement()
    {
        return $this->belongsTo(FinancialStatement::class, 'matched_statement_id');
    }
}
