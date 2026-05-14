<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;

trait HasPermissions
{
    /**
     * Verifica se o módulo está liberado no plano da empresa.
     */
    public function hasPlanAccess(string $module): bool
    {
        // SuperAdmin bypassa tudo
        if ($this->is_superadmin) {
            return true;
        }

        $cacheKey = "plan_features:{$this->company_id}";

        $features = Cache::remember(
            $cacheKey,
            now()->addMinutes(30),
            function () {
                $plan = $this->company?->plan;
                if (!$plan) return [];

                $features = is_array($plan->features)
                    ? $plan->features
                    : json_decode($plan->features ?? '[]', true);

                $addons = is_array($this->company->addons)
                    ? $this->company->addons
                    : json_decode($this->company->addons ?? '[]', true);

                return array_merge($features, $addons);
            }
        );

        return in_array($module, $features);
    }

    /**
     * Verifica permissão de ação específica no role do usuário.
     */
    public function hasPermission(string $module, string $page, string $action): bool
    {
        // SuperAdmin e Admin bypass total
        if ($this->is_superadmin || $this->is_admin) {
            return true;
        }

        // 1. Verificar se o módulo está no plano da empresa
        if (!$this->hasPlanAccess($module)) {
            return false;
        }

        // 2. Verificar permissão específica do role
        $permissions = Cache::remember(
            "user_permissions:{$this->id}",
            now()->addMinutes(30),
            fn () => $this->role?->permissions ?? []
        );

        return $permissions[$module][$page][$action] ?? false;
    }

    public function canView(string $module, string $page): bool
    {
        return $this->hasPermission($module, $page, 'view');
    }

    public function canCreate(string $module, string $page): bool
    {
        return $this->hasPermission($module, $page, 'create');
    }

    public function canEdit(string $module, string $page): bool
    {
        return $this->hasPermission($module, $page, 'edit');
    }

    public function canDelete(string $module, string $page): bool
    {
        return $this->hasPermission($module, $page, 'delete');
    }

    public function clearPermissionsCache(): void
    {
        Cache::forget("user_permissions:{$this->id}");
        Cache::forget("plan_features:{$this->company_id}");
    }
}
