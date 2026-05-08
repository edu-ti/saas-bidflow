<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;

$user = User::where('email', 'admin@bidflow.dev')->first();

if ($user) {
    $user->is_admin = true;
    $user->is_superadmin = true;
    $user->save();
    echo "✅ Usuário admin@bidflow.dev atualizado com sucesso!\n";
    echo "   is_admin: " . ($user->is_admin ? 'true' : 'false') . "\n";
    echo "   is_superadmin: " . ($user->is_superadmin ? 'true' : 'false') . "\n";
} else {
    echo "❌ Usuário admin@bidflow.dev não encontrado.\n";
}
