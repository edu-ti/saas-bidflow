<?php

namespace App\Http\Controllers;

use App\Models\Consignee;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ConsigneeController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Consignee::class);

        $query = Consignee::latest();

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

        $consignee = Consignee::create($validated);
        return response()->json(['data' => $consignee], 201);
    }

    public function show(Consignee $consignee)
    {
        $this->authorize('view', $consignee);
        return response()->json(['data' => $consignee]);
    }

    public function update(Request $request, Consignee $consignee)
    {
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

    public function destroy(Consignee $consignee)
    {
        $this->authorize('delete', $consignee);
        $consignee->delete();
        return response()->noContent();
    }
}
