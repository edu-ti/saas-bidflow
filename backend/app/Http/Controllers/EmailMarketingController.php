<?php

namespace App\Http\Controllers;

use App\Models\EmailCampaign;
use App\Models\EmailRecipient;
use App\Models\Lead;
use Illuminate\Http\Request;

class EmailMarketingController extends Controller
{
    public function index(Request $request)
    {
        $query = EmailCampaign::where('company_id', $request->user()->company_id);

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
            'body' => 'nullable|string',
            'recipient_emails' => 'nullable|array',
            'recipient_lead_ids' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
        ]);

        $companyId = $request->user()->company_id;

        $recipientCount = 0;

        if (!empty($validated['recipient_lead_ids'])) {
            $leadEmails = Lead::where('company_id', $companyId)
                ->whereIn('id', $validated['recipient_lead_ids'])
                ->whereNotNull('email')
                ->pluck('email')
                ->toArray();
            $recipientCount = count($leadEmails);
        } elseif (!empty($validated['recipient_emails'])) {
            $recipientCount = count($validated['recipient_emails']);
        }

        $validated['company_id'] = $companyId;
        $validated['status'] = !empty($validated['scheduled_at']) ? 'scheduled' : 'draft';
        $validated['recipient_count'] = $recipientCount;

        $campaign = EmailCampaign::create($validated);

        if (!empty($validated['recipient_lead_ids'])) {
            $leads = Lead::where('company_id', $companyId)
                ->whereIn('id', $validated['recipient_lead_ids'])
                ->whereNotNull('email')
                ->get();

            foreach ($leads as $lead) {
                EmailRecipient::create([
                    'company_id' => $companyId,
                    'email_campaign_id' => $campaign->id,
                    'email' => $lead->email,
                    'name' => $lead->name ?? null,
                    'status' => 'pending',
                ]);
            }
        } elseif (!empty($validated['recipient_emails'])) {
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
            'campaign' => $campaign->load('recipients'),
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
            'body' => 'nullable|string',
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

        $campaign->update([
            'status' => 'sending',
            'sent_at' => now(),
        ]);

        $recipients = $campaign->recipients()->where('status', 'pending')->get();

        $sentCount = 0;

        foreach ($recipients as $recipient) {
            try {
                $this->sendEmail($recipient->email, $campaign->subject, $campaign->body);
                
                $recipient->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);
                
                $sentCount++;
            } catch (\Exception $e) {
                $recipient->update([
                    'status' => 'failed',
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $campaign->update([
            'status' => 'sent',
            'sent_count' => $sentCount,
        ]);

        return response()->json([
            'message' => 'Campanha enviada',
            'campaign' => $campaign,
        ]);
    }

    protected function sendEmail(string $to, string $subject, string $body): bool
    {
        $config = config('mail');

        if ($config['driver'] === 'smtp') {
            return $this->sendViaSMTP($to, $subject, $body);
        }

        return true;
    }

    protected function sendViaSMTP(string $to, string $subject, string $body): bool
    {
        return true;
    }

    public function searchLeads(Request $request)
    {
        $search = $request->get('search', '');
        
        $leads = Lead::where('company_id', $request->user()->company_id)
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