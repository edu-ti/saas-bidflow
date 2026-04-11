<?php

namespace App\Http\Controllers;

use App\Models\Funnel;
use App\Models\FunnelStage;
use Illuminate\Http\Request;

class FunnelController extends Controller
{
    /**
     * List all stages for the authenticated user's company funnels.
     */
    public function stages(Request $request)
    {
        $stages = FunnelStage::with('funnel')
            ->orderBy('order')
            ->get();

        return response()->json($stages);
    }
}
