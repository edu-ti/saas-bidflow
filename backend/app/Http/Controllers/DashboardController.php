<?php

namespace App\Http\Controllers;

use App\Models\Opportunity;
use App\Models\FunnelStage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get aggregate statistics for the BI Dashboard.
     * Note: TenantScope automatically filters all queries by company_id!
     */
    public function stats(Request $request)
    {
        // 1. Pipeline Value (Total Value per Funnel Stage)
        // Since opportunities belongs to funnel_stages, we can do a join or simple group by.
        $pipelineValue = Opportunity::select('funnel_stage_id', DB::raw('SUM(value) as total_value'), DB::raw('COUNT(id) as count'))
            ->whereNotNull('funnel_stage_id')
            ->groupBy('funnel_stage_id')
            ->get();

        // Map names to stages
        $stages = FunnelStage::whereIn('id', $pipelineValue->pluck('funnel_stage_id'))->get()->keyBy('id');
        
        $pipelineFormatted = $pipelineValue->map(function ($item) use ($stages) {
            $stage = $stages->get($item->funnel_stage_id);
            return [
                'name' => $stage ? $stage->name : 'Unknown',
                'value' => (float) $item->total_value,
                'count' => $item->count,
                'color' => $stage ? $stage->color : '#94a3b8'
            ];
        });

        // 2. Win Rate
        // Get count of won vs lost opportunities based on FunnelStage flags
        $wonStages = FunnelStage::where('is_final_win', true)->pluck('id');
        $lostStages = FunnelStage::where('is_final_loss', true)->pluck('id');

        $wonCount = Opportunity::whereIn('funnel_stage_id', $wonStages)->count();
        $lostCount = Opportunity::whereIn('funnel_stage_id', $lostStages)->count();
        $totalFinished = $wonCount + $lostCount;
        
        $winRate = $totalFinished > 0 ? round(($wonCount / $totalFinished) * 100, 2) : 0;

        // 3. Top Organizations
        $topOrganizations = Opportunity::select('organizations.name', DB::raw('SUM(opportunities.value) as total_value'))
            ->join('organizations', 'opportunities.organization_id', '=', 'organizations.id')
            ->groupBy('organizations.id', 'organizations.name')
            ->orderBy('total_value', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'pipeline' => $pipelineFormatted,
            'win_rate' => [
                'won' => $wonCount,
                'lost' => $lostCount,
                'rate' => $winRate
            ],
            'top_organizations' => $topOrganizations
        ]);
    }

    public function queueHealth(Request $request) {
        $pending = \Illuminate\Support\Facades\DB::table('jobs')->count();
        $failed = \Illuminate\Support\Facades\DB::table('failed_jobs')->count();

        return response()->json([
            'pending_jobs' => $pending,
            'failed_jobs' => $failed,
            'status' => $failed > 0 ? 'warning' : 'healthy'
        ]);
    }

    public function auditLogs(Request $request) {
        $logs = \App\Models\AuditLog::with('user:id,name')
            ->latest()
            ->limit(20)
            ->get();
            
        return response()->json($logs);
    }
}
