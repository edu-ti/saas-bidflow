<?php

namespace Tests\Feature\Opportunity;

use App\Models\Company;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OpportunityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.master_domain' => 'master.localhost']);
        config(['app.app_domain' => 'app.localhost']);
    }

    public function test_listar_oportunidades_retorna_apenas_as_do_tenant_atual(): void
    {
        $company = Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id]);

        app()->instance('current_tenant_id', $company->id);

        Opportunity::factory()->count(5)->create(['company_id' => $company->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/opportunities');

        $response->assertStatus(200);
        $response->assertJsonCount(5, 'data');
    }

    public function test_criar_oportunidade_com_dados_validos_retorna_201(): void
    {
        $company = Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id]);

        app()->instance('current_tenant_id', $company->id);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/opportunities', [
                'title' => 'Nova Oportunidade de Teste',
                'type' => 'bidding',
                'value' => 50000,
                'notes' => 'Notas de teste',
            ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => ['id', 'title', 'type', 'value', 'company_id'],
        ]);
    }

    public function test_criar_oportunidade_sem_autenticacao_retorna_401(): void
    {
        $company = Company::factory()->create();
        app()->instance('current_tenant_id', $company->id);

        $response = $this->postJson('/api/opportunities', [
            'title' => 'Nova Oportunidade',
            'type' => 'bidding',
            'value' => 10000,
        ]);

        $response->assertStatus(401);
    }

    public function test_listar_oportunidades_sem_autenticacao_retorna_401(): void
    {
        $response = $this->getJson('/api/opportunities');

        $response->assertStatus(401);
    }
}