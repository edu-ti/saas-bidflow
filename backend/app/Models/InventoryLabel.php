<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['company_id', 'name', 'color', 'active'])]
class InventoryLabel extends Model
{
    use SoftDeletes;

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}