<?php

namespace App\Services;

use App\Models\Opportunity;
use App\Models\FunnelStage;
use App\Models\Contract;
use App\Models\AccountsReceivable;
use App\Models\AccountsPayable;
use App\Models\BiddingAlert;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class ReportService
{
    public function getOverview(Request $request): array
    {
        $companyId = Auth::user()->company_id;
        $dateRange = $this->getDateRange($request->get('period', 'month'));

        $wonStageIds = FunnelStage::where('company_id', $companyId)
            ->where('is_final_win', true)
            ->pluck('id')
            ->toArray();

        $opportunitiesQuery = Opportunity::where('company_id', $companyId)
            ->whereBetween('created_at', $dateRange);

        $wonOpportunities = (clone $opportunitiesQuery)
            ->whereIn('funnel_stage_id', $wonStageIds)
            ->count();

        $totalOpportunities = (clone $opportunitiesQuery)->count();
        
        $conversionRate = $totalOpportunities > 0 
            ? round(($wonOpportunities / $totalOpportunities) * 100, 1) 
            : 0;

        $contracts = Contract::where('company_id', $companyId)
            ->where('status', 'active')
            ->whereBetween('created_at', $dateRange);

        $newContracts = $contracts->count();

        $activeContracts = Contract::where('company_id', $companyId)
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where(function ($q) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', now());
            })
            ->sum('value');

        return [
            'revenue' => $activeContracts,
            'win_rate' => $conversionRate,
            'new_contracts' => $newContracts,
            'total_opportunities' => $totalOpportunities,
            'won_opportunities' => $wonOpportunities,
        ];
    }

    public function getBiddingMetrics(Request $request): array
    {
        $companyId = Auth::user()->company_id;
        $userId = $request->get('user_id');
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

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $total = $query->count();
        $totalValue = $query->sum('value');

        $won = (clone $query)
            ->whereIn('funnel_stage_id', $wonStageIds)
            ->count();

        $wonValue = (clone $query)
            ->whereIn('funnel_stage_id', $wonStageIds)
            ->sum('value');

        $lost = (clone $query)
            ->whereIn('funnel_stage_id', $lossStageIds)
            ->count();

        $capturedAlerts = BiddingAlert::where('company_id', $companyId)
            ->whereBetween('created_at', $dateRange)
            ->count();

        $qualifiedOpportunities = Opportunity::where('company_id', $companyId)
            ->where('type', 'bidding')
            ->whereNotNull('opportunity_id')
            ->whereBetween('created_at', $dateRange)
            ->count();

        $winRate = ($won + $lost) > 0
            ? round(($won / ($won + $lost)) * 100, 1)
            : 0;

        return [
            'total' => $total,
            'won' => $won,
            'lost' => $lost,
            'pending' => $total - $won - $lost,
            'total_value' => $totalValue,
            'won_value' => $wonValue,
            'win_rate' => $winRate,
            'captured_alerts' => $capturedAlerts,
            'qualified_opportunities' => $qualifiedOpportunities,
        ];
    }

    public function getBiddingFunnel(Request $request): array
    {
        $companyId = Auth::user()->company_id;
        $userId = $request->get('user_id');
        $dateRange = $this->getDateRange($request->get('period', 'month'));

        $stages = FunnelStage::where('company_id', $companyId)
            ->orderBy('order')
            ->get();

        $funnelData = [];
        foreach ($stages as $stage) {
            $query = Opportunity::where('company_id', $companyId)
                ->where('funnel_stage_id', $stage->id)
                ->whereBetween('created_at', $dateRange);

            if ($userId) {
                $query->where('user_id', $userId);
            }

            $count = $query->count();
            $value = $query->sum('value');

            $funnelData[] = [
                'stage' => $stage->name,
                'count' => $count,
                'value' => $value,
                'probability' => $stage->probability,
                'color' => $stage->color,
                'is_win' => $stage->is_final_win,
                'is_loss' => $stage->is_final_loss,
            ];
        }

        return $funnelData;
    }

    public function getFinancialHealth(Request $request): array
    {
        $companyId = Auth::user()->company_id;
        $dateRange = $this->getDateRange($request->get('period', 'month'));

        $receivables = AccountsReceivable::where('company_id', $companyId)
            ->whereBetween('due_date', $dateRange);

        $totalReceivable = (clone $receivables)->sum('amount');
        $paidReceivable = (clone $receivables)->where('status', 'Paid')->sum('amount');
        $overdueReceivable = (clone $receivables)->where('status', 'Overdue')->sum('amount');
        $pendingReceivable = (clone $receivables)->where('status', 'Pending')->sum('amount');

        $payables = AccountsPayable::where('company_id', $companyId)
            ->whereBetween('due_date', $dateRange);

        $totalPayable = (clone $payables)->sum('amount');
        $paidPayable = (clone $payables)->where('status', 'Paid')->sum('amount');
        $pendingPayable = (clone $payables)->where('status', 'Pending')->sum('amount');

        $mrr = Contract::where('company_id', $companyId)
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where(function ($q) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', now());
            })
            ->sum('value');

        $defaultRate = $totalReceivable > 0 
            ? round(($overdueReceivable / $totalReceivable) * 100, 1) 
            : 0;

        return [
            'total_receivable' => $totalReceivable,
            'paid_receivable' => $paidReceivable,
            'overdue_receivable' => $overdueReceivable,
            'pending_receivable' => $pendingReceivable,
            'total_payable' => $totalPayable,
            'paid_payable' => $paidPayable,
            'pending_payable' => $pendingPayable,
            'mrr' => $mrr,
            'default_rate' => $defaultRate,
            'net_position' => $totalReceivable - $totalPayable,
        ];
    }

    public function getFinancialTimeline(Request $request): array
    {
        $companyId = Auth::user()->company_id;
        $period = $request->get('period', 'month');
        $dateRange = $this->getDateRange($period);

        $receivablesByMonth = AccountsReceivable::where('company_id', $companyId)
            ->selectRaw('DATE_FORMAT(due_date, "%Y-%m") as month')
            ->selectRaw('SUM(CASE WHEN status = "Paid" THEN amount ELSE 0 END) as received')
            ->selectRaw('SUM(CASE WHEN status IN ("Pending", "Overdue") THEN amount ELSE 0 END) as pending')
            ->whereBetween('due_date', $dateRange)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $payablesByMonth = AccountsPayable::where('company_id', $companyId)
            ->selectRaw('DATE_FORMAT(due_date, "%Y-%m") as month')
            ->selectRaw('SUM(CASE WHEN status = "Paid" THEN amount ELSE 0 END) as paid')
            ->selectRaw('SUM(CASE WHEN status = "Pending" THEN amount ELSE 0 END) as pending')
            ->whereBetween('due_date', $dateRange)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $timeline = [];
        $monthKeys = $receivablesByMonth->pluck('month')
            ->merge($payablesByMonth->pluck('month'))
            ->unique()
            ->sort()
            ->values()
            ->toArray();

        foreach ($monthKeys as $month) {
            $recvData = $receivablesByMonth->firstWhere('month', $month);
            $payData = $payablesByMonth->firstWhere('month', $month);

            $timeline[] = [
                'month' => $month,
                'received' => $recvData?->received ?? 0,
                'pending_receivable' => $recvData?->pending ?? 0,
                'paid' => $payData?->paid ?? 0,
                'pending_payable' => $payData?->pending ?? 0,
            ];
        }

        return $timeline;
    }

    public function getTeamPerformance(Request $request): array
    {
        $companyId = Auth::user()->company_id;
        $dateRange = $this->getDateRange($request->get('period', 'month'));

        $wonStageIds = FunnelStage::where('company_id', $companyId)
            ->where('is_final_win', true)
            ->pluck('id')
            ->toArray();

        $users = User::where('company_id', $companyId)->get();

        $performance = [];
        foreach ($users as $user) {
            $wonValue = Opportunity::where('company_id', $companyId)
                ->where('user_id', $user->id)
                ->whereIn('funnel_stage_id', $wonStageIds)
                ->whereBetween('created_at', $dateRange)
                ->sum('value');

            $wonCount = Opportunity::where('company_id', $companyId)
                ->where('user_id', $user->id)
                ->whereIn('funnel_stage_id', $wonStageIds)
                ->whereBetween('created_at', $dateRange)
                ->count();

            $totalValue = Opportunity::where('company_id', $companyId)
                ->where('user_id', $user->id)
                ->whereBetween('created_at', $dateRange)
                ->sum('value');

            $performance[] = [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'won_count' => $wonCount,
                'total_value' => $totalValue,
                'won_value' => $wonValue,
                'win_rate' => $totalValue > 0 ? round(($wonValue / $totalValue) * 100, 1) : 0,
            ];
        }

        usort($performance, fn($a, $b) => $b['won_value'] - $a['won_value']);

        return $performance;
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