<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'company_id', 'product_id', 'depot_id', 'category_id', 'type',
    'quantity', 'unit_cost', 'total_value', 'entity', 'document', 'notes', 'date'
])]
class InventoryMovement extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:4',
            'unit_cost' => 'decimal:2',
            'total_value' => 'decimal:2',
            'date' => 'date',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function depot()
    {
        return $this->belongsTo(InventoryDepot::class, 'depot_id');
    }

    public function category()
    {
        return $this->belongsTo(InventoryMovementCategory::class, 'category_id');
    }
}