<?php

namespace App\Policies;

use App\Models\User;

abstract class BasePolicy
{
    protected function checkPermission(
        User $user,
        string $module,
        string $page,
        string $action
    ): bool {
        if ($user->is_superadmin) {
            return true;
        }

        if ($user->is_admin) {
            $company = $user->company;
            $plan = $company?->plan;

            if (!$plan) {
                return true;
            }

            $features = is_array($plan->features) ? $plan->features : json_decode($plan->features ?? '[]', true);
            $addons = is_array($company->addons) ? $company->addons : json_decode($company->addons ?? '[]', true);

            if (!in_array($module, $features) && !in_array($module, $addons)) {
                return false;
            }

            return true;
        }

        return $user->hasPermission($module, $page, $action);
    }
}
