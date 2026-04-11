<?php
// api/handlers/agenda_handler.php

// Inclui o ficheiro com a função de envio de email
require_once dirname(__DIR__) . '/core/helpers.php';

/**
 * Cria um novo agendamento (associado a múltiplos usuários) e envia notificações por email.
 */
function handle_create_agendamento($pdo, $data)
{
    // Validações iniciais
    error_log("DEBUG: [Agenda Create] Iniciando handle_create_agendamento");
    if ($data === null) {
        error_log("ERRO: [Agenda Create] Nenhum dado recebido.");
        json_response(['success' => false, 'error' => 'Nenhum dado recebido.'], 400);
        return;
    }
    // Valida campos básicos
    $required_fields = ['titulo', 'data_agendamento', 'hora_agendamento', 'tipo'];
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            error_log("ERRO: [Agenda Create] Campo obrigatório ausente: {$field}");
            json_response(['success' => false, 'error' => "Campo obrigatório ausente: {$field}"], 400);
            return;
        }
    }
    // ***** ALTERAÇÃO: Valida array de usuários *****
    $para_usuario_ids = $data['para_usuario_ids'] ?? []; // Espera array do frontend
    // Filtra para garantir que são apenas IDs numéricos e válidos
    $para_usuario_ids = array_filter($para_usuario_ids, function ($id) {
        return is_numeric($id) && $id > 0;
    });
    if (empty($para_usuario_ids)) {
        error_log("ERRO: [Agenda Create] Campo 'Direcionar para' está vazio ou contém IDs inválidos.");
        json_response(['success' => false, 'error' => "Selecione pelo menos um usuário válido para direcionar."], 400);
        return;
    }
    // ***** FIM DA ALTERAÇÃO *****

    $data_inicio_str = $data['data_agendamento'] . ' ' . $data['hora_agendamento'];
    $data_inicio_dt = null;
    try {
        // Tenta criar DateTime, tratando potencial erro de formato
        $data_inicio_dt = new DateTime($data_inicio_str);
        // Reformata para o formato MySQL DATETIME 'YYYY-MM-DD HH:MM:SS'
        $data_inicio_mysql = $data_inicio_dt->format('Y-m-d H:i:s');
        error_log("DEBUG: [Agenda Create] Data/Hora validada e formatada para MySQL: " . $data_inicio_mysql);
    } catch (Exception $e) {
        error_log("ERRO: [Agenda Create] Formato inválido de data/hora: " . $data_inicio_str . " - Erro: " . $e->getMessage());
        json_response(['success' => false, 'error' => 'Formato inválido de data ou hora.'], 400);
        return;
    }


    // ***** ALTERAÇÃO: Insere no BD usando transação e tabela de ligação *****
    error_log("DEBUG: [Agenda Create] Tentando inserir agendamento no BD...");
    // Não insere mais usuario_id na tabela principal
    $sql_agendamento = "INSERT INTO agendamentos (titulo, descricao, data_inicio, tipo, criado_por_id, oportunidade_id, data_entrega) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt_agendamento = $pdo->prepare($sql_agendamento);
    $success = false;
    $lastId = null;

    try {
        $pdo->beginTransaction(); // Inicia transação

        // 1. Insere o agendamento principal usando a data formatada para MySQL
        $sql_agendamento = "INSERT INTO agendamentos (titulo, descricao, data_inicio, tipo, criado_por_id, oportunidade_id, data_entrega) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt_agendamento = $pdo->prepare($sql_agendamento);
        $success = $stmt_agendamento->execute([
            $data['titulo'],
            $data['observacoes'] ?? null,
            $data_inicio_mysql, // Usa a data formatada
            $data['tipo'],
            $_SESSION['user_id'],
            !empty($data['oportunidade_id']) ? $data['oportunidade_id'] : null,
            !empty($data['data_entrega']) ? $data['data_entrega'] : null
        ]);

        if ($success) {
            $lastId = $pdo->lastInsertId();
            error_log("DEBUG: [Agenda Create] Agendamento base inserido com sucesso. ID: " . $lastId);

            // 2. Insere as associações na tabela agendamento_usuarios
            $sql_assoc = "INSERT INTO agendamento_usuarios (agendamento_id, usuario_id) VALUES (?, ?)";
            $stmt_assoc = $pdo->prepare($sql_assoc);
            foreach ($para_usuario_ids as $userId) {
                // Validação já feita, mas garante novamente
                if (is_numeric($userId) && $userId > 0) {
                    $stmt_assoc->execute([$lastId, $userId]);
                }
            }
            error_log("DEBUG: [Agenda Create] Associações de usuário inseridas para ID: " . $lastId);

            // 3. Se for 'Controle de Entrega' e tiver oportunidade associada, move a oportunidade
            if ($data['tipo'] === 'Controle de Entrega' && !empty($data['oportunidade_id'])) {
                // Tenta achar a etapa 'Controle de Entrega' no banco de dados para o funil atual da oportunidade, ou global
                $stmt_etapa = $pdo->prepare("SELECT id FROM etapas_funil WHERE nome = 'Controle de Entrega' LIMIT 1");
                $stmt_etapa->execute();
                $etapaId = $stmt_etapa->fetchColumn();

                if ($etapaId) {
                    $stmt_opp = $pdo->prepare("UPDATE oportunidades SET etapa_id = ?, data_ultima_movimentacao = NOW() WHERE id = ?");
                    $stmt_opp->execute([$etapaId, $data['oportunidade_id']]);
                    error_log("DEBUG: [Agenda Create] Oportunidade ID " . $data['oportunidade_id'] . " movida para a etapa Controle de Entrega (ID: " . $etapaId . ")");
                }
            }

            $pdo->commit(); // Confirma transação
        } else {
            $pdo->rollBack();
            $errorInfo = $stmt_agendamento->errorInfo();
            error_log("ERRO DB: [Agenda Create] Falha na execução do INSERT agendamento: " . print_r($errorInfo, true));
            json_response(['success' => false, 'error' => 'Falha ao criar agendamento base.'], 500);
            return;
        }

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("ERRO DB TRANSACTION: [Agenda Create] Falha na transação: " . $e->getMessage());
        json_response(['success' => false, 'error' => 'Falha na transação ao criar agendamento.'], 500);
        return;
    }
    // ***** FIM DA ALTERAÇÃO *****


    // --- A lógica abaixo só executa se a transação foi bem-sucedida ---
    if ($success && isset($lastId)) {

        // ***** ALTERAÇÃO: Busca detalhes incluindo nomes e IDs concatenados *****
        error_log("DEBUG: [Agenda Create] Buscando detalhes do agendamento ID: " . $lastId);
        $agendamento = null; // Inicializa
        try {
            $stmt_new = $pdo->prepare("
                 SELECT a.*,
                        u_criador.nome as criado_por_nome, u_criador.email as criado_por_email,
                        o.titulo as oportunidade_titulo,
                        GROUP_CONCAT(DISTINCT u_para.nome SEPARATOR ', ') as para_usuario_nomes, -- Usa DISTINCT
                        GROUP_CONCAT(DISTINCT u_para.id SEPARATOR ',') as usuarios_associados_ids -- Usa DISTINCT e vírgula como separador
                 FROM agendamentos a
                 LEFT JOIN usuarios u_criador ON a.criado_por_id = u_criador.id
                 LEFT JOIN oportunidades o ON a.oportunidade_id = o.id
                 LEFT JOIN agendamento_usuarios au ON a.id = au.agendamento_id -- Join com tabela de ligação
                 LEFT JOIN usuarios u_para ON au.usuario_id = u_para.id -- Join para pegar nome/id do associado
                 WHERE a.id = ?
                 GROUP BY a.id -- Agrupa para obter os nomes/IDs concatenados
             ");
            $stmt_new->execute([$lastId]);
            $agendamento = $stmt_new->fetch(PDO::FETCH_ASSOC);

            // Converte a string de IDs de volta para array para o frontend
            if ($agendamento && !empty($agendamento['usuarios_associados_ids'])) {
                // Explode a string em um array de IDs (serão strings, mas JS lida bem)
                $agendamento['usuarios_associados'] = explode(',', $agendamento['usuarios_associados_ids']);
            } else if ($agendamento) {
                // Garante que a chave exista como array vazio se não houver associações
                $agendamento['usuarios_associados'] = [];
            }
            // Mantém 'usuarios_associados_ids' se quiser depurar no frontend

        } catch (PDOException $e) {
            error_log("ERRO DB: [Agenda Create] Falha ao buscar detalhes do agendamento ID " . $lastId . ": " . $e->getMessage());
            // Continua, mas a notificação pode falhar e a resposta pode estar incompleta
        }
        // ***** FIM DA ALTERAÇÃO *****


        // --- LÓGICA DE ENVIO DE EMAIL (RETRIÇÃO: APENAS ASSIGNADOS) ---
        error_log("DEBUG: [Agenda Create] Iniciando lógica de envio de email...");
        if ($agendamento && !empty($agendamento['usuarios_associados'])) {

            $recipientIds = $agendamento['usuarios_associados']; // Array de IDs
            $recipientEmails = [];

            if (!empty($recipientIds)) {
                $placeholders = implode(',', array_fill(0, count($recipientIds), '?'));
                $sql_users = "SELECT email FROM usuarios WHERE id IN ($placeholders) AND status = 'Ativo'";
                $stmt_users = $pdo->prepare($sql_users);
                $stmt_users->execute($recipientIds);
                $recipientEmails = $stmt_users->fetchAll(PDO::FETCH_COLUMN);

                // ***** ALTERAÇÃO: Incluir o criador na notificação *****
                if (!empty($agendamento['criado_por_email'])) {
                    $recipientEmails[] = $agendamento['criado_por_email'];
                }
                $recipientEmails = array_unique($recipientEmails); // Garante que não há duplicatas
                // ***** FIM DA ALTERAÇÃO *****

                error_log("DEBUG: [Agenda Create] Emails encontrados para notificação (incluindo criador): " . count($recipientEmails));

                // Prepara e envia o email se houver destinatários
                if (!empty($recipientEmails)) {
                    $dataHoraFormatada = '';
                    try {
                        // Usa o objeto DateTime já criado ou cria um novo a partir do BD
                        $dt = $data_inicio_dt ?? new DateTime($agendamento['data_inicio']);
                        $dataHoraFormatada = $dt->format('d/m/Y \à\s H:i');
                    } catch (Exception $e) {
                        $dataHoraFormatada = 'Data/Hora Inválida';
                    }

                    $subject = "[CRM FR] Novo Agendamento: " . $agendamento['titulo'];
                    $htmlBody = "<h2>Novo Agendamento Criado no CRM</h2>" .
                        "<p>Um novo agendamento foi adicionado ao sistema e você foi marcado:</p>" .
                        "<ul>" .
                        "<li><strong>Título:</strong> " . htmlspecialchars($agendamento['titulo']) . "</li>" .
                        "<li><strong>Tipo:</strong> " . htmlspecialchars($agendamento['tipo']) . "</li>" .
                        "<li><strong>Data e Hora:</strong> " . $dataHoraFormatada . "</li>" .
                        "<li><strong>Direcionado para:</strong> " . htmlspecialchars($agendamento['para_usuario_nomes'] ?: 'N/A') . "</li>" .
                        "<li><strong>Criado por:</strong> " . htmlspecialchars($agendamento['criado_por_nome'] ?: 'N/A') . "</li>" .
                        (!empty($agendamento['oportunidade_titulo']) ? "<li><strong>Oportunidade Associada:</strong> " . htmlspecialchars($agendamento['oportunidade_titulo']) . "</li>" : "") .
                        "<li><strong>Observações:</strong> " . nl2br(htmlspecialchars($agendamento['descricao'] ?: 'Nenhuma')) . "</li>" .
                        "</ul>" .
                        "<p>Pode ver mais detalhes na Agenda do CRM.</p>";

                    if (function_exists('send_email_notification')) {
                        if (!send_email_notification($recipientEmails, $subject, $htmlBody)) {
                            error_log("AVISO: [Agenda Create] Falha ao enviar notificação via send_email_notification.");
                        } else {
                            error_log("DEBUG: [Agenda Create] Notificação enviada com sucesso.");
                        }
                    } else {
                        error_log("ERRO: [Agenda Create] Função send_email_notification não encontrada.");
                    }

                } else {
                    error_log("AVISO: [Agenda Create] Nenhum email encontrado para os usuários associados.");
                }
            }
        } else {
            error_log("AVISO: [Agenda Create] Nenhum usuário associado para notificar.");
        }
        // --- FIM DA LÓGICA DE ENVIO DE EMAIL ---

        // Envia a resposta de sucesso para o frontend
        error_log("DEBUG: [Agenda Create] Enviando resposta JSON de sucesso para o frontend.");
        json_response(['success' => true, 'agendamento' => $agendamento]); // Envia detalhes atualizados

    }
    // Não precisa de um 'else' aqui porque os erros já retornaram json_response
}


