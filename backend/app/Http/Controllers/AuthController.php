<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;

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

        // Revoke tokens older than 24 hours (keep recent sessions active)
        \Laravel\Sanctum\PersonalAccessToken::where('tokenable_type', User::class)
            ->where('tokenable_id', $user->id)
            ->where('created_at', '<', now()->subHours(24))
            ->delete();

        $token = $user->createToken('spa-session')->plainTextToken;

        $cacheKey = "user_permissions:{$user->id}";

        $cached = Cache::get($cacheKey);

        if ($cached) {
            return response()->json([
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'role_name' => $cached['role_name'],
                    'permissions' => $cached['permissions'],
                    'company_id' => $user->company_id,
                    'is_superadmin' => (bool) $user->is_superadmin,
                    'is_admin' => (bool) $user->is_admin,
                    'allowed_modules' => $cached['allowed_modules'],
                ]
            ]);
        }

        $company = $user->company ?? null;
        $plan = $company?->plan ?? null;
        $features = is_array($plan?->features) ? $plan->features : [];
        $addons = is_array($company?->addons) ? $company->addons : [];
        $allowed_modules = array_values(array_unique(array_merge($features, $addons)));
        $role_name = $user->role?->name ?? ($user->is_admin ? 'Administrador' : 'Usuário');
        $permissions = $user->role?->permissions ?? null;

        Cache::put($cacheKey, [
            'role_name' => $role_name,
            'permissions' => $permissions,
            'allowed_modules' => $allowed_modules,
            'company_status' => $company?->status ?? 'active',
            'plan_features' => $features,
            'plan_addons' => $addons,
        ], now()->addHours(2));

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role_id' => $user->role_id,
                'role_name' => $role_name,
                'permissions' => $permissions,
                'company_id' => $user->company_id,
                'is_superadmin' => (bool) $user->is_superadmin,
                'is_admin' => (bool) $user->is_admin,
                'allowed_modules' => $allowed_modules,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            Cache::forget("user_permissions:{$user->id}");
            $user->currentAccessToken()->delete();
        }
        return response()->json(['message' => 'Logged out.']);
    }
}
