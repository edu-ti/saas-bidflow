<?php

namespace App\Http\Controllers;

use App\Models\EmailCampaign;
use App\Models\EmailRecipient;
use App\Models\Lead;
use App\Models\CompanyClient;
use App\Jobs\ProcessEmailCampaignJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EmailMarketingController extends Controller
{
    public function index(Request $request)
    {
        $query = EmailCampaign::where('company_id', Auth::user()->company_id);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $query->where('subject', 'like', "%{$request->search}%");
        }

        $campaigns = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($campaigns);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'image_url' => 'nullable|string',
            'body' => 'required|string',
            'target_audience' => 'required|string|in:all_leads,all_clients,manual',
            'recipient_emails' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
        ]);

        $companyId = Auth::user()->company_id;
        $recipientCount = 0;

        // Calculate recipient count
        if ($validated['target_audience'] === 'all_leads') {
            $recipientCount = Lead::where('company_id', $companyId)->whereNotNull('email')->count();
        } elseif ($validated['target_audience'] === 'all_clients') {
            $recipientCount = CompanyClient::where('company_id', $companyId)->whereNotNull('email')->count();
        } elseif ($validated['target_audience'] === 'manual' && !empty($validated['recipient_emails'])) {
            $recipientCount = count($validated['recipient_emails']);
        }

        $campaign = EmailCampaign::create([
            'company_id' => $companyId,
            'name' => $validated['name'],
            'subject' => $validated['subject'],
            'image_url' => $validated['image_url'] ?? null,
            'body' => $validated['body'],
            'target_audience' => $validated['target_audience'],
            'status' => 'draft',
            'recipient_count' => $recipientCount,
            'scheduled_at' => $validated['scheduled_at'] ?? null,
        ]);

        // If manual, create recipients now
        if ($validated['target_audience'] === 'manual' && !empty($validated['recipient_emails'])) {
            foreach ($validated['recipient_emails'] as $email) {
                EmailRecipient::create([
                    'company_id' => $companyId,
                    'email_campaign_id' => $campaign->id,
                    'email' => $email,
                    'status' => 'pending',
                ]);
            }
        }

        return response()->json([
            'message' => 'Campanha criada com sucesso',
            'campaign' => $campaign,
        ], 201);
    }

    public function show($id)
    {
        $campaign = EmailCampaign::with(['recipients' => function ($q) {
            $q->limit(100);
        }])->findOrFail($id);

        return response()->json($campaign);
    }

    public function update(Request $request, $id)
    {
        $campaign = EmailCampaign::findOrFail($id);

        if ($campaign->status !== 'draft') {
            return response()->json([
                'message' => 'Apenas campanhas em rascunho podem ser editadas'
            ], 422);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'subject' => 'sometimes|string|max:255',
            'image_url' => 'nullable|string',
            'body' => 'sometimes|string',
            'target_audience' => 'sometimes|string|in:all_leads,all_clients,manual',
        ]);

        $campaign->update($validated);

        return response()->json([
            'message' => 'Campanha atualizada',
            'campaign' => $campaign,
        ]);
    }

    public function destroy($id)
    {
        $campaign = EmailCampaign::findOrFail($id);

        if ($campaign->status === 'sending') {
            return response()->json([
                'message' => 'Não é possível excluir campanha em envio'
            ], 422);
        }

        $campaign->delete();

        return response()->json(['message' => 'Campanha excluída']);
    }

    public function send(Request $request, $id)
    {
        $campaign = EmailCampaign::findOrFail($id);

        if ($campaign->status !== 'draft' && $campaign->status !== 'scheduled') {
            return response()->json([
                'message' => 'Campanha não pode ser enviada neste status'
            ], 422);
        }

        // Dispatch Job
        ProcessEmailCampaignJob::dispatch($campaign);

        return response()->json([
            'message' => 'Disparo de campanha iniciado em segundo plano',
            'status' => 'sending'
        ]);
    }

    public function searchLeads(Request $request)
    {
        $search = $request->get('search', '');
        
        $leads = Lead::where('company_id', Auth::user()->company_id)
            ->whereNotNull('email')
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->limit(20)
            ->get(['id', 'name', 'email']);

        return response()->json($leads);
    }
}