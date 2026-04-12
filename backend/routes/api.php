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
use App\Http\Controllers\FunnelController;

// Public routes (no auth needed)
Route::post('/login', [AuthController::class, 'login']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/system/queue-health', [DashboardController::class, 'queueHealth']);
    Route::get('/audit-logs', [DashboardController::class, 'auditLogs']);
    Route::get('/funnel-stages', [FunnelController::class, 'stages']);
    Route::get('/opportunities', [OpportunityController::class, 'index']);
    Route::patch('/opportunities/{id}/move', [OpportunityController::class, 'move']);
    Route::post('/opportunities/{id}/ai-insights', [OpportunityAiController::class, 'updateInsights']);
    Route::post('/opportunities/{id}/attachments', [OpportunityController::class, 'uploadAttachment']);
    
    // Phase 10: AI Jobs & Automation
    Route::post('/opportunities/{id}/predict', [OpportunityAiController::class, 'predict']);
    Route::post('/opportunities/{id}/parse-notice', [OpportunityAiController::class, 'parseNotice']);
    Route::get('/opportunities/{id}/proposal-draft/pdf', [OpportunityAiController::class, 'generateDraftPdf']);

    Route::get('/alerts', [AlertController::class, 'index']);
    Route::post('/alerts', [AlertController::class, 'store']);
    Route::apiResource('organizations', OrganizationController::class)->only(['index', 'store', 'show']);
    Route::post('/proposals', [ProposalController::class, 'store']);
    Route::post('/proposals/{id}/generate-pdf', [ProposalController::class, 'generatePdf']);
    
    // CRM & Agenda migrations
    Route::apiResource('leads', \App\Http\Controllers\LeadController::class);
    Route::apiResource('contacts', \App\Http\Controllers\ContactController::class);
    Route::apiResource('individual-clients', \App\Http\Controllers\IndividualClientController::class);
    Route::apiResource('products', \App\Http\Controllers\ProductController::class);
    Route::apiResource('events', \App\Http\Controllers\EventController::class);
    
    // Phase 9: Financial, Radar, Marketing
    Route::apiResource('bidding-filters', \App\Http\Controllers\BiddingFilterController::class);
    Route::apiResource('accounts-payable', \App\Http\Controllers\AccountsPayableController::class);
    Route::apiResource('accounts-receivable', \App\Http\Controllers\AccountsReceivableController::class);
    Route::apiResource('email-campaigns', \App\Http\Controllers\EmailCampaignController::class);
    
    // Phase 9: Tenant Admin
    Route::get('/tenant/users', [\App\Http\Controllers\CompanyManagementController::class, 'usersIndex']);
    Route::post('/tenant/users', [\App\Http\Controllers\CompanyManagementController::class, 'userStore']);
    Route::put('/tenant/users/{id}', [\App\Http\Controllers\CompanyManagementController::class, 'userUpdate']);
});
