<?php
// api/handlers/lead_handler.php

// *** NOVO: Adiciona a necessidade da biblioteca PHPSpreadsheet ***
// Se não estiver a usar Composer, inclua manualmente.
// use PhpOffice\PhpSpreadsheet\IOFactory;

function handle_convert_lead_to_pre_proposal($pdo, $data)
{
    $lead_id = $data['lead_id'] ?? null;
    if (!$lead_id) {
        json_response(['success' => false, 'error' => 'ID do Lead não fornecido.'], 400);
    }

    $pdo->beginTransaction();

    try {
        // 1. Busca os dados do lead
        $stmt_lead = $pdo->prepare("SELECT * FROM leads WHERE id = ?");
        $stmt_lead->execute([$lead_id]);
        $lead = $stmt_lead->fetch(PDO::FETCH_ASSOC);

        if (!$lead) {
            throw new Exception('Lead não encontrado.');
        }

        // 2. Tenta encontrar um cliente PF existente com o mesmo email ou telefone
        $cliente_pf_id = null;
        if (!empty($lead['email']) || !empty($lead['telefone'])) {
            $sql_find_client = "SELECT id FROM clientes_pf WHERE ";
            $params_find = [];
            if (!empty($lead['email'])) {
                $sql_find_client .= "email = ? ";
                $params_find[] = $lead['email'];
            }
            if (!empty($lead['telefone'])) {
                $sql_find_client .= (count($params_find) > 0 ? "OR " : "") . "telefone = ?";
                $params_find[] = $lead['telefone'];
            }
            // Adiciona verificação para não buscar se ambos forem vazios
            if (!empty($params_find)) {
                $stmt_find = $pdo->prepare($sql_find_client . " LIMIT 1"); // Adiciona LIMIT 1
                $stmt_find->execute($params_find);
                $cliente_pf_id = $stmt_find->fetchColumn();
            }
        }


        // 3. Se não encontrar, cria um novo cliente PF
        if (!$cliente_pf_id && (!empty($lead['email']) || !empty($lead['telefone']))) { // Só cria se tiver email ou telefone
            $stmt_create_client = $pdo->prepare("INSERT INTO clientes_pf (nome, email, telefone) VALUES (?, ?, ?)");
            $stmt_create_client->execute([$lead['nome'], $lead['email'], $lead['telefone']]);
            $cliente_pf_id = $pdo->lastInsertId();
        }

        // 4. Busca o ID da primeira etapa do funil (pode ajustar o nome se necessário)
        $stmt_stage = $pdo->prepare("SELECT id FROM etapas_funil WHERE nome = 'Prospectando' LIMIT 1"); // Busca por 'Prospectando'
        $stmt_stage->execute();
        $first_stage_id = $stmt_stage->fetchColumn();
        if (!$first_stage_id) {
            // Se não encontrar 'Prospectando', tenta pegar a primeira pela ordem
            $stmt_stage_order = $pdo->prepare("SELECT id FROM etapas_funil ORDER BY ordem ASC LIMIT 1");
            $stmt_stage_order->execute();
            $first_stage_id = $stmt_stage_order->fetchColumn();
            if (!$first_stage_id) {
                throw new Exception('Nenhuma etapa inicial de funil encontrada.');
            }
        }


        // 5. Gera o número da pré-proposta
        $year = date('Y');
        $stmt_max = $pdo->prepare("SELECT MAX(CAST(SUBSTRING_INDEX(pre_proposal_number, '/', 1) AS UNSIGNED)) FROM oportunidades WHERE pre_proposal_number LIKE ?");
        $stmt_max->execute(["%/$year"]);
        $max_num = $stmt_max->fetchColumn();
        $next_num = ($max_num ? $max_num : 0) + 1;
        $pre_proposal_number = str_pad($next_num, 4, '0', STR_PAD_LEFT) . '/' . $year;

        // 6. Cria a nova oportunidade (pré-proposta)
        // Adicionado cliente_pf_id na inserção e ORIGEM
        $sql_insert_opp = "INSERT INTO oportunidades (titulo, cliente_pf_id, organizacao_id, contato_id, valor, etapa_id, usuario_id, comercial_user_id, pre_proposal_number, notas, descricao_produto, data_criacao, data_ultima_movimentacao, origem) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)";
        $stmt_insert_opp = $pdo->prepare($sql_insert_opp);

        $titulo_opp = 'Oportunidade de ' . $lead['nome'];

        $stmt_insert_opp->execute([
            $titulo_opp,
            $cliente_pf_id, // Adicionado
            null, // organizacao_id
            null, // contato_id
            0, // Valor inicial 0
            $first_stage_id,
            $_SESSION['user_id'],
            $data['comercial_user_id'] ?? $_SESSION['user_id'], // Usa o usuário selecionado ou o logado
            $pre_proposal_number,
            $lead['observacao'],
            $lead['produto_interesse'] ?? $lead['produto'], // Prioriza produto_interesse
            $lead['origem'] ?? null // Copia a origem do lead
        ]);
        $new_opportunity_id = $pdo->lastInsertId();

        // 7. Atualiza o status do lead e vincula a oportunidade
        $stmt_update_lead = $pdo->prepare("UPDATE leads SET status = 'Convertido em Oportunidade', oportunidade_id = ? WHERE id = ?");
        $stmt_update_lead->execute([$new_opportunity_id, $lead_id]);

        $pdo->commit();

        // 8. Retorna a nova oportunidade criada
        // Corrigido para buscar nome de cliente_pf
        $stmt_new_opp = $pdo->prepare("SELECT o.*, pf.nome as cliente_pf_nome, org.nome_fantasia as organizacao_nome, u.nome as vendedor_nome FROM oportunidades o LEFT JOIN clientes_pf pf ON o.cliente_pf_id = pf.id LEFT JOIN organizacoes org ON o.organizacao_id = org.id LEFT JOIN usuarios u ON o.usuario_id = u.id WHERE o.id = ?");
        $stmt_new_opp->execute([$new_opportunity_id]);
        $new_opportunity = $stmt_new_opp->fetch(PDO::FETCH_ASSOC);

        json_response(['success' => true, 'opportunity' => $new_opportunity]);

    } catch (Exception $e) {
        $pdo->rollBack();
        json_response(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// --- NOVO: Função para atualizar múltiplos campos ---
function handle_update_lead_fields($pdo, $data)
{
    $lead_id = $data['lead_id'] ?? null;
    $fields = $data['fields'] ?? null;

    if (!$lead_id || !is_array($fields) || empty($fields)) {
        json_response(['success' => false, 'error' => 'Dados insuficientes ou inválidos.'], 400);
    }

    $allowed_fields = ['nome', 'email', 'telefone', 'produto_interesse', 'observacao', 'sub_origem', 'campanha']; // Adicionado nome, email, telefone
    $set_clauses = [];
    $params = [];

    foreach ($fields as $field => $value) {
        if (in_array($field, $allowed_fields)) {
            $set_clauses[] = "$field = ?";
            $params[] = $value;
        } else {
            // Ignora campos não permitidos, mas pode logar se necessário
            error_log("Tentativa de atualizar campo não permitido no lead $lead_id: $field");
        }
    }

    if (empty($set_clauses)) {
        json_response(['success' => false, 'error' => 'Nenhum campo válido para atualização fornecido.'], 400);
    }

    $params[] = $lead_id; // Adiciona o ID ao final para o WHERE

    try {
        $sql = "UPDATE leads SET " . implode(', ', $set_clauses) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        json_response(['success' => true]);
    } catch (Exception $e) {
        // Verifica erro de duplicidade (código 23000 ou 1062)
        if ($e->getCode() == '23000' || strpos($e->getMessage(), 'Duplicate entry') !== false) {
            json_response(['success' => false, 'error' => 'Erro: Email ou telefone já existe para outro lead.'], 409); // Conflict
        } else {
            json_response(['success' => false, 'error' => 'Erro ao atualizar o lead: ' . $e->getMessage()], 500);
        }
    }
}


function handle_update_lead_field($pdo, $data)
{
    $lead_id = $data['lead_id'] ?? null;
    $field = $data['field'] ?? null;
    $value = $data['value'] ?? null;

    if (!$lead_id || !$field) {
        json_response(['success' => false, 'error' => 'Dados insuficientes.'], 400);
    }

    $allowed_fields = ['produto_interesse', 'observacao', 'sub_origem', 'campanha']; // Adicionado produto_interesse
    if (!in_array($field, $allowed_fields)) {
        json_response(['success' => false, 'error' => 'Campo inválido para atualização.'], 400);
    }

    try {
        $stmt = $pdo->prepare("UPDATE leads SET $field = ? WHERE id = ?");
        $stmt->execute([$value, $lead_id]);
        json_response(['success' => true]);
    } catch (Exception $e) {
        json_response(['success' => false, 'error' => 'Erro ao atualizar o lead: ' . $e->getMessage()], 500);
    }
}

function handle_update_lead_status($pdo, $data)
{
    $lead_id = $data['lead_id'] ?? null;
    $status = $data['status'] ?? null;

    if (!$lead_id || !$status) {
        json_response(['success' => false, 'error' => 'Dados insuficientes.'], 400);
    }

    // Lista atualizada de status válidos que podem ser salvos no DB
    $allowed_statuses_db = [
        'Novo',
        'Convertido em Oportunidade',
        'Aguardando', // Mantido para compatibilidade, representa 'Tentativa de Contato'
        'Recusado',
        'Proposta Enviada', // Mantido para compatibilidade, representa 'Envio de Proposta'
        'Leads Recebidos via API',
        // Novos status do funil que podem ser salvos
        'Tentativa de Contato',
        'Contato pendente',
        'Envio de Proposta',
        'Negociação',
        'Fechamento',
        'Oportunidade futura'
        // 'Cliente Potencial' é apenas visual, o status no DB é 'Novo'
    ];

    if (!in_array($status, $allowed_statuses_db)) {
        json_response(['success' => false, 'error' => "Status inválido fornecido: '$status'"], 400);
    }

    try {
        $stmt = $pdo->prepare("UPDATE leads SET status = ? WHERE id = ?");
        $stmt->execute([$status, $lead_id]);

        if ($stmt->rowCount() > 0) {
            // Retorna o status que foi efetivamente salvo no DB
            json_response(['success' => true, 'lead' => ['id' => $lead_id, 'status' => $status]]);
        } else {
            // Pode ser que o status já fosse o mesmo, não necessariamente um erro.
            $stmt_check = $pdo->prepare("SELECT COUNT(*) FROM leads WHERE id = ?");
            $stmt_check->execute([$lead_id]);
            if ($stmt_check->fetchColumn() > 0) {
                json_response(['success' => true, 'message' => 'Nenhuma alteração de status necessária.', 'lead' => ['id' => $lead_id, 'status' => $status]]);
            } else {
                json_response(['success' => false, 'error' => 'Lead não encontrado.'], 404);
            }
        }
    } catch (Exception $e) {
        json_response(['success' => false, 'error' => 'Erro ao atualizar o status do lead: ' . $e->getMessage()], 500);
    }
}


// --- NOVO: Função para importar leads ---
function handle_import_leads($pdo, $data)
{
    $leads_data = $data['leads'] ?? [];

    if (empty($leads_data)) {
        json_response(['success' => false, 'error' => 'Nenhum dado de lead recebido.'], 400);
    }

    $imported_count = 0;
    $duplicate_count = 0;
    $error_count = 0;
    $newly_imported_leads = [];

    // Prepara a query para inserir, ignorando duplicados (baseado em email ou telefone se existirem)
    $sql_check_duplicate = "SELECT id FROM leads WHERE (? IS NOT NULL AND email = ?) OR (? IS NOT NULL AND telefone = ?) LIMIT 1";
    $stmt_check = $pdo->prepare($sql_check_duplicate);

    $sql_insert = "INSERT INTO leads (nome, email, telefone, origem, produto_interesse, observacao, status, data_chegada) VALUES (?, ?, ?, ?, ?, ?, 'Novo', NOW())";
    $stmt_insert = $pdo->prepare($sql_insert);

    $pdo->beginTransaction();
    try {
        foreach ($leads_data as $lead) {
            $nome = trim($lead['nome'] ?? '');
            $email = !empty($lead['email']) ? trim($lead['email']) : null;
            $telefone = !empty($lead['telefone']) ? trim($lead['telefone']) : null;
            $origem = trim($lead['origem'] ?? 'Importado');
            $produto_interesse = trim($lead['produto_interesse'] ?? '');
            $observacao = trim($lead['observacao'] ?? '');

            // Validação mínima
            if (empty($nome) || (empty($email) && empty($telefone))) {
                $error_count++;
                continue; // Pula para o próximo lead
            }

            // Verifica duplicados apenas se email ou telefone foram fornecidos
            $is_duplicate = false;
            if ($email || $telefone) {
                $stmt_check->execute([$email, $email, $telefone, $telefone]);
                if ($stmt_check->fetchColumn()) {
                    $is_duplicate = true;
                }
            }


            if ($is_duplicate) {
                $duplicate_count++;
            } else {
                // Insere o novo lead
                $success = $stmt_insert->execute([
                    $nome,
                    $email,
                    $telefone,
                    $origem,
                    $produto_interesse ?: null, // Salva null se vazio
                    $observacao ?: null, // Salva null se vazio
                ]);
                if ($success) {
                    $imported_count++;
                    $lastId = $pdo->lastInsertId();
                    // Adiciona o lead recém-criado à lista para retornar ao frontend
                    $newly_imported_leads[] = [
                        'id' => $lastId,
                        'nome' => $nome,
                        'email' => $email,
                        'telefone' => $telefone,
                        'origem' => $origem,
                        'produto_interesse' => $produto_interesse ?: null,
                        'observacao' => $observacao ?: null,
                        'status' => 'Novo',
                        'data_chegada' => date('Y-m-d H:i:s') // Aproximação da data/hora
                    ];
                } else {
                    $error_count++;
                }
            }
        }
        $pdo->commit();
        json_response([
            'success' => true,
            'imported' => $imported_count,
            'duplicates' => $duplicate_count,
            'errors' => $error_count,
            'newLeads' => $newly_imported_leads // Retorna os leads importados
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        json_response(['success' => false, 'error' => 'Erro durante a importação: ' . $e->getMessage()], 500);
    }
}

