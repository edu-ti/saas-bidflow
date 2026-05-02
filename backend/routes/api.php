<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\ProposalController;
use App\Http\Controllers\OpportunityController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FunnelController;
use App\Http\Controllers\CompanyManagementController;

// Public routes (no auth needed)
Route::post('/login', [AuthController::class, 'login']);

// Rotas públicas para dados externos
Route::get('/cnpj/{cnpj}', [\App\Http\Controllers\ExternalDataController::class, 'searchCNPJ']);
Route::get('/cep/{cep}', [\App\Http\Controllers\ExternalDataController::class, 'searchCEP']);

Route::get('/user', function (Request $request) {
    $user = $request->user();
    $company = $user->company;
    $plan = $company ? $company->plan : null;
    $features = $plan && is_array($plan->features) ? $plan->features : [];
    $addons = $company && is_array($company->addons) ? $company->addons : [];
    
    $userData = $user->toArray();
    $userData['allowed_modules'] = array_values(array_unique(array_merge($features, $addons)));
    
    return $userData;
})->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'throttle:api', 'tenant.status'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/system/queue-health', [DashboardController::class, 'queueHealth']);
    Route::get('/audit-logs', [DashboardController::class, 'auditLogs']);
    
    Route::middleware('feature:commercial')->group(function () {
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
        Route::post('/opportunities/{id}/ai-insights', [OpportunityController::class, 'updateInsights']);
        Route::post('/opportunities/{id}/attachments', [OpportunityController::class, 'uploadAttachment']);
        
        // Phase 10: AI Jobs & Automation
        Route::post('/opportunities/{id}/predict', [OpportunityController::class, 'predict']);
        Route::post('/opportunities/{id}/parse-notice', [OpportunityController::class, 'parseNotice']);
        Route::get('/opportunities/{id}/proposal-draft/pdf', [OpportunityController::class, 'generateDraftPdf']);
    });

    Route::middleware('feature:bidding')->group(function () {
        Route::get('/alerts', [AlertController::class, 'index']);
        Route::post('/alerts', [AlertController::class, 'store']);
    });
    
    // Organizations (consolidated under CompanyManagementController)
    Route::get('/organizations', [CompanyManagementController::class, 'organizationIndex']);
    Route::post('/organizations', [CompanyManagementController::class, 'organizationStore']);
    Route::get('/organizations/{id}', [CompanyManagementController::class, 'organizationShow']);
    Route::middleware('feature:commercial')->group(function () {
        Route::post('/proposals', [ProposalController::class, 'store']);
        Route::post('/proposals/{id}/generate-pdf', [ProposalController::class, 'generatePdf']);
        
        // CRM & Agenda migrations
        Route::apiResource('leads', \App\Http\Controllers\LeadController::class);
        Route::apiResource('contacts', \App\Http\Controllers\ContactController::class);
        Route::apiResource('individual-clients', \App\Http\Controllers\IndividualClientController::class);
        Route::apiResource('company-clients', \App\Http\Controllers\CompanyClientController::class);
        Route::apiResource('products', \App\Http\Controllers\ProductController::class);
        Route::apiResource('events', \App\Http\Controllers\EventController::class);
    });
    
    // Phase 9: Financial, Radar, Marketing
    Route::middleware('feature:bidding')->group(function () {
        Route::apiResource('bidding-filters', \App\Http\Controllers\BiddingFilterController::class);
    });
    Route::middleware('feature:financial')->group(function () {
        Route::apiResource('accounts-payable', \App\Http\Controllers\AccountsPayableController::class);
        Route::apiResource('accounts-receivable', \App\Http\Controllers\AccountsReceivableController::class);
    });
    Route::middleware('feature:marketing')->group(function () {
        Route::apiResource('email-campaigns', \App\Http\Controllers\EmailCampaignController::class);
    });
    
    Route::middleware('feature:inventory')->group(function () {
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
    });

    // Financial Engine
    Route::middleware('feature:financial')->prefix('financial')->group(function () {
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

        Route::post('/ofx-upload', [\App\Http\Controllers\FinancialEngineController::class, 'ofxUpload']);
        Route::get('/reconciliation/{account_id}', [\App\Http\Controllers\FinancialEngineController::class, 'reconciliationItems']);
        Route::post('/reconcile', [\App\Http\Controllers\FinancialEngineController::class, 'reconcile']);

        Route::get('/tax-config', [\App\Http\Controllers\FinancialEngineController::class, 'taxConfigShow']);
        Route::post('/tax-config', [\App\Http\Controllers\FinancialEngineController::class, 'taxConfigSave']);
        Route::post('/tax-config/certificate', [\App\Http\Controllers\FinancialEngineController::class, 'taxConfigUploadCert']);
    });

    // Phase 9: Tenant Admin
    Route::get('/tenant/users', [\App\Http\Controllers\CompanyManagementController::class, 'usersIndex']);
    Route::post('/tenant/users', [\App\Http\Controllers\CompanyManagementController::class, 'userStore']);
    Route::put('/tenant/users/{id}', [\App\Http\Controllers\CompanyManagementController::class, 'userUpdate']);
    Route::delete('/tenant/users/{id}', [\App\Http\Controllers\CompanyManagementController::class, 'userDestroy']);
    
    // Companies
    Route::get('/companies/{id}', [\App\Http\Controllers\CompanyManagementController::class, 'companyShow']);
    Route::put('/companies/{id}', [\App\Http\Controllers\CompanyManagementController::class, 'companyUpdate']);

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

    // Inventory / Estoque
    Route::get('/inventory/dashboard', [\App\Http\Controllers\InventoryController::class, 'dashboard']);
    Route::get('/inventory/products', [\App\Http\Controllers\InventoryController::class, 'index']);
    Route::post('/inventory/products', [\App\Http\Controllers\InventoryController::class, 'store']);
    Route::get('/inventory/products/{id}', [\App\Http\Controllers\InventoryController::class, 'show']);
    Route::put('/inventory/products/{id}', [\App\Http\Controllers\InventoryController::class, 'update']);
    Route::delete('/inventory/products/{id}', [\App\Http\Controllers\InventoryController::class, 'destroy']);

    Route::get('/inventory/brands', [\App\Http\Controllers\InventoryController::class, 'brands']);
    Route::post('/inventory/brands', [\App\Http\Controllers\InventoryController::class, 'createBrand']);
    Route::get('/inventory/categories', [\App\Http\Controllers\InventoryController::class, 'categories']);
    Route::post('/inventory/categories', [\App\Http\Controllers\InventoryController::class, 'createCategory']);
    Route::get('/inventory/units', [\App\Http\Controllers\InventoryController::class, 'units']);
    Route::post('/inventory/units', [\App\Http\Controllers\InventoryController::class, 'createUnit']);
    Route::get('/inventory/sizes', [\App\Http\Controllers\InventoryController::class, 'sizes']);
    Route::post('/inventory/sizes', [\App\Http\Controllers\InventoryController::class, 'createSize']);
    Route::get('/inventory/statuses', [\App\Http\Controllers\InventoryController::class, 'statuses']);
    Route::post('/inventory/statuses', [\App\Http\Controllers\InventoryController::class, 'createStatus']);
    Route::get('/inventory/labels', [\App\Http\Controllers\InventoryController::class, 'labels']);
    Route::post('/inventory/labels', [\App\Http\Controllers\InventoryController::class, 'createLabel']);
    Route::get('/inventory/depots', [\App\Http\Controllers\InventoryController::class, 'depots']);
    Route::post('/inventory/depots', [\App\Http\Controllers\InventoryController::class, 'createDepot']);
    Route::get('/inventory/movements', [\App\Http\Controllers\InventoryController::class, 'movements']);
    Route::post('/inventory/movements', [\App\Http\Controllers\InventoryController::class, 'createMovement']);

    Route::middleware('feature:marketing')->group(function () {
        // Campanhas
        Route::get('/campaigns', [\App\Http\Controllers\CampaignController::class, 'index']);
        Route::post('/campaigns', [\App\Http\Controllers\CampaignController::class, 'store']);
        Route::get('/campaigns/{id}', [\App\Http\Controllers\CampaignController::class, 'show']);
        Route::put('/campaigns/{id}', [\App\Http\Controllers\CampaignController::class, 'update']);
        Route::delete('/campaigns/{id}', [\App\Http\Controllers\CampaignController::class, 'destroy']);
        Route::get('/campaigns/stats', [\App\Http\Controllers\CampaignController::class, 'stats']);

        // Tarefas
        Route::get('/tasks', [\App\Http\Controllers\TaskController::class, 'index']);
        Route::post('/tasks', [\App\Http\Controllers\TaskController::class, 'store']);
        Route::get('/tasks/{id}', [\App\Http\Controllers\TaskController::class, 'show']);
        Route::put('/tasks/{id}', [\App\Http\Controllers\TaskController::class, 'update']);
        Route::delete('/tasks/{id}', [\App\Http\Controllers\TaskController::class, 'destroy']);
        Route::patch('/tasks/{id}/toggle', [\App\Http\Controllers\TaskController::class, 'toggleStatus']);
        Route::get('/tasks/stats', [\App\Http\Controllers\TaskController::class, 'stats']);

        // E-mail Marketing
        Route::get('/email-campaigns', [\App\Http\Controllers\EmailMarketingController::class, 'index']);
        Route::post('/email-campaigns', [\App\Http\Controllers\EmailMarketingController::class, 'store']);
        Route::get('/email-campaigns/{id}', [\App\Http\Controllers\EmailMarketingController::class, 'show']);
        Route::put('/email-campaigns/{id}', [\App\Http\Controllers\EmailMarketingController::class, 'update']);
        Route::delete('/email-campaigns/{id}', [\App\Http\Controllers\EmailMarketingController::class, 'destroy']);
        Route::post('/email-campaigns/{id}/send', [\App\Http\Controllers\EmailMarketingController::class, 'send']);
        Route::get('/email-campaigns/leads/search', [\App\Http\Controllers\EmailMarketingController::class, 'searchLeads']);
    });

    Route::middleware('feature:chatbot')->group(function () {
        // Chatbot Builder
        Route::get('/chatbot/flows', [\App\Http\Controllers\ChatbotController::class, 'index']);
        Route::post('/chatbot/flows', [\App\Http\Controllers\ChatbotController::class, 'store']);
        Route::get('/chatbot/flows/{id}', [\App\Http\Controllers\ChatbotController::class, 'show']);
        Route::put('/chatbot/flows/{id}', [\App\Http\Controllers\ChatbotController::class, 'update']);
        Route::delete('/chatbot/flows/{id}', [\App\Http\Controllers\ChatbotController::class, 'destroy']);
        Route::get('/chatbot/flows/active', [\App\Http\Controllers\ChatbotController::class, 'active']);
        Route::post('/chatbot/flows/{id}/activate', [\App\Http\Controllers\ChatbotController::class, 'setActive']);
    });

    // Settings / Configurações do Usuário
    Route::get('/settings/profile', [\App\Http\Controllers\SettingsController::class, 'profile']);
    Route::put('/settings/profile', [\App\Http\Controllers\SettingsController::class, 'updateProfile']);
    Route::get('/settings/security', [\App\Http\Controllers\SettingsController::class, 'security']);
    Route::post('/settings/password', [\App\Http\Controllers\SettingsController::class, 'changePassword']);
    Route::get('/settings/notifications', [\App\Http\Controllers\SettingsController::class, 'notifications']);
    Route::put('/settings/notifications', [\App\Http\Controllers\SettingsController::class, 'updateNotifications']);
    Route::get('/settings/whatsapp', [\App\Http\Controllers\SettingsController::class, 'whatsapp']);
    Route::put('/settings/whatsapp', [\App\Http\Controllers\SettingsController::class, 'updateWhatsapp']);

    Route::middleware('feature:chatbot')->group(function () {
        // Conversas
        Route::get('/conversations', [\App\Http\Controllers\ConversationController::class, 'index']);
        Route::post('/conversations', [\App\Http\Controllers\ConversationController::class, 'store']);
        Route::get('/conversations/{id}', [\App\Http\Controllers\ConversationController::class, 'show']);
        Route::put('/conversations/{id}', [\App\Http\Controllers\ConversationController::class, 'update']);
        Route::delete('/conversations/{id}', [\App\Http\Controllers\ConversationController::class, 'destroy']);
        Route::get('/conversations/{conversationId}/messages', [\App\Http\Controllers\ConversationController::class, 'messages']);
        Route::post('/conversations/{conversationId}/messages', [\App\Http\Controllers\ConversationController::class, 'sendMessage']);
        Route::post('/conversations/{conversationId}/read', [\App\Http\Controllers\ConversationController::class, 'markRead']);
        Route::get('/conversations/stats', [\App\Http\Controllers\ConversationController::class, 'stats']);
    });
});

// Master SuperAdmin Routes
Route::middleware(['auth:sanctum', 'throttle:api', \App\Http\Middleware\SuperAdminMiddleware::class])->prefix('master')->group(function () {
    Route::get('/tenants', [\App\Http\Controllers\Master\TenantManagementController::class, 'index']);
    Route::post('/tenants', [\App\Http\Controllers\Master\TenantManagementController::class, 'store']);
    Route::put('/tenants/{tenant_id}', [\App\Http\Controllers\Master\TenantManagementController::class, 'update']);
    Route::post('/tenants/{tenant_id}/impersonate', [\App\Http\Controllers\Master\TenantManagementController::class, 'impersonate']);
    Route::get('/system-health', [\App\Http\Controllers\Master\SystemHealthController::class, 'index']);
    
    Route::apiResource('plans', \App\Http\Controllers\Master\PlanController::class);
});
