<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FinancialStatement extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'company_id', 'bank_account_id', 'invoice_id', 'type', 'category',
        'description', 'amount', 'status', 'due_date', 'payment_date',
    ];

    protected function casts(): array
    {
        return [
            'amount'       => 'decimal:2',
            'due_date'     => 'date',
            'payment_date' => 'date',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function bankAccount()
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
