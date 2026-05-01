<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Plan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'monthly_price',
        'max_users',
        'active',
        'features',
    ];

    protected $casts = [
        'monthly_price' => 'decimal:2',
        'max_users' => 'integer',
        'active' => 'boolean',
        'features' => 'array',
    ];

    public function companies()
    {
        return $this->hasMany(Company::class);
    }
}
