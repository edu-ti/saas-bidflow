<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'document', 'domain', 'plan_id', 'addons', 'status', 'asaas_customer_id', 'asaas_subscription_id'])]
class Company extends Model
{
    use HasFactory;

    protected $casts = [
        'addons' => 'array',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function suppliers()
    {
        return $this->hasMany(Supplier::class);
    }

    public function opportunities()
    {
        return $this->hasMany(Opportunity::class);
    }

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    public function funnels()
    {
        return $this->hasMany(Funnel::class);
    }

    public function organizations()
    {
        return $this->hasMany(Organization::class);
    }

    public function leads()
    {
        return $this->hasMany(Lead::class);
    }

    public function contacts()
    {
        return $this->hasMany(Contact::class);
    }

    public function individualClients()
    {
        return $this->hasMany(IndividualClient::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function biddingFilters()
    {
        return $this->hasMany(BiddingFilter::class);
    }

    public function accountsPayables()
    {
        return $this->hasMany(AccountsPayable::class);
    }

    public function accountsReceivables()
    {
        return $this->hasMany(AccountsReceivable::class);
    }

    public function emailCampaigns()
    {
        return $this->hasMany(EmailCampaign::class);
    }
}
