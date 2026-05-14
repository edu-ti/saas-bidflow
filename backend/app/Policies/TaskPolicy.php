<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->checkPermission($user, 'tasks', 'tasks', 'view');
    }

    public function view(User $user, Task $task): bool
    {
        return $this->checkPermission($user, 'tasks', 'tasks', 'view')
            && $task->company_id === $user->company_id;
    }

    public function create(User $user): bool
    {
        return $this->checkPermission($user, 'tasks', 'tasks', 'create');
    }

    public function update(User $user, Task $task): bool
    {
        return $this->checkPermission($user, 'tasks', 'tasks', 'edit')
            && $task->company_id === $user->company_id;
    }

    public function delete(User $user, Task $task): bool
    {
        return $this->checkPermission($user, 'tasks', 'tasks', 'delete')
            && $task->company_id === $user->company_id;
    }
}
