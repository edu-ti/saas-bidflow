<?php

namespace App\Http\Controllers;

use App\Models\CompanyClient;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CompanyClientController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', CompanyClient::class);
        $clients = CompanyClient::latest()->get();
        return response()->json(['data' => $clients]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', CompanyClient::class);
        $validated = $request->validate([
            'corporate_name' => 'required|string|max:255',
            'fantasy_name' => 'nullable|string|max:255',
            'cnpj' => 'nullable|string|max:20',
            'municipal_registration' => 'nullable|string|max:50',
            'state_registration' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'contact_name' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_position' => 'nullable|string|max:100',
            'contact_phone' => 'nullable|string|max:20',
        ]);

        $client = CompanyClient::create($validated);
        return response()->json(['data' => $client], 201);
    }

    public function show(CompanyClient $companyClient)
    {
        $this->authorize('view', $companyClient);
        return response()->json(['data' => $companyClient]);
    }

    public function update(Request $request, CompanyClient $companyClient)
    {
        $this->authorize('update', $companyClient);
        $validated = $request->validate([
            'corporate_name' => 'sometimes|required|string|max:255',
            'fantasy_name' => 'nullable|string|max:255',
            'cnpj' => 'nullable|string|max:20',
            'municipal_registration' => 'nullable|string|max:50',
            'state_registration' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'contact_name' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_position' => 'nullable|string|max:100',
            'contact_phone' => 'nullable|string|max:20',
        ]);

        $companyClient->update($validated);
        return response()->json(['data' => $companyClient]);
    }

    public function destroy(CompanyClient $companyClient)
    {
        $this->authorize('delete', $companyClient);
        $companyClient->delete();
        return response()->noContent();
    }
}