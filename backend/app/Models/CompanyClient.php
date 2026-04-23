<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['company_id', 'corporate_name', 'fantasy_name', 'cnpj', 'municipal_registration', 'state_registration', 'address', 'contact_name', 'contact_email', 'contact_position', 'contact_phone'])]
class CompanyClient extends Model
{
    use SoftDeletes, BelongsToTenant;

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}