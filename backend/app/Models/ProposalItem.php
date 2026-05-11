<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'company_id',
    'proposal_id',
    'description',
    'quantity',
    'unit_price',
    'total_price',
    'brand',
    'model',
    'status',
    'meses_locacao',
    'desconto_percent',
    'unidade_medida',
    'parametros',
    'descricao_detalhada',
    'imagem_url',
])]
class ProposalItem extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'unit_price' => 'decimal:4',
            'total_price' => 'decimal:2',
            'desconto_percent' => 'decimal:2',
            'meses_locacao' => 'integer',
            'parametros' => 'array',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }
}
