<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MasterDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        Log::channel('structured')->info('master_panel_access', [
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
            'host' => request()->getHost(),
            'timestamp' => now()->toIso8601String(),
        ]);

        return response()->json([
            'panel' => 'master',
            'status' => 'ok',
        ]);
    }

    public function stats(): JsonResponse
    {
        $totalCompanies = Company::count();
        $totalUsers = User::whereNull('deleted_at')->count();
        $newCompanies30d = Company::where('created_at', '>=', now()->subDays(30))->count();
        $mrr = Company::whereIn('status', ['active', 'trial'])
            ->sum('subscription_value') ?? 0;

        $overdueCount = Company::where(function ($query) {
            $query->whereNotIn('status', ['active', 'trial'])
                  ->orWhere(function ($q) {
                      $q->whereNotNull('next_billing_date')
                        ->where('next_billing_date', '<', now());
                  });
        })->count();

        return response()->json([
            'total_companies' => [
                'value' => (string) $totalCompanies,
                'trend' => '+0%',
            ],
            'total_users' => [
                'value' => (string) $totalUsers,
                'trend' => '+0%',
            ],
            'mrr' => [
                'value' => 'R$ ' . number_format($mrr, 2, ',', '.'),
                'trend' => '+0%',
            ],
            'new_companies_30d' => [
                'value' => (string) $newCompanies30d,
                'trend' => '+0%',
            ],
            'infrastructure' => [
                'status' => 'Sistema Nominal',
            ],
            'overdue_count' => $overdueCount,
        ]);
    }
}
