<?php

namespace App\Services;

use App\Models\Opportunity;
use App\Models\Contract;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;

class OpportunityService
{
    /**
     * Move opportunity to a different funnel stage
     */
    public function moveToStage(Opportunity $opportunity, int $newStageId): Opportunity
    {
        $oldStageId = $opportunity->funnel_stage_id;

        $opportunity->update([
            'funnel_stage_id' => $newStageId,
        ]);

        $this->logActivity($opportunity, 'stage_changed', [
            'old_stage_id' => $oldStageId,
            'new_stage_id' => $newStageId,
        ]);

        return $opportunity->fresh();
    }

    /**
     * Create contract when opportunity is won
     */
    public function createContractFromOpportunity(Opportunity $opportunity, array $data): Contract
    {
        return DB::transaction(function () use ($opportunity, $data) {
            $contract = Contract::create([
                'company_id' => $opportunity->company_id,
                'opportunity_id' => $opportunity->id,
                'title' => $data['title'] ?? "Contrato - {$opportunity->title}",
                'value' => $data['value'] ?? $opportunity->estimated_value,
                'start_date' => $data['start_date'] ?? now(),
                'end_date' => $data['end_date'] ?? null,
                'status' => $data['status'] ?? 'active',
            ]);

            $opportunity->update([
                'status' => 'won',
                'contract_id' => $contract->id,
            ]);

            $this->logActivity($opportunity, 'contract_created', [
                'contract_id' => $contract->id,
            ]);

            return $contract;
        });
    }

    /**
     * Calculate win rate for user/company
     */
    public function calculateWinRate(int $companyId, ?int $userId = null): array
    {
        $query = Opportunity::where('company_id', $companyId);

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $total = (clone $query)->count();
        $won = (clone $query)->where('status', 'won')->count();
        $lost = (clone $query)->where('status', 'lost')->count();
        $active = (clone $query)->where('status', 'active')->count();

        $winRate = $total > 0 ? round(($won / $total) * 100, 2) : 0;

        return [
            'total' => $total,
            'won' => $won,
            'lost' => $lost,
            'active' => $active,
            'win_rate' => $winRate,
        ];
    }

    /**
     * Get opportunities by stage
     */
    public function getOpportunitiesByStage(int $companyId): array
    {
        return Opportunity::where('company_id', $companyId)
            ->with(['stage', 'user', 'organization'])
            ->get()
            ->groupBy('funnel_stage_id')
            ->map(function ($opportunities) {
                return [
                    'count' => $opportunities->count(),
                    'total_value' => $opportunities->sum('estimated_value'),
                    'opportunities' => $opportunities,
                ];
            })
            ->toArray();
    }

    /**
     * Log activity for audit trail
     */
    protected function logActivity(Opportunity $opportunity, string $action, array $data = []): void
    {
        AuditLog::create([
            'company_id' => $opportunity->company_id,
            'user_id' => auth()->id(),
            'action' => $action,
            'model_type' => Opportunity::class,
            'model_id' => $opportunity->id,
            'changes' => $data,
        ]);
    }
}
