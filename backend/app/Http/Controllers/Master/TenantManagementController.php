<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;

class TenantManagementController extends Controller
{
    /**
     * List all tenants (companies) with aggregated data.
     */
    public function index()
    {
        $companies = Company::withCount('users')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($company) {
                return [
                    'id' => $company->id,
                    'name' => $company->name ?? 'Empresa Sem Nome',
                    'cnpj' => $company->document,
                    'status' => 'active',
                    'users_count' => $company->users_count,
                    'created_at' => $company->created_at,
                ];
            });

        return response()->json(['data' => $companies]);
    }

    /**
     * Impersonate a tenant's admin user.
     */
    public function impersonate(Request $request, $tenant_id)
    {
        $company = Company::findOrFail($tenant_id);

        // Find an admin user in that company to impersonate
        $adminUser = User::where('company_id', $company->id)
            ->where('role', 'Admin')
            ->first();

        if (!$adminUser) {
            // Fallback to the first user if no admin exists
            $adminUser = User::where('company_id', $company->id)->first();
        }

        if (!$adminUser) {
            return response()->json(['message' => 'Nenhum usuário encontrado nesta empresa para acessar.'], 404);
        }

        // Generate a temporary token
        $token = $adminUser->createToken('impersonation_token')->plainTextToken;

        return response()->json([
            'message' => 'Impersonation successful',
            'token' => $token,
            'user' => $adminUser,
            'company' => $company
        ]);
    }
}
