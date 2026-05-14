<?php

namespace App\Providers;

use App\Models\AccountsPayable;
use App\Models\AccountsReceivable;
use App\Models\Contact;
use App\Models\Contract;
use App\Models\InventoryProduct;
use App\Models\Invoice;
use App\Models\Opportunity;
use App\Models\Proposal;
use App\Models\Supplier;
use App\Models\Task;
use App\Policies\AccountsPayablePolicy;
use App\Policies\AccountsReceivablePolicy;
use App\Policies\ContactPolicy;
use App\Policies\ContractPolicy;
use App\Policies\InventoryProductPolicy;
use App\Policies\InvoicePolicy;
use App\Policies\OpportunityPolicy;
use App\Policies\ProposalPolicy;
use App\Policies\SupplierPolicy;
use App\Policies\TaskPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Contract::class => ContractPolicy::class,
        Proposal::class => ProposalPolicy::class,
        Opportunity::class => OpportunityPolicy::class,
        Contact::class => ContactPolicy::class,
        InventoryProduct::class => InventoryProductPolicy::class,
        Supplier::class => SupplierPolicy::class,
        Task::class => TaskPolicy::class,
        Invoice::class => InvoicePolicy::class,
        AccountsPayable::class => AccountsPayablePolicy::class,
        AccountsReceivable::class => AccountsReceivablePolicy::class,
    ];

    public function boot(): void
    {
        //
    }
}
