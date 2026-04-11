<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class GenerateApiToken extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'api:token {email : The email of the user} {name=Bot : The name of the token}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate a Sanctum API token for a specific user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $tokenName = $this->argument('name');

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("User with email {$email} not found.");
            return static::FAILURE;
        }

        $token = $user->createToken($tokenName);

        $this->info("Token created successfully for user {$user->name}!");
        $this->line("Token: " . $token->plainTextToken);

        return static::SUCCESS;
    }
}
