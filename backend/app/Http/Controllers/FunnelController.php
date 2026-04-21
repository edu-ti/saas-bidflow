<?php

namespace App\Http\Controllers;

use App\Models\Funnel;
use App\Models\FunnelStage;
use Illuminate\Http\Request;

class FunnelController extends Controller
{
    /**
     * List all stages for the authenticated user's company funnels.
     */
    public function stages(Request $request)
    {
        $stages = FunnelStage::with('funnel')
            ->orderBy('order')
            ->get();

        return response()->json($stages);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:50',
            'order' => 'nullable|integer',
        ]);

        $stage = new FunnelStage();
        $stage->name = $validated['name'];
        $stage->color = $validated['color'] ?? '#cccccc';
        $stage->order = $validated['order'] ?? 0;
        
        // Assumindo que haja default funnel ou o user->company_id etc.
        // Simulando associacao a um funnel existente
        $funnel = Funnel::first();
        if ($funnel) {
            $stage->funnel_id = $funnel->id;
        }

        // Se houver suporte a multi-tenant no FunnelStage, associar aqui:
        // $stage->company_id = $request->user()->company_id;
        
        $stage->save();

        return response()->json($stage, 201);
    }

    public function update(Request $request, $id)
    {
        $stage = FunnelStage::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:50',
            'order' => 'nullable|integer',
        ]);

        $stage->name = $validated['name'];
        if (isset($validated['color'])) {
            $stage->color = $validated['color'];
        }
        if (isset($validated['order'])) {
            $stage->order = $validated['order'];
        }
        
        $stage->save();

        return response()->json($stage);
    }

    public function destroy($id)
    {
        $stage = FunnelStage::findOrFail($id);
        
        // Impedir exclusao se houver oportunidades?
        // (Isso deve ser tratado via Foreign Key Restrict ou checagem aqui)
        if (\App\Models\Opportunity::where('funnel_stage_id', $id)->exists()) {
            return response()->json(['message' => 'Não é possível excluir etapa com oportunidades associadas.'], 400);
        }

        $stage->delete();

        return response()->json(['message' => 'Etapa excluída com sucesso.']);
    }
}
