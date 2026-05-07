<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class MasterDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        Log::channel('structured')->info('master_panel_access', [
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
            'host' => request()->getHost(),
            'timestamp' => now()->toIso8601String(),
        ]);

        return response()->json([
            'panel' => 'master',
            'status' => 'ok',
        ]);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'total_tenants' => 0,
            'active_users' => 0,
        ]);
    }
}