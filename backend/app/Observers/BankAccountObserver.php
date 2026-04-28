<?php

namespace App\Observers;

use App\Models\BankAccount;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class BankAccountObserver
{
    /**
     * Handle the BankAccount "updating" event.
     */
    public function updating(BankAccount $bankAccount): void
    {
        if ($bankAccount->isDirty('current_balance')) {
            $oldBalance = $bankAccount->getOriginal('current_balance');
            $newBalance = $bankAccount->current_balance;

            // Log de auditoria para captura de alteração de saldo
            AuditLog::create([
                'company_id'     => $bankAccount->company_id,
                'user_id'        => Auth::id(),
                'auditable_type' => BankAccount::class,
                'auditable_id'   => $bankAccount->id,
                'action'         => 'manual_balance_update',
                'old_value'      => $oldBalance,
                'new_value'      => $newBalance,
                'ip_address'     => request()?->ip(),
            ]);

            // Se o saldo for negativo e não houver permissão, impedir.
            if ($newBalance < 0) {
                // Checar permissão do Tenant
                $taxConfig = \App\Models\TaxConfiguration::where('company_id', $bankAccount->company_id)->first();
                if (!$taxConfig || !$taxConfig->permite_saldo_negativo) {
                    // Impede a operação (vai jogar exceção e fazer rollback)
                    throw new \Exception('Saldo não pode ficar negativo. Permissão de "Crédito Especial" negada.');
                }
            }
        }
    }
}
