<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;

class TenantManagementController extends Controller
{
    /**
     * Store a new tenant (Company) and its first admin User.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'document' => 'required|string|max:20|unique:companies,document',
            'plan_id' => 'required|exists:plans,id',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $company = \Illuminate\Support\Facades\DB::transaction(function () use ($validated) {
            // Create the Company
            $company = Company::create([
                'name' => $validated['name'],
                'document' => $validated['document'],
                'plan_id' => $validated['plan_id'],
            ]);

            // Create the Admin User for this Company
            User::create([
                'company_id' => $company->id,
                'name' => $validated['admin_name'],
                'email' => $validated['admin_email'],
                'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
                'role' => 'Admin',
                'status' => 'Active',
                'is_superadmin' => false,
            ]);

            return $company;
        });

        // Load relations or counts if needed
        $company->users_count = 1;
        
        return response()->json([
            'message' => 'Empresa cadastrada com sucesso!',
            'company' => $company
        ], 201);
    }

    /**
     * List all tenants (companies) with aggregated data.
     */
    public function index()
    {
        $companies = Company::with(['plan', 'users' => function($q) {
            $q->where('role', 'Admin')->limit(1);
        }])->withCount('users')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($company) {
                $admin = $company->users->first() ?? \App\Models\User::where('company_id', $company->id)->first();
                return [
                    'id' => $company->id,
                    'name' => $company->name ?? 'Empresa Sem Nome',
                    'cnpj' => $company->document,
                    'plan_id' => $company->plan_id,
                    'plan_name' => $company->plan ? $company->plan->name : 'Nenhum',
                    'status' => 'active',
                    'users_count' => $company->users_count,
                    'created_at' => $company->created_at,
                    'admin_name' => $admin ? $admin->name : null,
                    'admin_email' => $admin ? $admin->email : null,
                ];
            });

        return response()->json(['data' => $companies]);
    }

    /**
     * Update a tenant (Company) data.
     */
    public function update(Request $request, $tenant_id)
    {
        $company = Company::findOrFail($tenant_id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'document' => 'required|string|max:20|unique:companies,document,' . $company->id,
            'plan_id' => 'required|exists:plans,id',
            'admin_name' => 'nullable|string|max:255',
            'admin_email' => 'nullable|email|max:255',
            'password' => 'nullable|string|min:6',
            'addons' => 'nullable|array',
            'addons.*' => 'string',
        ]);

        $company->update([
            'name' => $validated['name'],
            'document' => $validated['document'],
            'plan_id' => $validated['plan_id'],
            'addons' => $validated['addons'] ?? []
        ]);

        $adminUser = User::where('company_id', $company->id)->where('role', 'Admin')->first() 
            ?? User::where('company_id', $company->id)->first();
            
        if ($adminUser) {
            if (!empty($validated['admin_name'])) {
                $adminUser->name = $validated['admin_name'];
            }
            
            if (!empty($validated['admin_email']) && $adminUser->email !== $validated['admin_email']) {
                $exists = User::where('email', $validated['admin_email'])->exists();
                if ($exists) {
                    return response()->json(['message' => 'O e-mail informado já está em uso por outro usuário.'], 422);
                }
                $adminUser->email = $validated['admin_email'];
            }
            
            if (!empty($validated['password'])) {
                $adminUser->password = \Illuminate\Support\Facades\Hash::make($validated['password']);
            }
            
            $adminUser->save();
        }

        return response()->json([
            'message' => 'Empresa atualizada com sucesso!',
            'company' => $company
        ]);
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
