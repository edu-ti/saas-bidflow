<?php

namespace App\Policies;

use App\Models\Contract;
use App\Models\User;

class ContractPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->checkPermission($user, 'contracts', 'contracts', 'view');
    }

    public function view(User $user, Contract $contract): bool
    {
        return $this->checkPermission($user, 'contracts', 'contracts', 'view')
            && $contract->company_id === $user->company_id;
    }

    public function create(User $user): bool
    {
        return $this->checkPermission($user, 'contracts', 'contracts', 'create');
    }

    public function update(User $user, Contract $contract): bool
    {
        return $this->checkPermission($user, 'contracts', 'contracts', 'edit')
            && $contract->company_id === $user->company_id;
    }

    public function delete(User $user, Contract $contract): bool
    {
        return $this->checkPermission($user, 'contracts', 'contracts', 'delete')
            && $contract->company_id === $user->company_id;
    }
}
