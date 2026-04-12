<?php

namespace App\Jobs;

use App\Models\Opportunity;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class PredictWinProbabilityJob implements ShouldQueue
{
    use Queueable;

    public $opportunity;

    public function __construct(Opportunity $opportunity)
    {
        $this->opportunity = $opportunity;
    }

    public function handle(): void
    {
        // Simular um atraso na comunicação com o Python/ML Model real
        sleep(2); 

        // Como mock, calcularemos uma probabilidade baseada em dados dummy
        // No mundo real, faríamos um Http::get ou Http::post pro bot_python
        $baseProb = 50.0;
        
        // Exemplo: se o budget for alto, a probabilidade varia.
        if ($this->opportunity->estimated_value > 100000) {
            $baseProb += 15.3;
        }

        $this->opportunity->update([
            'win_probability' => min(99.99, $baseProb + rand(0, 10))
        ]);
    }
}
