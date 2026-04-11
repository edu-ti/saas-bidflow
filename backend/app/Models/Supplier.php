<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;

#[Fillable(['company_id', 'name', 'document_number', 'state', 'is_me_epp'])]
class Supplier extends Model
{
    use SoftDeletes, BelongsToTenant;

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
