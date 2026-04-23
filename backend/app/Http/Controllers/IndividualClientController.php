<?php

namespace App\Http\Controllers;

use App\Models\IndividualClient;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class IndividualClientController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', IndividualClient::class);
        $clients = IndividualClient::latest()->get();
        return response()->json(['data' => $clients]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', IndividualClient::class);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'cpf' => 'nullable|string|max:20',
            'rg' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'address' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:100',
        ]);

        $client = IndividualClient::create($validated);
        return response()->json(['data' => $client], 201);
    }

    public function show(IndividualClient $individualClient)
    {
        $this->authorize('view', $individualClient);
        return response()->json(['data' => $individualClient]);
    }

    public function update(Request $request, IndividualClient $individualClient)
    {
        $this->authorize('update', $individualClient);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'cpf' => 'nullable|string|max:20',
            'rg' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'address' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:100',
        ]);

        $individualClient->update($validated);
        return response()->json(['data' => $individualClient]);
    }

    public function destroy(IndividualClient $individualClient)
    {
        $this->authorize('delete', $individualClient);
        $individualClient->delete();
        return response()->noContent();
    }
}
