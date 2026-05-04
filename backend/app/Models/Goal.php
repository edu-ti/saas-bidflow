<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Goal extends Model
{
    protected $fillable = [
        'company_id',
        'goal_type',
        'target_id',
        'uf',
        'month',
        'year',
        'target_revenue',
        'target_wins',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
