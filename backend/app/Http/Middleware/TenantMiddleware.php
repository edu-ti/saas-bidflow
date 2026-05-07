<?php

namespace App\Http\Middleware;

use App\Models\Company;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $host = $request->getHost();
        $masterDomain = config('app.master_domain', env('MASTER_DOMAIN', 'master.localhost'));

        if ($host === $masterDomain || $host === 'localhost' || $host === '127.0.0.1') {
            return $next($request);
        }

        $subdomain = $this->extractSubdomain($host);

        if (!$subdomain) {
            return abort(404, 'Tenant não encontrado.');
        }

        $company = Company::withoutGlobalScopes()
            ->where('subdomain', $subdomain)
            ->first();

        if (!$company) {
            return abort(404, 'Tenant não encontrado.');
        }

        app()->instance('current_tenant_id', $company->id);
        app()->instance('current_tenant', $company);
        config(['app.current_company_id' => $company->id]);

        return $next($request);
    }

    private function extractSubdomain(string $host): ?string
    {
        $parts = explode('.', $host);

        if (count($parts) < 2) {
            return null;
        }

        return $parts[0];
    }
}