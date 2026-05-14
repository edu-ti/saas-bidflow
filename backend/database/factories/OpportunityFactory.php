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
            'company_id' => null,
            'title' => fake()->sentence(3),
            'type' => 'Sale',
            'user_id' => null,
            'organization_id' => null,
            'value' => fake()->randomFloat(2, 1000, 1000000),
            'funnel_stage_id' => null,
            'notes' => fake()->optional()->paragraph(),
            'bidding_metadata' => [
                'risco_edital' => fake()->randomElement(['Baixo', 'Médio', 'Alto']),
                'data_limite_impugnacao' => fake()->dateTimeBetween('now', '+30 days')->format('d/m/Y'),
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
