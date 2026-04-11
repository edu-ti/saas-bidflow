<?php
// api/handlers/proposal_handler.php

function handle_create_proposal($pdo, $data)
{
    $client = $data['currentClient'] ?? null;
    $items = $data['items'] ?? [];
    $clientType = $data['clientType'] ?? null;

    if (empty($client) || empty($items) || empty($clientType)) {
        json_response(['success' => false, 'error' => 'Dados insuficientes para criar a proposta.'], 400);
    }

    $pdo->beginTransaction();
    try {
        // Calcula valor total usando helper
        $valor_total = calculate_proposal_total($items, $data['frete_valor'] ?? 0);

        $cliente_pf_id = ($clientType === 'pf') ? $client['id'] : null;
        $organizacao_id = ($clientType === 'pj') ? $client['id'] : null;
        $contato_id = ($clientType === 'pj' && isset($client['contact'])) ? $client['contact']['id'] : null;

        $oportunidade_id = $data['oportunidade_id'] ?? null;
        $new_opportunity = null; // Para retornar ao frontend se uma nova opp for criada

        // Busca ID da etapa 'Proposta'
        $stmt_stage = $pdo->prepare("SELECT id FROM etapas_funil WHERE nome = 'Proposta' LIMIT 1");
        $stmt_stage->execute();
        $proposta_stage_id = $stmt_stage->fetchColumn();

        // Cria oportunidade se não veio de uma existente e a etapa 'Proposta' existe
        if (empty($oportunidade_id) && $proposta_stage_id) {
            $opp_title = "Oportunidade p/ Proposta: " . ($clientType === 'pj' ? $client['nome_fantasia'] : $client['nome']);
            $opp_sql = "INSERT INTO oportunidades (titulo, organizacao_id, contato_id, cliente_pf_id, valor, etapa_id, usuario_id, data_criacao, data_ultima_movimentacao) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            $opp_stmt = $pdo->prepare($opp_sql);
            $opp_stmt->execute([
                $opp_title,
                $organizacao_id,
                $contato_id,
                $cliente_pf_id,
                $valor_total,
                $proposta_stage_id,
                $_SESSION['user_id']
            ]);
            $oportunidade_id = $pdo->lastInsertId(); // Pega o ID da nova oportunidade

            // Busca dados da nova oportunidade para retornar
            $stmt_new_opp = $pdo->prepare("SELECT o.*, org.nome_fantasia as organizacao_nome, cpf.nome as cliente_pf_nome, c.nome as contato_nome, c.email as contato_email, c.telefone as contato_telefone, u.nome as vendedor_nome FROM oportunidades o LEFT JOIN organizacoes org ON o.organizacao_id = org.id LEFT JOIN clientes_pf cpf ON o.cliente_pf_id = cpf.id LEFT JOIN contatos c ON o.contato_id = c.id LEFT JOIN usuarios u ON o.usuario_id = u.id WHERE o.id = ?");
            $stmt_new_opp->execute([$oportunidade_id]);
            $new_opportunity = $stmt_new_opp->fetch(PDO::FETCH_ASSOC);

        } elseif (!empty($oportunidade_id) && $proposta_stage_id) {
            // Se veio de uma oportunidade, atualiza a etapa dela para 'Proposta'
            // REMOVIDO: A atualização agora será feita pela função de sincronização
            // $update_opp_stmt = $pdo->prepare("UPDATE oportunidades SET etapa_id = ?, data_ultima_movimentacao = NOW() WHERE id = ?");
            // $update_opp_stmt->execute([$proposta_stage_id, $oportunidade_id]);
        }

        // Busca o usuario_id (dono) da oportunidade para manter a atribuição original
        $proposal_owner_id = $_SESSION['user_id']; // Default (fallback)
        if ($oportunidade_id) {
            $stmt_opp_owner = $pdo->prepare("SELECT usuario_id FROM oportunidades WHERE id = ?");
            $stmt_opp_owner->execute([$oportunidade_id]);
            $fetched_owner = $stmt_opp_owner->fetchColumn();
            if ($fetched_owner) {
                $proposal_owner_id = $fetched_owner;
            }
        }

        // Insere a proposta principal
        // MODIFICADO: Usa $proposal_owner_id em vez de $_SESSION['user_id']
        // Adicionado: frete_tipo, frete_valor
        $sql = "INSERT INTO propostas (oportunidade_id, cliente_pf_id, organizacao_id, contato_id, usuario_id, valor_total, status, data_validade, faturamento, treinamento, condicoes_pagamento, prazo_entrega, garantia_equipamentos, garantia_acessorios, instalacao, assistencia_tecnica, observacoes, motivo_status, frete_tipo, frete_valor, data_criacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            $oportunidade_id,
            $cliente_pf_id,
            $organizacao_id,
            $contato_id,
            $proposal_owner_id,
            $valor_total,
            $data['status'] ?? 'Rascunho',
            $data['data_validade'] ?: null,
            $data['faturamento'] ?? null,
            $data['treinamento'] ?? null,
            $data['condicoes_pagamento'] ?? null,
            $data['prazo_entrega'] ?? null,
            $data['garantia_equipamentos'] ?? null,
            $data['garantia_acessorios'] ?? null,
            $data['instalacao'] ?? null,
            $data['assistencia_tecnica'] ?? null,
            $data['observacoes'] ?? null,
            $data['motivo_status'] ?? null,
            $data['frete_tipo'] ?? 'CIF',
            $data['frete_valor'] ?? 0
        ]);
        $proposta_id = $pdo->lastInsertId();

        // Gera e atualiza o número da proposta
        $year = date('Y');
        $stmt_max = $pdo->prepare("SELECT MAX(CAST(SUBSTRING_INDEX(numero_proposta, '/', 1) AS UNSIGNED)) FROM propostas WHERE YEAR(data_criacao) = ?");
        $stmt_max->execute([$year]);
        $max_num = $stmt_max->fetchColumn();
        $next_num = ($max_num ?: 0) + 1;
        $numero_proposta = str_pad($next_num, 3, '0', STR_PAD_LEFT) . '/' . $year;

        $update_numero_stmt = $pdo->prepare("UPDATE propostas SET numero_proposta = ? WHERE id = ?");
        $update_numero_stmt->execute([$numero_proposta, $proposta_id]);

        // Insere os itens da proposta usando helper
        insert_proposal_items($pdo, $proposta_id, $items);

        // Sincroniza o status da oportunidade
        sync_opportunity_stage($pdo, $oportunidade_id, $data['status'] ?? 'Rascunho');

        // ***** INÍCIO: Lógica para criar venda fornecedor se status for "Aprovada" *****
