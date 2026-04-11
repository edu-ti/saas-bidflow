<?php
// webhook.php

// --- CONFIGURAÇÃO E SEGURANÇA ---
ini_set('display_errors', 1); // Temporariamente ligado para depuração
ini_set('log_errors', 1);
error_reporting(E_ALL);
ini_set('error_log', 'webhook_errors.log'); // Log de erros PHP

require_once 'config.php';
require_once 'api/core/Database.php';

// Função de log para depuração
function log_message($message) {
    file_put_contents('webhook_log.txt', date('Y-m-d H:i:s') . " - " . $message . "\n\n", FILE_APPEND);
}

// --- VERIFICAÇÃO DO WEBHOOK (SETUP INICIAL) ---
$verify_token = '8134232022'; // DEVE SER O MESMO TOKEN USADO NO PAINEL DE DESENVOLVEDOR DA META
$hub_verify_token = $_GET['hub_verify_token'] ?? null;
if ($hub_verify_token === $verify_token) {
    log_message("Verificação do Webhook bem-sucedida. Challenge: " . ($_GET['hub_challenge'] ?? 'N/A'));
    echo $_GET['hub_challenge'];
    exit;
}
log_message("Acesso ao webhook (não verificação). Método: " . $_SERVER['REQUEST_METHOD']);


// --- PROCESSAMENTO DOS DADOS DO LEAD ---
$input = file_get_contents('php://input');
log_message("Dados brutos recebidos: " . $input); // Log para depuração

$data = json_decode($input, true);

