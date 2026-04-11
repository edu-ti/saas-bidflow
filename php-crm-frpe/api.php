<?php
// api.php - Roteador Principal

// --- CONFIGURAÇÃO INICIAL E SEGURANÇA ---
// --- CONFIGURAÇÃO INICIAL E SEGURANÇA ---
date_default_timezone_set('America/Recife');
error_reporting(E_ALL);
// Em produção, display_errors deve ser 0 e log_errors deve ser 1
ini_set('display_errors', 0);
ini_set('log_errors', 1);
// ini_set('error_log', '/path/to/your/php-error.log'); // Defina um caminho se necessário

session_start();

// --- INCLUSÃO DE ARQUIVOS ESSENCIAIS ---
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/config.php';

require_once __DIR__ . '/api/core/helpers.php';
require_once __DIR__ . '/api/core/Database.php';

// Observação: Os handlers agora são carregados dinamicamente apenas quando necessários.

// --- MANIPULADORES DE ERRO GLOBAIS ---
set_error_handler('handle_php_error');
set_exception_handler(function ($exception) {
    handle_php_error(
        $exception->getCode(),
        $exception->getMessage(),
        $exception->getFile(),
        $exception->getLine()
    );
});

header("Content-Type: application/json");

// --- PROCESSAMENTO DA REQUISIÇÃO ---
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$data = [];

// Popula $data com base no método
if ($method === 'POST' || $method === 'PUT' || $method === 'DELETE') {
    $input = file_get_contents('php://input');
    if ($input) {
        $decoded_data = json_decode($input, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $data = $decoded_data;
        }
    }
} elseif ($method === 'GET') {
    $data = $_GET;
}

