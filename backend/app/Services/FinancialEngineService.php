<?php

namespace App\Services;

use App\Models\AccountsReceivable;
use App\Models\AuditLog;
use App\Models\BankAccount;
use App\Models\BankBalanceLog;
use App\Models\BankReconciliation;
use App\Models\BankReconciliationItem;
use App\Models\FinancialStatement;
use App\Models\Invoice;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FinancialEngineService
{
    // ─────────────────────────────────────────────
    //  INVOICE: Create + Auto-Provision
    // ─────────────────────────────────────────────
    public function createInvoice(array $data): Invoice
    {
        return DB::transaction(function () use ($data) {
            $invoice = Invoice::create($data);

            // Auto-provision: output invoice → AccountReceivable + FinancialStatement
            if ($invoice->type === 'output' && $invoice->total_value > 0) {
                AccountsReceivable::create([
                    'company_id'      => $invoice->company_id,
                    'reference_title' => "NF-e #{$invoice->number} – {$invoice->recipient_name}",
                    'amount'          => $invoice->total_value,
                    'due_date'        => now()->addDays(30),
                    'status'          => 'Pending',
                ]);

                FinancialStatement::create([
                    'company_id' => $invoice->company_id,
                    'invoice_id' => $invoice->id,
                    'type'       => 'entry',
                    'category'   => 'Vendas / NF-e',
                    'description'=> "NF-e #{$invoice->number}",
                    'amount'     => $invoice->total_value,
                    'status'     => 'pending',
                    'due_date'   => now()->addDays(30),
                ]);
            }

            $this->audit($invoice, 'invoice_created', null, $invoice->status);
            return $invoice;
        });
    }

    public function updateInvoiceStatus(Invoice $invoice, string $newStatus): Invoice
    {
        return DB::transaction(function () use ($invoice, $newStatus) {
            $old = $invoice->status;

            $updateData = ['status' => $newStatus];
            if ($newStatus === 'authorized') {
                $updateData['authorized_at'] = now();
            }

            $invoice->update($updateData);
            $this->audit($invoice, 'invoice_status_changed', $old, $newStatus);

            return $invoice;
        });
    }

    // ─────────────────────────────────────────────
    //  OFX PARSER
    // ─────────────────────────────────────────────
    public function parseOfxContent(string $content, int $bankAccountId): BankReconciliation
    {
        $bankAccount = BankAccount::findOrFail($bankAccountId);

        return DB::transaction(function () use ($content, $bankAccount) {
            $reconciliation = BankReconciliation::create([
                'company_id'      => $bankAccount->company_id,
                'bank_account_id' => $bankAccount->id,
                'file_name'       => 'ofx_import_' . now()->format('Ymd_His') . '.ofx',
                'status'          => 'imported',
            ]);

            $transactions = $this->extractOfxTransactions($content);
            $matched = 0;

            foreach ($transactions as $tx) {
                $type = $tx['amount'] >= 0 ? 'credit' : 'debit';
                $absAmount = abs($tx['amount']);

                // Try to match with existing financial statements
                $matchedStatement = FinancialStatement::where('company_id', $bankAccount->company_id)
                    ->where('status', 'pending')
                    ->whereBetween('amount', [$absAmount - 0.01, $absAmount + 0.01])
                    ->whereBetween('due_date', [
                        $tx['date']->copy()->subDays(5),
                        $tx['date']->copy()->addDays(5),
                    ])
                    ->first();

                $matchStatus = $matchedStatement ? 'matched' : 'unmatched';
                if ($matchedStatement) $matched++;

                BankReconciliationItem::create([
                    'reconciliation_id'    => $reconciliation->id,
                    'transaction_date'     => $tx['date'],
                    'amount'               => $tx['amount'],
                    'description'          => $tx['description'] ?? '',
                    'fitid'                => $tx['fitid'] ?? null,
                    'type'                 => $type,
                    'matched_statement_id' => $matchedStatement?->id,
                    'match_status'         => $matchStatus,
                ]);
            }

            $reconciliation->update([
                'total_transactions'   => count($transactions),
                'matched_transactions' => $matched,
                'status'               => 'reconciling',
            ]);

            return $reconciliation->load('items');
        });
    }

    private function extractOfxTransactions(string $content): array
    {
        $transactions = [];
        // Parse OFX/XML-like structure
        preg_match_all('/<STMTTRN>(.*?)<\/STMTTRN>/s', $content, $matches);

        foreach ($matches[1] as $block) {
            $amount = 0;
            $date = now();
            $desc = '';
            $fitid = '';

            if (preg_match('/<TRNAMT>([-\d.]+)/', $block, $m)) $amount = (float) $m[1];
            if (preg_match('/<DTPOSTED>(\d{8})/', $block, $m)) {
                $date = \Carbon\Carbon::createFromFormat('Ymd', $m[1]);
            }
            if (preg_match('/<MEMO>(.+?)(?:\n|<)/', $block, $m)) $desc = trim($m[1]);
            if (preg_match('/<FITID>(.+?)(?:\n|<)/', $block, $m)) $fitid = trim($m[1]);

            $transactions[] = [
                'amount'      => $amount,
                'date'        => $date,
                'description' => $desc,
                'fitid'       => $fitid,
            ];
        }

        return $transactions;
    }

    // ─────────────────────────────────────────────
    //  RECONCILE a single OFX item
    // ─────────────────────────────────────────────
    public function reconcileItem(BankReconciliationItem $item, ?int $statementId): BankReconciliationItem
    {
        return DB::transaction(function () use ($item, $statementId) {
            if ($statementId) {
                $statement = FinancialStatement::findOrFail($statementId);
                $statement->update([
                    'status'       => 'paid',
                    'payment_date' => $item->transaction_date,
                ]);

                // Update bank balance
                $reconciliation = $item->reconciliation;
                $bankAccount = BankAccount::lockForUpdate()->find($reconciliation->bank_account_id);
                if ($bankAccount) {
                    $this->logBalanceChange($bankAccount, $item->amount, "Conciliação: {$item->description}");
                }

                $this->auditPaymentChange($statement, 'pending', 'paid');
            }

            $item->update([
                'matched_statement_id' => $statementId,
                'match_status'         => $statementId ? 'matched' : 'ignored',
            ]);

            // Update reconciliation counters
            $recon = $item->reconciliation;
            $recon->update([
                'matched_transactions' => $recon->items()->where('match_status', 'matched')->count(),
            ]);

            $allDone = $recon->items()->where('match_status', 'unmatched')->count() === 0;
            if ($allDone) {
                $recon->update(['status' => 'completed']);
            }

            return $item->load('matchedStatement');
        });
    }

    // ─────────────────────────────────────────────
    //  BANK BALANCE LOG
    // ─────────────────────────────────────────────
    public function logBalanceChange(BankAccount $account, float $amount, string $reference): void
    {
        $previous = (float) $account->current_balance;
        $new = $previous + $amount;

        BankBalanceLog::create([
            'bank_account_id'  => $account->id,
            'previous_balance' => $previous,
            'amount'           => $amount,
            'new_balance'      => $new,
            'reference'        => $reference,
        ]);

        $account->update(['current_balance' => $new]);
    }

    // ─────────────────────────────────────────────
    //  CASH FLOW SUMMARY
    // ─────────────────────────────────────────────
    public function getCashFlowSummary(int $companyId, ?string $period = null): array
    {
        $query = FinancialStatement::where('company_id', $companyId);

        if ($period === 'month') {
            $query->whereMonth('due_date', now()->month)->whereYear('due_date', now()->year);
        } elseif ($period === 'year') {
            $query->whereYear('due_date', now()->year);
        }

        $entries = (clone $query)->where('type', 'entry');
        $exits   = (clone $query)->where('type', 'exit');

        $monthlyFlow = FinancialStatement::where('company_id', $companyId)
            ->whereYear('due_date', now()->year)
            ->selectRaw("EXTRACT(MONTH FROM due_date) as month, type, SUM(amount) as total")
            ->groupByRaw("EXTRACT(MONTH FROM due_date), type")
            ->get()
            ->groupBy('month')
            ->map(fn($group) => [
                'entries' => (float) ($group->firstWhere('type', 'entry')?->total ?? 0),
                'exits'   => (float) ($group->firstWhere('type', 'exit')?->total ?? 0),
            ]);

        return [
            'total_entries'   => (float) $entries->sum('amount'),
            'total_exits'     => (float) $exits->sum('amount'),
            'pending_entries' => (float) (clone $entries)->where('status', 'pending')->sum('amount'),
            'pending_exits'   => (float) (clone $exits)->where('status', 'pending')->sum('amount'),
            'paid_entries'    => (float) (clone $entries)->where('status', 'paid')->sum('amount'),
            'paid_exits'      => (float) (clone $exits)->where('status', 'paid')->sum('amount'),
            'balance'         => (float) $entries->sum('amount') - (float) $exits->sum('amount'),
            'monthly_flow'    => $monthlyFlow,
        ];
    }

    // ─────────────────────────────────────────────
    //  AUDIT
    // ─────────────────────────────────────────────
    private function audit($model, string $action, ?string $old, ?string $new): void
    {
        AuditLog::create([
            'company_id'     => $model->company_id,
            'user_id'        => Auth::id(),
            'auditable_type' => get_class($model),
            'auditable_id'   => $model->id,
            'action'         => $action,
            'old_value'      => $old,
            'new_value'      => $new,
            'ip_address'     => request()?->ip(),
        ]);
    }

    private function auditPaymentChange(FinancialStatement $stmt, string $old, string $new): void
    {
        $this->audit($stmt, 'payment_status_changed', $old, $new);
    }
}
