<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bank_reconciliation_items', function (Blueprint $table) {
            $table->dropForeign(['matched_statement_id']);
            $table->dropColumn('matched_statement_id');
            $table->foreignId('payable_id')->nullable()->constrained('accounts_payables')->nullOnDelete();
            $table->foreignId('receivable_id')->nullable()->constrained('accounts_receivables')->nullOnDelete();
            
            // Re-create match_status
            $table->dropIndex(['reconciliation_id', 'match_status']);
            $table->dropColumn('match_status');
        });
        Schema::table('bank_reconciliation_items', function (Blueprint $table) {
            $table->enum('match_status', ['unmatched', 'suggested_match', 'matched', 'ignored'])->default('unmatched');
            $table->index(['reconciliation_id', 'match_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bank_reconciliation_items', function (Blueprint $table) {
            $table->dropForeign(['payable_id']);
            $table->dropForeign(['receivable_id']);
            $table->dropColumn(['payable_id', 'receivable_id', 'match_status']);
            $table->foreignId('matched_statement_id')->nullable()->constrained('financial_statements')->nullOnDelete();
            $table->enum('match_status', ['unmatched', 'matched', 'ignored'])->default('unmatched');
        });
    }
};
