<?php
// google_webhook.php - Receptor de Leads do Google Ads

// Ativa o log de erros em um arquivo, mas não exibe na tela.
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'google_webhook_errors.log'); // Erros de PHP serão salvos aqui.

// ===================================================================
// ARQUIVO DE CONFIGURAÇÃO
// ===================================================================

// Inclui config.php para carregar .env e constantes de DB
require_once __DIR__ . '/config.php';

// --- DADOS DO GOOGLE ADS ---
$google_webhook_secret = getenv('GOOGLE_WEBHOOK_SECRET');

// --- DADOS DO BANCO DE DADOS (USANDO CONSTANTES DO CONFIG.PHP) ---
// As variáveis abaixo são mantidas para compatibilidade com o resto do script,
// mas populadas a partir das constantes definidas via .env
$db_host = DB_HOST;
$db_user = DB_USER;
$db_pass = DB_PASS;
$db_name = DB_NAME;
$db_table = 'leads';

// --- ARQUIVO DE LOG PERSONALIZADO ---
$log_file = 'google_webhook_log.txt';

// Função para registrar mensagens no log
function log_message($message)
{
    global $log_file;
    file_put_contents($log_file, date("Y-m-d H:i:s") . " - " . $message . "\n", FILE_APPEND);
}

log_message("------ Script Acessado (Método: " . $_SERVER['REQUEST_METHOD'] . ") ------");

// ===================================================================
// PROCESSAMENTO DO WEBHOOK (SOMENTE MÉTODO POST)
// ===================================================================
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    log_message("Requisição com método não suportado: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405); // Method Not Allowed
    exit;
}

// 1. Receber os dados brutos da requisição
$raw_post_data = file_get_contents('php://input');
log_message("Dados brutos recebidos: " . $raw_post_data);

// 2. Decodificar o JSON
$payload = json_decode($raw_post_data, true);

// 3. Validar a chave secreta (Verificação de segurança)
if (!isset($payload['google_key']) || $payload['google_key'] !== $google_webhook_secret) {
    log_message("FALHA DE AUTENTICAÇÃO: A 'google_key' recebida não corresponde à chave secreta configurada.");
    http_response_code(403); // Forbidden
    exit;
}

log_message("Chave do Google validada com sucesso.");

// 4. Verificar se é um lead real ou um teste
if (isset($payload['is_test']) && $payload['is_test'] === true) {
    log_message("Recebida uma notificação de TESTE do Google. Nenhum dado será salvo.");
    http_response_code(200); // Responde OK para o teste
    exit;
}

// 5. Extrair os dados do lead
$nome = '';
$email = '';
$telefone = '';
$origem = 'Google Ads'; // Define a origem para o CRM

if (isset($payload['user_column_data']) && is_array($payload['user_column_data'])) {
    foreach ($payload['user_column_data'] as $field) {
        $column_id = $field['column_id'];
        $value = $field['string_value'];

        // Os IDs das colunas podem variar, mas geralmente seguem este padrão.
        // Verifique os dados de teste para confirmar os IDs corretos.
        switch ($column_id) {
            case 'FULL_NAME':
            case 'nome_completo':
                $nome = $value;
                break;
            case 'EMAIL':
            case 'email':
                $email = $value;
                break;
            case 'PHONE_NUMBER':
            case 'telefone':
                $telefone = $value;
                break;
        }
    }
}

log_message("Dados extraídos: Nome='{$nome}', Email='{$email}', Telefone='{$telefone}'");

if (empty($nome) && empty($email) && empty($telefone)) {
    log_message("AVISO: Nenhum dado de lead útil (nome, email, telefone) foi encontrado no payload.");
    http_response_code(200); // Responde OK, mas não faz nada.
    exit;
}

// 6. Inserir os dados no banco de dados
try {
    $pdo = new PDO("mysql:host={$db_host};dbname={$db_name};charset=utf8", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    log_message("Conexão com o banco de dados (PDO) bem-sucedida.");

    // Prepara a query para evitar duplicatas de email ou telefone, se existirem.
    // Se um lead com o mesmo email ou telefone já existir, ele não será inserido novamente.
    $stmt = $pdo->prepare(
        "INSERT INTO {$db_table} (nome, email, telefone, origem, dados_brutos)
         SELECT ?, ?, ?, ?, ? FROM DUAL
         WHERE NOT EXISTS (SELECT 1 FROM {$db_table} WHERE email = ? OR telefone = ? LIMIT 1)"
    );

    // Executa a query com os parâmetros
    $stmt->execute([
        $nome,
        $email,
        $telefone,
        $origem,
        $raw_post_data,
        $email, // para a verificação do WHERE NOT EXISTS
        $telefone // para a verificação do WHERE NOT EXISTS
    ]);

    if ($stmt->rowCount() > 0) {
        log_message("SUCESSO: Lead do Google salvo no banco de dados.");
    } else {
        log_message("AVISO: Lead do Google não foi inserido, pois um registro com o mesmo e-mail ou telefone já existe.");
    }

} catch (PDOException $e) {
    log_message("ERRO DE BANCO DE DADOS (PDO): " . $e->getMessage());
    http_response_code(500); // Erro interno do servidor
    exit;
}

// 7. Responder ao Google que tudo ocorreu bem.
http_response_code(200);
log_message("Processo finalizado com sucesso.");
