<?php

namespace App\Jobs;

use App\Models\Opportunity;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ParseNoticeItemsJob implements ShouldQueue
{
    use Queueable;

    public $opportunity;

    public function __construct(Opportunity $opportunity)
    {
        $this->opportunity = $opportunity;
    }

    public function handle(): void
    {
        // LLM/RAG system contextualizado para GC Representações (Hospitalar/TI)
        // O prompt seria: "Atue como especialista em licitações de saúde e TI. Extraia os itens e exija correlação de capital social."
        sleep(2);

        $mockItems = [
            ["description" => "Bomba de Infusão Contínua", "quantity" => 20, "matched_product_id" => null],
            ["description" => "Monitor Multiparamétrico", "quantity" => 15, "matched_product_id" => null],
            ["description" => "Switch Gerenciável 48 Portas PoE (TI Hospitalar)", "quantity" => 5, "matched_product_id" => null]
        ];

        // Mapeou 1 item do Product Model
        $mockItems[0]['matched_product_id'] = 1;

        $this->opportunity->update([
            'parsed_items' => $mockItems
        ]);
    }
}
