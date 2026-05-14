<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

class SuperAdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized access. Super admin privileges required.'], 403);
        }

        if (!Gate::allows('access-master-panel')) {
            return response()->json(['message' => 'Unauthorized access. Super admin privileges required.'], 403);
        }

        return $next($request);
    }
}
