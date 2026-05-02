<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
$users = User::where('is_superadmin', 1)->get(['id', 'name', 'email', 'is_superadmin']);
echo $users->toJson(JSON_PRETTY_PRINT);
