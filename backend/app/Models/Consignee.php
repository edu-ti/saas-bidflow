<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Consignee extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'company_id',
        'name',
        'document',
        'credit_limit',
        'commission_rate',
        'address',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'credit_limit'    => 'decimal:2',
            'commission_rate' => 'decimal:2',
            'active'          => 'boolean',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function consignments()
    {
        return $this->hasMany(Consignment::class);
    }
}
