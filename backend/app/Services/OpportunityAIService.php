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

    public function analyzeBiddingNotice(int $opportunityId)
    {
        $opportunity = Opportunity::findOrFail($opportunityId);
        
        // Em um cenário real, aqui chamaríamos a API do Gemini ou OpenAI.
        // Simulando resposta da IA conforme solicitado:
        $aiResponse = [
            'resumo_objeto' => 'Aquisição de solução tecnológica para gestão de dados corporativos.',
            'documentacao'  => 'Certidões Negativas, Atestado de Capacidade Técnica, Balanço Patrimonial.',
            'penalidades'   => 'Multa de 10% por descumprimento, Suspensão temporária de licitar.',
            'win_rate'      => 68.5
        ];

        $opportunity->win_probability = $aiResponse['win_rate'];
        $opportunity->parsed_items = [
            'resumo' => $aiResponse['resumo_objeto'],
            'documentacao' => $aiResponse['documentacao'],
            'penalidades' => $aiResponse['penalidades'],
        ];
        
        $opportunity->save();

        return $opportunity;
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