// ***** INÍCIO: Lógica para criar venda fornecedor se status for "Aprovada" *****
        if (strcasecmp($data['status'] ?? 'Rascunho', 'Aprovada') === 0) {
            create_vendas_fornecedores_from_proposal($pdo, $proposta_id, $organizacao_id, $cliente_pf_id);
        }
        // ***** FIM: Lógica *****

        $pdo->commit();

        // Busca a proposta completa para retornar ao frontend
        $full_proposal_query = "
             SELECT p.*,
                    o.nome_fantasia as organizacao_nome, o.cnpj,
                    c_pf.nome as cliente_pf_nome, c_pf.cpf,
                    cont.nome as contato_nome, cont.email as contato_email, cont.telefone as contato_telefone,
                    u.nome as vendedor_nome,
                    ef.nome as etapa_funil_nome
             FROM propostas p
             LEFT JOIN organizacoes o ON p.organizacao_id = o.id
             LEFT JOIN clientes_pf c_pf ON p.cliente_pf_id = c_pf.id
             LEFT JOIN contatos cont ON p.contato_id = cont.id
             LEFT JOIN usuarios u ON p.usuario_id = u.id
             LEFT JOIN oportunidades opp ON p.oportunidade_id = opp.id
             LEFT JOIN etapas_funil ef ON opp.etapa_id = ef.id
             WHERE p.id = ?
         ";
        $proposal_stmt = $pdo->prepare($full_proposal_query);
        $proposal_stmt->execute([$proposta_id]);
        $created_proposal = $proposal_stmt->fetch(PDO::FETCH_ASSOC);

        json_response([
            'success' => true,
            'proposal' => [
                'proposal' => $created_proposal,
                'opportunity' => $new_opportunity // Retorna a nova oportunidade se foi criada
            ]
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("[Create Proposal Error] Exception: " . $e->getMessage() . "\nTrace: " . $e->getTraceAsString()); // Log detalhado
        json_response(['success' => false, 'error' => 'Erro na transação ao criar proposta: ' . $e->getMessage()], 500);
    }
}

