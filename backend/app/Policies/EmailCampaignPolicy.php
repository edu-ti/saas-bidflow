<?php

namespace App\Policies;

use App\Models\EmailCampaign;
use App\Models\User;

class EmailCampaignPolicy
{
    public function viewAny(User $user): bool { return true; }
    public function view(User $user, EmailCampaign $model): bool { return $user->company_id === $model->company_id; }
    public function create(User $user): bool { return true; }
    public function update(User $user, EmailCampaign $model): bool { return $user->company_id === $model->company_id; }
    public function delete(User $user, EmailCampaign $model): bool { return $user->company_id === $model->company_id && in_array($user->role, ['Admin', 'Manager']); }
}
