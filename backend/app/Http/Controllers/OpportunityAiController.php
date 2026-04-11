<?php

namespace App\Http\Controllers;

use App\Models\Opportunity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OpportunityAiController extends Controller
{
    /**
     * Webhook for receiving AI insights to update opportunity bidding_metadata.
     */
    public function updateInsights(Request $request, $id)
    {
        $validated = $request->validate([
            'insights' => 'required|array',
        ]);

        $opportunity = Opportunity::find($id);

        if (! $opportunity) {
            return response()->json(['message' => 'Opportunity not found'], 404);
        }

        // Implicit Auth check (Token comes from bot which belongs to a company, thus we secure the update)
        if ($opportunity->company_id !== Auth::user()->company_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Retrieve existing metadata or instantiate new ArrayObject
        $metadata = $opportunity->bidding_metadata ?? new \Illuminate\Database\Eloquent\Casts\ArrayObject();

        // Merge AI insights. Using standard array merge on the ArrayObject
        // Since ArrayObject acts like an array, we can iterate
        foreach ($validated['insights'] as $key => $value) {
            $metadata[$key] = $value;
        }

        $opportunity->bidding_metadata = $metadata;
        $opportunity->save();

        return response()->json([
            'message' => 'AI insights merged successfully',
            'opportunity' => $opportunity
        ]);
    }
}
