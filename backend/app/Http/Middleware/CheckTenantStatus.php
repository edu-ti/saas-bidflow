<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckTenantStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Ignora checagem para rotas master ou super admins
        if ($user && $user->is_superadmin && $request->is('api/master/*')) {
            return $next($request);
        }

        if ($user && $user->company) {
            $status = $user->company->status;
            if (in_array($status, ['past_due', 'suspended', 'cancelled'])) {
                return response()->json([
                    'message' => 'O acesso da sua empresa está bloqueado.',
                    'code' => 'TENANT_SUSPENDED'
                ], 403);
            }
        }

        return $next($request);
    }
}
