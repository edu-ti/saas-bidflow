<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'company_id', 'product_id', 'sku', 'barcode', 'brand_id', 'category_id',
    'unit_id', 'size_id', 'status_id', 'depot_id', 'cost_price', 'markup',
    'sale_price', 'on_hand_qty', 'reserved_qty', 'min_stock', 'max_stock',
    'ncm', 'cest', 'origin', 'label_ids'
])]
class InventoryProduct extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected function casts(): array
    {
        return [
            'cost_price' => 'decimal:2',
            'markup' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'on_hand_qty' => 'decimal:4',
            'reserved_qty' => 'decimal:4',
            'min_stock' => 'decimal:4',
            'max_stock' => 'decimal:4',
            'label_ids' => 'array',
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

    public function brand()
    {
        return $this->belongsTo(InventoryBrand::class, 'brand_id');
    }

    public function category()
    {
        return $this->belongsTo(InventoryProductCategory::class, 'category_id');
    }

    public function unit()
    {
        return $this->belongsTo(InventoryUnit::class, 'unit_id');
    }

    public function size()
    {
        return $this->belongsTo(InventorySize::class, 'size_id');
    }

    public function status()
    {
        return $this->belongsTo(InventoryProductStatus::class, 'status_id');
    }

    public function depot()
    {
        return $this->belongsTo(InventoryDepot::class, 'depot_id');
    }

    public function getAvailableQtyAttribute(): float
    {
        return ($this->on_hand_qty ?? 0) - ($this->reserved_qty ?? 0);
    }

    public function isLowStock(): bool
    {
        return $this->on_hand_qty <= ($this->min_stock ?? 0);
    }

    public function isOutOfStock(): bool
    {
        return $this->on_hand_qty <= 0;
    }
}