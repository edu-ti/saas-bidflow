<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CheckUserPermission
{
    public function handle(Request $request, Closure $next, string $module, string $page, string $action): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Não autenticado.'], 401);
        }

        $cacheKey = "user_permissions:{$user->id}";
        $cached = Cache::get($cacheKey);

        // 1. Verificar trava do Plano/Empresa (Módulo)
        // Se for superadmin (Master), ignora trava de plano. Admin da empresa respeita o plano.
        if (!$user->is_superadmin) {
            if ($cached) {
                $features = $cached['plan_features'] ?? [];
                $addons = $cached['plan_addons'] ?? [];
                if (!in_array($module, $features) && !in_array($module, $addons)) {
                    return response()->json([
                        'message' => 'Seu plano atual não permite acesso a este módulo. Por favor, faça um upgrade ou contrate o add-on.'
                    ], 403);
                }
            } else {
                $company = $user->company;
                $plan = $company ? $company->plan : null;
                if ($plan) {
                    $features = is_array($plan->features) ? $plan->features : [];
                    $addons = is_array($company->addons) ? $company->addons : [];
                    if (!in_array($module, $features) && !in_array($module, $addons)) {
                        return response()->json([
                            'message' => 'Seu plano atual não permite acesso a este módulo. Por favor, faça um upgrade ou contrate o add-on.'
                        ], 403);
                    }
                }
            }
        }

        // 2. Admin Principal / SuperAdmin bypass
        if ($user->is_superadmin || $user->is_admin) {
            return $next($request);
        }

        // 3. Load permissions from cache or role
        if ($cached && isset($cached['permissions'])) {
            $permissions = $cached['permissions'];
        } else {
            $role = $user->role;
            if (!$role) {
                return response()->json(['message' => 'Permissão negada. Perfil não encontrado.'], 403);
            }
            $permissions = $role->permissions;
        }

        // 4. Check specific permission (Module > Page > Action)
        if (!isset($permissions[$module][$page][$action]) || $permissions[$module][$page][$action] !== true) {
            return response()->json(['message' => "Permissão negada para $action em $page ($module)."], 403);
        }

        return $next($request);
    }
}
