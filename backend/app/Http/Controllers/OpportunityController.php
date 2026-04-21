<?php

namespace App\Http\Controllers;

use App\Models\Opportunity;
use App\Models\FunnelStage;
use App\Models\Contract;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OpportunityController extends Controller
{
    /**
     * Move an opportunity to a new funnel stage.
     */
    public function move(Request $request, $id)
    {
        $validated = $request->validate([
            'funnel_stage_id' => 'required|integer',
        ]);

        $opportunity = Opportunity::find($id);

        if (! $opportunity) {
            return response()->json(['message' => 'Opportunity not found'], 404);
        }

        // Apply Policy to ensure they can update it
        if ($request->user()->cannot('update', $opportunity)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $oldStageId = $opportunity->funnel_stage_id;
        $success = $opportunity->move_to_stage($validated['funnel_stage_id']);

        if (! $success) {
            return response()->json(['message' => 'Invalid funnel stage or tenant mismatch'], 400);
        }

        // Grave o log de auditoria
        \App\Models\AuditLog::create([
            'user_id' => $request->user()->id,
            'auditable_type' => Opportunity::class,
            'auditable_id' => $opportunity->id,
            'action' => 'Moved Stage',
            'old_value' => "Funnel Stage ID: " . $oldStageId,
            'new_value' => "Funnel Stage ID: " . $validated['funnel_stage_id'],
            'ip_address' => $request->ip(),
        ]);

        // Logic for Contract Creation on won
        $stage = FunnelStage::find($validated['funnel_stage_id']);
        
        $contractSuggested = false;
        
        // If the stage is marked as "is_final_win"
        if ($stage && $stage->is_final_win) {
            // Check if contract already exists
            $existingContract = Contract::where('opportunity_id', $opportunity->id)->first();
            
            if (!$existingContract) {
                // Auto-suggest / draft a contract based on the latest proposal or opportunity value
                Contract::create([
                    'company_id' => $opportunity->company_id,
                    'opportunity_id' => $opportunity->id,
                    'total_value' => $opportunity->value,
                    'status' => 'Ativo'
                ]);
                $contractSuggested = true;
            }
        }

        return response()->json([
            'message' => 'Stage updated successfully',
            'contract_auto_created' => $contractSuggested,
            'opportunity' => $opportunity
        ]);
    }
    
    /**
     * Display a listing of opportunities.
     */
    public function index(Request $request)
    {
        $query = Opportunity::query();
        
        // Basic filtering based on user role handled by Policy natively?
        // Actually, Policy only handles specific models, so if user is Sale, scope query here
        $user = $request->user();
        if (!in_array($user->role, ['Admin', 'Manager'])) {
            $query->where('user_id', $user->id);
        }
        
        // Basically no-op for mock
        return response()->json(['data' => $query->get()]);
    }

    public function uploadAttachment(Request $request, $id)
    {
        $opportunity = Opportunity::find($id);
        if (! $opportunity) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('attachments', 'public');
            
            // Grava na DB (Mock: supondo que tenhamos relacao attachments ou só retorna)
            return response()->json(['message' => 'Arquivo salvo', 'path' => $path]);
        }
        return response()->json(['message' => 'Nenhum arquivo enviado'], 400);
    }

    /**
     * Store a newly created opportunity in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'organization_id' => 'nullable|integer|exists:organizations,id',
            'individual_client_id' => 'nullable|integer|exists:individual_clients,id',
            'contact_id' => 'nullable|integer|exists:contacts,id',
            'forward_to' => 'nullable|string|max:255',
            'funnel_stage_id' => 'nullable|integer|exists:funnel_stages,id',
            'notes' => 'nullable|string',
            'value' => 'nullable|numeric',
            'items' => 'nullable|array',
            'items.*.description' => 'required_with:items|string|max:255',
            'items.*.manufacturer' => 'nullable|string|max:255',
            'items.*.model' => 'nullable|string|max:255',
            'items.*.status' => 'nullable|string|max:50',
            'items.*.detailed_description' => 'nullable|string',
            'items.*.additional_parameters' => 'nullable|array',
            'items.*.quantity' => 'required_with:items|numeric|min:1',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
            'items.*.unit_measure' => 'nullable|string|max:50',
            'items.*.subtotal' => 'nullable|numeric',
            'items.*.product_id' => 'nullable|integer|exists:products,id',
        ]);

        $user = $request->user();

        // Calcular valor total baseado nos itens se nao informado
        $totalValue = $validated['value'] ?? 0;
        if (empty($validated['value']) && !empty($validated['items'])) {
            $totalValue = collect($validated['items'])->sum(function ($item) {
                return ($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0);
            });
        }

        // Se nenhuma etapa foi enviada, tenta pegar a primeira
        $stageId = $validated['funnel_stage_id'] ?? FunnelStage::orderBy('order')->first()?->id;

        $opportunity = Opportunity::create([
            'company_id' => $user->company_id, // assume tenant is company_id
            'user_id' => $user->id,
            'title' => $validated['title'],
            'organization_id' => $validated['organization_id'] ?? null,
            'individual_client_id' => $validated['individual_client_id'] ?? null,
            'contact_id' => $validated['contact_id'] ?? null,
            'forward_to' => $validated['forward_to'] ?? null,
            'funnel_stage_id' => $stageId,
            'notes' => $validated['notes'] ?? null,
            'value' => $totalValue,
            'type' => 'Nova', // default type
        ]);

        if (!empty($validated['items'])) {
            foreach ($validated['items'] as $itemData) {
                $subtotal = ($itemData['quantity'] ?? 1) * ($itemData['unit_price'] ?? 0);
                
                $opportunity->items()->create([
                    'product_id' => $itemData['product_id'] ?? null,
                    'description' => $itemData['description'],
                    'manufacturer' => $itemData['manufacturer'] ?? null,
                    'model' => $itemData['model'] ?? null,
                    'status' => $itemData['status'] ?? 'Venda',
                    'detailed_description' => $itemData['detailed_description'] ?? null,
                    'additional_parameters' => $itemData['additional_parameters'] ?? null,
                    'quantity' => $itemData['quantity'] ?? 1,
                    'unit_price' => $itemData['unit_price'] ?? 0,
                    'unit_measure' => $itemData['unit_measure'] ?? 'Unidade',
                    'subtotal' => $subtotal,
                ]);
            }
        }

        \App\Models\AuditLog::create([
            'user_id' => $user->id,
            'auditable_type' => Opportunity::class,
            'auditable_id' => $opportunity->id,
            'action' => 'Created',
            'new_value' => json_encode($opportunity->toArray()),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Opportunity created successfully',
            'opportunity' => $opportunity->load('items')
        ], 201);
    }

    public function show($id)
    {
        $opportunity = Opportunity::with('items')->findOrFail($id);
        return response()->json($opportunity);
    }

    public function update(Request $request, $id)
    {
        $opportunity = Opportunity::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'organization_id' => 'nullable|integer|exists:organizations,id',
            'contact_id' => 'nullable|integer|exists:contacts,id',
            'forward_to' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'value' => 'nullable|numeric',
            'items' => 'nullable|array',
            'items.*.description' => 'required_with:items|string|max:255',
            'items.*.manufacturer' => 'nullable|string|max:255',
            'items.*.model' => 'nullable|string|max:255',
            'items.*.status' => 'nullable|string|max:50',
            'items.*.detailed_description' => 'nullable|string',
            'items.*.additional_parameters' => 'nullable|array',
            'items.*.quantity' => 'required_with:items|numeric|min:1',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
            'items.*.unit_measure' => 'nullable|string|max:50',
            'items.*.subtotal' => 'nullable|numeric',
        ]);

        $totalValue = $validated['value'] ?? 0;
        if (empty($validated['value']) && !empty($validated['items'])) {
            $totalValue = collect($validated['items'])->sum(function ($item) {
                return ($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0);
            });
        }

        $opportunity->update([
            'title' => $validated['title'],
            'organization_id' => $validated['organization_id'] ?? null,
            'contact_id' => $validated['contact_id'] ?? null,
            'forward_to' => $validated['forward_to'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'value' => $totalValue,
        ]);

        // Sync items (recreate for simplicity or sync by ID if needed)
        // A simple approach is delete all existing and insert new ones
        $opportunity->items()->delete();

        if (!empty($validated['items'])) {
            foreach ($validated['items'] as $itemData) {
                $subtotal = ($itemData['quantity'] ?? 1) * ($itemData['unit_price'] ?? 0);
                
                $opportunity->items()->create([
                    'description' => $itemData['description'],
                    'manufacturer' => $itemData['manufacturer'] ?? null,
                    'model' => $itemData['model'] ?? null,
                    'status' => $itemData['status'] ?? 'Venda',
                    'detailed_description' => $itemData['detailed_description'] ?? null,
                    'additional_parameters' => $itemData['additional_parameters'] ?? null,
                    'quantity' => $itemData['quantity'] ?? 1,
                    'unit_price' => $itemData['unit_price'] ?? 0,
                    'unit_measure' => $itemData['unit_measure'] ?? 'Unidade',
                    'subtotal' => $subtotal,
                ]);
            }
        }

        return response()->json([
            'message' => 'Opportunity updated successfully',
            'opportunity' => $opportunity->load('items')
        ]);
    }

    public function destroy($id)
    {
        $opportunity = Opportunity::findOrFail($id);
        $opportunity->delete();
        return response()->json(['message' => 'Opportunity deleted successfully']);
    }
}
