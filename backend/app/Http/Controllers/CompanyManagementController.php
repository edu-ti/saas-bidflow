<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Company;
use App\Models\Organization;
use App\Http\Resources\OrganizationResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class CompanyManagementController extends Controller
{
    public function usersIndex(Request $request)
    {
        $user = Auth::user();
        if (!in_array($user->role, ['admin', 'manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $users = User::where('company_id', $user->company_id)->get();
        return response()->json(['data' => $users]);
    }

    public function userStore(Request $request)
    {
        $authUser = Auth::user();
        if (!in_array($authUser->role, ['admin', 'manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $company = $authUser->company;
        $plan = $company->plan;
        if ($plan) {
            $currentUsersCount = User::where('company_id', $company->id)->count();
            if ($currentUsersCount >= $plan->max_users) {
                return response()->json([
                    'message' => 'Limite de usuários atingido. Por favor, faça um upgrade de plano.',
                ], 403);
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,manager,user,analyst',
            'position' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        $validated['company_id'] = $authUser->company_id;
        $validated['password'] = Hash::make($validated['password']);
        $validated['status'] = 'active';

        $newUser = User::create($validated);
        
        return response()->json(['data' => $newUser, 'message' => 'Utilizador criado com sucesso'], 201);
    }

    public function userUpdate(Request $request, $id)
    {
        $authUser = Auth::user();
        if (!in_array($authUser->role, ['admin', 'manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $targetUser = User::where('company_id', $authUser->company_id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email',
            'role' => 'sometimes|required|in:admin,manager,user,analyst',
            'status' => 'sometimes|required|in:active,inactive',
            'position' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        $targetUser->update($validated);
        
        return response()->json(['data' => $targetUser, 'message' => 'Utilizador atualizado com sucesso']);
    }

    public function userDestroy(Request $request, $id)
    {
        $authUser = Auth::user();
        if (!in_array($authUser->role, ['admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $targetUser = User::where('company_id', $authUser->company_id)->findOrFail($id);
        
        if ($targetUser->id === $authUser->id) {
            return response()->json(['message' => 'Não pode eliminar o próprio utilizador'], 422);
        }

        $targetUser->delete();
        
        return response()->json(['message' => 'Utilizador eliminado com sucesso']);
    }

    public function companyShow(Request $request, $id)
    {
        $company = Company::findOrFail($id);
        return response()->json($company);
    }

    public function companyUpdate(Request $request, $id)
    {
        $authUser = Auth::user();
        if (!in_array($authUser->role, ['admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $company = Company::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'cnpj' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'subdomain' => 'nullable|string|max:50',
        ]);

        $company->update($validated);
        
        return response()->json(['data' => $company, 'message' => 'Empresa atualizada com sucesso']);
    }

    // --- Organization Methods ---

    public function organizationIndex(Request $request)
    {
        // Trait BelongsToTenant will scope this to the current tenant if configured,
        // but we explicitly enforce it here to standardize tenant control
        $authUser = Auth::user();
        $organizations = Organization::where('company_id', $authUser->company_id)->get();
        return OrganizationResource::collection($organizations);
    }

    public function organizationStore(Request $request)
    {
        $authUser = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'document_number' => 'nullable|string|max:255',
            'uasg_code' => 'nullable|string|max:255',
            'sphere' => 'nullable|in:Federal,Estadual,Municipal',
            'address_data' => 'nullable|array',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        $validated['company_id'] = $authUser->company_id;
        $organization = Organization::create($validated);

        return new OrganizationResource($organization);
    }

    public function organizationShow(Request $request, $id)
    {
        $authUser = Auth::user();
        $organization = Organization::where('company_id', $authUser->company_id)->find($id);

        if (! $organization) {
            return response()->json(['message' => 'Organization not found'], 404);
        }

        return new OrganizationResource($organization);
    }
}