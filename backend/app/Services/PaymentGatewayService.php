<?php

namespace App\Services;

use App\Models\Company;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentGatewayService
{
    protected string $apiKey;
    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.payment_gateway.api_key', 'sk_test_mock');
        $this->baseUrl = config('services.payment_gateway.base_url', 'https://api.stripe.com/v1');
    }

    /**
     * Cria o cliente no gateway quando a empresa se cadastra.
     */
    public function createCustomer(Company $company)
    {
        Log::info("PaymentGateway: Creating customer for company ID {$company->id}");
        
        // Simulação de chamada de API
        // No Stripe seria: \Stripe\Customer::create(['name' => $company->name, 'email' => ...])
        
        return 'cus_' . bin2hex(random_bytes(8));
    }

    /**
     * Associa o cliente a um plano.
     */
    public function createSubscription(Company $company, string $planId)
    {
        Log::info("PaymentGateway: Creating subscription for company ID {$company->id} on plan {$planId}");
        
        // Simulação de valor baseado no plano (exemplo fixo aqui)
        $value = 499.00;
        if (str_contains(strtolower($planId), 'platinum')) $value = 999.00;
        
        return [
            'id' => 'sub_' . bin2hex(random_bytes(8)),
            'value' => $value,
            'next_billing' => now()->addMonth()->format('Y-m-d')
        ];
    }

    /**
     * Link para o cliente ver faturas/trocar cartão (Customer Portal).
     */
    public function getBillingPortalUrl(Company $company)
    {
        if (!$company->gateway_customer_id) {
            return null;
        }

        // Simulação de URL de portal de faturamento
        return "https://billing.stripe.com/p/session/test_" . bin2hex(random_bytes(16));
    }
}