function handle_update_proposal($pdo, $data)
{
    $proposalId = $data['id'] ?? null;
    $client = $data['currentClient'] ?? null;
    $items = $data['items'] ?? [];
    $clientType = $data['clientType'] ?? null;
    $new_status = $data['status'] ?? null; // Pega o novo status

    if (empty($proposalId) || empty($client) || empty($items) || empty($clientType) || empty($new_status)) {
        json_response(['success' => false, 'error' => 'Dados insuficientes para atualizar a proposta.'], 400);
    }

    // --- VERIFICAÇÃO DE SEGURANÇA (RBAC) ---
    $currentRole = $_SESSION['role'];
    if (in_array($currentRole, ['Vendedor', 'Especialista'])) {
        $stmt_check = $pdo->prepare("SELECT usuario_id FROM propostas WHERE id = ?");
        $stmt_check->execute([$proposalId]);
        $ownerId = $stmt_check->fetchColumn();

        if ($ownerId != $_SESSION['user_id']) {
            json_response(['success' => false, 'error' => 'Acesso negado: Você só pode editar propostas que criou.'], 403);
            return;
        }
    }
    // ---------------------------------------

    $pdo->beginTransaction();
    try {
        // Busca o status atual ANTES de atualizar
        $stmt_current_status = $pdo->prepare("SELECT status FROM propostas WHERE id = ?");
        $stmt_current_status->execute([$proposalId]);
        $current_status = $stmt_current_status->fetchColumn();

        // Calcula valor total usando helper
        $valor_total = calculate_proposal_total($items, $data['frete_valor'] ?? 0);

        // Determina IDs de cliente
        $cliente_pf_id = ($clientType === 'pf') ? $client['id'] : null;
        $organizacao_id = ($clientType === 'pj') ? $client['id'] : null;
        $contato_id = ($clientType === 'pj' && isset($client['contact'])) ? $client['contact']['id'] : null;

        // Atualiza a proposta principal (Incluindo atualizado_por_id)
        $sql = "UPDATE propostas SET cliente_pf_id = ?, organizacao_id = ?, contato_id = ?, valor_total = ?, status = ?, data_validade = ?, faturamento = ?, treinamento = ?, condicoes_pagamento = ?, prazo_entrega = ?, garantia_equipamentos = ?, garantia_acessorios = ?, instalacao = ?, assistencia_tecnica = ?, observacoes = ?, motivo_status = ?, frete_tipo = ?, frete_valor = ?, atualizado_por_id = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $cliente_pf_id,
            $organizacao_id,
            $contato_id,
            $valor_total,
            $new_status, // Usa o novo status
            $data['data_validade'] ?: null,
            $data['faturamento'] ?? null,
            $data['treinamento'] ?? null,
            $data['condicoes_pagamento'] ?? null,
            $data['prazo_entrega'] ?? null,
            $data['garantia_equipamentos'] ?? null,
            $data['garantia_acessorios'] ?? null,
            $data['instalacao'] ?? null,
            $data['assistencia_tecnica'] ?? null,
            $data['observacoes'] ?? null,
            $data['motivo_status'] ?? null,
            $data['frete_tipo'] ?? 'CIF',
            $data['frete_valor'] ?? 0,
            $_SESSION['user_id'], // salva quem atualizou
            $proposalId
        ]);

        // Re-insere os itens (DELETE + INSERT)
        $delete_stmt = $pdo->prepare("DELETE FROM proposta_itens WHERE proposta_id = ?");
        $delete_stmt->execute([$proposalId]);

        // --- ALTERAÇÃO: Adiciona coluna 'parametros' ---
// --- ALTERAÇÃO: Adiciona coluna 'parametros' ---
        // Re-insere os itens usando helper
        insert_proposal_items($pdo, $proposalId, $items);

        // Sincroniza o status da oportunidade
        // Precisamos buscar o oportunidade_id da proposta se não tivermos
        $opp_id_stmt = $pdo->prepare("SELECT oportunidade_id FROM propostas WHERE id = ?");
        $opp_id_stmt->execute([$proposalId]);
        $oportunidade_id = $opp_id_stmt->fetchColumn();

        if ($oportunidade_id) {
            sync_opportunity_stage($pdo, $oportunidade_id, $new_status);
        }

        // ***** INÍCIO: Lógica para criar venda fornecedor se status mudou para "Aprovada" *****
// ***** INÍCIO: Lógica para criar venda fornecedor se status mudou para "Aprovada" *****
        if (strcasecmp($new_status, 'Aprovada') === 0 && strcasecmp($current_status, 'Aprovada') !== 0) {
            // Chama a função auxiliar para criar as vendas
            create_vendas_fornecedores_from_proposal($pdo, $proposalId, $organizacao_id, $cliente_pf_id);
        }
        // ***** FIM: Lógica *****

        $pdo->commit();

        // Busca a proposta completa atualizada para retornar
        $full_proposal_query = "
             SELECT p.*,
                    o.nome_fantasia as organizacao_nome, o.cnpj,
                    c_pf.nome as cliente_pf_nome, c_pf.cpf,
                    cont.nome as contato_nome, cont.email as contato_email, cont.telefone as contato_telefone,
                    u.nome as vendedor_nome,
                    ef.nome as etapa_funil_nome
             FROM propostas p
             LEFT JOIN organizacoes o ON p.organizacao_id = o.id
             LEFT JOIN clientes_pf c_pf ON p.cliente_pf_id = c_pf.id
             LEFT JOIN contatos cont ON p.contato_id = cont.id
             LEFT JOIN usuarios u ON p.usuario_id = u.id
             LEFT JOIN oportunidades opp ON p.oportunidade_id = opp.id
             LEFT JOIN etapas_funil ef ON opp.etapa_id = ef.id
             WHERE p.id = ?
         ";
        $proposal_stmt = $pdo->prepare($full_proposal_query);
        $proposal_stmt->execute([$proposalId]);
        json_response(['success' => true, 'proposal' => $proposal_stmt->fetch(PDO::FETCH_ASSOC)]);

    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("[Update Proposal Error] Exception: " . $e->getMessage() . "\nTrace: " . $e->getTraceAsString()); // Log detalhado
        json_response(['success' => false, 'error' => 'Erro na transação ao atualizar proposta: ' . $e->getMessage()], 500);
    }
}

