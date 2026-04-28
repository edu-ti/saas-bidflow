<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Company;
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
}