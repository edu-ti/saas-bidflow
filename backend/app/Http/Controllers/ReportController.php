<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    protected ReportService $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function overview(Request $request)
    {
        $data = $this->reportService->getOverview($request);
        return response()->json($data);
    }

    public function bidding(Request $request)
    {
        $metrics = $this->reportService->getBiddingMetrics($request);
        $funnel = $this->reportService->getBiddingFunnel($request);

        return response()->json([
            'metrics' => $metrics,
            'funnel' => $funnel,
        ]);
    }

    public function biddingFunnel(Request $request)
    {
        $funnel = $this->reportService->getBiddingFunnel($request);
        return response()->json($funnel);
    }

    public function financial(Request $request)
    {
        $health = $this->reportService->getFinancialHealth($request);
        $timeline = $this->reportService->getFinancialTimeline($request);

        return response()->json([
            'health' => $health,
            'timeline' => $timeline,
        ]);
    }

    public function financialHealth(Request $request)
    {
        $health = $this->reportService->getFinancialHealth($request);
        return response()->json($health);
    }

    public function financialTimeline(Request $request)
    {
        $timeline = $this->reportService->getFinancialTimeline($request);
        return response()->json($timeline);
    }

    public function teamPerformance(Request $request)
    {
        $performance = $this->reportService->getTeamPerformance($request);
        return response()->json($performance);
    }

    public function sales(Request $request)
    {
        $metrics = $this->reportService->getSalesMetrics($request);
        return response()->json($metrics);
    }

    public function suppliers(Request $request)
    {
        $performance = $this->reportService->getSupplierPerformance($request);
        return response()->json($performance);
    }

    public function lossAnalysis(Request $request)
    {
        $analysis = $this->reportService->getLossAnalysis($request);
        return response()->json($analysis);
    }

    public function users(Request $request)
    {
        $users = \App\Models\User::where('company_id', Auth::user()->company_id)
            ->select('id', 'name', 'email')
            ->get();

        return response()->json($users);
    }

    public function availableSuppliers(Request $request)
    {
        $suppliers = \App\Models\Supplier::where('company_id', Auth::user()->company_id)
            ->select('id', 'name')
            ->get();

        return response()->json($suppliers);
    }
}