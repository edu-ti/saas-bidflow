<?php

namespace App\Policies;

use App\Models\Supplier;
use App\Models\User;

class SupplierPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->checkPermission($user, 'inventory', 'suppliers', 'view');
    }

    public function view(User $user, Supplier $supplier): bool
    {
        return $this->checkPermission($user, 'inventory', 'suppliers', 'view')
            && $supplier->company_id === $user->company_id;
    }

    public function create(User $user): bool
    {
        return $this->checkPermission($user, 'inventory', 'suppliers', 'create');
    }

    public function update(User $user, Supplier $supplier): bool
    {
        return $this->checkPermission($user, 'inventory', 'suppliers', 'edit')
            && $supplier->company_id === $user->company_id;
    }

    public function delete(User $user, Supplier $supplier): bool
    {
        return $this->checkPermission($user, 'inventory', 'suppliers', 'delete')
            && $supplier->company_id === $user->company_id;
    }
}
