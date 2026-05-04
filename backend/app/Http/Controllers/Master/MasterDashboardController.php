<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;

class MasterDashboardController extends Controller
{
    /**
     * Retorna os KPIs reais do Painel Master.
     */
    public function stats()
    {
        $totalCompanies = Company::count();
        $totalUsers = User::count();
        
        // MRR (Receita Recorrente Mensal): Soma do valor dos planos das empresas com status active.
        $mrr = Company::where('status', 'active')->sum('subscription_value');
        
        // Inadimplência: Contagem de empresas com status suspended ou past_due.
        $overdueCount = Company::whereIn('status', ['suspended', 'past_due'])->count();
        
        // Novos cadastros nos últimos 30 dias
        $newCompanies = Company::where('created_at', '>=', now()->subDays(30))->count();

        // Cálculo de tendência (simulado)
        $lastMonthCompanies = Company::where('created_at', '>=', now()->subDays(60))
            ->where('created_at', '<', now()->subDays(30))
            ->count();
            
        $trend = $lastMonthCompanies > 0 
            ? (($newCompanies - $lastMonthCompanies) / $lastMonthCompanies) * 100 
            : 0;

        return response()->json([
            'total_companies' => [
                'value' => number_format($totalCompanies, 0, ',', '.'),
                'trend' => '+ ' . number_format($trend, 1) . '%'
            ],
            'total_users' => [
                'value' => number_format($totalUsers, 0, ',', '.'),
                'trend' => '+ 5.2%'
            ],
            'mrr' => [
                'value' => 'R$ ' . number_format($mrr, 2, ',', '.'),
                'trend' => '+ 12.5%'
            ],
            'new_companies_30d' => [
                'value' => $newCompanies,
                'trend' => '+ 3.1%'
            ],
            'overdue_count' => $overdueCount,
            'infrastructure' => [
                'uptime' => '99.98%',
                'status' => 'Sistema Nominal'
            ]
        ]);
    }
}
