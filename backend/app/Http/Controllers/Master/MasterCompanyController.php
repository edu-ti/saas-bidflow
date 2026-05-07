<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MasterCompanyController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'panel' => 'master',
            'data' => [],
        ]);
    }
}