<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserPermission
{
    public function handle(Request $request, Closure $next, string $module, string $action): Response
    {
        $user = $request->user();

        // 1. Admin Principal bypass (is_admin ou sem role_id)
        if ($user->is_admin || !$user->role_id) {
            return $next($request);
        }

        // 2. Load permissions from role
        $role = $user->role;
        if (!$role) {
            return response()->json(['message' => 'Permissão negada. Perfil não encontrado.'], 403);
        }

        $permissions = $role->permissions;

        // 3. Check specific permission
        if (!isset($permissions[$module][$action]) || $permissions[$module][$action] !== true) {
            return response()->json(['message' => "Permissão negada para $action no módulo $module."], 403);
        }

        return $next($request);
    }
}
