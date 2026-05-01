<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciais inválidas.'], 401);
        }

        // Revoke old tokens
        $user->tokens()->delete();

        $token = $user->createToken('spa-session')->plainTextToken;

        $company = $user->company;
        $plan = $company ? $company->plan : null;
        $features = $plan && is_array($plan->features) ? $plan->features : [];
        $addons = $company && is_array($company->addons) ? $company->addons : [];
        $allowed_modules = array_values(array_unique(array_merge($features, $addons)));

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'company_id' => $user->company_id,
                'is_superadmin' => (bool) $user->is_superadmin,
                'allowed_modules' => $allowed_modules,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out.']);
    }
}