// Verifica a estrutura esperada para leads do Facebook/Instagram
if (isset($data['entry'][0]['changes'][0]['value']['leadgen_id']) && isset($data['entry'][0]['changes'][0]['value']['form_id'])) {
    $leadgen_id = $data['entry'][0]['changes'][0]['value']['leadgen_id'];
    $form_id_received = $data['entry'][0]['changes'][0]['value']['form_id']; // ID do formulário que gerou o lead
    log_message("Lead ID recebido: {$leadgen_id}, Form ID: {$form_id_received}");

    // *** ALTERAÇÃO: Define o mapeamento de Form ID para Nome do Produto ***
    // PRECISA ATUALIZAR ESTA LISTA COM OS SEUS IDs E NOMES CORRETOS!
    $form_id_to_product_map = [
        '1446155639775798' => 'FR_Sendline', // Exemplo baseado no seu log
        '1814290879464646' => 'FR_Oximetro',
        '2239635346507878' => 'FR_Ultrasoom',
        // Adicione mais mapeamentos conforme necessário
    ];

    // Determina o produto_interesse com base no form_id
    $produto_interesse_from_form_id = $form_id_to_product_map[$form_id_received] ?? 'Formulário Desconhecido (' . $form_id_received . ')';
    log_message("Produto/Interesse determinado pelo Form ID: " . $produto_interesse_from_form_id);


    // Obtenha os detalhes do lead usando a Graph API
    $page_access_token = 'EAAR7vNttS68BPn4vPdNDtrU9wlQJxnVwF91ZA5I43c1kg4TKZBO3NwGOsBZCBB7QBlybTPyCZCCled6ZAVfRcrjBRFe99Ipk8DKBI2U4ZBi4KgLEVYQ9fal4A07vRqufWdlTR8nfHBUIH7LsfKyWV4H94iXdHXsGEJVLk1FGi8RyOqkHAXZBPvL1BZBGCk21dnJC2AN9R8iCoZAUPIQvPog04z6pb'; // SUBSTITUA PELO SEU TOKEN DE ACESSO À PÁGINA VÁLIDO
    // *** ALTERAÇÃO: Remove 'form_name' dos campos solicitados ***
    $graph_url = "https://graph.facebook.com/v15.0/{$leadgen_id}?fields=field_data,form_id&access_token={$page_access_token}";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $graph_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    // curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Descomente apenas se tiver problemas de SSL em ambiente local
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    if ($http_code !== 200 || !$response) {
        log_message("ERRO ao buscar detalhes do lead na Graph API. Código HTTP: {$http_code}. Erro cURL: {$curl_error}. Resposta: {$response}");
        http_response_code(500); // Indica erro ao Meta
        exit;
    }

    $lead_data = json_decode($response, true);
    log_message("Dados do Lead da API Graph: " . print_r($lead_data, true));

    if (isset($lead_data['field_data'])) {
        $lead_details = [];
        foreach ($lead_data['field_data'] as $field) {
            // Guarda o valor usando o nome do campo como chave
            if (isset($field['name']) && isset($field['values'][0])) {
                 $lead_details[$field['name']] = $field['values'][0];
            }
        }
        log_message("Detalhes do campo extraídos: " . print_r($lead_details, true));


        $nome = $lead_details['full_name'] ?? ($lead_details['nome_completo'] ?? 'Lead sem nome');
        $email = $lead_details['email'] ?? null;
        $telefone = $lead_details['poderia_nos_informar_seu_número_de_contato_ou_whatsapp_atualizado,_por_favor?'] ?? ($lead_details['phone_number'] ?? null);

        // *** ALTERAÇÃO: Usa o mapeamento pelo Form ID como 'produto_interesse' ***
        // Tenta pegar do campo 'produto_interesse' se existir, senão usa o mapeamento pelo form_id
        $produto_interesse_form_field = $lead_details['produto_interesse'] ?? null;
        $produto_interesse = $produto_interesse_form_field ?: $produto_interesse_from_form_id;

        $observacao = $lead_details['observacoes'] ?? null;

        $origem = 'Meta Ads';

        // Validação básica - precisa ter nome e (email ou telefone)
        if (empty($nome) || (empty($email) && empty($telefone))) {
            log_message("AVISO: Lead ignorado por falta de nome ou contato (email/telefone). Nome='{$nome}', Email='{$email}', Telefone='{$telefone}'");
             http_response_code(200); // Responde OK para o Meta, mas não processa
            exit;
        }


        try {
            $database = new Database();
            $pdo = $database->getConnection();

            // Verifica se já existe um lead com o mesmo email ou telefone (ignora se for null)
            $sql_check = "SELECT id FROM leads WHERE (? IS NOT NULL AND email = ?) OR (? IS NOT NULL AND telefone = ?) LIMIT 1";
            $stmt_check = $pdo->prepare($sql_check);
            $stmt_check->execute([$email, $email, $telefone, $telefone]);
            $existing_lead_id = $stmt_check->fetchColumn();

            if ($existing_lead_id) {
                log_message("AVISO: Lead duplicado detectado (email ou telefone já existe). Lead ID existente: {$existing_lead_id}. Nome recebido: '{$nome}'.");
                 http_response_code(200); // Informa o Meta que recebeu, mas não insere duplicado
            } else {
                // Inclui 'produto_interesse' na inserção
                $sql = "INSERT INTO leads (nome, email, telefone, origem, produto, produto_interesse, observacao, status, data_chegada, dados_brutos) VALUES (?, ?, ?, ?, ?, ?, ?, 'Novo', NOW(), ?)";
                $stmt = $pdo->prepare($sql);
                // O campo 'produto' antigo pode ficar nulo ou receber o mesmo valor, dependendo da sua necessidade
                $stmt->execute([$nome, $email, $telefone, $origem, null, $produto_interesse, $observacao, json_encode($lead_data)]);

                log_message("SUCESSO: Lead '{$nome}' (Produto/Interesse: '{$produto_interesse}') inserido no banco.");
                 http_response_code(200); // Sucesso
            }

        } catch (PDOException $e) {
            log_message("ERRO DE BANCO: " . $e->getMessage());
             http_response_code(500); // Erro interno do servidor
        }
    } else {
         log_message("AVISO: Estrutura 'field_data' não encontrada na resposta da Graph API.");
         http_response_code(200); // Responde OK, mas não processa
    }
} else {
    log_message("AVISO: Payload recebido não corresponde à estrutura esperada de um lead do Meta Ads (faltando leadgen_id ou form_id).");
    http_response_code(400); // Bad Request - Payload inválido
}

// Resposta final (se não saiu antes)
// http_response_code(200); // Garante resposta 200 se chegou até aqui sem erros fatais
exit; // Termina o script

