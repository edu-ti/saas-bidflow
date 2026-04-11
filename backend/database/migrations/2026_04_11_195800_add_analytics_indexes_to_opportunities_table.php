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
        Schema::table('opportunities', function (Blueprint $table) {
            $table->index(['company_id', 'funnel_stage_id'], 'opt_company_funnel_idx');
            $table->index('organization_id', 'opt_organization_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('opportunities', function (Blueprint $table) {
            $table->dropIndex('opt_company_funnel_idx');
            $table->dropIndex('opt_organization_idx');
        });
    }
};
