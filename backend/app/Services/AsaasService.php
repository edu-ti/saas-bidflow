<?php

namespace App\Services;

use App\Models\Company;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AsaasService
{
    protected string $apiKey;
    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.asaas.key');
        $this->baseUrl = config('services.asaas.url', 'https://api.asaas.com/v3');
    }

    protected function client()
    {
        return Http::withHeaders([
            'access_token' => $this->apiKey,
        ]);
    }

    /**
     * Cria um cliente no Asaas.
     */
    public function createCustomer(Company $company)
    {
        try {
            $response = $this->client()->post("{$this->baseUrl}/customers", [
                'name' => $company->name,
                'cpfCnpj' => preg_replace('/\D/', '', $company->document),
                'externalReference' => (string) $company->id,
                'notificationDisabled' => false,
            ]);

            if ($response->successful()) {
                $asaasId = $response->json('id');
                $company->update(['asaas_customer_id' => $asaasId]);
                return $asaasId;
            }

            Log::error('Asaas Create Customer Error', ['response' => $response->json(), 'company' => $company->id]);
            return null;
        } catch (\Exception $e) {
            Log::error('Asaas Create Customer Exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Cria uma assinatura recorrente no Asaas.
     */
    public function createSubscription(Company $company, $plan, $billingType = 'UNDEFINED')
    {
        if (!$company->asaas_customer_id) {
            $this->createCustomer($company);
        }

        try {
            $response = $this->client()->post("{$this->baseUrl}/subscriptions", [
                'customer' => $company->asaas_customer_id,
                'billingType' => $billingType, // BOLETO, CREDIT_CARD, PIX, UNDEFINED
                'value' => (float) $company->subscription_value ?? 499.90,
                'nextDueDate' => now()->addDays(7)->format('Y-m-d'),
                'cycle' => 'MONTHLY',
                'description' => "Assinatura SaaS BidFlow - Plano " . ($plan->name ?? 'Platinum'),
                'externalReference' => (string) $company->id,
            ]);

            if ($response->successful()) {
                $subscriptionId = $response->json('id');
                $company->update(['asaas_subscription_id' => $subscriptionId]);
                return $response->json();
            }

            Log::error('Asaas Create Subscription Error', ['response' => $response->json(), 'company' => $company->id]);
            return null;
        } catch (\Exception $e) {
            Log::error('Asaas Create Subscription Exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Retorna o link da fatura atual.
     */
    public function getPaymentLink(Company $company)
    {
        try {
            // Busca a última cobrança ativa da assinatura
            $response = $this->client()->get("{$this->baseUrl}/payments", [
                'customer' => $company->asaas_customer_id,
                'status' => 'PENDING',
            ]);

            if ($response->successful() && !empty($response->json('data'))) {
                return $response->json('data.0.invoiceUrl');
            }

            // Se não encontrar pendente, retorna o link da assinatura se houver
            return null;
        } catch (\Exception $e) {
            Log::error('Asaas Get Payment Link Exception', ['message' => $e->getMessage()]);
            return null;
        }
    }
}
