<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Role extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'company_id',
        'name',
        'permissions',
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
