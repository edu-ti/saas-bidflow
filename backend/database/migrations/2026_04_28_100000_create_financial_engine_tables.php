<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tax Configurations
        Schema::create('tax_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('regime_especial')->nullable();
            $table->decimal('aliquota_padrao', 5, 2)->default(0);
            $table->text('certificado_path')->nullable(); // encrypted at app level
            $table->timestamps();
            $table->softDeletes();
            $table->index('company_id');
        });

        // 2. Invoices (Notas Fiscais)
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['input', 'output']);
            $table->enum('status', ['draft', 'sent', 'authorized', 'cancelled'])->default('draft');
            $table->string('number')->nullable();
            $table->string('series')->nullable();
            $table->string('access_key', 50)->nullable();
            $table->text('xml_path')->nullable();
            $table->text('danfe_path')->nullable();
            $table->decimal('total_value', 15, 2)->default(0);
            $table->json('items_json')->nullable();
            $table->string('recipient_name')->nullable();
            $table->string('recipient_document', 20)->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('authorized_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['company_id', 'type']);
            $table->index(['company_id', 'status']);
        });

        // 3. Bank Accounts
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('bank_name');
            $table->string('agency', 20)->nullable();
            $table->string('number', 30);
            $table->decimal('current_balance', 15, 2)->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['company_id', 'active']);
        });

        // 4. Financial Statements (Fluxo de Caixa)
        Schema::create('financial_statements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bank_account_id')->nullable()->constrained('bank_accounts')->nullOnDelete();
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->nullOnDelete();
            $table->enum('type', ['entry', 'exit']);
            $table->string('category')->nullable();
            $table->string('description')->nullable();
            $table->decimal('amount', 15, 2);
            $table->enum('status', ['pending', 'paid'])->default('pending');
            $table->date('due_date');
            $table->date('payment_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['company_id', 'type']);
            $table->index(['company_id', 'status']);
            $table->index(['company_id', 'due_date']);
        });

        // 5. Bank Reconciliations
        Schema::create('bank_reconciliations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bank_account_id')->constrained('bank_accounts')->cascadeOnDelete();
            $table->string('file_name');
            $table->enum('status', ['imported', 'reconciling', 'completed'])->default('imported');
            $table->integer('total_transactions')->default(0);
            $table->integer('matched_transactions')->default(0);
            $table->timestamps();
            $table->index(['company_id', 'status']);
        });

        // 6. Bank Reconciliation Items (individual OFX lines)
        Schema::create('bank_reconciliation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reconciliation_id')->constrained('bank_reconciliations')->cascadeOnDelete();
            $table->date('transaction_date');
            $table->decimal('amount', 15, 2);
            $table->string('description')->nullable();
            $table->string('fitid', 100)->nullable();
            $table->enum('type', ['credit', 'debit']);
            $table->foreignId('matched_statement_id')->nullable()->constrained('financial_statements')->nullOnDelete();
            $table->enum('match_status', ['unmatched', 'matched', 'ignored'])->default('unmatched');
            $table->timestamps();
            $table->index(['reconciliation_id', 'match_status']);
        });

        // 7. Bank Balance Log
        Schema::create('bank_balance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_account_id')->constrained('bank_accounts')->cascadeOnDelete();
            $table->decimal('previous_balance', 15, 2);
            $table->decimal('amount', 15, 2);
            $table->decimal('new_balance', 15, 2);
            $table->string('reference')->nullable();
            $table->timestamps();
            $table->index('bank_account_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_balance_logs');
        Schema::dropIfExists('bank_reconciliation_items');
        Schema::dropIfExists('bank_reconciliations');
        Schema::dropIfExists('financial_statements');
        Schema::dropIfExists('bank_accounts');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('tax_configurations');
    }
};
