<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'company_id',
    'funnel_id',
    'name',
    'order',
    'color',
    'probability',
    'is_final_win',
    'is_final_loss',
])]
class FunnelStage extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'probability' => 'integer',
            'is_final_win' => 'boolean',
            'is_final_loss' => 'boolean',
        ];
    }

    public function funnel()
    {
        return $this->belongsTo(Funnel::class);
    }

    public function opportunities()
    {
        return $this->hasMany(Opportunity::class);
    }
}
