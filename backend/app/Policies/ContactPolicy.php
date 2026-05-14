<?php

namespace App\Policies;

use App\Models\Contact;
use App\Models\User;

class ContactPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->checkPermission($user, 'crm', 'contacts', 'view');
    }

    public function view(User $user, Contact $model): bool
    {
        return $this->checkPermission($user, 'crm', 'contacts', 'view')
            && $model->company_id === $user->company_id;
    }

    public function create(User $user): bool
    {
        return $this->checkPermission($user, 'crm', 'contacts', 'create');
    }

    public function update(User $user, Contact $model): bool
    {
        return $this->checkPermission($user, 'crm', 'contacts', 'edit')
            && $model->company_id === $user->company_id;
    }

    public function delete(User $user, Contact $model): bool
    {
        return $this->checkPermission($user, 'crm', 'contacts', 'delete')
            && $model->company_id === $user->company_id;
    }
}
