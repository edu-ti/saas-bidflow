<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ConsignmentItem extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'consignment_id',
        'product_id',
        'qty_sent',
        'qty_returned',
        'qty_sold',
        'agreed_unit_price',
    ];

    protected function casts(): array
    {
        return [
            'agreed_unit_price' => 'decimal:2',
        ];
    }

    public function consignment()
    {
        return $this->belongsTo(Consignment::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /** Qty still outstanding (not returned or sold yet) */
    public function getQtyPendingAttribute(): int
    {
        return $this->qty_sent - $this->qty_returned - $this->qty_sold;
    }

    /** Revenue from sold items */
    public function getSoldValueAttribute(): float
    {
        return $this->qty_sold * (float) $this->agreed_unit_price;
    }
}
