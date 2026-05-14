<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;

trait HasPermissions
{
    public function hasPermission(string $module, string $page, string $action): bool
    {
        if ($this->is_superadmin || $this->is_admin) {
            return true;
        }

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
    }
}
