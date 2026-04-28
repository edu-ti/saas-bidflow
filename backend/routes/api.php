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

// Rotas públicas para dados externos
Route::get('/cnpj/{cnpj}', [\App\Http\Controllers\ExternalDataController::class, 'searchCNPJ']);
Route::get('/cep/{cep}', [\App\Http\Controllers\ExternalDataController::class, 'searchCEP']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/system/queue-health', [DashboardController::class, 'queueHealth']);
    Route::get('/audit-logs', [DashboardController::class, 'auditLogs']);
    
    Route::get('/funnel-stages', [FunnelController::class, 'stages']);
    Route::post('/funnel-stages', [FunnelController::class, 'store']);
    Route::put('/funnel-stages/{id}', [FunnelController::class, 'update']);
    Route::delete('/funnel-stages/{id}', [FunnelController::class, 'destroy']);
    
    Route::get('/opportunities', [OpportunityController::class, 'index']);
    Route::post('/opportunities', [OpportunityController::class, 'store']);
    Route::get('/opportunities/{id}', [OpportunityController::class, 'show']);
    Route::put('/opportunities/{id}', [OpportunityController::class, 'update']);
    Route::delete('/opportunities/{id}', [OpportunityController::class, 'destroy']);
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
    Route::apiResource('company-clients', \App\Http\Controllers\CompanyClientController::class);
    Route::apiResource('products', \App\Http\Controllers\ProductController::class);
    Route::apiResource('events', \App\Http\Controllers\EventController::class);
    
    // Phase 9: Financial, Radar, Marketing
    Route::apiResource('bidding-filters', \App\Http\Controllers\BiddingFilterController::class);
    Route::apiResource('accounts-payable', \App\Http\Controllers\AccountsPayableController::class);
    Route::apiResource('accounts-receivable', \App\Http\Controllers\AccountsReceivableController::class);
    Route::apiResource('email-campaigns', \App\Http\Controllers\EmailCampaignController::class);
    
    // Consignatários
    Route::apiResource('consignees', \App\Http\Controllers\ConsigneeController::class);

    // Consignações
    Route::get('/consignments/dashboard-stats', [\App\Http\Controllers\ConsignmentController::class, 'dashboardStats']);
    Route::get('/consignments/products', [\App\Http\Controllers\ConsignmentController::class, 'products']);
    Route::get('/reports/consignments', [\App\Http\Controllers\ConsignmentController::class, 'report']);
    Route::post('/consignments/{consignment}/send', [\App\Http\Controllers\ConsignmentController::class, 'send']);
    Route::post('/consignments/{consignment}/reconcile', [\App\Http\Controllers\ConsignmentController::class, 'reconcile']);
    Route::post('/consignments/{consignment}/close', [\App\Http\Controllers\ConsignmentController::class, 'close']);
    Route::apiResource('consignments', \App\Http\Controllers\ConsignmentController::class);

    // Financial Engine
    Route::prefix('financial')->group(function () {
        Route::get('/cash-flow', [\App\Http\Controllers\FinancialEngineController::class, 'cashFlowSummary']);
        Route::get('/statements', [\App\Http\Controllers\FinancialEngineController::class, 'statementsIndex']);
        Route::post('/statements', [\App\Http\Controllers\FinancialEngineController::class, 'statementsStore']);

        Route::get('/invoices', [\App\Http\Controllers\FinancialEngineController::class, 'invoicesIndex']);
        Route::post('/invoices', [\App\Http\Controllers\FinancialEngineController::class, 'invoicesStore']);
        Route::get('/invoices/{invoice}', [\App\Http\Controllers\FinancialEngineController::class, 'invoicesShow']);
        Route::post('/invoices/{invoice}/transmit', [\App\Http\Controllers\FinancialEngineController::class, 'invoicesTransmit']);
        Route::post('/invoices/{invoice}/cancel', [\App\Http\Controllers\FinancialEngineController::class, 'invoicesCancel']);

        Route::get('/bank-accounts', [\App\Http\Controllers\FinancialEngineController::class, 'bankAccountsIndex']);
        Route::post('/bank-accounts', [\App\Http\Controllers\FinancialEngineController::class, 'bankAccountsStore']);
        Route::put('/bank-accounts/{bankAccount}', [\App\Http\Controllers\FinancialEngineController::class, 'bankAccountsUpdate']);

        Route::post('/ofx-import', [\App\Http\Controllers\FinancialEngineController::class, 'importOfx']);
        Route::get('/reconciliations', [\App\Http\Controllers\FinancialEngineController::class, 'reconciliationsIndex']);
        Route::post('/reconciliation-items/{item}/reconcile', [\App\Http\Controllers\FinancialEngineController::class, 'reconcileItem']);

        Route::get('/tax-config', [\App\Http\Controllers\FinancialEngineController::class, 'taxConfigShow']);
        Route::post('/tax-config', [\App\Http\Controllers\FinancialEngineController::class, 'taxConfigSave']);
        Route::post('/tax-config/certificate', [\App\Http\Controllers\FinancialEngineController::class, 'taxConfigUploadCert']);
    });

    // Phase 9: Tenant Admin
    Route::get('/tenant/users', [\App\Http\Controllers\CompanyManagementController::class, 'usersIndex']);
    Route::post('/tenant/users', [\App\Http\Controllers\CompanyManagementController::class, 'userStore']);
    Route::put('/tenant/users/{id}', [\App\Http\Controllers\CompanyManagementController::class, 'userUpdate']);

    // CLM - Contract Lifecycle Management
    Route::apiResource('contracts', \App\Http\Controllers\ContractController::class);
    Route::patch('/contracts/{id}/status', [\App\Http\Controllers\ContractController::class, 'changeStatus']);
    Route::post('/contracts/{id}/request-approval', [\App\Http\Controllers\ContractController::class, 'requestApproval']);
    Route::post('/contracts/{id}/addendum', [\App\Http\Controllers\ContractController::class, 'addAddendum']);
    Route::get('/contracts/expiring', [\App\Http\Controllers\ContractController::class, 'getExpiring']);
    Route::get('/contracts/expired', [\App\Http\Controllers\ContractController::class, 'getExpired']);

    Route::apiResource('contract-templates', \App\Http\Controllers\ContractTemplateController::class);
    Route::get('/contract-templates/placeholders', [\App\Http\Controllers\ContractTemplateController::class, 'getPlaceholders']);

    Route::post('/contract-approvals/{approvalId}/process', [\App\Http\Controllers\ContractController::class, 'processApproval']);
});
