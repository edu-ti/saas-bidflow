<?php

namespace App\Policies;

use App\Models\Contact;
use App\Models\User;

class ContactPolicy
{
    public function viewAny(User $user): bool { return true; }
    public function view(User $user, Contact $model): bool { return $user->company_id === $model->company_id; }
    public function create(User $user): bool { return true; }
    public function update(User $user, Contact $model): bool { return $user->company_id === $model->company_id; }
    public function delete(User $user, Contact $model): bool { return $user->company_id === $model->company_id && in_array($user->role, ['Admin', 'Manager']); }
}
