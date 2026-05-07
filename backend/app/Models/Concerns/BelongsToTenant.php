<?php

namespace App\Models\Concerns;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope());

        static::creating(function ($model) {
            if (app()->bound('current_tenant_id') && is_null($model->company_id)) {
                $model->company_id = app('current_tenant_id');
            }
        });
    }

    public static function withoutTenant(): Builder
    {
        return static::withoutGlobalScope(TenantScope::class);
    }
}