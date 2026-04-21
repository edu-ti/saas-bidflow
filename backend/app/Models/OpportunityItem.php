<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OpportunityItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'opportunity_id',
        'product_id',
        'description',
        'manufacturer',
        'image_path',
        'model',
        'status',
        'detailed_description',
        'additional_parameters',
        'quantity',
        'unit_price',
        'unit_measure',
        'subtotal',
    ];

    protected $casts = [
        'additional_parameters' => 'array',
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function opportunity()
    {
        return $this->belongsTo(Opportunity::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
