<?php

namespace App\Http\Controllers;

use App\Services\PaymentGatewayService;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    protected $gateway;

    public function __construct(PaymentGatewayService $gateway)
    {
        $this->gateway = $gateway;
    }

    /**
     * Retorna o resumo do plano atual do cliente.
     */
    public function getInfo(Request $request)
    {
        $user = $request->user();
        $company = $user->company;
        
        if (!$company) {
            return response()->json(['error' => 'Company not found'], 404);
        }

        return response()->json([
            'plan_name' => $company->plan->name ?? 'Plano Platinum',
            'status' => $company->status, // active, suspended, past_due
            'value' => $company->subscription_value ?? 499.00,
            'next_billing' => $company->next_billing_date ?? now()->addDays(15)->format('Y-m-d'),
            'customer_id' => $company->gateway_customer_id
        ]);
    }

    /**
     * Gera a URL do portal do cliente para gerenciar assinatura.
     */
    public function getPortalUrl(Request $request)
    {
        $user = $request->user();
        $company = $user->company;

        if (!$company || !$company->gateway_customer_id) {
            return response()->json(['error' => 'Billing customer not initialized'], 400);
        }

        $url = $this->gateway->getBillingPortalUrl($company);
        
        return response()->json(['url' => $url]);
    }
}
