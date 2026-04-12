<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;

class EventPolicy
{
    public function viewAny(User $user): bool { return true; }
    
    public function view(User $user, Event $model): bool { 
        return $user->company_id === $model->company_id && ($user->id === $model->user_id || in_array($user->role, ['Admin', 'Manager'])); 
    }
    
    public function create(User $user): bool { return true; }
    
    public function update(User $user, Event $model): bool { 
        return $user->company_id === $model->company_id && ($user->id === $model->user_id || in_array($user->role, ['Admin', 'Manager'])); 
    }
    
    public function delete(User $user, Event $model): bool { 
        return $user->company_id === $model->company_id && ($user->id === $model->user_id || in_array($user->role, ['Admin', 'Manager'])); 
    }
}
