<?php

namespace App\Services;

use App\Models\Opportunity;
use App\Models\FunnelStage;
use App\Models\Contract;
use App\Models\AccountsReceivable;
use App\Models\AccountsPayable;
use App\Models\BiddingAlert;
use App\Models\User;
use App\Models\Goal;
use App\Models\Supplier;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class ReportService
{
    public function getOverview(Request $request): array
    {
        $companyId = Auth::user()->company_id;
        $filters = $this->getFilters($request);
        $dateRange = $this->getDateRange($request->get('period', 'month'));

        $wonStageIds = FunnelStage::where('company_id', $companyId)
            ->where('is_final_win', true)
            ->pluck('id')
            ->toArray();

        $query = Opportunity::where('company_id', $companyId)
            ->whereBetween('created_at', $dateRange);

        $this->applyFilters($query, $filters);

        $totalOpportunities = (clone $query)->count();
        $wonOpportunities = (clone $query)->whereIn('funnel_stage_id', $wonStageIds)->count();
        
        $conversionRate = $totalOpportunities > 0 
            ? round(($wonOpportunities / $totalOpportunities) * 100, 1) 
            : 0;

        $contractsQuery = Contract::where('company_id', $companyId)
            ->where('status', 'active');
        
        // Note: Contracts might need more complex filtering if linked to UF/Suppliers
        $newContracts = (clone $contractsQuery)->whereBetween('created_at', $dateRange)->count();
        $revenue = (clone $contractsQuery)->sum('value');

        // Crossing with Goals
        $goals = $this->getGoals($companyId, $filters, $request);

        return [
            'revenue' => $revenue,
            'target_revenue' => $goals['target_revenue'],
            'win_rate' => $conversionRate,
            'new_contracts' => $newContracts,
            'target_wins' => $goals['target_wins'],
            'total_opportunities' => $totalOpportunities,
            'won_opportunities' => $wonOpportunities,
            'revenue_progress' => $goals['target_revenue'] > 0 ? round(($revenue / $goals['target_revenue']) * 100, 1) : 0,
            'wins_progress' => $goals['target_wins'] > 0 ? round(($wonOpportunities / $goals['target_wins']) * 100, 1) : 0,
        ];
    }

    public function getSalesMetrics(Request $request): array
    {
        $companyId = Auth::user()->company_id;
        $filters = $this->getFilters($request);
        $dateRange = $this->getDateRange($request->get('period', 'month'));

        $query = Opportunity::where('company_id', $companyId)
            ->where('type', 'sales')
            ->whereBetween('created_at', $dateRange);

        $this->applyFilters($query, $filters);

        $total = $query->count();
        $revenue = $query->sum('value');
        
        $wonStageIds = FunnelStage::where('company_id', $companyId)
            ->where('is_final_win', true)
            ->pluck('id')
            ->toArray();

        $wonCount = (clone $query)->whereIn('funnel_stage_id', $wonStageIds)->count();
        $wonValue = (clone $query)->whereIn('funnel_stage_id', $wonStageIds)->sum('value');

        return [
            'total_proposals' => $total,
            'total_value' => $revenue,
            'won_count' => $wonCount,
            'won_value' => $wonValue,
            'ticket_medio' => $wonCount > 0 ? round($wonValue / $wonCount, 2) : 0,
            'conversion_rate' => $total > 0 ? round(($wonCount / $total) * 100, 1) : 0
        ];
    }

    public function getBiddingMetrics(Request $request): array
    {
        $companyId = Auth::user()->company_id;
        $filters = $this->getFilters($request);
        $dateRange = $this->getDateRange($request->get('period', 'month'));

        $wonStageIds = FunnelStage::where('company_id', $companyId)
            ->where('is_final_win', true)
            ->pluck('id')
            ->toArray();

        $lossStageIds = FunnelStage::where('company_id', $companyId)
            ->where('is_final_loss', true)
            ->pluck('id')
            ->toArray();

        $query = Opportunity::where('company_id', $companyId)
            ->where('type', 'bidding')
            ->whereBetween('created_at', $dateRange);

        $this->applyFilters($query, $filters);

        $total = $query->count();
        $totalValue = $query->sum('value');

        $won = (clone $query)->whereIn('funnel_stage_id', $wonStageIds)->count();
        $wonValue = (clone $query)->whereIn('funnel_stage_id', $wonStageIds)->sum('value');
        $lost = (clone $query)->whereIn('funnel_stage_id', $lossStageIds)->count();

        $winRate = ($won + $lost) > 0 ? round(($won / ($won + $lost)) * 100, 1) : 0;

        return [
            'total' => $total,
            'won' => $won,
            'lost' => $lost,
            'total_value' => $totalValue,
            'won_value' => $wonValue,
            'win_rate' => $winRate,
        ];
    }

    public function getSupplierPerformance(Request $request): array
    {
        $companyId = Auth::user()->company_id;
        $filters = $this->getFilters($request);
        $dateRange = $this->getDateRange($request->get('period', 'month'));

        $wonStageIds = FunnelStage::where('company_id', $companyId)
            ->where('is_final_win', true)
            ->pluck('id')
            ->toArray();

        $query = Opportunity::where('company_id', $companyId)
            ->whereNotNull('supplier_id')
            ->whereBetween('opportunities.created_at', $dateRange)
            ->join('suppliers', 'opportunities.supplier_id', '=', 'suppliers.id')
            ->select('suppliers.name as supplier_name', 'suppliers.id as supplier_id')
            ->selectRaw('COUNT(*) as total_opps')
            ->selectRaw('SUM(CASE WHEN funnel_stage_id IN ('.implode(',', $wonStageIds).') THEN 1 ELSE 0 END) as wins')
            ->selectRaw('SUM(CASE WHEN funnel_stage_id IN ('.implode(',', $wonStageIds).') THEN value ELSE 0 END) as revenue')
            ->groupBy('suppliers.id', 'suppliers.name');

        if ($filters['uf']) {
            $query->where('suppliers.state', $filters['uf']);
        }
        
        if ($filters['supplier_id']) {
            $query->where('suppliers.id', $filters['supplier_id']);
        }

        return $query->get()->toArray();
    }

    public function getLossAnalysis(Request $request): array
    {
        $companyId = Auth::user()->company_id;
        $filters = $this->getFilters($request);
        $dateRange = $this->getDateRange($request->get('period', 'month'));

        $lossStageIds = FunnelStage::where('company_id', $companyId)
            ->where('is_final_loss', true)
            ->pluck('id')
            ->toArray();

        $query = Opportunity::where('company_id', $companyId)
            ->whereIn('funnel_stage_id', $lossStageIds)
            ->whereBetween('created_at', $dateRange)
            ->select('loss_reason', DB::raw('count(*) as count'))
            ->groupBy('loss_reason');

        $this->applyFilters($query, $filters);

        return $query->get()->toArray();
    }

    protected function applyFilters($query, array $filters)
    {
        if ($filters['user_id']) {
            $query->where('user_id', $filters['user_id']);
        }
        if ($filters['supplier_id']) {
            $query->where('supplier_id', $filters['supplier_id']);
        }
        if ($filters['uf']) {
            $query->join('organizations', 'opportunities.organization_id', '=', 'organizations.id')
                  ->where('organizations.address_data->uf', $filters['uf']);
        }
    }

    protected function getFilters(Request $request): array
    {
        return [
            'user_id' => $request->get('user_id'),
            'supplier_id' => $request->get('supplier_id'),
            'uf' => $request->get('uf'),
            'month' => $request->get('month', now()->month),
            'year' => $request->get('year', now()->year),
        ];
    }

    protected function getGoals(int $companyId, array $filters, Request $request): array
    {
        $goalQuery = Goal::where('company_id', $companyId)
            ->where('month', $filters['month'])
            ->where('year', $filters['year']);

        if ($filters['user_id']) {
            $goalQuery->where('goal_type', 'user')->where('target_id', $filters['user_id']);
        } elseif ($filters['supplier_id']) {
            $goalQuery->where('goal_type', 'supplier')->where('target_id', $filters['supplier_id']);
        } else {
            $goalQuery->where('goal_type', 'global');
        }

        if ($filters['uf']) {
            $goalQuery->where('uf', $filters['uf']);
        }

        $goal = $goalQuery->first();

        return [
            'target_revenue' => $goal?->target_revenue ?? 0,
            'target_wins' => $goal?->target_wins ?? 0,
        ];
    }

    protected function getDateRange(string $period): array
    {
        $now = now();
        return match ($period) {
            'month' => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
            '30days' => [$now->copy()->subDays(30), $now],
            'year' => [$now->copy()->startOfYear(), $now->copy()->endOfYear()],
            default => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
        };
    }
}