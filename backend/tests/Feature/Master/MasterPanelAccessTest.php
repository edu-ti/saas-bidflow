<?php

namespace Tests\Feature\Master;

use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterPanelAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.master_domain' => 'master.localhost']);
    }

    public function test_requisicao_ao_painel_master_com_dominio_correto_retorna_200(): void
    {
        $company = Company::factory()->create(['subdomain' => 'test']);
        $user = User::factory()->create([
            'company_id' => $company->id,
            'is_superadmin' => true,
        ]);

        $this->actingAs($user, 'sanctum');

        $response = $this->getJson('http://master.localhost/api/master/dashboard');

        $response->assertStatus(200);
    }

    public function test_requisicao_ao_painel_master_com_dominio_errado_retorna_403(): void
    {
        $company = Company::factory()->create(['subdomain' => 'test']);
        $user = User::factory()->create([
            'company_id' => $company->id,
            'is_superadmin' => true,
        ]);

        $this->actingAs($user, 'sanctum');

        $response = $this->getJson('http://app.localhost/api/master/dashboard');

        $response->assertStatus(403);
    }

    public function test_usuario_sem_role_master_recebe_403_no_dominio_correto(): void
    {
        $company = Company::factory()->create(['subdomain' => 'test']);
        $user = User::factory()->create([
            'company_id' => $company->id,
            'is_superadmin' => false,
        ]);

        $this->actingAs($user, 'sanctum');

        $response = $this->getJson('http://master.localhost/api/master/dashboard');

        $response->assertStatus(403);
    }

    public function test_usuario_com_role_master_no_dominio_correto_recebe_200(): void
    {
        $company = Company::factory()->create(['subdomain' => 'test']);
        $user = User::factory()->create([
            'company_id' => $company->id,
            'is_superadmin' => true,
        ]);

        $this->actingAs($user, 'sanctum');

        $response = $this->getJson('http://master.localhost/api/master/dashboard');

        $response->assertStatus(200);
    }
}