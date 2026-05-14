<?php

namespace App\Http\Controllers;

use App\Models\Proposal;
use App\Models\ProposalItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Attachment;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class ProposalController extends Controller
{
    /**
     * Store a newly created proposal and its items.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'opportunity_id' => 'nullable|exists:opportunities,id',
            'status' => 'nullable|in:Draft,Sent,Accepted,Rejected',
            'notes' => 'nullable|string',
            'data_validade' => 'nullable|date',
            'motivo_status' => 'nullable|string',
            'faturamento' => 'nullable|string',
            'treinamento' => 'nullable|string',
            'condicoes_pagamento' => 'nullable|string',
            'prazo_entrega' => 'nullable|string',
            'garantia_equipamentos' => 'nullable|string',
            'garantia_acessorios' => 'nullable|string',
            'instalacao' => 'nullable|string',
            'assistencia_tecnica' => 'nullable|string',
            'frete_tipo' => 'nullable|in:CIF,FOB',
            'frete_valor' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.brand' => 'nullable|string',
            'items.*.model' => 'nullable|string',
            'items.*.status' => 'nullable|in:VENDA,LOCACAO,SERVICO',
            'items.*.meses_locacao' => 'nullable|integer|min:1',
            'items.*.desconto_percent' => 'nullable|numeric|min:0|max:100',
            'items.*.unidade_medida' => 'nullable|string',
            'items.*.parametros' => 'nullable|array',
            'items.*.descricao_detalhada' => 'nullable|string',
            'items.*.imagem_url' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $totalValue = 0;
            $freteValor = (float) ($validated['frete_valor'] ?? 0);

            foreach ($validated['items'] as $item) {
                $meses = (int) ($item['meses_locacao'] ?? 12);
                $multiplicador = (strtoupper($item['status'] ?? 'VENDA') === 'LOCACAO') ? $meses : 1;
                $quantidade = (float) ($item['quantity'] ?? 1);
                $valorUnitario = (float) ($item['unit_price'] ?? 0);
                $desconto = (float) ($item['desconto_percent'] ?? 0);

                $subtotalSemDesconto = $quantidade * $valorUnitario * $multiplicador;
                $valorDesconto = $subtotalSemDesconto * ($desconto / 100);
                $totalValue += ($subtotalSemDesconto - $valorDesconto);
            }

            $totalValue += $freteValor;

            // Gerar número da proposta
            $year = date('Y');
            $maxNum = Proposal::whereYear('created_at', $year)->max('id') ?? 0;
            $nextNum = $maxNum + 1;
            $numeroProposta = str_pad((string) $nextNum, 3, '0', STR_PAD_LEFT) . '/' . $year;

            $proposal = Proposal::create([
                'opportunity_id' => $validated['opportunity_id'] ?? null,
                'status' => $validated['status'] ?? 'Draft',
                'total_value' => $totalValue,
                'notes' => $validated['notes'] ?? null,
                'numero_proposta' => $numeroProposta,
                'data_validade' => $validated['data_validade'] ?? null,
                'motivo_status' => $validated['motivo_status'] ?? null,
                'faturamento' => $validated['faturamento'] ?? null,
                'treinamento' => $validated['treinamento'] ?? null,
                'condicoes_pagamento' => $validated['condicoes_pagamento'] ?? null,
                'prazo_entrega' => $validated['prazo_entrega'] ?? null,
                'garantia_equipamentos' => $validated['garantia_equipamentos'] ?? null,
                'garantia_acessorios' => $validated['garantia_acessorios'] ?? null,
                'instalacao' => $validated['instalacao'] ?? null,
                'assistencia_tecnica' => $validated['assistencia_tecnica'] ?? null,
                'frete_tipo' => $validated['frete_tipo'] ?? 'CIF',
            'company_id' => Auth::user()->company_id,
            'frete_valor' => $freteValor,
        ]);

            foreach ($validated['items'] as $itemData) {
                $meses = (int) ($itemData['meses_locacao'] ?? 12);
                $multiplicador = (strtoupper($itemData['status'] ?? 'VENDA') === 'LOCACAO') ? $meses : 1;
                $quantidade = (float) ($itemData['quantity'] ?? 1);
                $valorUnitario = (float) ($itemData['unit_price'] ?? 0);
                $desconto = (float) ($itemData['desconto_percent'] ?? 0);

                $subtotalSemDesconto = $quantidade * $valorUnitario * $multiplicador;
                $itemTotalPrice = $subtotalSemDesconto * (1 - ($desconto / 100));

                ProposalItem::create([
                    'proposal_id' => $proposal->id,
                    'description' => $itemData['description'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'total_price' => $itemTotalPrice,
                    'brand' => $itemData['brand'] ?? null,
                    'model' => $itemData['model'] ?? null,
                    'status' => $itemData['status'] ?? 'VENDA',
                    'meses_locacao' => ($itemData['status'] ?? 'VENDA') === 'LOCACAO' ? ($itemData['meses_locacao'] ?? 12) : null,
                    'desconto_percent' => $itemData['desconto_percent'] ?? 0,
                    'unidade_medida' => $itemData['unidade_medida'] ?? 'Unidade',
                    'parametros' => $itemData['parametros'] ?? null,
                    'descricao_detalhada' => $itemData['descricao_detalhada'] ?? null,
                    'imagem_url' => $itemData['imagem_url'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json($proposal->load('items'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create proposal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate PDF for a Proposal and save to attachments.
     */
    public function generatePdf($id)
    {
        $proposal = Proposal::with(['items', 'company', 'opportunity.organization'])->find($id);

        if (!$proposal) {
            return response()->json(['message' => 'Proposal not found'], 404);
        }

        $opportunity = $proposal->opportunity;

        // Ensure user has access
        if ($proposal->company_id !== auth()->user()->company_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $companyInfo = [
            'name' => $proposal->company->name ?? 'Empresa',
            'cnpj' => $proposal->company->document ?? '',
            'phone' => $proposal->company->phone ?? '',
            'address' => $proposal->company->address ?? '',
            'email' => $proposal->company->email ?? '',
        ];

        // Calcular totais para exibição no PDF
        $hasLocacao = false;
        $hasDiscount = false;
        $hasServico = false;
        $maxMesesLocacao = 1;
        $totalMensalLocacao = 0;
        $totalSubtotalGeral = 0;
        $totalDescontoGeral = 0;
        $totalGeral = 0;

        foreach ($proposal->items as $item) {
            $itemStatus = strtoupper($item->status ?? 'VENDA');
            $isLocacao = $itemStatus === 'LOCACAO';
            $isServico = $itemStatus === 'SERVIÇO';
            $mesesLocacao = $isLocacao ? ((int)($item->meses_locacao ?? 12)) : 1;
            $multiplicador = $isLocacao ? $mesesLocacao : 1;

            if ($isLocacao) $hasLocacao = true;
            if ($isServico) $hasServico = true;
            if (((float)($item->desconto_percent ?? 0)) > 0) $hasDiscount = true;

            $quantidade = (float) ($item->quantity ?? 1);
            $valorUnitario = (float) ($item->unit_price ?? 0);
            $descontoPercent = (float) ($item->desconto_percent ?? 0);

            $subtotalSemDesconto = $quantidade * $valorUnitario * $multiplicador;
            $valorDesconto = $subtotalSemDesconto * ($descontoPercent / 100);
            $subtotal = $subtotalSemDesconto - $valorDesconto;

            $totalSubtotalGeral += $subtotalSemDesconto;
            $totalDescontoGeral += $valorDesconto;
            $totalGeral += $subtotal;

            if ($isLocacao) {
                if ($mesesLocacao > $maxMesesLocacao) $maxMesesLocacao = $mesesLocacao;
                $valorMensalBruto = $valorUnitario * $quantidade;
                $descontoMensal = $valorMensalBruto * ($descontoPercent / 100);
                $totalMensalLocacao += ($valorMensalBruto - $descontoMensal);
            }
        }

        $freteValor = (float) ($proposal->frete_valor ?? 0);
        $totalGeralCalculado = $totalGeral + $freteValor;

        // Render PDF from Blade
        $pdf = Pdf::loadView('pdfs.proposal', [
            'proposal' => $proposal,
            'items' => $proposal->items,
            'company' => $companyInfo,
            'opportunity' => $opportunity,
            'organization' => $opportunity->organization ?? null,
            'hasLocacao' => $hasLocacao,
            'hasDiscount' => $hasDiscount,
            'hasServico' => $hasServico,
            'maxMesesLocacao' => $maxMesesLocacao,
            'totalMensalLocacao' => $totalMensalLocacao,
            'totalSubtotalGeral' => $totalSubtotalGeral,
            'totalDescontoGeral' => $totalDescontoGeral,
            'totalGeral' => $totalGeral,
            'totalGeralCalculado' => $totalGeralCalculado,
            'freteValor' => $freteValor,
        ]);

        $fileName = 'Proposta_' . ($proposal->numero_proposta ?? $proposal->id) . '_' . date('Y_m_d_His') . '.pdf';
        $filePath = 'proposals/' . $proposal->company_id . '/' . $fileName;

        // Save file to storage disk
        Storage::disk('local')->put($filePath, $pdf->output());

        // Log attachment to the database
        $attachment = Attachment::create([
            'company_id' => $proposal->company_id,
            'opportunity_id' => $opportunity?->id,
            'file_name' => $fileName,
            'file_path' => $filePath,
            'type' => 'Anexo de Proposta'
        ]);

        return response()->json([
            'message' => 'PDF generated and saved successfully',
            'attachment' => $attachment
        ]);
    }
}
