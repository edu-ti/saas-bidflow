<?php

namespace App\Console\Commands;

use App\Models\Company;
use App\Services\ContractManagerService;
use Illuminate\Console\Command;

class CheckContractExpirations extends Command
{
    protected $signature = 'contracts:check-expirations {--days=30 : Dias de antecedência para notificação}';
    protected $description = 'Verifica contratos próximos ao vencimento e dispara notificações';

    public function __construct(
        protected ContractManagerService $contractService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $days = (int) $this->option('days');

        $this->info("Verificando contratos que expiram em {$days} dias...");

        $companies = Company::all();

        foreach ($companies as $company) {
            $this->processCompany($company, $days);
        }

        $this->info('Verificação de vencimentos concluída.');

        return Command::SUCCESS;
    }

    protected function processCompany(Company $company, int $days): void
    {
        $this->info("Processando empresa: {$company->name}");

        $expiringContracts = $this->contractService->getExpiringContracts($company->id, $days);

        foreach ($expiringContracts as $contract) {
            $daysUntil = $contract->daysUntilExpiry();

            $this->sendExpirationNotification($contract, $daysUntil);
        }

        $expiredContracts = $this->contractService->getExpiredContracts($company->id);

        foreach ($expiredContracts as $contract) {
            $this->sendExpiredNotification($contract);
        }
    }

    protected function sendExpirationNotification($contract, int $daysUntil): void
    {
        $clientName = $contract->client_name ?? 'N/A';
        $contractNumber = $contract->contract_number;
        $endDate = $contract->end_date->format('d/m/Y');

        $message = "⚠️ Contrato {$contractNumber} expira em {$daysUntil} dias ({$endDate})";
        $message .= "\nCliente: {$clientName}";
        $message .= "\nValor: R$ " . number_format($contract->value, 2, ',', '.');

        $this->info($message);

        $this->createAlert($contract, $message, $daysUntil);
    }

    protected function sendExpiredNotification($contract): void
    {
        $clientName = $contract->client_name ?? 'N/A';
        $contractNumber = $contract->contract_number;
        $endDate = $contract->end_date->format('d/m/Y');

        $message = "🔴 Contrato {$contractNumber} EXPIRADO em {$endDate}";
        $message .= "\nCliente: {$clientName}";
        $message .= "\nValor: R$ " . number_format($contract->value, 2, ',', '.');

        $this->warn($message);

        $this->createAlert($contract, $message, 0);
    }

    protected function createAlert($contract, string $message, int $daysUntil): void
    {
        $alertDays = match (true) {
            $daysUntil <= 7 => 7,
            $daysUntil <= 15 => 15,
            $daysUntil <= 30 => 30,
            default => null,
        };

        if ($alertDays === null) {
            return;
        }

        \App\Models\BiddingAlert::updateOrCreate(
            [
                'company_id' => $contract->company_id,
                'type' => 'contract_expiration',
                'reference_id' => $contract->id,
                'reference_type' => 'contract',
            ],
            [
                'title' => "Contrato {$contract->contract_number} - {$daysUntil} dias",
                'message' => $message,
                'priority' => $daysUntil <= 7 ? 'high' : 'medium',
                'alert_date' => now(),
            ]
        );
    }
}
