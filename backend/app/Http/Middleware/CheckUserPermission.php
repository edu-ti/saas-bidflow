<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserPermission
{
    public function handle(Request $request, Closure $next, string $module, string $page, string $action): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Não autenticado.'], 401);
        }

        // 1. Verificar trava do Plano/Empresa (Módulo)
        // Se for superadmin (Master), ignora trava de plano
        if (!$user->is_superadmin) {
            $company = $user->company;
            $plan = $company ? $company->plan : null;
            $features = $plan && is_array($plan->features) ? $plan->features : [];
            $addons = $company && is_array($company->addons) ? $company->addons : [];

            if (!in_array($module, $features) && !in_array($module, $addons)) {
                return response()->json([
                    'message' => 'Seu plano atual não permite acesso a este módulo.'
                ], 403);
            }
        }

        // 2. Admin Principal bypass (is_admin == true ou role_id == null)
        if ($user->is_admin || !$user->role_id || $user->is_superadmin) {
            return $next($request);
        }

        // 3. Load permissions from role
        $role = $user->role;
        if (!$role) {
            return response()->json(['message' => 'Permissão negada. Perfil não encontrado.'], 403);
        }

        $permissions = $role->permissions;

        // 4. Check specific permission (Module > Page > Action)
        if (!isset($permissions[$module][$page][$action]) || $permissions[$module][$page][$action] !== true) {
            return response()->json(['message' => "Permissão negada para $action em $page ($module)."], 403);
        }

        return $next($request);
    }
}
