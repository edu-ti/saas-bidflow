<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MasterPanelMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $masterDomain = config('app.master_domain', env('MASTER_DOMAIN', 'master.localhost'));

        if ($request->getHost() !== $masterDomain) {
            abort(403, 'Acesso restrito ao painel master.');
        }

        if (!$request->user()) {
            abort(403, 'Acesso restrito ao painel master.');
        }

        $user = $request->user();

        $hasMasterRole = $user->role && in_array($user->role->name, ['master', 'super_admin']);
        $hasSuperAdmin = $user->is_superadmin;

        if (!$hasMasterRole && !$hasSuperAdmin) {
            abort(403);
        }

        return $next($request);
    }
}