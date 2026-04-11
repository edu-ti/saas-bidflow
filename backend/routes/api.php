<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\ProposalController;
use App\Http\Controllers\OpportunityAiController;
use App\Http\Controllers\OpportunityController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;

// Public routes (no auth needed)
Route::post('/login', [AuthController::class, 'login']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/opportunities', [OpportunityController::class, 'index']);
    Route::patch('/opportunities/{id}/move', [OpportunityController::class, 'move']);
    Route::post('/opportunities/{id}/ai-insights', [OpportunityAiController::class, 'updateInsights']);
    Route::get('/alerts', [AlertController::class, 'index']);
    Route::post('/alerts', [AlertController::class, 'store']);
    Route::apiResource('organizations', OrganizationController::class)->only(['index', 'store', 'show']);
    Route::post('/proposals', [ProposalController::class, 'store']);
    Route::post('/proposals/{id}/generate-pdf', [ProposalController::class, 'generatePdf']);
});
