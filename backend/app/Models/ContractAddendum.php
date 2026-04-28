<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'company_id',
    'contract_id',
    'title',
    'description',
    'type',
    'old_value',
    'new_value',
    'old_end_date',
    'new_end_date',
    'effective_date',
])]
class ContractAddendum extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected function casts(): array
    {
        return [
            'old_value' => 'decimal:2',
            'new_value' => 'decimal:2',
            'old_end_date' => 'date',
            'new_end_date' => 'date',
            'effective_date' => 'date',
        ];
    }

    public const TYPES = [
        'valor' => 'Alteração de Valor',
        'prazo' => 'Alteração de Prazo',
        'valor_e_prazo' => 'Valor e Prazo',
        'outros' => 'Outros',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function getTypeLabelAttribute(): string
    {
        return self::TYPES[$this->type] ?? $this->type;
    }

    public function hasValueChange(): bool
    {
        return $this->old_value !== null && $this->new_value !== null;
    }

    public function hasDateChange(): bool
    {
        return $this->old_end_date !== null && $this->new_end_date !== null;
    }

    public function getValueVariation(): ?float
    {
        if (!$this->hasValueChange()) {
            return null;
        }

        return $this->new_value - $this->old_value;
    }

    public function getValueVariationPercent(): ?float
    {
        if (!$this->hasValueChange() || $this->old_value == 0) {
            return null;
        }

        return (($this->new_value - $this->old_value) / $this->old_value) * 100;
    }
}
