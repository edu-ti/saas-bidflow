<?php

namespace App\Providers;

use App\Models\Company;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \App\Models\BankAccount::observe(\App\Observers\BankAccountObserver::class);
        \App\Models\User::observe(\App\Observers\UserObserver::class);
        Company::observe(\App\Observers\CompanyObserver::class);
        Plan::observe(\App\Observers\PlanObserver::class);

        RateLimiter::for('api', function (Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        Gate::define('access-master-panel', function (User $user) {
            return $user->is_superadmin;
        });

        Gate::define('access-admin-panel', function (User $user) {
            return $user->is_admin || $user->is_superadmin;
        });
    }
}
