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

    public function export(Request $request)
    {
        $type = $request->get('type', 'pdf');
        $tab = $request->get('tab', 'overview');

        if ($tab === 'overview') {
            $data = $this->reportService->getOverview($request);
        } elseif ($tab === 'bidding') {
            $data = $this->reportService->getBiddingMetrics($request);
        } elseif ($tab === 'sales') {
            $data = $this->reportService->getSalesMetrics($request);
        } elseif ($tab === 'suppliers') {
            $data = $this->reportService->getSupplierPerformance($request);
        } elseif ($tab === 'team') {
            $data = $this->reportService->getTeamPerformance($request);
        } else {
            $data = [];
        }

        if ($type === 'excel') {
            return $this->exportCsv($data, $tab);
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.export', ['data' => $data, 'tab' => $tab])->setPaper('a4', 'landscape');
        return $pdf->download("relatorio_{$tab}.pdf");
    }

    private function exportCsv($data, $tab)
    {
        $filename = "relatorio_{$tab}.csv";
        
        ob_start();
        $handle = fopen('php://output', 'w');
        
        // Add BOM for UTF-8 Excel compatibility
        fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

        if (is_array($data) && count($data) > 0) {
             if (isset($data[0]) && is_array($data[0])) {
                 fputcsv($handle, array_keys($data[0]), ';');
                 foreach ($data as $row) {
                     fputcsv($handle, array_values($row), ';');
                 }
             } else {
                 fputcsv($handle, array_keys($data), ';');
                 fputcsv($handle, array_values($data), ';');
             }
        } else {
            fputcsv($handle, ['Nenhum dado encontrado'], ';');
        }

        fclose($handle);
        $csv = ob_get_clean();

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}