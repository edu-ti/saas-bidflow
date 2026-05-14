<?php

namespace App\Policies;

use App\Models\InventoryProduct;
use App\Models\User;

class InventoryProductPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->checkPermission($user, 'inventory', 'products', 'view');
    }

    public function view(User $user, InventoryProduct $inventoryProduct): bool
    {
        return $this->checkPermission($user, 'inventory', 'products', 'view')
            && $inventoryProduct->company_id === $user->company_id;
    }

    public function create(User $user): bool
    {
        return $this->checkPermission($user, 'inventory', 'products', 'create');
    }

    public function update(User $user, InventoryProduct $inventoryProduct): bool
    {
        return $this->checkPermission($user, 'inventory', 'products', 'edit')
            && $inventoryProduct->company_id === $user->company_id;
    }

    public function delete(User $user, InventoryProduct $inventoryProduct): bool
    {
        return $this->checkPermission($user, 'inventory', 'products', 'delete')
            && $inventoryProduct->company_id === $user->company_id;
    }
}
