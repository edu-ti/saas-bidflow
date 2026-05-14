<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Índice crítico: users.company_id - usado em TODAS as queries de tenant
        Schema::table('users', function (Blueprint $table) {
            if (!$this->hasIndex('users', 'users_company_id_index')) {
                $table->index('company_id');
            }
        });

        // Índice para roles.company_id
        Schema::table('roles', function (Blueprint $table) {
            if (!$this->hasIndex('roles', 'roles_company_id_index')) {
                $table->index('company_id');
            }
        });

        // Índice composto para tasks: company_id + status (usado em stats e listagens)
        Schema::table('tasks', function (Blueprint $table) {
            if (!$this->hasIndex('tasks', 'tasks_company_status_index')) {
                $table->index(['company_id', 'status']);
            }
            if (!$this->hasIndex('tasks', 'tasks_company_due_date_index')) {
                $table->index(['company_id', 'due_date']);
            }
        });

        // Índice para events: company_id + start_date (usado na agenda)
        Schema::table('events', function (Blueprint $table) {
            if (!$this->hasIndex('events', 'events_company_start_date_index')) {
                $table->index(['company_id', 'start_date']);
            }
        });

        // Índice para opportunities: company_id + funnel_stage_id (usado no funil)
        Schema::table('opportunities', function (Blueprint $table) {
            if (!$this->hasIndex('opportunities', 'opp_company_funnel_idx')) {
                $table->index(['company_id', 'funnel_stage_id']);
            }
        });

        // Índice para personal_access_tokens: tokenable_type + tokenable_id (usado pelo Sanctum)
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            if (!$this->hasIndex('personal_access_tokens', 'pat_tokenable_index')) {
                $table->index(['tokenable_type', 'tokenable_id'], 'pat_tokenable_index');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['company_id']);
        });

        Schema::table('roles', function (Blueprint $table) {
            $table->dropIndex(['company_id']);
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex(['company_id', 'status']);
            $table->dropIndex(['company_id', 'due_date']);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex(['company_id', 'start_date']);
        });

        Schema::table('opportunities', function (Blueprint $table) {
            $table->dropIndex(['company_id', 'funnel_stage_id']);
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropIndex('pat_tokenable_index');
        });
    }

    private function hasIndex(string $table, string $indexName): bool
    {
        $indexes = Schema::getIndexes($table);
        foreach ($indexes as $index) {
            if ($index['name'] === $indexName) {
                return true;
            }
        }
        return false;
    }
};
