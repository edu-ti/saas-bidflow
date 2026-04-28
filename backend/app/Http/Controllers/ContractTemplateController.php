<?php

namespace App\Http\Controllers;

use App\Models\ContractTemplate;
use Illuminate\Http\Request;

class ContractTemplateController extends Controller
{
    public function index(Request $request)
    {
        $query = ContractTemplate::query();

        if ($request->has('active')) {
            $query->where('active', $request->boolean('active'));
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $templates = $query->orderBy('name')
            ->paginate($request->get('per_page', 20));

        return response()->json($templates);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:servico,aluguel,compra,parceria,fornecimento,outros',
            'content' => 'required|string',
            'active' => 'nullable|boolean',
        ]);

        $template = ContractTemplate::create([
            'company_id' => $request->user()->company_id,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'content' => $validated['content'],
            'active' => $validated['active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Template criado com sucesso',
            'template' => $template,
        ], 201);
    }

    public function show($id)
    {
        $template = ContractTemplate::findOrFail($id);
        return response()->json($template);
    }

    public function update(Request $request, $id)
    {
        $template = ContractTemplate::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|in:servico,aluguel,compra,parceria,fornecimento,outros',
            'content' => 'sometimes|string',
            'active' => 'nullable|boolean',
        ]);

        $template->update($validated);

        return response()->json([
            'message' => 'Template atualizado com sucesso',
            'template' => $template,
        ]);
    }

    public function destroy($id)
    {
        $template = ContractTemplate::findOrFail($id);

        $activeContracts = $template->contracts()->count();

        if ($activeContracts > 0) {
            return response()->json([
                'message' => 'Não é possível excluir template com contratos associados'
            ], 422);
        }

        $template->delete();

        return response()->json(['message' => 'Template excluído com sucesso']);
    }

    public function getPlaceholders()
    {
        return response()->json([
            'placeholders' => [
                'client_name' => 'Nome do cliente',
                'client_document' => 'CPF/CNPJ',
                'client_trade_name' => 'Nome fantasia (PJ)',
                'client_corporate_name' => 'Razão social',
                'client_email' => 'E-mail',
                'client_phone' => 'Telefone',
                'client_address' => 'Endereço',
                'client_city' => 'Cidade',
                'client_state' => 'Estado',
                'client_uasg' => 'UASG (para orgãos públicos)',
                'client_sphere' => 'Esfera (Federal/Estadual/Municipal)',
                'contract_date' => 'Data atual do contrato',
                'contract_year' => 'Ano atual',
                'contract_month' => 'Mês atual',
                'contract_day' => 'Dia atual',
            ],
        ]);
    }
}
