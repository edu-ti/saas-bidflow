<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BankAccount extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'company_id', 'bank_name', 'agency', 'number', 'current_balance', 'active',
    ];

    protected function casts(): array
    {
        return [
            'current_balance' => 'decimal:2',
            'active'          => 'boolean',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function statements()
    {
        return $this->hasMany(FinancialStatement::class);
    }

    public function reconciliations()
    {
        return $this->hasMany(BankReconciliation::class);
    }

    public function balanceLogs()
    {
        return $this->hasMany(BankBalanceLog::class);
    }
}
