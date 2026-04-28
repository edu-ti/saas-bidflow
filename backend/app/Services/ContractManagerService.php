<?php

namespace App\Services;

use App\Models\Contract;
use App\Models\ContractTemplate;
use App\Models\ContractApproval;
use App\Models\ContractAddendum;
use App\Models\AuditLog;
use App\Models\IndividualClient;
use App\Models\CompanyClient;
use App\Models\Supplier;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ContractManagerService
{
    protected FinanceService $financeService;

    public function __construct(FinanceService $financeService)
    {
        $this->financeService = $financeService;
    }

    public function generateContractNumber(int $companyId): string
    {
        $prefix = 'CNT';
        $year = date('Y');
        $month = date('m');

        $lastContract = Contract::where('company_id', $companyId)
            ->whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastContract ? ((int) substr($lastContract->contract_number, -5)) + 1 : 1;

        return sprintf('%s-%s%s-%05d', $prefix, $year, $month, $sequence);
    }

    public function generateFromTemplate(
        ContractTemplate $template,
        $contractable,
        array $data = []
    ): string {
        $content = $template->content;

        $replacements = $this->prepareReplacements($contractable, $data);

        foreach ($replacements as $placeholder => $value) {
            $content = str_replace('{{' . $placeholder . '}}', $value, $content);
        }

        $content = preg_replace('/\{\{[a-z_]+\}\}/', '', $content);

        return $content;
    }

    protected function prepareReplacements($contractable, array $data = []): array
    {
        $replacements = [];

        if ($contractable instanceof IndividualClient) {
            $replacements = [
                'client_name' => $contractable->name ?? '',
                'client_document' => $contractable->cpf ?? '',
                'client_rg' => $contractable->rg ?? '',
                'client_email' => $contractable->email ?? '',
                'client_phone' => $contractable->phone ?? '',
                'client_address' => $contractable->address ?? '',
            ];
        } elseif ($contractable instanceof CompanyClient) {
            $replacements = [
                'client_name' => $contractable->corporate_name ?? '',
                'client_trade_name' => $contractable->fantasy_name ?? '',
                'client_document' => $contractable->cnpj ?? '',
                'client_state_registration' => $contractable->state_registration ?? '',
                'client_municipal_registration' => $contractable->municipal_registration ?? '',
                'client_contact_name' => $contractable->contact_name ?? '',
                'client_contact_email' => $contractable->contact_email ?? '',
                'client_address' => is_array($contractable->address) ? json_encode($contractable->address) : ($contractable->address ?? ''),
            ];
        } elseif ($contractable instanceof Supplier) {
            $replacements = [
                'client_name' => $contractable->name ?? '',
                'client_document' => $contractable->document_number ?? '',
                'client_email' => $contractable->email ?? '',
                'client_phone' => $contractable->phone ?? '',
                'client_address' => $contractable->address ?? '',
                'client_city' => $contractable->city ?? '',
                'client_state' => $contractable->state ?? '',
            ];
        } elseif ($contractable instanceof Organization) {
            $replacements = [
                'client_name' => $contractable->name ?? '',
                'client_document' => $contractable->document_number ?? '',
                'client_uasg' => $contractable->uasg_code ?? '',
                'client_sphere' => $contractable->sphere ?? '',
                'client_email' => $contractable->email ?? '',
                'client_phone' => $contractable->phone ?? '',
            ];
        }

        $replacements['contract_date'] = now()->format('d/m/Y');
        $replacements['contract_year'] = now()->format('Y');
        $replacements['contract_month'] = now()->format('m');
        $replacements['contract_day'] = now()->format('d');

        return array_merge($replacements, $data);
    }

    public function createContract(
        int $companyId,
        ContractTemplate $template,
        $contractable,
        array $data
    ): Contract {
        return DB::transaction(function () use ($companyId, $template, $contractable, $data) {
            $contractNumber = $this->generateContractNumber($companyId);
            $generatedContent = $this->generateFromTemplate($template, $contractable, $data);

            $contract = Contract::create([
                'company_id' => $companyId,
                'contract_template_id' => $template->id,
                'contract_number' => $contractNumber,
                'contractable_id' => $contractable->id,
                'contractable_type' => get_class($contractable),
                'value' => $data['value'] ?? 0,
                'start_date' => $data['start_date'] ?? null,
                'end_date' => $data['end_date'] ?? null,
                'payment_terms' => $data['payment_terms'] ?? null,
                'renewal_type' => $data['renewal_type'] ?? 'manual',
                'generated_content' => $generatedContent,
                'status' => 'draft',
            ]);

            $this->logAudit(
                $companyId,
                $contract,
                'created',
                null,
                json_encode($contract->toArray()),
                $data['user_id'] ?? null
            );

            return $contract;
        });
    }

    public function transitionStatus(
        Contract $contract,
        string $newStatus,
        ?User $user = null,
        ?string $comments = null
    ): Contract {
        $oldStatus = $contract->status;

        if (!$this->canTransition($contract->status, $newStatus)) {
            throw new \InvalidArgumentException(
                "Transição de status inválida: {$oldStatus} -> {$newStatus}"
            );
        }

        $contract->update(['status' => $newStatus]);

        $this->logAudit(
            $contract->company_id,
            $contract,
            'status_changed',
            $oldStatus,
            $newStatus,
            $user?->id
        );

        if ($newStatus === 'approved' && $user) {
            $contract->update([
                'approved_by_user_id' => $user->id,
                'approved_at' => now(),
            ]);
        }

        if ($newStatus === 'active') {
            $this->provisionFinancialEntries($contract);
        }

        return $contract->fresh();
    }

    public function canTransition(string $fromStatus, string $toStatus): bool
    {
        $transitions = [
            'draft' => ['under_review', 'cancelled'],
            'under_review' => ['approved', 'draft', 'cancelled'],
            'approved' => ['sent_for_signature', 'cancelled'],
            'sent_for_signature' => ['active', 'cancelled'],
            'active' => ['finished', 'cancelled'],
            'finished' => [],
            'cancelled' => [],
        ];

        return in_array($toStatus, $transitions[$fromStatus] ?? []);
    }

    public function requestApproval(Contract $contract, string $role, ?User $user = null): ContractApproval
    {
        if (!$contract->canBeApproved()) {
            throw new \InvalidArgumentException(
                "Contrato não pode ser enviado para aprovação no status atual: {$contract->status}"
            );
        }

        $approval = ContractApproval::create([
            'company_id' => $contract->company_id,
            'contract_id' => $contract->id,
            'user_id' => $user?->id ?? auth()->id(),
            'role' => $role,
            'status' => 'pending',
        ]);

        if ($contract->status === 'draft') {
            $this->transitionStatus($contract, 'under_review', $user);
        }

        return $approval;
    }

    public function processApproval(
        ContractApproval $approval,
        string $status,
        ?string $comments = null,
        ?User $user = null
    ): Contract {
        $approval->update([
            'status' => $status,
            'comments' => $comments,
        ]);

        $this->logAudit(
            $approval->company_id,
            $approval,
            'approval_' . $status,
            null,
            json_encode($approval->toArray()),
            $user?->id ?? auth()->id()
        );

        if ($status === 'rejected') {
            $this->transitionStatus($approval->contract, 'draft', $user);
            return $approval->contract->fresh();
        }

        $contract = $approval->contract;
        $pendingApprovals = $contract->approvals()
            ->where('status', 'pending')
            ->count();

        if ($pendingApprovals === 0) {
            $contract = $this->transitionStatus($contract, 'approved', $user);
        }

        return $contract->fresh();
    }

    public function provisionFinancialEntries(Contract $contract): void
    {
        if (!$contract->payment_terms || !$contract->value) {
            return;
        }

        $parsedTerms = $this->parsePaymentTerms($contract->payment_terms);

        if (empty($parsedTerms)) {
            return;
        }

        $isReceivable = $this->isClientReceivable($contract);

        foreach ($parsedTerms as $term) {
            $data = [
                'reference_title' => sprintf(
                    '%s - Parcela %d/%d',
                    $contract->contract_number,
                    $term['installment'],
                    count($parsedTerms)
                ),
                'amount' => $term['amount'],
                'due_date' => $term['due_date'],
                'status' => 'Pending',
                'description' => "Contrato: {$contract->contract_number}",
            ];

            if ($isReceivable) {
                $this->financeService->createReceivable($data);
            } else {
                $this->financeService->createPayable($data);
            }
        }
    }

    protected function parsePaymentTerms(string $paymentTerms): array
    {
        $terms = [];
        $lines = explode("\n", trim($paymentTerms));

        foreach ($lines as $line) {
            if (preg_match('/(\d{2}\/\d{2}\/\d{4})[:\s]+R?\$?\s*([\d.,]+)/', $line, $matches)) {
                $terms[] = [
                    'due_date' => \Carbon\Carbon::createFromFormat('d/m/Y', $matches[1]),
                    'amount' => (float) str_replace([',', 'R$', ' '], '', $matches[2]),
                    'installment' => count($terms) + 1,
                ];
            }
        }

        if (empty($terms) && preg_match('/(\d+)\s*x\s*(?:de\s*)?R?\$?\s*([\d.,]+)/i', $paymentTerms, $matches)) {
            $installments = (int) $matches[1];
            $amount = (float) str_replace([',', 'R$', ' '], '', $matches[2]);
            $totalValue = $amount * $installments;

            if ($installments > 0 && $totalValue > 0) {
                $startDate = now()->addMonth();

                for ($i = 1; $i <= $installments; $i++) {
                    $terms[] = [
                        'due_date' => $startDate->copy()->addMonths($i - 1),
                        'amount' => $amount,
                        'installment' => $i,
                    ];
                }
            }
        }

        return $terms;
    }

    protected function isClientReceivable(Contract $contract): bool
    {
        return in_array($contract->contractable_type, [
            IndividualClient::class,
            CompanyClient::class,
            Organization::class,
        ]);
    }

    public function createAddendum(
        Contract $contract,
        array $data
    ): ContractAddendum {
        $oldValue = $contract->value;
        $oldEndDate = $contract->end_date;

        $addendum = ContractAddendum::create([
            'company_id' => $contract->company_id,
            'contract_id' => $contract->id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'type' => $data['type'] ?? 'outros',
            'old_value' => $oldValue,
            'new_value' => $data['new_value'] ?? null,
            'old_end_date' => $oldEndDate,
            'new_end_date' => $data['new_end_date'] ?? null,
            'effective_date' => $data['effective_date'] ?? now(),
        ]);

        if ($data['new_value'] ?? null) {
            $contract->update(['value' => $data['new_value']]);
        }

        if ($data['new_end_date'] ?? null) {
            $contract->update(['end_date' => $data['new_end_date']]);
        }

        $this->logAudit(
            $contract->company_id,
            $addendum,
            'created',
            null,
            json_encode($addendum->toArray()),
            $data['user_id'] ?? null
        );

        return $addendum;
    }

    public function getExpiringContracts(int $companyId, int $days = 30): \Illuminate\Database\Eloquent\Collection
    {
        $targetDate = now()->addDays($days);

        return Contract::where('company_id', $companyId)
            ->where('status', 'active')
            ->whereNotNull('end_date')
            ->where('end_date', '<=', $targetDate)
            ->where('end_date', '>=', now())
            ->with(['contractable', 'template'])
            ->get();
    }

    public function getExpiredContracts(int $companyId): \Illuminate\Database\Eloquent\Collection
    {
        return Contract::where('company_id', $companyId)
            ->where('status', 'active')
            ->whereNotNull('end_date')
            ->where('end_date', '<', now())
            ->with(['contractable', 'template'])
            ->get();
    }

    protected function logAudit(
        int $companyId,
        $model,
        string $action,
        ?string $oldValue,
        ?string $newValue,
        ?int $userId = null
    ): AuditLog {
        return AuditLog::create([
            'company_id' => $companyId,
            'user_id' => $userId ?? auth()->id(),
            'auditable_type' => get_class($model),
            'auditable_id' => $model->id,
            'action' => $action,
            'old_value' => $oldValue,
            'new_value' => $newValue,
            'ip_address' => request()->ip(),
        ]);
    }
}
