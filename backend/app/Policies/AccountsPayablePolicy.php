<?php

namespace App\Policies;

use App\Models\AccountsPayable;
use App\Models\User;

class AccountsPayablePolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->checkPermission($user, 'financial', 'accounts_payable', 'view');
    }

    public function view(User $user, AccountsPayable $model): bool
    {
        return $this->checkPermission($user, 'financial', 'accounts_payable', 'view')
            && $model->company_id === $user->company_id;
    }

    public function create(User $user): bool
    {
        return $this->checkPermission($user, 'financial', 'accounts_payable', 'create');
    }

    public function update(User $user, AccountsPayable $model): bool
    {
        return $this->checkPermission($user, 'financial', 'accounts_payable', 'edit')
            && $model->company_id === $user->company_id;
    }

    public function delete(User $user, AccountsPayable $model): bool
    {
        return $this->checkPermission($user, 'financial', 'accounts_payable', 'delete')
            && $model->company_id === $user->company_id;
    }
}
