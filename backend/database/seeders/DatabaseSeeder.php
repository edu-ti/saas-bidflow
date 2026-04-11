<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Funnel;
use App\Models\FunnelStage;
use App\Models\Opportunity;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ─────────────────────────────────────
        //  1. Company (Tenant)
        // ─────────────────────────────────────
        $company = Company::create([
            'name'     => 'Licitações Master',
            'document' => '12.345.678/0001-99',
            'domain'   => 'licitacoesmaster.com.br',
        ]);

        // ─────────────────────────────────────
        //  2. Admin User
        // ─────────────────────────────────────
        $user = User::withoutGlobalScopes()->create([
            'company_id' => $company->id,
            'name'       => 'Administrador',
            'email'      => 'admin@bidflow.dev',
            'password'   => Hash::make('password'),
            'role'       => 'Admin',
            'status'     => 'Active',
        ]);

        $this->command->info("✅ Company '{$company->name}' created.");
        $this->command->info("✅ Admin: admin@bidflow.dev / password");

        // ─────────────────────────────────────
        //  3. Bot API Token
        // ─────────────────────────────────────
        $token = $user->createToken('bot-python')->plainTextToken;
        $this->command->info("🤖 Bot token: {$token}");
        $this->command->warn("   → Set this in test_bidflow_bot.py as API_TOKEN");

        // ─────────────────────────────────────
        //  4. Default Funnel + Stages
        // ─────────────────────────────────────
        $funnel = Funnel::withoutGlobalScopes()->create([
            'company_id'  => $company->id,
            'name'        => 'Licitações',
            'description' => 'Pipeline padrão de pregões públicos.',
            'is_default'  => true,
        ]);

        $stagesConfig = [
            ['name' => 'Captado',          'order' => 1, 'color' => '#3b82f6', 'probability' => 10,  'is_final_win' => false, 'is_final_loss' => false],
            ['name' => 'Análise Técnica',  'order' => 2, 'color' => '#a855f7', 'probability' => 30,  'is_final_win' => false, 'is_final_loss' => false],
            ['name' => 'Proposta Enviada', 'order' => 3, 'color' => '#f97316', 'probability' => 65,  'is_final_win' => false, 'is_final_loss' => false],
            ['name' => 'Homologado',       'order' => 4, 'color' => '#22c55e', 'probability' => 100, 'is_final_win' => true,  'is_final_loss' => false],
            ['name' => 'Descartado',       'order' => 5, 'color' => '#ef4444', 'probability' => 0,   'is_final_win' => false, 'is_final_loss' => true],
        ];

        /** @var FunnelStage[] $stages */
        $stages = [];
        foreach ($stagesConfig as $cfg) {
            $stages[$cfg['name']] = FunnelStage::withoutGlobalScopes()->create([
                'company_id' => $company->id,
                'funnel_id'  => $funnel->id,
                ...$cfg,
            ]);
        }

        $this->command->info("✅ Funnel '{$funnel->name}' with " . count($stages) . " stages created.");

        // ─────────────────────────────────────
        //  5. Sample Organization
        // ─────────────────────────────────────
        $org = Organization::withoutGlobalScopes()->create([
            'company_id'      => $company->id,
            'name'            => 'Prefeitura Municipal de Recife',
            'document_number' => '08.241.754/0001-48',
            'uasg_code'       => '925332',
            'sphere'          => 'Municipal',
            'phone'           => '(81) 3355-0000',
            'email'           => 'compras@recife.pe.gov.br',
        ]);

        // ─────────────────────────────────────
        //  6. Sample Opportunities (one per stage)
        // ─────────────────────────────────────
        $opportunities = [
            [
                'title'           => 'Pregão 001/2026 – Aquisição de Material de TI',
                'type'            => 'Bidding',
                'value'           => 150000.00,
                'funnel_stage_id' => $stages['Captado']->id,
            ],
            [
                'title'           => 'Pregão 002/2026 – Serviços de Limpeza Hospitalar',
                'type'            => 'Bidding',
                'value'           => 480000.00,
                'funnel_stage_id' => $stages['Análise Técnica']->id,
            ],
            [
                'title'           => 'Pregão 003/2026 – Fornecimento de Medicamentos',
                'type'            => 'Bidding',
                'value'           => 95000.00,
                'funnel_stage_id' => $stages['Proposta Enviada']->id,
                'bidding_metadata' => ['risco_edital' => 'Baixo', 'resumo' => 'Oportunidade alta margem'],
            ],
            [
                'title'           => 'Pregão 004/2026 – Manutenção de Frota Municipal',
                'type'            => 'Bidding',
                'value'           => 320000.00,
                'funnel_stage_id' => $stages['Homologado']->id,
            ],
        ];

        foreach ($opportunities as $opp) {
            Opportunity::withoutGlobalScopes()->create([
                'company_id'      => $company->id,
                'user_id'         => $user->id,
                'organization_id' => $org->id,
                ...$opp,
            ]);
        }

        $this->command->info("✅ " . count($opportunities) . " sample opportunities created.");
        $this->command->newLine();
        $this->command->info("🚀 BidFlow is ready! Run: php artisan serve");
        $this->command->line("   Frontend: npm run dev");
    }
}
