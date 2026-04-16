<?php

namespace App\Services;

use App\Models\AccountsPayable;
use App\Models\AccountsReceivable;
use Illuminate\Support\Facades\DB;

class FinanceService
{
    /**
     * Create accounts payable
     */
    public function createPayable(array $data): AccountsPayable
    {
        return AccountsPayable::create([
            'company_id' => auth()->user()->company_id,
            'reference_title' => $data['reference_title'],
            'amount' => $data['amount'],
            'due_date' => $data['due_date'],
            'status' => $data['status'] ?? 'Pending',
            'description' => $data['description'] ?? null,
        ]);
    }

    /**
     * Create accounts receivable
     */
    public function createReceivable(array $data): AccountsReceivable
    {
        return AccountsReceivable::create([
            'company_id' => auth()->user()->company_id,
            'reference_title' => $data['reference_title'],
            'amount' => $data['amount'],
            'due_date' => $data['due_date'],
            'status' => $data['status'] ?? 'Pending',
            'description' => $data['description'] ?? null,
        ]);
    }

    /**
     * Mark as paid
     */
    public function markPayableAsPaid(AccountsPayable $payable): AccountsPayable
    {
        $payable->update([
            'status' => 'Paid',
            'paid_at' => now(),
        ]);

        return $payable;
    }

    /**
     * Mark as received
     */
    public function markReceivableAsReceived(AccountsReceivable $receivable): AccountsReceivable
    {
        $receivable->update([
            'status' => 'Paid',
            'received_at' => now(),
        ]);

        return $receivable;
    }

    /**
     * Get financial summary
     */
    public function getSummary(int $companyId): array
    {
        $payables = AccountsPayable::where('company_id', $companyId)->get();
        $receivables = AccountsReceivable::where('company_id', $companyId)->get();

        return [
            'payables' => [
                'total' => $payables->sum('amount'),
                'pending' => $payables->where('status', 'Pending')->sum('amount'),
                'paid' => $payables->where('status', 'Paid')->sum('amount'),
                'overdue' => $payables->where('status', 'Overdue')->sum('amount'),
            ],
            'receivables' => [
                'total' => $receivables->sum('amount'),
                'pending' => $receivables->where('status', 'Pending')->sum('amount'),
                'received' => $receivables->where('status', 'Paid')->sum('amount'),
                'overdue' => $receivables->where('status', 'Overdue')->sum('amount'),
            ],
            'balance' => $receivables->sum('amount') - $payables->sum('amount'),
        ];
    }
}
