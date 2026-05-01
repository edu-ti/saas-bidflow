<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckFeatureAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->is_superadmin) {
            return $next($request);
        }

        $company = $user->company;

        if (!$company) {
            return response()->json(['message' => 'Usuário não vinculado a uma empresa.'], 403);
        }

        $plan = $company->plan;

        $features = $plan && is_array($plan->features) ? $plan->features : [];
        $addons = is_array($company->addons) ? $company->addons : [];

        if (in_array($feature, $features) || in_array($feature, $addons)) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Seu plano atual não permite acesso a este módulo. Faça um upgrade ou contrate o add-on.'
        ], 403);
    }
}