// --- HELPER FUNCTIONS ---

/**
 * Calcula o valor total da proposta baseado nos itens e frete.
 */
function calculate_proposal_total($items, $frete_valor)
{
    $valor_total = 0;
    foreach ($items as $item) {
        $meses = (int) ($item['meses_locacao'] ?? 12);
        $multiplicador = (strtoupper($item['status'] ?? 'VENDA') === 'LOCAÇÃO') ? $meses : 1;

        $quantidade = ($item['quantidade'] ?? 1);
        $valor_unitario = ($item['valor_unitario'] ?? 0);
        $desconto_percent_val = ($item['desconto_percent'] ?? 0);

        // Aplica desconto no valor total do item
        $subtotal_sem_desconto = $quantidade * $valor_unitario * $multiplicador;
        $valor_desconto = $subtotal_sem_desconto * ($desconto_percent_val / 100);
        $subtotal_com_desconto = $subtotal_sem_desconto - $valor_desconto;

        $valor_total += $subtotal_com_desconto;
    }
    return $valor_total + (float) $frete_valor;
}

/**
 * Insere os itens da proposta no banco de dados.
 */
function insert_proposal_items($pdo, $proposal_id, $items)
{
    $item_sql = "INSERT INTO proposta_itens (proposta_id, produto_id, descricao, descricao_detalhada, fabricante, modelo, imagem_url, quantidade, valor_unitario, desconto_percent, status, unidade_medida, parametros, meses_locacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $item_stmt = $pdo->prepare($item_sql);

    foreach ($items as $item) {
        $meses_val = 1;
        if (strtoupper($item['status'] ?? 'VENDA') === 'LOCAÇÃO') {
            $meses_val = (int) ($item['meses_locacao'] ?? 12);
        } else {
            $meses_val = null;
        }

        // Parametros handling
        $parametros = $item['parametros'] ?? [];
        if (is_array($parametros)) {
            $parametros = array_values(array_filter($parametros, function ($p) {
                return isset($p['nome']) && $p['nome'] !== '__meses_locacao';
            }));
        }
        $item_parametros_json = !empty($parametros) ? json_encode($parametros) : null;

        $item_stmt->execute([
            $proposal_id,
            $item['produto_id'] ?? null,
            $item['descricao'],
            $item['descricao_detalhada'] ?? null,
            $item['fabricante'] ?? null,
            $item['modelo'] ?? null,
            $item['imagem_url'] ?? null,
            $item['quantidade'] ?? 1,
            $item['valor_unitario'] ?? 0,
            $item['desconto_percent'] ?? 0,
            $item['status'] ?? 'VENDA',
            $item['unidade_medida'] ?? null,
            $item_parametros_json,
            $meses_val
        ]);
    }
}

// --- NOVA FUNÇÃO AUXILIAR ---
/**
 * Cria registos na tabela vendas_fornecedores para cada item de uma proposta aprovada.
 * Deve ser chamada DENTRO de uma transação PDO ativa.
 *
 * @param PDO $pdo Instância da conexão PDO.
 * @param int $proposta_id ID da proposta que foi aprovada.
 * @param int|null $organizacao_id ID da organização cliente (se aplicável).
 * @param int|null $cliente_pf_id ID do cliente PF (se aplicável).
 */
