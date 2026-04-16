<?php

namespace Tests\Unit;

use App\Models\Company;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MultiTenancyTest extends TestCase
{
    use RefreshDatabase;

    public function test_company_model_has_correct_structure()
    {
        $company = Company::factory()->make([
            'name' => 'Test Company',
            'domain' => 'testcompany.com',
        ]);

        $this->assertEquals('Test Company', $company->name);
        $this->assertEquals('testcompany.com', $company->domain);
    }

    public function test_user_belongs_to_company()
    {
        $company = Company::factory()->create();
        $user = User::factory()->make(['company_id' => $company->id]);

        $this->assertEquals($company->id, $user->company_id);
    }

    public function test_opportunity_belongs_to_company()
    {
        $company = Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id]);
        
        $opportunity = Opportunity::factory()->make([
            'company_id' => $company->id,
            'user_id' => $user->id,
        ]);

        $this->assertEquals($company->id, $opportunity->company_id);
        $this->assertEquals($user->id, $opportunity->user_id);
    }
}
