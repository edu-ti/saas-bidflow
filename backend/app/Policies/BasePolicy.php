<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Support\Facades\Cache;

abstract class BasePolicy
{
    protected function checkPermission(User $user, string $module, string $page, string $action): bool
    {
        $cacheKey = "user_permissions:{$user->id}";
        $cached = Cache::get($cacheKey);

        if (!$user->is_superadmin) {
            if ($cached) {
                $features = $cached['plan_features'] ?? [];
                $addons = $cached['plan_addons'] ?? [];
                if (!in_array($module, $features) && !in_array($module, $addons)) {
                    return false;
                }
            } else {
                $company = $user->company;
                $plan = $company ? $company->plan : null;
                if ($plan) {
                    $features = is_array($plan->features) ? $plan->features : [];
                    $addons = is_array($company->addons) ? $company->addons : [];
                    if (!in_array($module, $features) && !in_array($module, $addons)) {
                        return false;
                    }
                }
            }
        }

        return $user->hasPermission($module, $page, $action);
    }
}
