<?php

namespace App\Policies;

use App\Models\Proposal;
use App\Models\User;

class ProposalPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->checkPermission($user, 'proposals', 'proposals', 'view');
    }

    public function view(User $user, Proposal $proposal): bool
    {
        return $this->checkPermission($user, 'proposals', 'proposals', 'view')
            && $proposal->company_id === $user->company_id;
    }

    public function create(User $user): bool
    {
        return $this->checkPermission($user, 'proposals', 'proposals', 'create');
    }

    public function update(User $user, Proposal $proposal): bool
    {
        return $this->checkPermission($user, 'proposals', 'proposals', 'edit')
            && $proposal->company_id === $user->company_id;
    }

    public function delete(User $user, Proposal $proposal): bool
    {
        return $this->checkPermission($user, 'proposals', 'proposals', 'delete')
            && $proposal->company_id === $user->company_id;
    }
}
