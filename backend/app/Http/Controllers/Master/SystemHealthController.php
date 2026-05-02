<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SystemHealthController extends Controller
{
    public function index()
    {
        $jobsCount = DB::table('jobs')->count();
        $failedJobsCount = DB::table('failed_jobs')->count();

        return response()->json([
            'jobs_count' => $jobsCount,
            'failed_jobs_count' => $failedJobsCount,
        ]);
    }
}