try {
    // $pdo já foi inicializado em config.php
    if (!isset($pdo)) {
        throw new Exception("Erro: Conexão com o banco de dados não estabelecida.");
    }

    // $database = new Database();
    // $pdo = $database->getConnection();

    // Definição das Rotas
    // Estrutura: 'action' => ['method' => 'GET/POST', 'file' => 'path/to/file.php', 'function' => 'function_name']

    // Rotas Públicas
    $public_routes = [
        'login' => ['method' => 'POST', 'file' => '/api/handlers/auth_handler.php', 'function' => 'handle_login'],
        'fetch_cnpj' => ['method' => 'GET', 'file' => '/api/handlers/external_api_handler.php', 'function' => 'handle_fetch_cnpj'],
        'fetch_cep' => ['method' => 'GET', 'file' => '/api/handlers/external_api_handler.php', 'function' => 'handle_fetch_cep'],
        'migrate_db' => ['method' => 'GET', 'file' => '/api/handlers/opportunity_handler.php', 'function' => 'handle_migrate_db_opps'],
    ];

    // Verifica rotas públicas
    if (isset($public_routes[$action])) {
        $route = $public_routes[$action];
        if ($method === $route['method']) {
            require_once __DIR__ . $route['file'];
            if ($action === 'fetch_cnpj') {
                $route['function']($data['cnpj'] ?? '');
            } elseif ($action === 'fetch_cep') {
                $route['function']($data['cep'] ?? '');
            } else {
                $route['function']($pdo, $data);
            }
            exit;
        }
    }

    // Rota Especial de Upload (Verificação Personalizada)
    if ($action === 'upload_email_image' && $method === 'POST') {
        if (!isset($_SESSION['user_id'])) {
            json_response(['error' => 'Acesso não autorizado para upload.'], 401);
        }
        require_once __DIR__ . '/api/handlers/email_handler.php';
        handle_upload_email_image();
        exit;
    }

    // --- Rotas Protegidas (Requerem Login) ---
    if (!isset($_SESSION['user_id'])) {
        json_response(['error' => 'Acesso não autorizado.'], 401);
    }

    // Mapeamento de Rotas Protegidas
    $protected_routes = [
        // Auth
        'logout' => ['method' => 'POST', 'file' => '/api/handlers/auth_handler.php', 'function' => 'handle_logout'],

        // Data
        'get_data' => ['method' => 'GET', 'file' => '/api/handlers/data_handler.php', 'function' => 'handle_get_data'],
        'get_stats' => ['method' => 'GET', 'file' => '/api/handlers/data_handler.php', 'function' => 'handle_get_stats'],

        // Vendas Fornecedores
        'create_venda_fornecedor' => ['method' => 'POST', 'file' => '/api/handlers/data_handler.php', 'function' => 'handle_create_venda_fornecedor'],
        'update_venda_fornecedor' => ['method' => 'POST', 'file' => '/api/handlers/data_handler.php', 'function' => 'handle_update_venda_fornecedor'],
        'delete_venda_fornecedor' => ['method' => 'POST', 'file' => '/api/handlers/data_handler.php', 'function' => 'handle_delete_venda_fornecedor'],

        // Oportunidades
        'create_opportunity' => ['method' => 'POST', 'file' => '/api/handlers/opportunity_handler.php', 'function' => 'handle_create_opportunity'],
        'update_opportunity' => ['method' => 'POST', 'file' => '/api/handlers/opportunity_handler.php', 'function' => 'handle_update_opportunity'],
        'delete_opportunity' => ['method' => 'POST', 'file' => '/api/handlers/opportunity_handler.php', 'function' => 'handle_delete_opportunity'],
        'move_opportunity' => ['method' => 'POST', 'file' => '/api/handlers/opportunity_handler.php', 'function' => 'handle_move_opportunity'],
        'get_opportunity_details' => ['method' => 'GET', 'file' => '/api/handlers/opportunity_handler.php', 'function' => 'handle_get_opportunity_details'],
        'transfer_opportunity' => ['method' => 'POST', 'file' => '/api/handlers/opportunity_handler.php', 'function' => 'handle_transfer_opportunity'],

        // Organizações
        'create_organization' => ['method' => 'POST', 'file' => '/api/handlers/organization_handler.php', 'function' => 'handle_create_organization'],
        'update_organization' => ['method' => 'POST', 'file' => '/api/handlers/organization_handler.php', 'function' => 'handle_update_organization'],
        'delete_organization' => ['method' => 'POST', 'file' => '/api/handlers/organization_handler.php', 'function' => 'handle_delete_organization'],
        'get_organization_details' => ['method' => 'GET', 'file' => '/api/handlers/organization_handler.php', 'function' => 'handle_get_organization_details'],

        // Contatos
        'create_contact' => ['method' => 'POST', 'file' => '/api/handlers/contact_handler.php', 'function' => 'handle_create_contact'],
        'update_contact' => ['method' => 'POST', 'file' => '/api/handlers/contact_handler.php', 'function' => 'handle_update_contact'],
        'get_contact_details' => ['method' => 'GET', 'file' => '/api/handlers/contact_handler.php', 'function' => 'handle_get_contact_details'],

        // Clientes PF
        'create_cliente_pf' => ['method' => 'POST', 'file' => '/api/handlers/client_pf_handler.php', 'function' => 'handle_create_cliente_pf'],
        'update_cliente_pf' => ['method' => 'POST', 'file' => '/api/handlers/client_pf_handler.php', 'function' => 'handle_update_cliente_pf'],
        'delete_cliente_pf' => ['method' => 'POST', 'file' => '/api/handlers/client_pf_handler.php', 'function' => 'handle_delete_cliente_pf'],
        'get_cliente_pf_details' => ['method' => 'GET', 'file' => '/api/handlers/client_pf_handler.php', 'function' => 'handle_get_cliente_pf_details'],
        'import_clients' => ['method' => 'POST', 'file' => '/api/handlers/client_pf_handler.php', 'function' => 'handle_import_clients'],

        // Propostas
        'create_proposal' => ['method' => 'POST', 'file' => '/api/handlers/proposal_handler.php', 'function' => 'handle_create_proposal'],
        'update_proposal' => ['method' => 'POST', 'file' => '/api/handlers/proposal_handler.php', 'function' => 'handle_update_proposal'],
        'delete_proposal' => ['method' => 'POST', 'file' => '/api/handlers/proposal_handler.php', 'function' => 'handle_delete_proposal'],
        'update_proposal_status' => ['method' => 'POST', 'file' => '/api/handlers/proposal_handler.php', 'function' => 'handle_update_proposal_status'],
        'get_proposal_details' => ['method' => 'GET', 'file' => '/api/handlers/proposal_handler.php', 'function' => 'handle_get_proposal_details'],
        'upload_image' => ['method' => 'POST', 'file' => '/api/handlers/proposal_handler.php', 'function' => 'handle_upload_image'],

        // Catálogo de Produtos
        'upload_product_image' => ['method' => 'POST', 'file' => '/api/handlers/product_handler.php', 'function' => 'handle_upload_product_image'],
        'create_product' => ['method' => 'POST', 'file' => '/api/handlers/product_handler.php', 'function' => 'handle_create_product'],
        'update_product' => ['method' => 'POST', 'file' => '/api/handlers/product_handler.php', 'function' => 'handle_update_product'],
        'delete_product' => ['method' => 'POST', 'file' => '/api/handlers/product_handler.php', 'function' => 'handle_delete_product'],

        // Tabela de Preço – Cabeçalho (Master)
        'get_price_tables'    => ['method' => 'GET',  'file' => '/api/handlers/product_handler.php', 'function' => 'handle_get_price_tables'],
        'create_price_table'  => ['method' => 'POST', 'file' => '/api/handlers/product_handler.php', 'function' => 'handle_create_price_table'],
        'update_price_table'  => ['method' => 'POST', 'file' => '/api/handlers/product_handler.php', 'function' => 'handle_update_price_table'],
        'delete_price_table'  => ['method' => 'POST', 'file' => '/api/handlers/product_handler.php', 'function' => 'handle_delete_price_table'],

        // Tabela de Preço – Itens (Detail)
        'create_price_table_item' => ['method' => 'POST', 'file' => '/api/handlers/product_handler.php', 'function' => 'handle_create_price_table_item'],
        'update_price_table_item' => ['method' => 'POST', 'file' => '/api/handlers/product_handler.php', 'function' => 'handle_update_price_table_item'],
        'delete_price_table_item' => ['method' => 'POST', 'file' => '/api/handlers/product_handler.php', 'function' => 'handle_delete_price_table_item'],

        // Kits
        'get_kits'    => ['method' => 'GET',  'file' => '/api/handlers/product_handler.php', 'function' => 'handle_get_kits'],
        'create_kit'  => ['method' => 'POST', 'file' => '/api/handlers/product_handler.php', 'function' => 'handle_create_kit'],
        'update_kit'  => ['method' => 'POST', 'file' => '/api/handlers/product_handler.php', 'function' => 'handle_update_kit'],
        'delete_kit'  => ['method' => 'POST', 'file' => '/api/handlers/product_handler.php', 'function' => 'handle_delete_kit'],

        // Usuários
        'create_user' => ['method' => 'POST', 'file' => '/api/handlers/user_handler.php', 'function' => 'handle_create_user'],
        'update_user' => ['method' => 'POST', 'file' => '/api/handlers/user_handler.php', 'function' => 'handle_update_user'],
        'delete_user' => ['method' => 'POST', 'file' => '/api/handlers/user_handler.php', 'function' => 'handle_delete_user'],

        // Agenda
        'get_agendamentos' => ['method' => 'GET', 'file' => '/api/handlers/agenda_handler.php', 'function' => 'handle_get_agendamentos'],
        'create_agendamento' => ['method' => 'POST', 'file' => '/api/handlers/agenda_handler.php', 'function' => 'handle_create_agendamento'],
        'update_agendamento' => ['method' => 'POST', 'file' => '/api/handlers/agenda_handler.php', 'function' => 'handle_update_agendamento'],
        'delete_agendamento' => ['method' => 'POST', 'file' => '/api/handlers/agenda_handler.php', 'function' => 'handle_delete_agendamento'],

        // Leads
        'update_lead_status' => ['method' => 'POST', 'file' => '/api/handlers/lead_handler.php', 'function' => 'handle_update_lead_status'],
        'update_lead_field' => ['method' => 'POST', 'file' => '/api/handlers/lead_handler.php', 'function' => 'handle_update_lead_field'],
        'update_lead_fields' => ['method' => 'POST', 'file' => '/api/handlers/lead_handler.php', 'function' => 'handle_update_lead_fields'],
        'import_leads' => ['method' => 'POST', 'file' => '/api/handlers/lead_handler.php', 'function' => 'handle_import_leads'],

        // Email Marketing
        'send_bulk_email_leads' => ['method' => 'POST', 'file' => '/api/handlers/email_handler.php', 'function' => 'handle_send_bulk_email_leads'],

        // Relatórios
        'get_report_data'          => ['method' => 'GET',  'file' => '/api/handlers/report_handler.php', 'function' => 'handle_get_report_data'],
        'get_supplier_targets'     => ['method' => 'GET',  'file' => '/api/handlers/report_handler.php', 'function' => 'handle_get_supplier_targets'],
        'save_targets'             => ['method' => 'POST', 'file' => '/api/handlers/report_handler.php', 'function' => 'handle_save_targets'],
        'get_report_kpis'          => ['method' => 'GET',  'file' => '/api/handlers/report_handler.php', 'function' => 'handle_get_report_kpis'],
        'export_pdf'               => ['method' => 'GET',  'file' => '/api/handlers/report_pdf_export.php', 'function' => 'handle_export_pdf'],
        // ── NOVAS ROTAS - Metas e Comissões ──────────────────────────────────────────
        'get_commission_config'    => ['method' => 'GET',  'file' => '/api/handlers/report_handler.php', 'function' => 'handle_get_commission_config'],
        'save_commission_config'   => ['method' => 'POST', 'file' => '/api/handlers/report_handler.php', 'function' => 'handle_save_commission_config'],
        'get_supplier_targets_all' => ['method' => 'GET',  'file' => '/api/handlers/report_handler.php', 'function' => 'handle_get_supplier_targets_all'],

        // Upload NF e Documentos
        'parse_invoice' => ['method' => 'POST', 'file' => '/api/handlers/invoice_parser_handler.php', 'function' => 'handle_parse_invoice'],
        'upload_document' => ['method' => 'POST', 'file' => '/api/handlers/opportunity_handler.php', 'function' => 'handle_upload_document'],

        // Funil Financeiro (Empenhos e NFs)
        'create_empenho' => ['method' => 'POST', 'file' => '/api/handlers/finance_handler.php', 'function' => 'handle_create_empenho'],
        'update_empenho' => ['method' => 'POST', 'file' => '/api/handlers/finance_handler.php', 'function' => 'handle_update_empenho'],
        'delete_empenho' => ['method' => 'POST', 'file' => '/api/handlers/finance_handler.php', 'function' => 'handle_delete_empenho'],
        'create_nota_fiscal' => ['method' => 'POST', 'file' => '/api/handlers/finance_handler.php', 'function' => 'handle_create_nota_fiscal'],
        'update_nota_fiscal' => ['method' => 'POST', 'file' => '/api/handlers/finance_handler.php', 'function' => 'handle_update_nota_fiscal'],
        'delete_nota_fiscal' => ['method' => 'POST', 'file' => '/api/handlers/finance_handler.php', 'function' => 'handle_delete_nota_fiscal'],
    ];

    if (isset($protected_routes[$action])) {
        $route = $protected_routes[$action];

        // Verifica método
        if ($method !== $route['method']) {
            // Aceita updates com POST mesmo se marcado como PUT/PATCH por simplicidade se necessário,
            // mas aqui seremos estritos ou permitiremos flexibilidade se o código legado depender disso.
            // O código original usava mostly POST p/ updates.
            // Mantendo checagem estrita baseada na definição acima:
            // Se o frontend envia POST para tudo, o array de rotas reflete isso.
        }

        if ($method === $route['method'] || ($route['method'] === 'POST' && ($method === 'PUT' || $method === 'DELETE'))) {
            // Flexibilização simples caso frontend use métodos RESTful mas backend espere POST
            // (Ou vice versa, ajustado conforme a definição no array)
            // Neste caso, se a definição diz POST, esperamos POST.
            if ($method !== $route['method']) {
                json_response(['error' => "Método incorreto. Esperado: {$route['method']}, Recebido: {$method}"], 405);
            }

            // Carrega o arquivo dinamicamente
            require_once __DIR__ . $route['file'];

            $handler_function = $route['function'];
            if (function_exists($handler_function)) {
                // Chama a função com os argumentos corretos
                if ($action === 'logout') {
                    $handler_function();
                } elseif (in_array($action, ['get_data', 'get_stats', 'get_agendamentos', 'get_report_kpis'])) {
                    // Alguns handlers GET antigos só recebem $pdo
                    $handler_function($pdo);
                } else {
                    // Padrão: $pdo e $data
                    $handler_function($pdo, $data);
                }
            } else {
                json_response(['error' => "Handler não encontrado: {$handler_function}"], 500);
            }
        } else {
            json_response(['error' => "Método não permitido."], 405);
        }

    } else {
        json_response(['error' => "Ação não encontrada: {$action}"], 404);
    }


} catch (PDOException $e) {
    // Log detalhado do erro PDO pode ser útil aqui
    error_log('Erro PDO: ' . $e->getMessage() . "\n" . $e->getTraceAsString()); // Log detalhado
    json_response(['error' => 'Erro de Base de Dados.'], 500); // Mensagem genérica para o cliente
} catch (Exception $e) {
    // Log detalhado do erro geral pode ser útil aqui
    error_log('Erro Geral: ' . $e->getMessage() . "\n" . $e->getTraceAsString()); // Log detalhado
    json_response(['error' => 'Erro Interno do Servidor.'], 500); // Mensagem genérica para o cliente
}

?>