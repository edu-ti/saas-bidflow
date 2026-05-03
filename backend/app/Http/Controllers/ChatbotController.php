<?php

namespace App\Http\Controllers;

use App\Models\ChatbotFlow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatbotController extends Controller
{
    public function index()
    {
        return ChatbotFlow::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nodes' => 'nullable|array',
            'connections' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $flow = ChatbotFlow::create($validated);

        return response()->json($flow, 201);
    }

    public function show($id)
    {
        return ChatbotFlow::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $flow = ChatbotFlow::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'nodes' => 'nullable|array',
            'connections' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $flow->update($validated);

        return $flow;
    }

    public function destroy($id)
    {
        $flow = ChatbotFlow::findOrFail($id);
        $flow->delete();

        return response()->json(null, 204);
    }

    public function active()
    {
        return ChatbotFlow::where('is_active', true)->first();
    }

    public function setActive($id)
    {
        // Deactivate all others for this company
        ChatbotFlow::where('company_id', Auth::user()->company_id)
            ->update(['is_active' => false]);

        $flow = ChatbotFlow::findOrFail($id);
        $flow->update(['is_active' => true]);

        return $flow;
    }
}