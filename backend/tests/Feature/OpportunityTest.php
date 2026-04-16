<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OpportunityTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Company $company;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::create([
            'name' => 'Test Company',
            'document' => '12345678901234',
            'domain' => 'testcompany.com',
        ]);

        $this->user = User::create([
            'company_id' => $this->company->id,
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'role' => 'Standard',
        ]);
    }

    public function test_user_can_list_opportunities()
    {
        Opportunity::create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
            'title' => 'Test Opportunity 1',
            'type' => 'Pregão Eletrônico',
            'estimated_value' => 10000.00,
            'status' => 'captured',
        ]);

        Opportunity::create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
            'title' => 'Test Opportunity 2',
            'type' => 'Concorrência',
            'estimated_value' => 50000.00,
            'status' => 'analysis',
        ]);

        $token = $this->user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/opportunities');

        $response->assertStatus(200);
    }

    public function test_user_can_create_opportunity()
    {
        $token = $this->user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/opportunities', [
                    'title' => 'New Opportunity',
                    'type' => 'Pregão Eletrônico',
                    'estimated_value' => 10000.00,
                    'status' => 'captured',
                ]);

        $response->assertStatus(201)
            ->assertJson(['title' => 'New Opportunity']);

        $this->assertDatabaseHas('opportunities', [
            'title' => 'New Opportunity',
            'company_id' => $this->company->id,
        ]);
    }

    public function test_user_can_view_single_opportunity()
    {
        $opportunity = Opportunity::create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
            'title' => 'View Test',
            'type' => 'Pregão Eletrônico',
            'estimated_value' => 20000.00,
            'status' => 'captured',
        ]);

        $token = $this->user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/opportunities/' . $opportunity->id);

        $response->assertStatus(200)
            ->assertJson(['id' => $opportunity->id]);
    }

    public function test_user_can_update_opportunity()
    {
        $opportunity = Opportunity::create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
            'title' => 'Old Title',
            'type' => 'Pregão Eletrônico',
            'estimated_value' => 15000.00,
            'status' => 'captured',
        ]);

        $token = $this->user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/opportunities/' . $opportunity->id, [
                    'title' => 'New Title',
                    'type' => 'Concorrência',
                    'estimated_value' => 25000.00,
                ]);

        $response->assertStatus(200)
            ->assertJson(['title' => 'New Title']);

        $this->assertDatabaseHas('opportunities', [
            'id' => $opportunity->id,
            'title' => 'New Title',
        ]);
    }

    public function test_user_can_delete_opportunity()
    {
        $opportunity = Opportunity::create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
            'title' => 'Delete Test',
            'type' => 'Pregão Eletrônico',
            'estimated_value' => 30000.00,
            'status' => 'captured',
        ]);

        $token = $this->user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->deleteJson('/api/opportunities/' . $opportunity->id);

        $response->assertStatus(200);

        $this->assertSoftDeleted('opportunities', [
            'id' => $opportunity->id,
        ]);
    }

    public function test_user_cannot_see_opportunities_from_other_company()
    {
        $otherCompany = Company::create([
            'name' => 'Other Company',
            'document' => '98765432109876',
            'domain' => 'othercompany.com',
        ]);

        $otherOpportunity = Opportunity::create([
            'company_id' => $otherCompany->id,
            'title' => 'Other Company Opp',
            'type' => 'Pregão Eletrônico',
            'estimated_value' => 40000.00,
            'status' => 'captured',
        ]);

        $token = $this->user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/opportunities/' . $otherOpportunity->id);

        $response->assertStatus(404);
    }
}
