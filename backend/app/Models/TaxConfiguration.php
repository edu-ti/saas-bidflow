<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaxConfiguration extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id', 'regime_especial', 'aliquota_padrao', 'certificado_path',
        'certificado_password', 'permite_saldo_negativo'
    ];

    protected function casts(): array
    {
        return [
            'aliquota_padrao'        => 'decimal:2',
            'certificado_path'       => 'encrypted',
            'certificado_password'   => 'encrypted',
            'permite_saldo_negativo' => 'boolean',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
