<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'company_id', 'type', 'status', 'number', 'series', 'access_key',
        'xml_path', 'danfe_path', 'total_value', 'items_json',
        'recipient_name', 'recipient_document', 'notes', 'authorized_at',
    ];

    protected function casts(): array
    {
        return [
            'total_value'   => 'decimal:2',
            'items_json'    => 'array',
            'authorized_at' => 'datetime',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function financialStatements()
    {
        return $this->hasMany(FinancialStatement::class);
    }
}
