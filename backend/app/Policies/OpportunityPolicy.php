<?php

namespace App\Policies;

use App\Models\Opportunity;
use App\Models\User;

class OpportunityPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // Filtered by TargetScope automatically
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Opportunity $opportunity): bool
    {
        if ($user->company_id !== $opportunity->company_id) {
            return false;
        }

        if (in_array($user->role, ['Admin', 'Manager'])) {
            return true;
        }

        return $user->id === $opportunity->user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Opportunity $opportunity): bool
    {
        if ($user->company_id !== $opportunity->company_id) {
            return false;
        }

        if (in_array($user->role, ['Admin', 'Manager'])) {
            return true;
        }

        return $user->id === $opportunity->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Opportunity $opportunity): bool
    {
        if ($user->company_id !== $opportunity->company_id) {
            return false;
        }

        return in_array($user->role, ['Admin', 'Manager']);
    }
}
