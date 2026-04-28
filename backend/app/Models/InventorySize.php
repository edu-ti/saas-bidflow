<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['company_id', 'name', 'code', 'active'])]
class InventorySize extends Model
{
    use SoftDeletes, BelongsToTenant;

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}