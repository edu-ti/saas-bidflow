<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleController extends Controller
{
    public function index()
    {
        return Role::where('company_id', Auth::user()->company_id)->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'permissions' => 'required|array',
        ]);

        $role = Role::create([
            'company_id' => Auth::user()->company_id,
            'name' => $validated['name'],
            'permissions' => $validated['permissions'],
        ]);

        return response()->json($role, 201);
    }

    public function show($id)
    {
        return Role::where('company_id', Auth::user()->company_id)->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $role = Role::where('company_id', Auth::user()->company_id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'permissions' => 'sometimes|array',
        ]);

        $role->update($validated);

        return response()->json($role);
    }

    public function destroy($id)
    {
        $role = Role::where('company_id', Auth::user()->company_id)->findOrFail($id);
        
        // Check if any user is using this role
        if ($role->users()->count() > 0) {
            return response()->json(['message' => 'Não é possível excluir um perfil vinculado a usuários.'], 422);
        }

        $role->delete();

        return response()->json(null, 204);
    }
}
