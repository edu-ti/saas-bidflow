<?php

namespace App\Http\Controllers;

use App\Models\ChatbotFlow;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    public function index(Request $request)
    {
        $flows = ChatbotFlow::where('company_id', $request->user()->company_id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($flows);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'nodes' => 'nullable|array',
            'connections' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['company_id'] = $request->user()->company_id;
        $validated['name'] = $validated['name'] ?? 'Fluxo Principal';

        $flow = ChatbotFlow::create($validated);

        return response()->json([
            'message' => 'Fluxo de chatbot criado com sucesso',
            'flow' => $flow,
        ], 201);
    }

    public function show($id)
    {
        $flow = ChatbotFlow::findOrFail($id);
        return response()->json($flow);
    }

    public function update(Request $request, $id)
    {
        $flow = ChatbotFlow::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'nodes' => 'nullable|array',
            'connections' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $flow->update($validated);

        return response()->json([
            'message' => 'Fluxo atualizado com sucesso',
            'flow' => $flow,
        ]);
    }

    public function destroy($id)
    {
        $flow = ChatbotFlow::findOrFail($id);
        $flow->delete();

        return response()->json(['message' => 'Fluxo deletado com sucesso']);
    }

    public function active(Request $request)
    {
        $flow = ChatbotFlow::where('company_id', $request->user()->company_id)
            ->where('is_active', true)
            ->first();

        return response()->json($flow);
    }

    public function setActive(Request $request, $id)
    {
        ChatbotFlow::where('company_id', $request->user()->company_id)
            ->update(['is_active' => false]);

        $flow = ChatbotFlow::findOrFail($id);
        $flow->update(['is_active' => true]);

        return response()->json([
            'message' => 'Fluxo ativado com sucesso',
            'flow' => $flow,
        ]);
    }
}