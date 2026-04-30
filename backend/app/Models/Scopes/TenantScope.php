<?php

declare(strict_types=1);

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class TenantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        if (! app()->runningInConsole() && Auth::hasUser()) {
            // Bypass tenant scope for super admins on master routes
            if (Auth::user()->is_superadmin && request()->is('api/master*')) {
                return;
            }
            
            $builder->where('company_id', Auth::user()->company_id);
        }
    }
}
