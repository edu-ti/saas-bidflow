<?php
// config.php




/**
 * Arquivo de configuração do banco de dados.
 * Define as constantes usadas para a conexão com o MySQL.
 */

/**
 * Cria um hash seguro de uma senha usando o algoritmo padrão do PHP.
 * Esta é a maneira mais recomendada e segura de armazenar senhas.
 *
 * @param string $password A senha em texto simples.
 * @return string A senha criptografada (hash).
 */
function hashPassword($password)
{
    // PASSWORD_DEFAULT usa o algoritmo mais forte disponível na sua versão do PHP
    // e é atualizado automaticamente em futuras versões.
    return password_hash($password, PASSWORD_DEFAULT);
}


/**
 * Carrega variáveis de ambiente de um arquivo .env
 *
 * @param string $path Caminho para o arquivo .env
 */
function loadEnv($path)
{
    if (!file_exists($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value, " \t\n\r\0\x0B\"'");

        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

// Carrega o arquivo .env da raiz
loadEnv(__DIR__ . '/.env');

define('DB_HOST', getenv('DB_HOST'));
define('DB_NAME', getenv('DB_NAME'));
define('DB_USER', getenv('DB_USER'));
define('DB_PASS', getenv('DB_PASS'));
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

// --- Email Configuration ---
define('MAIL_DRIVER', getenv('MAIL_DRIVER') ?: 'sendgrid'); // 'smtp' or 'sendgrid'
define('SMTP_HOST', getenv('SMTP_HOST'));
define('SMTP_PORT', getenv('SMTP_PORT'));
define('SMTP_USER', getenv('SMTP_USER'));
define('SMTP_PASS', getenv('SMTP_PASS'));
define('SMTP_SECURE', getenv('SMTP_SECURE')); // 'tls' or 'ssl'
define('MAIL_FROM_ADDRESS', getenv('MAIL_FROM_ADDRESS'));
define('MAIL_FROM_NAME', getenv('MAIL_FROM_NAME'));
define('SENDGRID_API_KEY', getenv('SENDGRID_API_KEY'));

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    // Em produção, não mostre o erro detalhado ao usuário
    error_log('Database Connection Error: ' . $e->getMessage());
    die('Erro de conexão com o banco de dados.');
}

