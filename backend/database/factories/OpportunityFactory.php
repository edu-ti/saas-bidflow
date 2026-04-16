<?php

namespace Database\Factories;

use App\Models\Opportunity;
use App\Models\User;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Opportunity>
 */
class OpportunityFactory extends Factory
{
    protected $model = Opportunity::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => null, // Will be set by the test
            'title' => fake()->sentence(3),
            'type' => fake()->randomElement(['Pregão Eletrônico', 'Concorrência', 'Dispensa', 'Inexigibilidade']),
            'user_id' => null, // Will be set by the test
            'organization_id' => null,
            'description' => fake()->paragraph(),
            'estimated_value' => fake()->randomFloat(2, 1000, 1000000),
            'status' => fake()->randomElement(['captured', 'analysis', 'proposal', 'won', 'lost']),
            'funnel_stage_id' => fake()->numberBetween(1, 5),
            'notes' => fake()->optional()->paragraph(),
            'bidding_metadata' => [
                'risco_edital' => fake()->randomElement(['Baixo', 'Médio', 'Alto']),
                'data_limite_impugnacao' => fake()->optional()->dateTimeBetween('now', '+30 days')->format('d/m/Y'),
            ],
        ];
    }

    /**
     * Configure the model factory.
     */
    public function configure(): static
    {
        return $this->afterMaking(function (Opportunity $opportunity) {
            //
        })->afterCreating(function (Opportunity $opportunity) {
            //
        });
    }
}
