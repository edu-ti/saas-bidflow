<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class CompanyManagementController extends Controller
{
    public function usersIndex(Request $request)
    {
        $user = Auth::user();
        if (!in_array($user->role, ['Admin', 'Manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $users = User::where('company_id', $user->company_id)->get();
        return response()->json(['data' => $users]);
    }

    public function userStore(Request $request)
    {
        $adminMode = Auth::user();
        if (!in_array($adminMode->role, ['Admin', 'Manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:Admin,Manager,Salesperson,Analyst,Expert,Staff',
        ]);

        $validated['company_id'] = $adminMode->company_id;
        $validated['password'] = Hash::make($validated['password']);
        $validated['status'] = 'Active';

        $newUser = User::create($validated);
        
        return response()->json(['data' => $newUser], 201);
    }

    public function userUpdate(Request $request, $id)
    {
        $adminMode = Auth::user();
        if (!in_array($adminMode->role, ['Admin', 'Manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $targetUser = User::where('company_id', $adminMode->company_id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'role' => 'sometimes|required|in:Admin,Manager,Salesperson,Analyst,Expert,Staff',
            'status' => 'sometimes|required|in:Active,Inactive',
        ]);

        $targetUser->update($validated);
        
        return response()->json(['data' => $targetUser]);
    }
}
