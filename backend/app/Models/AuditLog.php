<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use \App\Traits\BelongsToTenant;

    protected $fillable = [
        'company_id',
        'user_id',
        'auditable_type',
        'auditable_id',
        'action',
        'old_value',
        'new_value',
        'ip_address',
    ];

    public function auditable()
    {
        return $this->morphTo();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
