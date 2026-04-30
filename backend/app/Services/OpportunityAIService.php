<?php

namespace App\Services;

use App\Models\Opportunity;
use Illuminate\Support\Facades\Auth;

class OpportunityAIService
{
    public function updateInsights(Opportunity $opportunity, array $insights, $userId)
    {
        // Retrieve existing metadata or instantiate new ArrayObject
        $metadata = $opportunity->bidding_metadata ?? new \Illuminate\Database\Eloquent\Casts\ArrayObject();

        foreach ($insights as $key => $value) {
            $metadata[$key] = $value;
        }

        $opportunity->bidding_metadata = $metadata;
        $opportunity->save();

        return $opportunity;
    }

    public function predict(Opportunity $opportunity)
    {
        \App\Jobs\PredictWinProbabilityJob::dispatch($opportunity);
        return true;
    }

    public function parseNotice(Opportunity $opportunity)
    {
        \App\Jobs\ParseNoticeItemsJob::dispatch($opportunity);
        return true;
    }

    public function generateDraftPdf(Opportunity $opportunity)
    {
        if (!class_exists('Barryvdh\DomPDF\Facade\Pdf')) {
            throw new \Exception('DomPDF não configurado, instalar barryvdh/laravel-dompdf');
        }

        $html = '<h1>Rascunho Oficial: ' . e($opportunity->title) . '</h1>
        <p>Probabilidade de Vitória: ' . e($opportunity->win_probability) . '%</p>
        <p>Itens Mapeados via IA:</p><ul>';

        $items = $opportunity->parsed_items ?? [];
        foreach ($items as $item) {
            $html .= '<li>' . e($item['quantity'] ?? '') . 'x ' . e($item['description'] ?? '') . '</li>';
        }

        $html .= '</ul><p>Documento gerado eletronicamente por BidFlow GenAI.</p>';

        return \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
    }
}
