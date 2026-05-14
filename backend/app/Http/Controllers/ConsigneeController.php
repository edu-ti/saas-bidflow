<?php

namespace App\Http\Controllers;

use App\Models\Consignee;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;

class ConsigneeController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Consignee::class);

        $query = Consignee::latest()->where('company_id', Auth::user()->company_id);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) =>
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('document', 'like', "%{$s}%")
            );
        }

        if ($request->boolean('active_only', false)) {
            $query->where('active', true);
        }

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Consignee::class);

        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'document'        => 'nullable|string|max:20',
            'credit_limit'    => 'nullable|numeric|min:0',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'address'         => 'nullable|string',
            'active'          => 'boolean',
        ]);

        $validated['company_id'] = Auth::user()->company_id;
        $consignee = Consignee::create($validated);
        return response()->json(['data' => $consignee], 201);
    }

    public function show($id)
    {
        $consignee = Consignee::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('view', $consignee);
        return response()->json(['data' => $consignee]);
    }

    public function update(Request $request, $id)
    {
        $consignee = Consignee::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('update', $consignee);

        $validated = $request->validate([
            'name'            => 'sometimes|required|string|max:255',
            'document'        => 'nullable|string|max:20',
            'credit_limit'    => 'nullable|numeric|min:0',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'address'         => 'nullable|string',
            'active'          => 'boolean',
        ]);

        $consignee->update($validated);
        return response()->json(['data' => $consignee]);
    }

    public function destroy($id)
    {
        $consignee = Consignee::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('delete', $consignee);
        $consignee->delete();
        return response()->noContent();
    }
}
