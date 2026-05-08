<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommissionConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'user_id',
        'meta_mensal',
        'salario_fixo',
        'percentual_comissao',
        'ativo',
        'year',
    ];

    protected $casts = [
        'meta_mensal' => 'decimal:2',
        'salario_fixo' => 'decimal:2',
        'percentual_comissao' => 'decimal:2',
        'ativo' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
