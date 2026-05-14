<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->checkPermission($user, 'financial', 'invoices', 'view');
    }

    public function view(User $user, Invoice $invoice): bool
    {
        return $this->checkPermission($user, 'financial', 'invoices', 'view')
            && $invoice->company_id === $user->company_id;
    }

    public function create(User $user): bool
    {
        return $this->checkPermission($user, 'financial', 'invoices', 'create');
    }

    public function update(User $user, Invoice $invoice): bool
    {
        return $this->checkPermission($user, 'financial', 'invoices', 'edit')
            && $invoice->company_id === $user->company_id;
    }

    public function delete(User $user, Invoice $invoice): bool
    {
        return $this->checkPermission($user, 'financial', 'invoices', 'delete')
            && $invoice->company_id === $user->company_id;
    }
}