function create_vendas_fornecedores_from_proposal($pdo, $proposta_id, $organizacao_id, $cliente_pf_id)
{
    error_log("[Auto Sale Create] Iniciando criação de vendas para proposta ID: {$proposta_id}. OrgID: {$organizacao_id}, PFID: {$cliente_pf_id}");

    // 1. Busca os itens da proposta
    $stmt_items = $pdo->prepare("SELECT * FROM proposta_itens WHERE proposta_id = ?");
    $stmt_items->execute([$proposta_id]);
    $items = $stmt_items->fetchAll(PDO::FETCH_ASSOC);

    if (empty($items)) {
        error_log("[Auto Sale Create] Nenhum item encontrado para proposta ID: {$proposta_id}. Nenhuma venda criada.");
        return; // Sai se não houver itens
    }

    // 2. Prepara statements para busca de fornecedor e inserção de venda
    $stmt_find_fornecedor = $pdo->prepare("SELECT id FROM fornecedores WHERE nome = ? LIMIT 1");
    // ***** ALTERAÇÃO: Corrigido o INSERT para incluir cliente_pf_id e o número correto de placeholders (?) *****
    $sql_insert_venda = "INSERT INTO vendas_fornecedores (fornecedor_id, organizacao_id, cliente_pf_id, usuario_id, titulo, data_venda, origem, descricao_produto, fabricante_marca, modelo, quantidade, valor_unitario, valor_total, notas, proposta_ref_id) VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt_insert_venda = $pdo->prepare($sql_insert_venda);

    // Pega o usuário que criou a proposta
    $stmt_prop_user = $pdo->prepare("SELECT usuario_id FROM propostas WHERE id = ?");
    $stmt_prop_user->execute([$proposta_id]);
    $proposal_user_id = $stmt_prop_user->fetchColumn();
    // Usa o usuário da sessão como fallback se não encontrar o criador da proposta
    $user_id_for_sale = $proposal_user_id ?: $_SESSION['user_id'];

    $vendas_criadas = 0;
    $fornecedores_nao_encontrados = [];

    // 3. Itera sobre os itens
    foreach ($items as $item) {
        $fabricante = trim($item['fabricante'] ?? '');
        $fornecedor_id = null;

        $log_data = [ // Prepara dados para log
            'fab' => $fabricante,
            'org_id' => $organizacao_id,
            'pf_id' => $cliente_pf_id,
            'user_id' => $user_id_for_sale,
            'item_desc' => $item['descricao']
        ];
        error_log("[Auto Sale Create] Processando item: " . json_encode($log_data));

        // 4. Busca o ID do fornecedor pelo nome (fabricante)
        if (!empty($fabricante)) {
            $stmt_find_fornecedor->execute([$fabricante]);
            $fornecedor_id = $stmt_find_fornecedor->fetchColumn();
        }

        if ($fornecedor_id) {
            // 5. Se encontrou, insere a venda
            $titulo_venda = "Venda via Proposta #{$proposta_id} - " . ($item['descricao'] ?: 'Item');
            $quantidade = (int) ($item['quantidade'] ?? 1);
            $valor_unitario = (float) ($item['valor_unitario'] ?? 0);
            $valor_total_item = $quantidade * $valor_unitario; // Cálculo simples, sem multiplicador de locação
            $notas_venda = "Gerado automaticamente a partir da Proposta ID {$proposta_id}.";

            try {
                // ***** ALTERAÇÃO: Passa $cliente_pf_id e $organizacao_id corretamente *****
                $stmt_insert_venda->execute([
                    $fornecedor_id,
                    $organizacao_id, // Pode ser null se for cliente PF
                    $cliente_pf_id,  // Pode ser null se for organização (Corrigido para passar o ID PF)
                    $user_id_for_sale,
                    $titulo_venda,
                    'Proposta Aprovada', // Origem
                    $item['descricao'] ?: null,
                    $fabricante,
                    $item['modelo'] ?? null,
                    $quantidade,
                    $valor_unitario,
                    $valor_total_item,
                    $notas_venda,
                    $proposta_id // Referência à proposta
                ]);
                $vendas_criadas++;
                error_log("[Auto Sale Create] SUCESSO: Venda para fornecedor ID {$fornecedor_id} (Fabricante: {$fabricante}) criada para o item '{$item['descricao']}'.");
            } catch (PDOException $e) {
                // Loga o erro mas continua tentando inserir os outros itens
                error_log("[Auto Sale Create] ERRO PDO ao inserir venda para fornecedor ID {$fornecedor_id} / Item '{$item['descricao']}': " . $e->getMessage());
            }

        } else {
            // 6. Se não encontrou, regista o aviso
            error_log("[Auto Sale Create] AVISO: Fornecedor '{$fabricante}' (item: '{$item['descricao']}') não encontrado na tabela 'fornecedores'. Venda não criada para este item.");
            if (!empty($fabricante) && !in_array($fabricante, $fornecedores_nao_encontrados)) {
                $fornecedores_nao_encontrados[] = $fabricante;
            }
        }
    }

    error_log("[Auto Sale Create] Finalizado para proposta ID: {$proposta_id}. Vendas criadas: {$vendas_criadas}.");
    // Poderia retornar $fornecedores_nao_encontrados ou lançar uma exceção/aviso se necessário.
}
// --- FIM DA FUNÇÃO AUXILIAR ---

/**
 * Sincroniza a etapa da oportunidade baseada no status da proposta.
 * Suporta múltiplos funis (Vendas, Licitações, etc.) tentando mapear
 * o status da proposta para etapas equivalentes no funil da oportunidade.
 */
