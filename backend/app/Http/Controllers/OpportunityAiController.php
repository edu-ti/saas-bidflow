<?php

namespace App\Http\Controllers;

use App\Models\Opportunity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OpportunityAiController extends Controller
{
    /**
     * Webhook for receiving AI insights to update opportunity bidding_metadata.
     */
    public function updateInsights(Request $request, $id)
    {
        $validated = $request->validate([
            'insights' => 'required|array',
        ]);

        $opportunity = Opportunity::find($id);

        if (! $opportunity) {
            return response()->json(['message' => 'Opportunity not found'], 404);
        }

        // Implicit Auth check (Token comes from bot which belongs to a company, thus we secure the update)
        if ($opportunity->company_id !== Auth::user()->company_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Retrieve existing metadata or instantiate new ArrayObject
        $metadata = $opportunity->bidding_metadata ?? new \Illuminate\Database\Eloquent\Casts\ArrayObject();

        // Merge AI insights. Using standard array merge on the ArrayObject
        // Since ArrayObject acts like an array, we can iterate
        foreach ($validated['insights'] as $key => $value) {
            $metadata[$key] = $value;
        }

        $opportunity->bidding_metadata = $metadata;
        $opportunity->save();

        return response()->json([
            'message' => 'AI insights merged successfully',
            'opportunity' => $opportunity
        ]);
    }

    public function predict($id)
    {
        $opportunity = Opportunity::findOrFail($id);
        $this->authorize('update', $opportunity);

        \App\Jobs\PredictWinProbabilityJob::dispatch($opportunity);

        return response()->json([
            'message' => 'Predição genérica em andamento',
            'status' => 'processing'
        ], 202);
    }

    public function parseNotice($id)
    {
        $opportunity = Opportunity::findOrFail($id);
        $this->authorize('update', $opportunity);

        \App\Jobs\ParseNoticeItemsJob::dispatch($opportunity);

        return response()->json([
            'message' => 'Parsing de edital (RAG) em andamento',
            'status' => 'processing'
        ], 202);
    }

    public function generateDraftPdf($id)
    {
        $opportunity = Opportunity::findOrFail($id);
        $this->authorize('view', $opportunity);

        // Simulando a geração de PDF via DomPDF
        if (!class_exists('Barryvdh\DomPDF\Facade\Pdf')) {
            return response()->json(['error' => 'DomPDF não configurado, instalar barryvdh/laravel-dompdf'], 501);
        }

        /* 
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdfs.proposal-draft', [
            'opportunity' => $opportunity,
            'items' => $opportunity->parsed_items,
            'company' => $opportunity->company
        ]);
        return $pdf->stream('rascunho_proposta_'.$opportunity->id.'.pdf');
        */

        // Por agora, vamos retornar uma view HTML básica renderizada como PDF genérico.
        // Já que a view pdfs.proposal-draft talvez não exista ainda, retornamos um mock se falhar e pedimos para criar depois.
        
        $html = '<h1>Rascunho Oficial: ' . e($opportunity->title) . '</h1>
        <p>Probabilidade de Vitória: ' . e($opportunity->win_probability) . '%</p>
        <p>Itens Mapeados via IA:</p><ul>';

        $items = $opportunity->parsed_items ?? [];
        foreach ($items as $item) {
            $html .= '<li>' . e($item['quantity'] ?? '') . 'x ' . e($item['description'] ?? '') . '</li>';
        }

        $html .= '</ul><p>Documento gerado eletronicamente por BidFlow GenAI.</p>';

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        return $pdf->stream('proposal_draft_'.$id.'.pdf');
    }
}
