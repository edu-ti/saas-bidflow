<?php

namespace App\Http\Controllers;

use App\Models\EmailCampaign;
use Illuminate\Http\Request;
use App\Http\Resources\EmailCampaignResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\EmailCampaignMail;

class EmailCampaignController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', EmailCampaign::class);
        $campaigns = EmailCampaign::latest()->where('company_id', Auth::user()->company_id)->get();
        return EmailCampaignResource::collection($campaigns);
    }

    public function store(Request $request)
    {
        $this->authorize('create', EmailCampaign::class);
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'html_body' => 'required|string',
            'target_audience' => 'nullable|array',
            'status' => 'nullable|in:Draft,Scheduled,Sent',
            'sent_at' => 'nullable|date',
        ]);

        $validated['company_id'] = Auth::user()->company_id;
        $campaign = EmailCampaign::create($validated);
        return new EmailCampaignResource($campaign);
    }

    public function show($id)
    {
        $emailCampaign = EmailCampaign::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('view', $emailCampaign);
        return new EmailCampaignResource($emailCampaign);
    }

    public function update(Request $request, $id)
    {
        $emailCampaign = EmailCampaign::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('update', $emailCampaign);
        $validated = $request->validate([
            'subject' => 'sometimes|required|string|max:255',
            'html_body' => 'sometimes|required|string',
            'target_audience' => 'nullable|array',
            'status' => 'nullable|in:Draft,Scheduled,Sent',
            'sent_at' => 'nullable|date',
        ]);

        $emailCampaign->update($validated);
        
        // Se marcar como "Sent", tentar enviar o e-mail (simulação/teste)
        if ($request->status === 'Sent' && !$emailCampaign->sent_at) {
            // Em produção leria os targets (Leads) e faria batch
            // Aqui vamos loggar ou enviar para um email de teste configurado do sistema
            // Vamos iterar os targets ou apenas marcar como enviado localmente.
            /* 
            Mail::to('teste@bidflow.com')->send(new EmailCampaignMail(
                $emailCampaign->subject,
                $emailCampaign->html_body
            )); 
            */
            $emailCampaign->update(['sent_at' => now()]);
        }

        return new EmailCampaignResource($emailCampaign);
    }

    public function destroy($id)
    {
        $emailCampaign = EmailCampaign::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('delete', $emailCampaign);
        $emailCampaign->delete();
        return response()->noContent();
    }
}
