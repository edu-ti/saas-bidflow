<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use Illuminate\Http\Request;
use App\Http\Resources\LeadResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;

class LeadController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Lead::class);
        $leads = Lead::latest()->where('company_id', Auth::user()->company_id)->get();
        return LeadResource::collection($leads);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Lead::class);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:Novo,Contactado,Qualificado,Perdido',
            'source' => 'nullable|string|max:255',
            'temperature' => 'nullable|in:Frio,Morno,Quente',
        ]);

        $validated['company_id'] = Auth::user()->company_id;
        $lead = Lead::create($validated);
        return new LeadResource($lead);
    }

    public function show($id)
    {
        $lead = Lead::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('view', $lead);
        return new LeadResource($lead);
    }

    public function update(Request $request, $id)
    {
        $lead = Lead::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('update', $lead);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:Novo,Contactado,Qualificado,Perdido',
            'source' => 'nullable|string|max:255',
            'temperature' => 'nullable|in:Frio,Morno,Quente',
        ]);

        $lead->update($validated);
        return new LeadResource($lead);
    }

    public function destroy($id)
    {
        $lead = Lead::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('delete', $lead);
        $lead->delete();
        return response()->noContent();
    }
}
