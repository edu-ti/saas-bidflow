<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations - Add optimized composite indexes
     */
    public function up(): void
    {
        Schema::table('opportunities', function (Blueprint $table) {
            // Composite index for filtering opportunities by company and status
            $table->index(['company_id', 'status'], 'idx_opportunities_company_status');

            // Composite index for filtering by company and created_at
            $table->index(['company_id', 'created_at'], 'idx_opportunities_company_created');

            // Composite index for funnel queries
            $table->index(['company_id', 'funnel_stage_id'], 'idx_opportunities_company_stage');

            // Index for user-specific queries
            $table->index(['company_id', 'user_id'], 'idx_opportunities_company_user');
        });

        Schema::table('leads', function (Blueprint $table) {
            // Composite index for filtering leads by company and status
            $table->index(['company_id', 'status'], 'idx_leads_company_status');

            // Index for temperature-based queries
            $table->index(['company_id', 'temperature'], 'idx_leads_company_temperature');

            // Index for created_at sorting
            $table->index(['company_id', 'created_at'], 'idx_leads_company_created');
        });

        Schema::table('accounts_payables', function (Blueprint $table) {
            // Composite index for financial queries
            $table->index(['company_id', 'status'], 'idx_payable_company_status');
            $table->index(['company_id', 'due_date'], 'idx_payable_company_due_date');
        });

        Schema::table('accounts_receivables', function (Blueprint $table) {
            // Composite index for financial queries
            $table->index(['company_id', 'status'], 'idx_receivable_company_status');
            $table->index(['company_id', 'due_date'], 'idx_receivable_company_due_date');
        });

        Schema::table('contracts', function (Blueprint $table) {
            // Composite index for contract queries
            $table->index(['company_id', 'status'], 'idx_contracts_company_status');
            $table->index(['company_id', 'start_date'], 'idx_contracts_company_start_date');
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            // Composite index for audit queries
            $table->index(['company_id', 'created_at'], 'idx_audit_logs_company_created');
            $table->index(['company_id', 'user_id'], 'idx_audit_logs_company_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('opportunities', function (Blueprint $table) {
            $table->dropIndex('idx_opportunities_company_status');
            $table->dropIndex('idx_opportunities_company_created');
            $table->dropIndex('idx_opportunities_company_stage');
            $table->dropIndex('idx_opportunities_company_user');
        });

        Schema::table('leads', function (Blueprint $table) {
            $table->dropIndex('idx_leads_company_status');
            $table->dropIndex('idx_leads_company_temperature');
            $table->dropIndex('idx_leads_company_created');
        });

        Schema::table('accounts_payables', function (Blueprint $table) {
            $table->dropIndex('idx_payable_company_status');
            $table->dropIndex('idx_payable_company_due_date');
        });

        Schema::table('accounts_receivables', function (Blueprint $table) {
            $table->dropIndex('idx_receivable_company_status');
            $table->dropIndex('idx_receivable_company_due_date');
        });

        Schema::table('contracts', function (Blueprint $table) {
            $table->dropIndex('idx_contracts_company_status');
            $table->dropIndex('idx_contracts_company_start_date');
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex('idx_audit_logs_company_created');
            $table->dropIndex('idx_audit_logs_company_user');
        });
    }
};