/**
 * Atualiza um agendamento existente e envia notificações por email.
 */
function handle_update_agendamento($pdo, $data)
{
    // Validações
    error_log("DEBUG: [Agenda Update] Iniciando handle_update_agendamento");
    if ($data === null) {
        json_response(['success' => false, 'error' => 'Nenhum dado recebido.'], 400);
        return;
    }
    $required_fields = ['id', 'titulo', 'data_agendamento', 'hora_agendamento', 'tipo']; // id é necessário
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            json_response(['success' => false, 'error' => "Campo obrigatório ausente: {$field}"], 400);
            return;
        }
    }
    // ***** ALTERAÇÃO: Valida array de usuários *****
    $para_usuario_ids = $data['para_usuario_ids'] ?? [];
    $para_usuario_ids = array_filter($para_usuario_ids, function ($id) {
        return is_numeric($id) && $id > 0;
    });
    if (empty($para_usuario_ids)) {
        json_response(['success' => false, 'error' => "Selecione pelo menos um usuário válido para direcionar."], 400);
        return;
    }
    // ***** FIM DA ALTERAÇÃO *****
    // Validação e formatação data/hora
    $data_inicio_str = $data['data_agendamento'] . ' ' . $data['hora_agendamento'];
    $data_inicio_dt = null;
    $data_inicio_mysql = null;
    try {
        $data_inicio_dt = new DateTime($data_inicio_str);
        $data_inicio_mysql = $data_inicio_dt->format('Y-m-d H:i:s');
        error_log("DEBUG: [Agenda Update] Data/Hora validada e formatada para MySQL: " . $data_inicio_mysql);
    } catch (Exception $e) {
        error_log("ERRO: [Agenda Update] Formato inválido de data/hora: " . $data_inicio_str . " - Erro: " . $e->getMessage());
        json_response(['success' => false, 'error' => 'Formato inválido de data ou hora.'], 400);
        return;
    }


    $agendamentoId = $data['id'];
    $success = false;

    // --- VERIFICAÇÃO DE SEGURANÇA (RBAC) ---
    $currentRole = $_SESSION['role'];
    if (in_array($currentRole, ['Vendedor', 'Especialista'])) {
        // Verifica se criou OU se está associado
        $stmt_check = $pdo->prepare("
            SELECT 1 
            FROM agendamentos a
            LEFT JOIN agendamento_usuarios au ON a.id = au.agendamento_id 
            WHERE a.id = ? 
            AND (a.criado_por_id = ? OR au.usuario_id = ?)
            LIMIT 1
        ");
        $stmt_check->execute([$agendamentoId, $_SESSION['user_id'], $_SESSION['user_id']]);
        if (!$stmt_check->fetchColumn()) {
            json_response(['success' => false, 'error' => 'Acesso negado: Você só pode editar agendamentos que criou ou para os quais está agendado.'], 403);
            return;
        }
    }
    // ---------------------------------------

    // ***** ALTERAÇÃO: Atualiza no BD usando transação e tabela de ligação *****
    error_log("DEBUG: [Agenda Update] Tentando atualizar agendamento ID: " . $agendamentoId);
    try {
        $pdo->beginTransaction();

        // 1. Atualiza o agendamento principal (sem usuario_id) usando data formatada
        $sql_update = "UPDATE agendamentos SET titulo = ?, descricao = ?, data_inicio = ?, tipo = ?, oportunidade_id = ?, data_entrega = ? WHERE id = ?";
        $stmt_update = $pdo->prepare($sql_update);
        $success = $stmt_update->execute([
            $data['titulo'],
            $data['observacoes'] ?? null,
            $data_inicio_mysql, // Usa data formatada
            $data['tipo'],
            !empty($data['oportunidade_id']) ? $data['oportunidade_id'] : null,
            !empty($data['data_entrega']) ? $data['data_entrega'] : null,
            $agendamentoId
        ]);

        if ($success) {
            error_log("DEBUG: [Agenda Update] Agendamento base atualizado.");
            // 2. Remove associações antigas
            $stmt_delete_assoc = $pdo->prepare("DELETE FROM agendamento_usuarios WHERE agendamento_id = ?");
            $stmt_delete_assoc->execute([$agendamentoId]);
            error_log("DEBUG: [Agenda Update] Associações antigas removidas.");

            // 3. Insere novas associações
            $sql_assoc = "INSERT INTO agendamento_usuarios (agendamento_id, usuario_id) VALUES (?, ?)";
            $stmt_assoc = $pdo->prepare($sql_assoc);
            foreach ($para_usuario_ids as $userId) {
                if (is_numeric($userId) && $userId > 0) {
                    $stmt_assoc->execute([$agendamentoId, $userId]);
                }
            }
            error_log("DEBUG: [Agenda Update] Novas associações inseridas.");

            // 4. Se for 'Controle de Entrega' e tiver oportunidade associada, move a oportunidade
            if ($data['tipo'] === 'Controle de Entrega' && !empty($data['oportunidade_id'])) {
                // Tenta achar a etapa 'Controle de Entrega' no banco de dados para o funil atual da oportunidade, ou global
                $stmt_etapa = $pdo->prepare("SELECT id FROM etapas_funil WHERE nome = 'Controle de Entrega' LIMIT 1");
                $stmt_etapa->execute();
                $etapaId = $stmt_etapa->fetchColumn();

                if ($etapaId) {
                    $stmt_opp = $pdo->prepare("UPDATE oportunidades SET etapa_id = ?, data_ultima_movimentacao = NOW() WHERE id = ?");
                    $stmt_opp->execute([$etapaId, $data['oportunidade_id']]);
                    error_log("DEBUG: [Agenda Update] Oportunidade ID " . $data['oportunidade_id'] . " movida para a etapa Controle de Entrega (ID: " . $etapaId . ")");
                }
            }

            $pdo->commit();
        } else {
            $pdo->rollBack();
            $errorInfo = $stmt_update->errorInfo();
            error_log("ERRO DB: [Agenda Update] Falha na execução do UPDATE: " . print_r($errorInfo, true));
            json_response(['success' => false, 'error' => 'Falha ao atualizar agendamento base.'], 500);
            return;
        }

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("ERRO DB TRANSACTION: [Agenda Update] Falha na transação: " . $e->getMessage());
        json_response(['success' => false, 'error' => 'Falha na transação ao atualizar agendamento.'], 500);
        return;
    }
    // ***** FIM DA ALTERAÇÃO *****

    if ($success) {
        // ***** ALTERAÇÃO: Busca detalhes incluindo nomes e IDs concatenados *****
        error_log("DEBUG: [Agenda Update] Buscando detalhes atualizados ID: " . $agendamentoId);
        $agendamento = null;
        try {
            // Consulta SQL idêntica à do create para buscar $agendamento com GROUP_CONCAT
            $stmt_updated = $pdo->prepare("
                 SELECT a.*, u_criador.nome as criado_por_nome, u_criador.email as criado_por_email, o.titulo as oportunidade_titulo,
                        GROUP_CONCAT(DISTINCT u_para.nome SEPARATOR ', ') as para_usuario_nomes,
                        GROUP_CONCAT(DISTINCT u_para.id SEPARATOR ',') as usuarios_associados_ids
                 FROM agendamentos a
                 LEFT JOIN usuarios u_criador ON a.criado_por_id = u_criador.id
                 LEFT JOIN oportunidades o ON a.oportunidade_id = o.id
                 LEFT JOIN agendamento_usuarios au ON a.id = au.agendamento_id
                 LEFT JOIN usuarios u_para ON au.usuario_id = u_para.id
                 WHERE a.id = ? GROUP BY a.id
             ");
            $stmt_updated->execute([$agendamentoId]);
            $agendamento = $stmt_updated->fetch(PDO::FETCH_ASSOC);
            // Converte string de IDs para array
            if ($agendamento && !empty($agendamento['usuarios_associados_ids'])) {
                $agendamento['usuarios_associados'] = explode(',', $agendamento['usuarios_associados_ids']);
            } else if ($agendamento) {
                $agendamento['usuarios_associados'] = [];
            }

        } catch (PDOException $e) {
            error_log("ERRO DB: [Agenda Update] Falha ao buscar detalhes atualizados: " . $e->getMessage());
        }
        // ***** FIM DA ALTERAÇÃO *****


        // --- LÓGICA DE ENVIO DE EMAIL (RETRIÇÃO: APENAS ASSIGNADOS) ---
        error_log("DEBUG: [Agenda Update] Iniciando lógica de envio de email...");
        if ($agendamento && !empty($agendamento['usuarios_associados'])) {

            $recipientIds = $agendamento['usuarios_associados'];
            $recipientEmails = [];

            if (!empty($recipientIds)) {
                $placeholders = implode(',', array_fill(0, count($recipientIds), '?'));
                $sql_users = "SELECT email FROM usuarios WHERE id IN ($placeholders) AND status = 'Ativo'";
                $stmt_users = $pdo->prepare($sql_users);
                $stmt_users->execute($recipientIds);
                $recipientEmails = $stmt_users->fetchAll(PDO::FETCH_COLUMN);

                // ***** ALTERAÇÃO: Incluir o criador na notificação *****
                if (!empty($agendamento['criado_por_email'])) {
                    $recipientEmails[] = $agendamento['criado_por_email'];
                }
                $recipientEmails = array_unique($recipientEmails);
                // ***** FIM DA ALTERAÇÃO *****

                if (!empty($recipientEmails)) {
                    $dataHoraFormatada = '';
                    try {
                        $dt = $data_inicio_dt ?? new DateTime($agendamento['data_inicio']);
                        $dataHoraFormatada = $dt->format('d/m/Y \à\s H:i');
                    } catch (Exception $e) {
                        $dataHoraFormatada = 'Data/Hora Inválida';
                    }

                    $subject = "[CRM FR] Agendamento Atualizado: " . $agendamento['titulo'];
                    $htmlBody = "<h2>Agendamento Atualizado no CRM</h2>" .
                        "<p>O seguinte agendamento foi modificado por " . htmlspecialchars($_SESSION['nome']) . ":</p>" .
                        "<ul>" .
                        "<li><strong>Título:</strong> " . htmlspecialchars($agendamento['titulo']) . "</li>" .
                        "<li><strong>Tipo:</strong> " . htmlspecialchars($agendamento['tipo']) . "</li>" .
                        "<li><strong>Data e Hora:</strong> " . $dataHoraFormatada . "</li>" .
                        "<li><strong>Direcionado para:</strong> " . htmlspecialchars($agendamento['para_usuario_nomes'] ?: 'N/A') . "</li>" .
                        "<li><strong>Criado originalmente por:</strong> " . htmlspecialchars($agendamento['criado_por_nome'] ?: 'N/A') . "</li>" .
                        (!empty($agendamento['oportunidade_titulo']) ? "<li><strong>Oportunidade Associada:</strong> " . htmlspecialchars($agendamento['oportunidade_titulo']) . "</li>" : "") .
                        "<li><strong>Observações:</strong> " . nl2br(htmlspecialchars($agendamento['descricao'] ?: 'Nenhuma')) . "</li>" .
                        "</ul>" .
                        "<p>Pode ver mais detalhes na Agenda do CRM.</p>";

                    if (function_exists('send_email_notification')) {
                        if (!send_email_notification($recipientEmails, $subject, $htmlBody)) {
                            error_log("AVISO: [Agenda Update] Falha ao enviar notificação.");
                        } else {
                            error_log("DEBUG: [Agenda Update] Notificação enviada.");
                        }
                    } else {
                        error_log("ERRO: [Agenda Update] Função send_email_notification não encontrada.");
                    }

                } else {
                    error_log("AVISO: [Agenda Update] Nenhum email encontrado para associados.");
                }
            }
        }
        // --- FIM DA LÓGICA DE ENVIO DE EMAIL ---

        // Envia a resposta de sucesso para o frontend
        error_log("DEBUG: [Agenda Update] Enviando resposta JSON de sucesso para o frontend.");
        json_response(['success' => true, 'agendamento' => $agendamento]); // Envia detalhes atualizados

    } else {
        // Erro ao atualizar BD já foi logado
        json_response(['success' => false, 'error' => 'Falha ao atualizar agendamento no banco de dados. Verifique os logs.'], 500);
    }
}

/**
 * Exclui um agendamento e envia notificação de cancelamento por email.
 */
function handle_delete_agendamento($pdo, $data)
{
    error_log("DEBUG: [Agenda Delete] Iniciando handle_delete_agendamento");
    if (empty($data['id'])) {
        json_response(['success' => false, 'error' => 'ID do agendamento não fornecido.'], 400);
        return;
    }
    $agendamentoId = $data['id'];

    $agendamento_deleted = null;

    // 1. Busca os detalhes ANTES de excluir (incluindo nomes concatenados)
    error_log("DEBUG: [Agenda Delete] Buscando detalhes ID: " . $agendamentoId);
    try {
        // ***** ALTERAÇÃO: Consulta atualizada para buscar nomes concatenados *****
        $stmt_find = $pdo->prepare("
             SELECT a.*, u_criador.nome as criado_por_nome, u_criador.email as criado_por_email,
                    GROUP_CONCAT(DISTINCT u_para.email SEPARATOR ',') as para_usuario_emails,
                    GROUP_CONCAT(DISTINCT u_para.nome SEPARATOR ', ') as para_usuario_nomes -- Usa DISTINCT
             FROM agendamentos a
             LEFT JOIN usuarios u_criador ON a.criado_por_id = u_criador.id
             LEFT JOIN agendamento_usuarios au ON a.id = au.agendamento_id -- Join com tabela de ligação
             LEFT JOIN usuarios u_para ON au.usuario_id = u_para.id -- Join para pegar nome do associado
             WHERE a.id = ? GROUP BY a.id -- Agrupa para usar GROUP_CONCAT
         ");
        $stmt_find->execute([$agendamentoId]);
        $agendamento_deleted = $stmt_find->fetch(PDO::FETCH_ASSOC);
        // ***** FIM DA ALTERAÇÃO *****
    } catch (PDOException $e) {
        error_log("ERRO DB: [Agenda Delete] Falha ao buscar detalhes antes de excluir ID " . $agendamentoId . ": " . $e->getMessage());
        // Continua para tentar excluir mesmo assim
    }

    // --- VERIFICAÇÃO DE SEGURANÇA (RBAC) ---
    $currentRole = $_SESSION['role'];
    if (in_array($currentRole, ['Vendedor', 'Especialista'])) {
        // Verifica se criou OU se está associado
        $stmt_check = $pdo->prepare("
            SELECT 1 
            FROM agendamentos a
            LEFT JOIN agendamento_usuarios au ON a.id = au.agendamento_id 
            WHERE a.id = ? 
            AND (a.criado_por_id = ? OR au.usuario_id = ?)
            LIMIT 1
        ");
        $stmt_check->execute([$agendamentoId, $_SESSION['user_id'], $_SESSION['user_id']]);
        if (!$stmt_check->fetchColumn()) {
            json_response(['success' => false, 'error' => 'Acesso negado: Você só pode excluir agendamentos que criou ou para os quais está agendado.'], 403);
            return;
        }
    }
    // ---------------------------------------


    // 2. Procede com a exclusão (DELETE CASCADE deve remover da tabela agendamento_usuarios automaticamente)
    error_log("DEBUG: [Agenda Delete] Tentando excluir agendamento ID: " . $agendamentoId);
    $stmt = $pdo->prepare("DELETE FROM agendamentos WHERE id = ?");
    $success = false;
    try {
        $success = $stmt->execute([$agendamentoId]);
    } catch (PDOException $e) {
        error_log("ERRO DB: [Agenda Delete] Falha ao excluir agendamento ID " . $agendamentoId . ": " . $e->getMessage());
        $success = false;
    }


    // 3. Envia notificação SE a exclusão foi bem-sucedida E temos os dados
    if ($success && $agendamento_deleted) {
        error_log("DEBUG: [Agenda Delete] Exclusão bem-sucedida. Enviando notificação...");

        // Coleta emails dos envolvidos (Criador + Associados)
        $recipientEmails = [];

        // 1. Adiciona emails dos usuários associados (se houver)
        if (!empty($agendamento_deleted['para_usuario_emails'])) {
            $associatedEmails = explode(',', $agendamento_deleted['para_usuario_emails']);
            $recipientEmails = array_merge($recipientEmails, $associatedEmails);
        }

        // 2. Adiciona email do criador (se houver)
        if (!empty($agendamento_deleted['criado_por_email'])) {
            $recipientEmails[] = $agendamento_deleted['criado_por_email'];
        }

        // Remove duplicatas e limpa
        $recipientEmails = array_unique(array_filter($recipientEmails));

        if (!empty($recipientEmails)) {
            $dataHoraFormatada = '';
            try {
                $dt = new DateTime($agendamento_deleted['data_inicio']);
                $dataHoraFormatada = $dt->format('d/m/Y \à\s H:i');
            } catch (Exception $e) {
                $dataHoraFormatada = 'Data/Hora Inválida';
            }

            $subject = "[CRM FR] Agendamento Cancelado: " . $agendamento_deleted['titulo'];
            $htmlBody = "<h2>Agendamento Cancelado no CRM</h2>" .
                "<p>O seguinte agendamento foi cancelado/excluído por " . htmlspecialchars($_SESSION['nome']) . ":</p>" .
                "<ul>" .
                "<li><strong>Título:</strong> " . htmlspecialchars($agendamento_deleted['titulo']) . "</li>" .
                "<li><strong>Tipo:</strong> " . htmlspecialchars($agendamento_deleted['tipo']) . "</li>" .
                "<li><strong>Data e Hora que estava agendado:</strong> " . $dataHoraFormatada . "</li>" .
                "<li><strong>Era direcionado para:</strong> " . htmlspecialchars($agendamento_deleted['para_usuario_nomes'] ?: 'N/A') . "</li>" .
                "<li><strong>Tinha sido criado por:</strong> " . htmlspecialchars($agendamento_deleted['criado_por_nome'] ?: 'N/A') . "</li>" .
                "</ul>" .
                "<p>Este agendamento foi removido da Agenda do CRM.</p>";

            // Tenta usar a função global send_email_notification
            if (function_exists('send_email_notification')) {
                if (!send_email_notification($recipientEmails, $subject, $htmlBody)) {
                    error_log("AVISO: [Agenda Delete] Falha ao enviar notificação via send_email_notification para ID: " . $agendamentoId);
                } else {
                    error_log("DEBUG: [Agenda Delete] Notificação enviada via send_email_notification para ID: " . $agendamentoId . " - Destinatários: " . implode(', ', $recipientEmails));
                }
            } else {
                error_log("ERRO: [Agenda Delete] Função send_email_notification não encontrada.");
            }

        } else {
            error_log("AVISO: [Agenda Delete] Nenhum email encontrado para notificar sobre a exclusão. ID: " . $agendamentoId);
        }
    } elseif ($success && !$agendamento_deleted) {
        error_log("AVISO: [Agenda Delete] Agendamento ID: " . $agendamentoId . " excluído, mas não foi possível buscar detalhes para notificação.");
    } elseif (!$success) {
        // Erro ao excluir BD já foi logado
    }

    // Responde ao frontend sobre o sucesso da EXCLUSÃO
    error_log("DEBUG: [Agenda Delete] Enviando resposta JSON para o frontend. Success: " . ($success ? 'true' : 'false'));
    json_response(['success' => $success]);
}

?>