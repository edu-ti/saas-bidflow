<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    public function index(Request $request)
    {
        $query = Campaign::where('company_id', $request->user()->company_id);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('channel') && $request->channel) {
            $query->where('channel', $request->channel);
        }

        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $campaigns = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($campaigns);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'channel' => 'nullable|in:whatsapp,email,sms',
            'status' => 'nullable|in:draft,active,scheduled,paused,completed',
            'sent' => 'nullable|integer|min:0',
            'open_rate' => 'nullable|string|max:10',
            'message' => 'nullable|string',
            'recipients' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
        ]);

        $validated['company_id'] = $request->user()->company_id;
        $validated['status'] = $validated['status'] ?? 'draft';
        $validated['channel'] = $validated['channel'] ?? 'whatsapp';
        $validated['sent'] = $validated['sent'] ?? 0;
        $validated['open_rate'] = $validated['open_rate'] ?? '0%';

        $campaign = Campaign::create($validated);

        return response()->json([
            'message' => 'Campanha criada com sucesso',
            'campaign' => $campaign,
        ], 201);
    }

    public function show($id)
    {
        $campaign = Campaign::findOrFail($id);
        return response()->json($campaign);
    }

    public function update(Request $request, $id)
    {
        $campaign = Campaign::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'channel' => 'sometimes|in:whatsapp,email,sms',
            'status' => 'sometimes|in:draft,active,scheduled,paused,completed',
            'sent' => 'nullable|integer|min:0',
            'open_rate' => 'nullable|string|max:10',
            'message' => 'nullable|string',
            'recipients' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
        ]);

        $campaign->update($validated);

        return response()->json([
            'message' => 'Campanha atualizada',
            'campaign' => $campaign,
        ]);
    }

    public function destroy($id)
    {
        $campaign = Campaign::findOrFail($id);
        $campaign->delete();

        return response()->json(['message' => 'Campanha excluída']);
    }

    public function stats(Request $request)
    {
        $companyId = $request->user()->company_id;

        $totalSent = Campaign::where('company_id', $companyId)->sum('sent');
        $activeCampaigns = Campaign::where('company_id', $companyId)
            ->where('status', 'active')
            ->count();
        $scheduledCampaigns = Campaign::where('company_id', $companyId)
            ->where('status', 'scheduled')
            ->count();

        return response()->json([
            'total_sent' => $totalSent,
            'active' => $activeCampaigns,
            'scheduled' => $scheduledCampaigns,
        ]);
    }
}