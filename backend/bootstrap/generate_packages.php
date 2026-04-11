<?php

$installed = json_decode(file_get_contents(__DIR__ . '/../vendor/composer/installed.json'), true);
$packages = $installed['packages'] ?? $installed;

$manifest = [];
foreach ($packages as $package) {
    $name = str_replace(__DIR__ . '/../vendor/', '', $package['name']);
    if (!empty($package['extra']['laravel'])) {
        $manifest[$name] = $package['extra']['laravel'];
    }
}

file_put_contents(
    __DIR__ . '/cache/packages.php',
    '<?php return ' . var_export($manifest, true) . ';'
);

echo "packages.php generated successfully!\n";
