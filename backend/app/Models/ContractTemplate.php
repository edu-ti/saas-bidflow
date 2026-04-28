<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'company_id',
    'name',
    'type',
    'content',
    'active',
])]
class ContractTemplate extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function contracts()
    {
        return $this->hasMany(Contract::class, 'contract_template_id');
    }

    public static function getTypes(): array
    {
        return [
            'servico' => 'Serviço',
            'aluguel' => 'Aluguel',
            'compra' => 'Compra',
            'parceria' => 'Parceria',
            'fornecimento' => 'Fornecimento',
            'outros' => 'Outros',
        ];
    }
}
