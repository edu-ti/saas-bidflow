<?php

namespace App\Policies;

use App\Models\Consignment;
use App\Models\User;

class ConsignmentPolicy
{
    public function viewAny(User $user): bool { return true; }
    public function view(User $user, Consignment $model): bool { return $user->company_id === $model->company_id; }
    public function create(User $user): bool { return true; }
    public function update(User $user, Consignment $model): bool { return $user->company_id === $model->company_id; }
    public function delete(User $user, Consignment $model): bool { return $user->company_id === $model->company_id && in_array($user->role, ['Admin', 'Manager']); }
}
