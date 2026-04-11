<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Funnel;
use App\Models\FunnelStage;
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
        // 1. Create the Tenant Company
        $company = Company::create([
            'name' => 'Licitações Master',
            'document' => '12.345.678/0001-99',
        ]);

        // 2. Create the Admin User (disable TenantScope for seeding)
        $user = User::withoutGlobalScopes()->create([
            'company_id' => $company->id,
            'name' => 'Administrador',
            'email' => 'admin@bidflow.dev',
            'password' => Hash::make('password'),
            'role' => 'Admin',
        ]);

        $this->command->info("✅ Company '{$company->name}' created.");
        $this->command->info("✅ Admin user: admin@bidflow.dev / password");

        // 3. Generate an API token for the bot
        $token = $user->createToken('bot-python')->plainTextToken;
        $this->command->info("🤖 Bot API Token: {$token}");
        $this->command->warn("   → Set this as API_TOKEN in test_bidflow_bot.py");

        // 4. Create the default Funnel (Pipeline)
        $funnel = Funnel::withoutGlobalScopes()->create([
            'company_id' => $company->id,
            'name' => 'Pipeline Padrão de Licitações',
            'description' => 'Funil padrão para gerenciamento de pregões.',
            'is_default' => true,
        ]);

        // 5. Create the Funnel Stages
        $stages = [
            ['name' => 'Edital Aberto', 'order' => 1, 'color' => '#3b82f6', 'probability' => 10,  'is_final_win' => false, 'is_final_loss' => false],
            ['name' => 'Análise',       'order' => 2, 'color' => '#a855f7', 'probability' => 25,  'is_final_win' => false, 'is_final_loss' => false],
            ['name' => 'Proposta',      'order' => 3, 'color' => '#f97316', 'probability' => 60,  'is_final_win' => false, 'is_final_loss' => false],
            ['name' => 'Homologado',    'order' => 4, 'color' => '#22c55e', 'probability' => 100, 'is_final_win' => true,  'is_final_loss' => false],
            ['name' => 'Descartado',    'order' => 5, 'color' => '#ef4444', 'probability' => 0,   'is_final_win' => false, 'is_final_loss' => true],
        ];

        foreach ($stages as $stageData) {
            FunnelStage::withoutGlobalScopes()->create([
                'funnel_id' => $funnel->id,
                'company_id' => $company->id,
                ...$stageData
            ]);
        }

        $this->command->info("✅ Default Funnel '{$funnel->name}' created with " . count($stages) . " stages.");
        $this->command->info("\n🚀 BidFlow seeded successfully! Run: php artisan serve");
    }
}
