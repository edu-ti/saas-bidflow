<?php

namespace App\Policies;

use App\Models\Opportunity;
use App\Models\User;

class OpportunityPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->checkPermission($user, 'crm', 'opportunities', 'view');
    }

    public function view(User $user, Opportunity $opportunity): bool
    {
        return $this->checkPermission($user, 'crm', 'opportunities', 'view')
            && $opportunity->company_id === $user->company_id;
    }

    public function create(User $user): bool
    {
        return $this->checkPermission($user, 'crm', 'opportunities', 'create');
    }

    public function update(User $user, Opportunity $opportunity): bool
    {
        return $this->checkPermission($user, 'crm', 'opportunities', 'edit')
            && $opportunity->company_id === $user->company_id;
    }

    public function delete(User $user, Opportunity $opportunity): bool
    {
        return $this->checkPermission($user, 'crm', 'opportunities', 'delete')
            && $opportunity->company_id === $user->company_id;
    }
}
