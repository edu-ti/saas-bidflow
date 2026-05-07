<?php

namespace App\Providers;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\ServiceProvider;

class TenantServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton('current_tenant_id', function () {
            return null;
        });

        $this->app->singleton('current_tenant', function () {
            return null;
        });
    }

    public function boot(): void
    {
        $this->registerTenantMacro();
        $this->registerAuditLogObserver();
    }

    private function registerTenantMacro(): void
    {
        Builder::macro('forTenant', function ($companyId) {
            return $this->where('company_id', $companyId);
        });
    }

    private function registerAuditLogObserver(): void
    {
        AuditLog::creating(function ($log) {
            if (app()->bound('current_tenant_id')) {
                $tenantId = app('current_tenant_id');
                if ($tenantId && is_null($log->company_id)) {
                    $log->company_id = $tenantId;
                }
            }
        });
    }
}