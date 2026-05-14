<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
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

        if (!Gate::allows('access-master-panel')) {
            abort(403);
        }

        return $next($request);
    }
}