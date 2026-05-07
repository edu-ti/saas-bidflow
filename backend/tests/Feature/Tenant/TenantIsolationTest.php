<?php

namespace Tests\Feature\Tenant;

use App\Models\Company;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.master_domain' => 'master.localhost']);
        config(['app.app_domain' => 'app.localhost']);
    }

    public function test_recurso_criado_pelo_tenant_a_nao_aparece_na_listagem_do_tenant_b(): void
    {
        $companyA = Company::factory()->create(['subdomain' => 'companya']);
        $companyB = Company::factory()->create(['subdomain' => 'companyb']);

        $userA = User::factory()->create(['company_id' => $companyA->id]);
        $userB = User::factory()->create(['company_id' => $companyB->id]);

        app()->instance('current_tenant_id', $companyA->id);

        Opportunity::factory()->count(3)->create([
            'company_id' => $companyA->id,
            'title' => 'Oportunidade Tenant A',
        ]);

        Opportunity::factory()->count(2)->create([
            'company_id' => $companyB->id,
            'title' => 'Oportunidade Tenant B',
        ]);

        $responseA = $this->actingAs($userA, 'sanctum')
            ->getJson('/api/opportunities');

        $opportunitiesA = $responseA->json('data');
        $this->assertCount(3, $opportunitiesA);
        $this->assertTrue(collect($opportunitiesA)->every(fn($o) => $o['company_id'] === $companyA->id));
    }

    public function test_company_id_e_injetado_ao_criar_recurso(): void
    {
        $company = Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id]);

        app()->instance('current_tenant_id', $company->id);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/opportunities', [
                'title' => 'Nova Oportunidade',
                'type' => 'bidding',
                'value' => 10000,
            ]);

        $response->assertStatus(201);

        $opportunity = Opportunity::where('title', 'Nova Oportunidade')->first();
        $this->assertNotNull($opportunity);
        $this->assertEquals($company->id, $opportunity->company_id);
    }

    public function test_query_sem_tenant_ativo_retorna_todos_registros_com_without_tenant(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();

        Opportunity::factory()->count(3)->create(['company_id' => $companyA->id]);
        Opportunity::factory()->count(2)->create(['company_id' => $companyB->id]);

        $opportunitiesWithoutTenant = Opportunity::withoutTenant()->get();

        $this->assertEquals(5, $opportunitiesWithoutTenant->count());
    }
}