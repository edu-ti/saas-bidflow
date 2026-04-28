<?php

namespace App\Http\Controllers;

use App\Models\BankAccount;
use App\Models\BankReconciliation;
use App\Models\BankReconciliationItem;
use App\Models\FinancialStatement;
use App\Models\Invoice;
use App\Models\TaxConfiguration;
use App\Services\FinancialEngineService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FinancialEngineController extends Controller
{
    public function __construct(private FinancialEngineService $service) {}

    // ── CASH FLOW DASHBOARD ─────────────────────
    public function cashFlowSummary(Request $request)
    {
        $companyId = Auth::user()->company_id;
        $period = $request->get('period', 'year');
        return response()->json(['data' => $this->service->getCashFlowSummary($companyId, $period)]);
    }

    // ── FINANCIAL STATEMENTS CRUD ───────────────
    public function statementsIndex(Request $request)
    {
        $query = FinancialStatement::latest();
        if ($request->filled('type'))   $query->where('type', $request->type);
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('category')) $query->where('category', $request->category);
        return response()->json(['data' => $query->get()]);
    }

    public function statementsStore(Request $request)
    {
        $validated = $request->validate([
            'bank_account_id' => 'nullable|exists:bank_accounts,id',
            'type'            => 'required|in:entry,exit',
            'category'        => 'nullable|string|max:255',
            'description'     => 'nullable|string|max:255',
            'amount'          => 'required|numeric|min:0.01',
            'status'          => 'required|in:pending,paid',
            'due_date'        => 'required|date',
            'payment_date'    => 'nullable|date',
        ]);

        $validated['company_id'] = Auth::user()->company_id;
        $statement = FinancialStatement::create($validated);

        // If paid immediately and has bank account, update balance
        if ($statement->status === 'paid' && $statement->bank_account_id) {
            $amount = $statement->type === 'entry' ? $statement->amount : -$statement->amount;
            $bank = BankAccount::find($statement->bank_account_id);
            if ($bank) $this->service->logBalanceChange($bank, $amount, $statement->description ?? 'Lançamento manual');
        }

        return response()->json(['data' => $statement], 201);
    }

    // ── INVOICES CRUD ───────────────────────────
    public function invoicesIndex(Request $request)
    {
        $query = Invoice::latest();
        if ($request->filled('type'))   $query->where('type', $request->type);
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q->where('number', 'like', "%{$s}%")
                ->orWhere('recipient_name', 'like', "%{$s}%"));
        }
        return response()->json(['data' => $query->get()]);
    }

    public function invoicesStore(Request $request)
    {
        $validated = $request->validate([
            'type'               => 'required|in:input,output',
            'number'             => 'nullable|string',
            'series'             => 'nullable|string',
            'total_value'        => 'required|numeric|min:0',
            'items_json'         => 'nullable|array',
            'recipient_name'     => 'nullable|string|max:255',
            'recipient_document' => 'nullable|string|max:20',
            'notes'              => 'nullable|string',
        ]);

        $validated['company_id'] = Auth::user()->company_id;
        $validated['status'] = 'draft';
        $invoice = $this->service->createInvoice($validated);

        return response()->json(['data' => $invoice], 201);
    }

    public function invoicesShow(Invoice $invoice)
    {
        return response()->json(['data' => $invoice]);
    }

    public function invoicesTransmit(Invoice $invoice)
    {
        if ($invoice->status !== 'draft') {
            return response()->json(['message' => 'Apenas notas em rascunho podem ser transmitidas.'], 422);
        }

        // Simulate NF-e transmission (placeholder for real API integration)
        $invoice = $this->service->updateInvoiceStatus($invoice, 'sent');

        // In production, integrate with FocusNFe/PlugNotas here:
        // $response = Http::post('https://api.focusnfe.com.br/...', $xmlPayload);
        // if ($response->successful()) $this->service->updateInvoiceStatus($invoice, 'authorized');

        return response()->json(['data' => $invoice, 'message' => 'Nota transmitida para processamento.']);
    }

    public function invoicesCancel(Invoice $invoice)
    {
        if (!in_array($invoice->status, ['sent', 'authorized'])) {
            return response()->json(['message' => 'Status não permite cancelamento.'], 422);
        }
        $invoice = $this->service->updateInvoiceStatus($invoice, 'cancelled');
        return response()->json(['data' => $invoice]);
    }

    // ── BANK ACCOUNTS CRUD ──────────────────────
    public function bankAccountsIndex()
    {
        return response()->json(['data' => BankAccount::latest()->get()]);
    }

    public function bankAccountsStore(Request $request)
    {
        $validated = $request->validate([
            'bank_name'       => 'required|string|max:255',
            'agency'          => 'nullable|string|max:20',
            'number'          => 'required|string|max:30',
            'current_balance' => 'nullable|numeric',
        ]);
        $validated['company_id'] = Auth::user()->company_id;
        return response()->json(['data' => BankAccount::create($validated)], 201);
    }

    public function bankAccountsUpdate(Request $request, BankAccount $bankAccount)
    {
        $validated = $request->validate([
            'bank_name' => 'sometimes|string|max:255',
            'agency'    => 'nullable|string|max:20',
            'number'    => 'sometimes|string|max:30',
            'active'    => 'boolean',
        ]);
        $bankAccount->update($validated);
        return response()->json(['data' => $bankAccount]);
    }

    // ── OFX IMPORT ──────────────────────────────
    public function importOfx(Request $request)
    {
        $request->validate([
            'bank_account_id' => 'required|exists:bank_accounts,id',
            'file'            => 'required|file|max:5120',
        ]);

        $content = file_get_contents($request->file('file')->getRealPath());
        $reconciliation = $this->service->parseOfxContent($content, $request->bank_account_id);

        return response()->json([
            'data'    => $reconciliation->load('items'),
            'message' => "Importado: {$reconciliation->total_transactions} transações, {$reconciliation->matched_transactions} conciliadas automaticamente.",
        ]);
    }

    // ── RECONCILIATION ──────────────────────────
    public function reconciliationsIndex()
    {
        $data = BankReconciliation::with(['bankAccount', 'items'])->latest()->get();
        return response()->json(['data' => $data]);
    }

    public function reconcileItem(Request $request, BankReconciliationItem $item)
    {
        $validated = $request->validate([
            'statement_id' => 'nullable|exists:financial_statements,id',
        ]);

        $item = $this->service->reconcileItem($item, $validated['statement_id'] ?? null);
        return response()->json(['data' => $item]);
    }

    // ── TAX CONFIGURATION ───────────────────────
    public function taxConfigShow()
    {
        $config = TaxConfiguration::first();
        return response()->json(['data' => $config]);
    }

    public function taxConfigSave(Request $request)
    {
        $validated = $request->validate([
            'regime_especial' => 'nullable|string|max:255',
            'aliquota_padrao' => 'nullable|numeric|min:0|max:100',
        ]);

        $validated['company_id'] = Auth::user()->company_id;
        $config = TaxConfiguration::updateOrCreate(
            ['company_id' => $validated['company_id']],
            $validated
        );

        return response()->json(['data' => $config]);
    }

    public function taxConfigUploadCert(Request $request)
    {
        $request->validate(['certificate' => 'required|file|max:2048']);

        $path = $request->file('certificate')->store('certificates', 'local');

        $config = TaxConfiguration::updateOrCreate(
            ['company_id' => Auth::user()->company_id],
            ['certificado_path' => $path]
        );

        return response()->json(['data' => $config, 'message' => 'Certificado enviado.']);
    }
}
