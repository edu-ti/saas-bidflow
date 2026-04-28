<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankBalanceLog extends Model
{
    protected $fillable = [
        'bank_account_id', 'previous_balance', 'amount', 'new_balance', 'reference',
    ];

    protected function casts(): array
    {
        return [
            'previous_balance' => 'decimal:2',
            'amount'           => 'decimal:2',
            'new_balance'      => 'decimal:2',
        ];
    }

    public function bankAccount()
    {
        return $this->belongsTo(BankAccount::class);
    }
}
