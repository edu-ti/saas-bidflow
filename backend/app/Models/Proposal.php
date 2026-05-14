<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'company_id',
    'opportunity_id',
    'status',
    'total_value',
    'notes',
    'numero_proposta',
    'data_validade',
    'motivo_status',
    'faturamento',
    'treinamento',
    'condicoes_pagamento',
    'prazo_entrega',
    'garantia_equipamentos',
    'garantia_acessorios',
    'instalacao',
    'assistencia_tecnica',
    'frete_tipo',
    'frete_valor',
])]
class Proposal extends Model
{
    protected $guarded = ['id', 'company_id'];
    use SoftDeletes, BelongsToTenant;

    protected function casts(): array
    {
        return [
            'total_value' => 'decimal:2',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function opportunity()
    {
        return $this->belongsTo(Opportunity::class);
    }

    public function items()
    {
        return $this->hasMany(ProposalItem::class);
    }
}
