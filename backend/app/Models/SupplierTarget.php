<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplierTarget extends Model
{
    protected $table = 'supplier_targets';

    protected $fillable = [
        'company_id',
        'supplier',
        'uf',
        'month',
        'year',
        'value',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'month' => 'integer',
        'year' => 'integer',
    ];
}