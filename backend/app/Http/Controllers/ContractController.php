<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\ContractTemplate;
use App\Models\IndividualClient;
use App\Models\CompanyClient;
use App\Models\Supplier;
use App\Models\Organization;
use App\Services\ContractManagerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ContractController extends Controller
{
    protected ContractManagerService $contractService;

    public function __construct(ContractManagerService $contractService)
    {
        $this->contractService = $contractService;
    }

    public function index(Request $request)
    {
        $query = Contract::with(['template', 'contractable', 'approvals', 'addendums']);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('type') && $request->type) {
            $query->whereHas('template', function ($q) use ($request) {
                $q->where('type', $request->type);
            });
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('contract_number', 'like', "%{$search}%")
                    ->orWhereHas('contractable', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%")
                            ->orWhere('corporate_name', 'like', "%{$search}%")
                            ->orWhere('cnpj', 'like', "%{$search}%")
                            ->orWhere('cpf', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('expiring_before')) {
            $query->where('end_date', '<=', $request->expiring_before);
        }

        if ($request->has('expiring_after')) {
            $query->where('end_date', '>=', $request->expiring_after);
        }

        $contracts = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($contracts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'contract_template_id' => 'required|exists:contract_templates,id',
            'contractable_type' => 'required|string',
            'contractable_id' => 'required|integer',
            'value' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'payment_terms' => 'nullable|string',
            'renewal_type' => 'nullable|string|in:manual,automatic',
        ]);

        $user = $request->user();

        if (Gate::denies('create-contract', Contract::class)) {
            return response()->json(['message' => 'Unauthorized - Permissão negada'], 403);
        }

        $contractable = $this->resolveContractable(
            $validated['contractable_type'],
            $validated['contractable_id']
        );

        if (!$contractable) {
            return response()->json(['message' => 'Entidade não encontrada'], 404);
        }

        $template = ContractTemplate::findOrFail($validated['contract_template_id']);

        $contract = $this->contractService->createContract(
            $user->company_id,
            $template,
            $contractable,
            $validated
        );

        return response()->json([
            'message' => 'Contrato criado com sucesso',
            'contract' => $contract->load(['template', 'contractable']),
        ], 201);
    }

    public function show($id)
    {
        $contract = Contract::with([
            'template',
            'contractable',
            'approvals.user',
            'addendums',
            'attachments',
            'approvedBy',
        ])->findOrFail($id);

        return response()->json($contract);
    }

    public function update(Request $request, $id)
    {
        $contract = Contract::findOrFail($id);

        if (!$contract->canBeEdited()) {
            return response()->json([
                'message' => 'Contrato não pode ser editado no status atual'
            ], 422);
        }

        $validated = $request->validate([
            'contract_template_id' => 'sometimes|exists:contract_templates,id',
            'value' => 'sometimes|numeric|min:0',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date',
            'payment_terms' => 'nullable|string',
            'renewal_type' => 'nullable|string|in:manual,automatic',
            'generated_content' => 'nullable|string',
        ]);

        $oldValues = $contract->toArray();
        $contract->update($validated);

        if (isset($validated['contract_template_id'])) {
            $template = ContractTemplate::find($validated['contract_template_id']);
            if ($template && $contract->contractable) {
                $generatedContent = $this->contractService->generateFromTemplate(
                    $template,
                    $contract->contractable,
                    $validated
                );
                $contract->update(['generated_content' => $generatedContent]);
            }
        }

        \App\Models\AuditLog::create([
            'company_id' => $contract->company_id,
            'user_id' => $request->user()->id,
            'auditable_type' => Contract::class,
            'auditable_id' => $contract->id,
            'action' => 'updated',
            'old_value' => json_encode($oldValues),
            'new_value' => json_encode($contract->fresh()->toArray()),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Contrato atualizado com sucesso',
            'contract' => $contract->fresh(['template', 'contractable']),
        ]);
    }

    public function destroy($id)
    {
        $contract = Contract::findOrFail($id);

        if ($contract->status !== 'draft') {
            return response()->json([
                'message' => 'Apenas contratos em rascunho podem ser excluídos'
            ], 422);
        }

        $contract->delete();

        return response()->json(['message' => 'Contrato excluído com sucesso']);
    }

    public function changeStatus(Request $request, $id)
    {
        $contract = Contract::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:draft,under_review,approved,sent_for_signature,active,finished,cancelled',
            'comments' => 'nullable|string',
        ]);

        try {
            $contract = $this->contractService->transitionStatus(
                $contract,
                $validated['status'],
                $request->user(),
                $validated['comments'] ?? null
            );

            return response()->json([
                'message' => 'Status alterado com sucesso',
                'contract' => $contract->fresh(),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function requestApproval(Request $request, $id)
    {
        $contract = Contract::findOrFail($id);

        $validated = $request->validate([
            'role' => 'required|string|in:juridico,financeiro,diretor,gestor',
        ]);

        try {
            $approval = $this->contractService->requestApproval(
                $contract,
                $validated['role'],
                $request->user()
            );

            return response()->json([
                'message' => 'Solicitação de aprovação enviada',
                'approval' => $approval,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function processApproval(Request $request, $approvalId)
    {
        $approval = ContractApproval::findOrFail($approvalId);

        $validated = $request->validate([
            'status' => 'required|string|in:approved,rejected',
            'comments' => 'nullable|string',
        ]);

        $contract = $this->contractService->processApproval(
            $approval,
            $validated['status'],
            $validated['comments'] ?? null,
            $request->user()
        );

        return response()->json([
            'message' => 'Aprovação processada',
            'contract' => $contract->fresh(),
        ]);
    }

    public function addAddendum(Request $request, $id)
    {
        $contract = Contract::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string|in:valor,prazo,valor_e_prazo,outros',
            'new_value' => 'nullable|numeric|min:0',
            'new_end_date' => 'nullable|date',
            'effective_date' => 'nullable|date',
        ]);

        $addendum = $this->contractService->createAddendum(
            $contract,
            array_merge($validated, ['user_id' => $request->user()->id])
        );

        return response()->json([
            'message' => 'Aditivo criado com sucesso',
            'addendum' => $addendum,
            'contract' => $contract->fresh(),
        ], 201);
    }

    public function getExpiring(Request $request)
    {
        $days = $request->get('days', 30);
        $contracts = $this->contractService->getExpiringContracts(
            $request->user()->company_id,
            $days
        );

        return response()->json($contracts);
    }

    public function getExpired(Request $request)
    {
        $contracts = $this->contractService->getExpiredContracts(
            $request->user()->company_id
        );

        return response()->json($contracts);
    }

    protected function resolveContractable(string $type, int $id)
    {
        return match ($type) {
            'individual_client' => IndividualClient::find($id),
            'company_client' => CompanyClient::find($id),
            'supplier' => Supplier::find($id),
            'organization' => Organization::find($id),
            default => null,
        };
    }
}
