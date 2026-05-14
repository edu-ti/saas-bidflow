<?php

namespace App\Policies;

use App\Models\AccountsReceivable;
use App\Models\User;

class AccountsReceivablePolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->checkPermission($user, 'financial', 'accounts_receivable', 'view');
    }

    public function view(User $user, AccountsReceivable $model): bool
    {
        return $this->checkPermission($user, 'financial', 'accounts_receivable', 'view')
            && $model->company_id === $user->company_id;
    }

    public function create(User $user): bool
    {
        return $this->checkPermission($user, 'financial', 'accounts_receivable', 'create');
    }

    public function update(User $user, AccountsReceivable $model): bool
    {
        return $this->checkPermission($user, 'financial', 'accounts_receivable', 'edit')
            && $model->company_id === $user->company_id;
    }

    public function delete(User $user, AccountsReceivable $model): bool
    {
        return $this->checkPermission($user, 'financial', 'accounts_receivable', 'delete')
            && $model->company_id === $user->company_id;
    }
}
