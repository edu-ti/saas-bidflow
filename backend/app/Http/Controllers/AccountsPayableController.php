<?php

namespace App\Http\Controllers;

use App\Models\AccountsPayable;
use Illuminate\Http\Request;
use App\Http\Resources\AccountsPayableResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AccountsPayableController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', AccountsPayable::class);
        $accounts = AccountsPayable::latest()->get();
        return AccountsPayableResource::collection($accounts);
    }

    public function store(Request $request)
    {
        $this->authorize('create', AccountsPayable::class);
        $validated = $request->validate([
            'reference_title' => 'required|string|max:255',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'payment_date' => 'nullable|date',
            'status' => 'nullable|in:Pending,Paid,Overdue,Cancelled',
        ]);

        $account = AccountsPayable::create($validated);
        return new AccountsPayableResource($account);
    }

    public function show(AccountsPayable $accountsPayable)
    {
        $this->authorize('view', $accountsPayable);
        return new AccountsPayableResource($accountsPayable);
    }

    public function update(Request $request, AccountsPayable $accountsPayable)
    {
        $this->authorize('update', $accountsPayable);
        $validated = $request->validate([
            'reference_title' => 'sometimes|required|string|max:255',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'amount' => 'sometimes|required|numeric|min:0',
            'due_date' => 'sometimes|required|date',
            'payment_date' => 'nullable|date',
            'status' => 'nullable|in:Pending,Paid,Overdue,Cancelled',
        ]);

        $accountsPayable->update($validated);
        return new AccountsPayableResource($accountsPayable);
    }

    public function destroy(AccountsPayable $accountsPayable)
    {
        $this->authorize('delete', $accountsPayable);
        $accountsPayable->delete();
        return response()->noContent();
    }
}
