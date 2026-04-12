<?php

namespace App\Http\Controllers;

use App\Models\AccountsReceivable;
use Illuminate\Http\Request;
use App\Http\Resources\AccountsReceivableResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AccountsReceivableController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', AccountsReceivable::class);
        $accounts = AccountsReceivable::latest()->get();
        return AccountsReceivableResource::collection($accounts);
    }

    public function store(Request $request)
    {
        $this->authorize('create', AccountsReceivable::class);
        $validated = $request->validate([
            'reference_title' => 'required|string|max:255',
            'organization_id' => 'nullable|exists:organizations,id',
            'individual_client_id' => 'nullable|exists:individual_clients,id',
            'opportunity_id' => 'nullable|exists:opportunities,id',
            'contract_id' => 'nullable|exists:contracts,id',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'payment_date' => 'nullable|date',
            'status' => 'nullable|in:Pending,Paid,Overdue,Cancelled',
        ]);

        $account = AccountsReceivable::create($validated);
        return new AccountsReceivableResource($account);
    }

    public function show(AccountsReceivable $accountsReceivable)
    {
        $this->authorize('view', $accountsReceivable);
        return new AccountsReceivableResource($accountsReceivable);
    }

    public function update(Request $request, AccountsReceivable $accountsReceivable)
    {
        $this->authorize('update', $accountsReceivable);
        $validated = $request->validate([
            'reference_title' => 'sometimes|required|string|max:255',
            'organization_id' => 'nullable|exists:organizations,id',
            'individual_client_id' => 'nullable|exists:individual_clients,id',
            'opportunity_id' => 'nullable|exists:opportunities,id',
            'contract_id' => 'nullable|exists:contracts,id',
            'amount' => 'sometimes|required|numeric|min:0',
            'due_date' => 'sometimes|required|date',
            'payment_date' => 'nullable|date',
            'status' => 'nullable|in:Pending,Paid,Overdue,Cancelled',
        ]);

        $accountsReceivable->update($validated);
        return new AccountsReceivableResource($accountsReceivable);
    }

    public function destroy(AccountsReceivable $accountsReceivable)
    {
        $this->authorize('delete', $accountsReceivable);
        $accountsReceivable->delete();
        return response()->noContent();
    }
}
