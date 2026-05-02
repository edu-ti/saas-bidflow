<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
$u = User::where('email', 'admin@bidflow.dev')->first();
if ($u) {
    $u->is_superadmin = 1;
    $u->save();
    echo "User admin@bidflow.dev promoted to superadmin\n";
} else {
    echo "User admin@bidflow.dev not found\n";
}
