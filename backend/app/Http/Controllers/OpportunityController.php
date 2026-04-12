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
}
