<?php

namespace App\Observers;

use App\Models\Company;
use Illuminate\Support\Facades\Cache;

class CompanyObserver
{
    public function updated(Company $company): void
    {
        if ($company->isDirty('plan_id')) {
            Cache::forget("plan_features:{$company->id}");

            $company->users()->each(function ($user) {
                Cache::forget("user_permissions:{$user->id}");
            });
        }
    }
}
