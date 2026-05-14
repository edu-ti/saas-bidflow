<?php

namespace App\Http\Controllers;

use App\Models\Funnel;
use App\Models\FunnelStage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FunnelController extends Controller
{
    /**
     * List all stages for the authenticated user's company funnels.
     */
    public function stages(Request $request)
    {
        $stages = FunnelStage::with('funnel')
            ->where('company_id', Auth::user()->company_id)
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
        $stage->company_id = Auth::user()->company_id;

        // Associar ao primeiro funnel da mesma empresa
        $funnel = Funnel::where('company_id', $stage->company_id)->first();
        if ($funnel) {
            $stage->funnel_id = $funnel->id;
        }

        $stage->save();

        return response()->json($stage, 201);
    }

    public function update(Request $request, $id)
    {
        $stage = FunnelStage::where('company_id', Auth::user()->company_id)->findOrFail($id);

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
        $stage = FunnelStage::where('company_id', Auth::user()->company_id)->findOrFail($id);

        // Impedir exclusao se houver oportunidades?
        // (Isso deve ser tratado via Foreign Key Restrict ou checagem aqui)
        if (\App\Models\Opportunity::where('funnel_stage_id', $id)->exists()) {
            return response()->json(['message' => 'Não é possível excluir etapa com oportunidades associadas.'], 400);
        }

        $stage->delete();

        return response()->json(['message' => 'Etapa excluída com sucesso.']);
    }
}
