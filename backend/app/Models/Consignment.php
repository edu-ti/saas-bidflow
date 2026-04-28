<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Consignment extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'company_id',
        'consignee_id',
        'user_id',
        'status',
        'total_value',
        'issue_date',
        'due_date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'total_value' => 'decimal:2',
            'issue_date'  => 'date',
            'due_date'    => 'date',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function consignee()
    {
        return $this->belongsTo(Consignee::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(ConsignmentItem::class);
    }
}
