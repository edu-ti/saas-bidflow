<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenant
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Se o tenant já foi resolvido pelo TenantMiddleware, não faz nada
        if (app()->bound('current_tenant_id')) {
            return $next($request);
        }

        if ($request->user()) {
            app()->instance('current_tenant_id', $request->user()->company_id);
        }

        return $next($request);
    }
}
