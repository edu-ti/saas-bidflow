<?php

namespace App\Http\Controllers;

use App\Models\BiddingAlert;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RpaController extends Controller
{
    /**
     * Webhook para receber dados do robô RPA.
     * POST /api/webhook/rpa/bids
     */
    public function handleBids(Request $request)
    {
        $secret = $request->header('X-RPA-Token');
        if ($secret !== env('RPA_WEBHOOK_SECRET')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'company_id'     => 'required|exists:companies,id',
            'agency'         => 'required|string',
            'object'         => 'required|string',
            'estimated_value'=> 'nullable|numeric',
            'opening_date'   => 'nullable|date',
            'notice_link'    => 'nullable|url',
            'uf'             => 'nullable|string|max:2',
        ]);

        $alert = BiddingAlert::create([
            'company_id' => $validated['company_id'],
            'type'       => 'RPA_RADAR',
            'content'    => $validated['object'],
            'raw_data'   => $validated,
            'alert_date' => now(),
            'is_read'    => false,
        ]);

        Log::info("RPA Bid received for company {$validated['company_id']}", ['alert_id' => $alert->id]);

        return response()->json([
            'message' => 'Bid processed successfully',
            'id' => $alert->id
        ], 201);
    }
}