function sync_opportunity_stage($pdo, $oportunidade_id, $status_proposta)
{
    if (empty($oportunidade_id) || empty($status_proposta)) {
        return;
    }

    // 1. Identificar qual Funil a oportunidade pertence
    // Precisamos do funil_id. A oportunidade tem etapa_id, que liga a etapas_funil, que tem funil_id.
    try {
        $stmt_funil = $pdo->prepare("
            SELECT f.id as funil_id, f.nome as funil_nome 
            FROM oportunidades o
            JOIN etapas_funil ef ON o.etapa_id = ef.id
            JOIN funis f ON ef.funil_id = f.id
            WHERE o.id = ?
        ");
        $stmt_funil->execute([$oportunidade_id]);
        $funil_data = $stmt_funil->fetch(PDO::FETCH_ASSOC);

        if (!$funil_data) {
            error_log("[Sync Opp Stage] ERRO: Não foi possível determinar o funil da Oportunidade ID {$oportunidade_id}.");
            return;
        }

        $funil_id = $funil_data['funil_id'];
        $funil_nome = $funil_data['funil_nome'];

        error_log("[Sync Opp Stage] Sincronizando Opp ID {$oportunidade_id} (Funil: {$funil_nome} [{$funil_id}]) com Status Proposta: '{$status_proposta}'");

        // 2. Definir candidatos de Etapa baseados no status da proposta
        // Ordem de prioridade importa.
        $candidatos = [];

        // Normaliza o status para comparação (embora os arrays abaixo usem chaves diretas para mapear)
        // Mapeamento: Status Proposta -> Lista de possíveis nomes de Etapa
        $mapa_candidatos = [
            'ENVIADA' => ['Proposta', 'Envio de Proposta', 'Acolhimento de propostas'],
            'Recusada' => ['Recusado', 'Desclassificado', 'Perdida', 'Perdido', 'Cancelado', 'Cancelada', 'Fracassado', 'Revogado', 'Anulado', 'Suspenso'],
            'Aprovada' => ['Fechado', 'Contrato', 'Homologado', 'Empenhado', 'Ganho', 'Vendido'],
            'Negociando' => ['Negociação', 'Em Negociação', 'Análise']
        ];

        // Tenta encontrar correspondência exata ou case-insensitive
        foreach ($mapa_candidatos as $key => $lista) {
            if (strcasecmp($key, $status_proposta) === 0) {
                $candidatos = $lista;
                break;
            }
        }

        if (empty($candidatos)) {
            error_log("[Sync Opp Stage] AVISO: Nenhuma etapa candidata mapeada para o status '{$status_proposta}'.");
            return;
        }

        // 3. Buscar a primeira etapa válida no funil atual
        // Monta placeholders para o IN (?, ?, ...)
        $placeholders = implode(',', array_fill(0, count($candidatos), '?'));

        // Prepara os parâmetros: funil_id primeiro, depois a lista de candidatos
        $params = array_merge([$funil_id], $candidatos);

        // Query para buscar Stages que existem neste funil e estão na lista de candidatos.
        // A ordem do FIELD ajuda a priorizar a ordem definida no array $candidatos, 
        // mas como são nomes diferentes, geralmente só vai achar um ou outro dependendo do funil.
        // Se houver conflito, pega o de menor ordem (mais "cedo" no funil? ou usar FIELD).
        // Vamos confiar que os nomes são distintos o suficiente entre funis ou equivalentes.
        $sql = "SELECT id, nome FROM etapas_funil WHERE funil_id = ? AND nome IN ($placeholders) LIMIT 1";

        $stmt_search = $pdo->prepare($sql);
        $stmt_search->execute($params);
        $found_stage = $stmt_search->fetch(PDO::FETCH_ASSOC);

        if ($found_stage) {
            $new_stage_id = $found_stage['id'];
            $new_stage_name = $found_stage['nome'];

            // 4. Atualizar a oportunidade
            $stmt_update = $pdo->prepare("UPDATE oportunidades SET etapa_id = ?, data_ultima_movimentacao = NOW() WHERE id = ?");
            $stmt_update->execute([$new_stage_id, $oportunidade_id]);

            error_log("[Sync Opp Stage] SUCESSO: Opp ID {$oportunidade_id} movida para '{$new_stage_name}' (ID: {$new_stage_id}).");
        } else {
            error_log("[Sync Opp Stage] FALHA: Nenhuma etapa correspondente encontrada no Funil '{$funil_nome}' para os candidatos: " . implode(', ', $candidatos));
        }

    } catch (Exception $e) {
        error_log("[Sync Opp Stage] EXCEPTION: " . $e->getMessage());
    }
}


// Função para buscar detalhes da proposta (sem alterações aqui, mas verifica se busca todos os campos necessários)
function handle_get_proposal_details($pdo, $get_data)
{
    $id = isset($get_data['id']) ? (int) $get_data['id'] : 0;
    if (empty($id)) {
        json_response(['success' => false, 'error' => 'ID da proposta não fornecido.'], 400);
    }

    // Garante que busca todos os campos de cliente e contato
    $proposal_stmt = $pdo->prepare("
         SELECT p.*,
                o.nome_fantasia as organizacao_nome, o.razao_social as org_razao_social, o.cnpj, o.logradouro as org_logradouro, o.numero as org_numero, o.complemento as org_complemento, o.bairro as org_bairro, o.cidade as org_cidade, o.estado as org_estado, o.cep as org_cep,
                pf.nome as cliente_pf_nome, pf.cpf, pf.logradouro as pf_logradouro, pf.numero as pf_numero, pf.complemento as pf_complemento, pf.bairro as pf_bairro, pf.cidade as pf_cidade, pf.estado as pf_estado, pf.cep as pf_cep,
                ct.nome as contato_nome, ct.email as contato_email, ct.telefone as contato_telefone,
                u.nome as vendedor_nome, u.role as vendedor_role, u.email as vendedor_email, u.telefone as vendedor_telefone,
                ef.nome as etapa_funil_nome
         FROM propostas p
         LEFT JOIN organizacoes o ON p.organizacao_id = o.id
         LEFT JOIN clientes_pf pf ON p.cliente_pf_id = pf.id
         LEFT JOIN contatos ct ON p.contato_id = ct.id
         LEFT JOIN usuarios u ON p.usuario_id = u.id
         LEFT JOIN oportunidades opp ON p.oportunidade_id = opp.id
         LEFT JOIN etapas_funil ef ON opp.etapa_id = ef.id
         WHERE p.id = ?");
    $proposal_stmt->execute([$id]);
    $proposal = $proposal_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$proposal) {
        json_response(['success' => false, 'error' => 'Proposta não encontrada.'], 404);
    }

    // --- ALTERAÇÃO: Busca também a coluna 'parametros' ---
    $items_stmt = $pdo->prepare("SELECT * FROM proposta_itens WHERE proposta_id = ?");
    $items_stmt->execute([$id]);
    $items = $items_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Decodifica o JSON de parâmetros para cada item
    foreach ($items as &$item) {
        $decoded_params = [];
        if (!empty($item['parametros'])) {
            try {
                $decoded_params = json_decode($item['parametros'], true);
                if (!is_array($decoded_params)) {
                    $decoded_params = [];
                }
            } catch (Exception $e) {
                $decoded_params = [];
            }
        }

        // Filter out __meses_locacao from parameters if it exists (legacy cleanup)
        $item['parametros'] = array_values(array_filter($decoded_params, function ($p) {
            return isset($p['nome']) && $p['nome'] !== '__meses_locacao';
        }));

        // Ensure integer type for meses_locacao if present
        if (isset($item['meses_locacao'])) {
            $item['meses_locacao'] = (int) $item['meses_locacao'];
        }
    }
    unset($item); // Libera a referência

    $proposal['items'] = $items;
    // --- FIM DA ALTERAÇÃO ---

    json_response(['success' => true, 'proposal' => $proposal]);
}

// Função de upload de imagem (sem alterações)
function handle_upload_image()
{
    if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'rar'];
        $filename = $_FILES['image']['name'];
        $filetype = pathinfo($filename, PATHINFO_EXTENSION);

        if (!in_array(strtolower($filetype), $allowed)) {
            json_response(['success' => false, 'error' => 'Tipo de arquivo inválido. Formatos permitidos: imagens, pdf, office e compactados.'], 400);
        }

        $upload_dir = 'uploads/proposal_items/'; // Diretório específico para itens de proposta
        $base_path = dirname(__DIR__, 2); // Raiz do projeto
        $destination_dir = $base_path . '/' . $upload_dir;

        if (!is_dir($destination_dir)) {
            if (!mkdir($destination_dir, 0775, true)) {
                json_response(['success' => false, 'error' => 'Falha ao criar diretório de uploads.'], 500);
                return;
            }
        }


        $new_filename = uniqid('item_') . '.' . strtolower($filetype);
        $destination_path = $destination_dir . $new_filename;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $destination_path)) {
            // Retorna apenas o caminho relativo
            $url = $upload_dir . $new_filename;
            json_response(['success' => true, 'url' => $url]);
        } else {
            json_response(['success' => false, 'error' => 'Falha ao mover o arquivo.'], 500);
        }
    } else {
        $error_code = $_FILES['image']['error'] ?? ' desconhecido';
        error_log("Erro no upload de imagem: Código {$error_code}");
        json_response(['success' => false, 'error' => 'Nenhum arquivo enviado ou erro no upload. Código: ' . $error_code], 400);
    }
}

