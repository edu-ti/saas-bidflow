<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AsaasWebhookController extends Controller
{
    /**
     * Processa os webhooks do Asaas.
     */
    public function handle(Request $request)
    {
        // Validação de segurança do Token
        $token = $request->header('asaas-access-token');
        if ($token !== config('services.asaas.webhook_token')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $payload = $request->all();
        $event = $payload['event'] ?? null;
        $customerId = $payload['payment']['customer'] ?? $payload['subscription']['customer'] ?? null;

        Log::info('Asaas Webhook Received', ['event' => $event, 'customer' => $customerId]);

        if (!$customerId) {
            return response()->json(['status' => 'ignored', 'reason' => 'no_customer']);
        }

        $company = Company::where('asaas_customer_id', $customerId)->first();

        if (!$company) {
            Log::warning('Asaas Webhook: Company not found', ['asaas_customer_id' => $customerId]);
            return response()->json(['status' => 'ignored', 'reason' => 'company_not_found']);
        }

        switch ($event) {
            case 'PAYMENT_RECEIVED':
            case 'PAYMENT_CONFIRMED':
                $company->update([
                    'status' => 'active',
                    'next_billing_date' => now()->addMonth()->format('Y-m-d')
                ]);
                Log::info('Tenant Activated/Renewed via Asaas', ['company_id' => $company->id]);
                break;

            case 'PAYMENT_OVERDUE':
            case 'PAYMENT_DELETED':
                $company->update(['status' => 'suspended']);
                Log::warning('Tenant Suspended via Asaas (Overdue/Deleted)', ['company_id' => $company->id]);
                break;
            
            case 'SUBSCRIPTION_DELETED':
                $company->update(['status' => 'suspended']);
                Log::warning('Subscription deleted for company', ['company_id' => $company->id]);
                break;
        }

        return response()->json(['status' => 'success']);
    }
}
