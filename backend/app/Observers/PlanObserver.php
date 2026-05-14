<?php

namespace App\Observers;

use App\Models\Company;
use App\Models\Plan;
use Illuminate\Support\Facades\Cache;

class PlanObserver
{
    public function updated(Plan $plan): void
    {
        $companies = Company::where('plan_id', $plan->id)->with('users')->get();

        foreach ($companies as $company) {
            Cache::forget("plan_features:{$company->id}");

            foreach ($company->users as $user) {
                Cache::forget("user_permissions:{$user->id}");
            }
        }
    }
}