// Opcional: Função dedicada para atualizar apenas o status (se necessário no futuro)

function handle_update_proposal_status($pdo, $data)
{
    $proposalId = $data['id'] ?? null;
    $new_status = $data['status'] ?? null;

    if (empty($proposalId) || empty($new_status)) {
        json_response(['success' => false, 'error' => 'ID da proposta e novo status são obrigatórios.'], 400);
    }
    // Adicionar validação se $new_status é um valor permitido

    $pdo->beginTransaction();
    try {
        // Busca o status atual e dados do cliente
        $stmt_current = $pdo->prepare("SELECT status, organizacao_id, cliente_pf_id FROM propostas WHERE id = ?");
        $stmt_current->execute([$proposalId]);
        $current_data = $stmt_current->fetch(PDO::FETCH_ASSOC);
        $current_status = $current_data['status'] ?? null;

        if (!$current_status) {
            throw new Exception("Proposta não encontrada.");
        }

        // Atualiza o status
        $stmt_update = $pdo->prepare("UPDATE propostas SET status = ? WHERE id = ?");
        $stmt_update->execute([$new_status, $proposalId]);

        // Sincroniza o status da oportunidade
        // Precisamos buscar o oportunidade_id desta proposta
        $opp_id_stmt = $pdo->prepare("SELECT oportunidade_id FROM propostas WHERE id = ?");
        $opp_id_stmt->execute([$proposalId]);
        $oportunidade_id = $opp_id_stmt->fetchColumn();

        if ($oportunidade_id) {
            sync_opportunity_stage($pdo, $oportunidade_id, $new_status);
        }

        // Lógica para criar venda fornecedor se status mudou para "Aprovada"
        if (strcasecmp($new_status, 'Aprovada') === 0 && strcasecmp($current_status, 'Aprovada') !== 0) {
            create_vendas_fornecedores_from_proposal($pdo, $proposalId, $current_data['organizacao_id'], $current_data['cliente_pf_id']);
        }

        $pdo->commit();
        json_response(['success' => true, 'proposal' => ['id' => $proposalId, 'status' => $new_status]]);

    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("[Update Status Error] Exception: " . $e->getMessage());
        json_response(['success' => false, 'error' => 'Erro na transação ao atualizar status: ' . $e->getMessage()], 500);
    }
}
function handle_delete_proposal($pdo, $data)
{
    // 1. Verificação de ID
    $proposalId = $data['id'] ?? null;
    if (empty($proposalId)) {
        json_response(['success' => false, 'error' => 'ID da proposta é obrigatório.'], 400);
        return;
    }

    // 2. Verificação de Permissão de Segurança (Backend)
    // Apenas Gestor, Analista e Comercial podem excluir
    // Vendedor e Especialista podem excluir APENAS SE FOREM DONOS
    $currentRole = $_SESSION['role'];
    $allowedGlobal = ['Gestor', 'Analista', 'Comercial'];

    if (in_array($currentRole, $allowedGlobal)) {
        // Permite excluir qualquer proposta
    } elseif (in_array($currentRole, ['Vendedor', 'Especialista'])) {
        // Verifica se é dono
        $stmt_check = $pdo->prepare("SELECT usuario_id FROM propostas WHERE id = ?");
        $stmt_check->execute([$proposalId]);
        $ownerId = $stmt_check->fetchColumn();

        if ($ownerId != $_SESSION['user_id']) {
            json_response(['success' => false, 'error' => 'Acesso negado: Você só pode excluir propostas que criou.'], 403);
            return;
        }
    } else {
        // Outros perfis (se houver) bloqueados
        json_response(['success' => false, 'error' => 'Acesso negado: Você não tem permissão para excluir propostas.'], 403);
        return;
    }

    $pdo->beginTransaction();
    try {
        // 3. Remove itens da proposta
        $stmt_items = $pdo->prepare("DELETE FROM proposta_itens WHERE proposta_id = ?");
        $stmt_items->execute([$proposalId]);

        // 4. Remove a proposta
        $stmt_proposal = $pdo->prepare("DELETE FROM propostas WHERE id = ?");
        $stmt_proposal->execute([$proposalId]);

        if ($stmt_proposal->rowCount() > 0) {
            $pdo->commit();
            json_response(['success' => true, 'message' => 'Proposta excluída com sucesso.']);
        } else {
            $pdo->rollBack();
            json_response(['success' => false, 'error' => 'Proposta não encontrada ou já excluída.'], 404);
        }

    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("[Delete Proposal Error] " . $e->getMessage());
        json_response(['success' => false, 'error' => 'Erro ao excluir proposta.'], 500);
    }
}
?>