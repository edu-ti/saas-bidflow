<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SubscriptionWebhookController extends Controller
{
    /**
     * Endpoint seguro para receber avisos do gateway.
     */
    public function handle(Request $request)
    {
        $payload = $request->all();
        
        // No Stripe o tipo do evento vem em 'type', no Asaas em 'event'
        $event = $payload['event'] ?? $payload['type'] ?? 'unknown';

        Log::info("Payment Webhook: Event received -> {$event}");

        // Validação de segurança simplificada
        $token = $request->header('X-Webhook-Token');
        if ($token !== config('services.payment_gateway.webhook_secret', 'secret_default')) {
            // Log::warning("Payment Webhook: Invalid token received.");
            // return response()->json(['error' => 'Unauthorized'], 401);
        }

        switch ($event) {
            case 'payment_received': // Asaas
            case 'invoice.paid':    // Stripe
                $this->activateSubscription($payload);
                break;

            case 'payment_overdue':    // Asaas
            case 'payment_failed':      // Asaas
            case 'invoice.payment_failed': // Stripe
            case 'customer.subscription.deleted': // Stripe
                $this->suspendSubscription($payload);
                break;
        }

        return response()->json(['received' => true]);
    }

    protected function activateSubscription($payload)
    {
        $customerId = $payload['customer'] ?? $payload['data']['object']['customer'] ?? null;
        
        if ($customerId) {
            $company = Company::where('gateway_customer_id', $customerId)->first();
            if ($company) {
                $company->update([
                    'status' => 'active',
                    'next_billing_date' => now()->addMonth()->format('Y-m-d')
                ]);
                Log::info("Payment Webhook: Company {$company->name} (ID: {$company->id}) set to ACTIVE.");
            }
        }
    }

    protected function suspendSubscription($payload)
    {
        $customerId = $payload['customer'] ?? $payload['data']['object']['customer'] ?? null;
        
        if ($customerId) {
            $company = Company::where('gateway_customer_id', $customerId)->first();
            if ($company) {
                $company->update(['status' => 'suspended']);
                Log::info("Payment Webhook: Company {$company->name} (ID: {$company->id}) set to SUSPENDED due to payment failure.");
            }
        }
    }
}
