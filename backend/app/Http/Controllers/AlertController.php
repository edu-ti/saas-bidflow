<?php

namespace App\Http\Controllers;

use App\Http\Resources\BiddingAlertResource;
use App\Models\BiddingAlert;
use App\Models\Opportunity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\Http;

class AlertController extends Controller
{
    /**
     * Store a newly created bidding alert and notify via Telegram.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'opportunity_id' => 'required|integer',
            'type' => 'required|string',
            'content' => 'nullable|string',
            'raw_data' => 'nullable|array',
            'is_read' => 'boolean',
            'alert_date' => 'nullable|date',
        ]);

        $opportunity = Opportunity::find($validated['opportunity_id']);

        if (! $opportunity) {
            return response()->json(['message' => 'Opportunity not found or does not belong to your company.'], 404);
        }

        if ($opportunity->company_id !== Auth::user()->company_id) {
            return response()->json(['message' => 'Unauthorized opportunity.'], 403);
        }

        $alert = BiddingAlert::create($validated);

        // Telegram Notification Logic
        $user = $opportunity->user;
        if ($user && $user->telegram_chat_id) {
            $botToken = env('TELEGRAM_BOT_TOKEN', 'YOUR_DEFAULT_TOKEN');
            $message = "🔔 *Novo Alerta do Robô BidFlow*\n\n"
                     . "🏷 *Licitação:* {$opportunity->title}\n"
                     . "📋 *Alerta:* {$alert->type}\n"
                     . "💬 *Detalhes:* {$alert->content}\n\n"
                     . "🔗 [Acessar Oportunidade](" . url("/opportunities/{$opportunity->id}") . ")";

            try {
                Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                    'chat_id' => $user->telegram_chat_id,
                    'text' => $message,
                    'parse_mode' => 'Markdown'
                ]);
            } catch (\Exception $e) {
                // Fail silently to not impact robot routine
            }
        }

        return new BiddingAlertResource($alert);
    }
}
