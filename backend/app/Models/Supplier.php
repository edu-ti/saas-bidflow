<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'corporate_name',
    'fantasy_name',
    'cnpj',
    'municipal_registration',
    'state_registration',
    'address',
    'contact_name',
    'contact_email',
    'contact_position',
    'contact_phone',
    'name',
    'document_number',
    'state',
    'city',
    'email',
    'phone',
    'is_me_epp',
    'notes',
])]
class Supplier extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected $guarded = ['id', 'company_id'];

    protected function casts(): array
    {
        return [
            'is_me_epp' => 'boolean',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function opportunities()
    {
        return $this->hasMany(Opportunity::class);
    }
}
