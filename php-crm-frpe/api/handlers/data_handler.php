<?php
// api/handlers/data_handler.php

function handle_get_data($pdo)
{
    $current_user_id = $_SESSION['user_id'];

    $stmt_user = $pdo->prepare("SELECT id, nome, role, email, telefone FROM usuarios WHERE id = ?");
    $stmt_user->execute([$current_user_id]);
    $currentUser = $stmt_user->fetch(PDO::FETCH_ASSOC);

    if (!$currentUser) {
        session_unset();
        session_destroy();
        json_response(['error' => 'Sessão inválida. Por favor, faça login novamente.'], 401);
        return; // Adiciona return
    }

    $current_user_role = $currentUser['role'];

    // --- LÓGICA DE PERMISSÕES ATUALIZADA ---
    $permissions = [
        'canSeeLeads' => in_array($current_user_role, ['Gestor', 'Analista', 'Comercial', 'Marketing', 'Vendedor', 'Especialista']),
        'canSeeSettings' => in_array($current_user_role, ['Gestor', 'Analista']), // Comercial removido
        'canSeeCatalog' => true,
        // canCreate genérico mantido para compatibilidade, mas recomenda-se usar específicos
        'canCreate' => in_array($current_user_role, ['Gestor', 'Analista', 'Comercial', 'Vendedor', 'Especialista']),
        'canEdit' => in_array($current_user_role, ['Gestor', 'Analista', 'Comercial', 'Vendedor', 'Especialista']),
        'canDelete' => in_array($current_user_role, ['Gestor', 'Analista', 'Comercial', 'Vendedor', 'Especialista']),
        'canPrint' => true,
        // Permissões Específicas
        'canCreateOpportunity' => in_array($current_user_role, ['Gestor', 'Analista', 'Comercial', 'Vendedor', 'Especialista']),
        'canCreateClient' => in_array($current_user_role, ['Gestor', 'Analista', 'Comercial', 'Vendedor', 'Especialista']),
        'canCreateProduct' => in_array($current_user_role, ['Gestor', 'Analista', 'Comercial', 'Especialista']), // Vendedor removido
        'canDeleteProduct' => in_array($current_user_role, ['Gestor', 'Analista', 'Comercial', 'Especialista']), // Nova permissão específica
        'canEditOwnedItems' => in_array($current_user_role, ['Vendedor', 'Especialista', 'Representante']),
        'canManageLeads' => in_array($current_user_role, ['Gestor', 'Analista', 'Comercial', 'Marketing', 'Vendedor', 'Especialista']), // Permissão para gerir leads
        'canCreateSchedule' => true,
        'canEditSchedule' => in_array($current_user_role, ['Gestor', 'Analista', 'Comercial', 'Vendedor', 'Especialista', 'Representante']),
        'canSeeReports' => in_array($current_user_role, ['Gestor', 'Analista', 'Comercial']), // Adicionado Comercial
    ];
    $currentUser['permissions'] = $permissions;

    // --- FILTRAGEM BASEADA NO PERFIL ---
    // Perfis restritos que só veem o que criaram
    $is_restricted = in_array($current_user_role, ['Vendedor', 'Especialista']);

    // Filtro para Oportunidades
    $where_opp = "";
    $params_opp = [];
    if ($is_restricted) {
        $where_opp = " WHERE (o.usuario_id = ? OR o.comercial_user_id = ?) ";
        $params_opp[] = $current_user_id;
        $params_opp[] = $current_user_id;
    }

    $sql_opps = "SELECT o.*, 
                 org.nome_fantasia as organizacao_nome, 
                 cpf.nome as cliente_pf_nome, 
                 c.nome as contato_nome, 
                 c.email as contato_email, 
                 c.telefone as contato_telefone, 
                 u.nome as vendedor_nome,
                 (SELECT GROUP_CONCAT(DISTINCT fabricante SEPARATOR ', ') FROM oportunidade_itens WHERE oportunidade_id = o.id) as fabricantes_itens
                 FROM oportunidades o 
                 LEFT JOIN organizacoes org ON o.organizacao_id = org.id 
                 LEFT JOIN clientes_pf cpf ON o.cliente_pf_id = cpf.id 
                 LEFT JOIN contatos c ON o.contato_id = c.id 
                 LEFT JOIN usuarios u ON o.usuario_id = u.id" . $where_opp;

    $opportunities = [];
    try {
        $stmt_opps = $pdo->prepare($sql_opps);
        $stmt_opps->execute($params_opp);
        $opportunities = $stmt_opps->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("ERRO DB (Oportunidades): " . $e->getMessage());
        $opportunities = []; // Falha graciosa
    }

    // Filtro para Propostas
    $where_prop = "";
    $params_prop = [];
    if ($is_restricted) {
        $where_prop = " WHERE p.usuario_id = ? ";
        $params_prop[] = $current_user_id;
    }

    $proposals_sql = "
         SELECT
             p.*,
             o.nome_fantasia as organizacao_nome,
             o.cnpj,
             c_pf.nome as cliente_pf_nome,
             c_pf.cpf,
             cont.nome as contato_nome,
             cont.email as contato_email,
             cont.telefone as contato_telefone,
             u.nome as vendedor_nome,
             ef.nome as etapa_funil_nome,
             (SELECT GROUP_CONCAT(DISTINCT descricao SEPARATOR ', ') FROM proposta_itens WHERE proposta_id = p.id) as itens_descricao,
             (SELECT GROUP_CONCAT(DISTINCT fabricante SEPARATOR ', ') FROM proposta_itens WHERE proposta_id = p.id) as itens_fabricante
         FROM propostas p
         LEFT JOIN organizacoes o ON p.organizacao_id = o.id
         LEFT JOIN clientes_pf c_pf ON p.cliente_pf_id = c_pf.id
         LEFT JOIN contatos cont ON p.contato_id = cont.id 
         LEFT JOIN usuarios u ON p.usuario_id = u.id
         LEFT JOIN oportunidades opp ON p.oportunidade_id = opp.id
         LEFT JOIN etapas_funil ef ON opp.etapa_id = ef.id
         " . $where_prop . "
         ORDER BY p.data_criacao DESC
     ";
    $proposals = [];
    try {
        $proposals_stmt = $pdo->prepare($proposals_sql);
        $proposals_stmt->execute($params_prop);
        $proposals = $proposals_stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("ERRO DB (Propostas): " . $e->getMessage());
    }

    $pre_proposals = [];
    if ($permissions['canEdit']) {
        // Pré-propostas também precisam ser filtradas se for Vendedor/Especialista
        $where_pre = " WHERE o.comercial_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM propostas p WHERE p.oportunidade_id = o.id)";
        $params_pre = [];

        if ($is_restricted) {
            $where_pre .= " AND (o.usuario_id = ? OR o.comercial_user_id = ?) "; // Pode ver se criou OU se foi atribuído como comercial
            $params_pre[] = $current_user_id;
            $params_pre[] = $current_user_id;
        }

        $sql_pre = "
             SELECT o.*,
                    org.nome_fantasia as organizacao_nome,
                    c.nome as contato_nome,
                    pf.nome as cliente_pf_nome,
                    u.nome as vendedor_nome
             FROM oportunidades o
             LEFT JOIN organizacoes org ON o.organizacao_id = org.id
             LEFT JOIN contatos c ON o.contato_id = c.id
             LEFT JOIN clientes_pf pf ON o.cliente_pf_id = pf.id
             LEFT JOIN usuarios u ON o.usuario_id = u.id
             " . $where_pre . "
             ORDER BY o.data_criacao DESC
         ";
        try {
            $stmt_pre = $pdo->prepare($sql_pre);
            $stmt_pre->execute($params_pre);
            $pre_proposals = $stmt_pre->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("ERRO DB (Pré-propostas): " . $e->getMessage());
        }
    }

    // Filtro para Vendas Fornecedores
    $where_vendas = "";
    $params_vendas = [];
    if ($is_restricted) {
        $where_vendas = " WHERE vf.usuario_id = ? ";
        $params_vendas[] = $current_user_id;
    }

    // ***** ALTERAÇÃO: Adicionado LEFT JOIN com clientes_pf *****
    $vendas_fornecedores_sql = "
         SELECT
             vf.*,
             f.nome as fornecedor_nome,
             o.nome_fantasia as organizacao_nome,
             pf.nome as cliente_pf_nome,
             u.nome as usuario_nome
         FROM vendas_fornecedores vf
         JOIN fornecedores f ON vf.fornecedor_id = f.id
         LEFT JOIN organizacoes o ON vf.organizacao_id = o.id
         LEFT JOIN clientes_pf pf ON vf.cliente_pf_id = pf.id
         JOIN usuarios u ON vf.usuario_id = u.id
         " . $where_vendas . "
         ORDER BY vf.data_venda DESC
     ";
    $vendas_fornecedores = [];
    try {
        $vendas_fornecedores_stmt = $pdo->prepare($vendas_fornecedores_sql);
        $vendas_fornecedores_stmt->execute($params_vendas);
        $vendas_fornecedores = $vendas_fornecedores_stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("ERRO DB (Vendas Fornecedores): " . $e->getMessage());
    }
    // ***** FIM DA ALTERAÇÃO *****


    $fornecedores = $pdo->query("SELECT * FROM fornecedores ORDER BY nome ASC")->fetchAll(PDO::FETCH_ASSOC);

    // --- CORREÇÃO: Consulta Agendamentos com FILTRO ---
    $where_agenda = "";
    $params_agenda = [];

    if ($is_restricted) {
        // Vê se criou OU se é um dos usuários associados
        // Subquery para verificar associação
        $where_agenda = " WHERE a.criado_por_id = ? OR EXISTS (SELECT 1 FROM agendamento_usuarios au_check WHERE au_check.agendamento_id = a.id AND au_check.usuario_id = ?) ";
        $params_agenda[] = $current_user_id;
        $params_agenda[] = $current_user_id;
    }

    $agendamentos_sql = "
          SELECT
              a.*,
              u_criador.nome as criado_por_nome,
              GROUP_CONCAT(DISTINCT u_para.nome SEPARATOR ', ') as para_usuario_nomes,
              GROUP_CONCAT(DISTINCT u_para.id SEPARATOR ',') as usuarios_associados_ids
          FROM agendamentos a
          LEFT JOIN usuarios u_criador ON a.criado_por_id = u_criador.id
          LEFT JOIN agendamento_usuarios au ON a.id = au.agendamento_id
          LEFT JOIN usuarios u_para ON au.usuario_id = u_para.id
          " . $where_agenda . "
          GROUP BY a.id
          ORDER BY a.data_inicio DESC
      ";
    $agendamentos = [];
    try {
        $stmt_agendamentos = $pdo->prepare($agendamentos_sql);
        $stmt_agendamentos->execute($params_agenda);
        $agendamentos = $stmt_agendamentos->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("ERRO DB (Agendamentos): " . $e->getMessage());
    }

    // Adiciona formatação de data/hora que era feita no PHP antigo, se necessário no JS
    foreach ($agendamentos as &$ag) {
        // O campo 'usuarios_associados_ids' já vem como string separada por vírgula
        // O campo 'para_usuario_nomes' já vem como string separada por vírgula e espaço
        // Adiciona o array 'usuarios_associados' para o frontend usar mais facilmente
        if (!empty($ag['usuarios_associados_ids'])) {
            $ag['usuarios_associados'] = explode(',', $ag['usuarios_associados_ids']);
        } else {
            $ag['usuarios_associados'] = [];
        }

        // Mantém a lógica de separar data e hora se o JS precisar
        if (!empty($ag['data_inicio'])) {
            try {
                $dt = new DateTime($ag['data_inicio']);
                // Estes campos podem ser úteis no JS, mas a exibição deve usar a string original 'data_inicio'
                //$ag['data_agendamento'] = $dt->format('Y-m-d');
                //$ag['hora_agendamento'] = $dt->format('H:i');
            } catch (Exception $e) {
                //$ag['data_agendamento'] = null;
                //$ag['hora_agendamento'] = null;
            }
        }
    }
    unset($ag); // Libera a referência

    // --- NOVO: Inclui 'produto_interesse' na busca de leads ---
    $leads = $pdo->query("SELECT id, nome, email, telefone, origem, sub_origem, produto, produto_interesse, campanha, observacao, status, data_chegada, oportunidade_id FROM leads ORDER BY data_chegada DESC")->fetchAll(PDO::FETCH_ASSOC);

    // Buscar produtos do catálogo
    $products = $pdo->query("SELECT * FROM produtos ORDER BY nome_produto ASC")->fetchAll(PDO::FETCH_ASSOC);

    // Buscar Tabelas de Preço (master) com seus itens (detail)
    $price_table = [];
    try {
        $tables = $pdo->query("SELECT * FROM tabela_preco ORDER BY nome_tabela ASC")->fetchAll(PDO::FETCH_ASSOC);
        $stmt_pi = $pdo->prepare("SELECT * FROM tabela_preco_itens WHERE tabela_preco_id = ? ORDER BY id ASC");
        foreach ($tables as &$tbl) {
            $stmt_pi->execute([$tbl['id']]);
            $tbl['itens'] = $stmt_pi->fetchAll(PDO::FETCH_ASSOC);
        }
        $price_table = $tables;
    } catch (PDOException $e) { /* Tabela pode não existir ainda */ }

    // Buscar Kits com seus itens (agora referenciando tabela_preco_itens)
    $kits_data = [];
    try {
        $kits_rows = $pdo->query("SELECT * FROM kits ORDER BY nome ASC")->fetchAll(PDO::FETCH_ASSOC);
        $stmt_ki = $pdo->prepare("
            SELECT ki.id, ki.kit_id, ki.tabela_preco_item_id, ki.quantidade, ki.valor_unitario_snapshot,
                   tpi.referencia, tpi.descricao, tpi.fabricante,
                   tp.codigo as tabela_codigo, tp.nome_tabela
            FROM kit_itens ki
            INNER JOIN tabela_preco_itens tpi ON tpi.id = ki.tabela_preco_item_id
            INNER JOIN tabela_preco tp ON tp.id = tpi.tabela_preco_id
            WHERE ki.kit_id = ? ORDER BY ki.id ASC
        ");
        foreach ($kits_rows as &$kit_row) {
            $stmt_ki->execute([$kit_row['id']]);
            $kit_row['itens'] = $stmt_ki->fetchAll(PDO::FETCH_ASSOC);
        }
        $kits_data = $kits_rows;
    } catch (PDOException $e) { /* Tabela pode não existir ainda */ }

    // --- NOVO: Buscar empenhos e notas fiscais (com Try/Catch caso as tabelas ainda não existam) ---
    $empenhos = [];
    try {
        // Traz o nome da empresa/contrato via join para facilitar
        $sql_emp = "SELECT e.*, o.numero_edital as numero_contrato, org.nome_fantasia as organizacao_nome 
                    FROM empenhos e 
                    LEFT JOIN oportunidades o ON e.oportunidade_id = o.id 
                    LEFT JOIN organizacoes org ON o.organizacao_id = org.id 
                    ORDER BY e.data_prevista DESC";
        $empenhos = $pdo->query($sql_emp)->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) { /* Tabela pode não existir ainda */
    }

    $notas_fiscais = [];
    try {
        $sql_nf = "SELECT nf.*, o.numero_edital as numero_contrato, org.nome_fantasia as organizacao_nome 
                   FROM notas_fiscais nf 
                   LEFT JOIN oportunidades o ON nf.oportunidade_id = o.id 
                   LEFT JOIN organizacoes org ON o.organizacao_id = org.id 
                   ORDER BY nf.data_prevista DESC";
        $notas_fiscais = $pdo->query($sql_nf)->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) { /* Tabela pode não existir ainda */
    }

    $response_data = [
        'currentUser' => $currentUser,
        'users' => $pdo->query("SELECT id, nome, role, email, telefone, cargo, status FROM usuarios WHERE deleted_at IS NULL")->fetchAll(PDO::FETCH_ASSOC),
        'opportunities' => $opportunities,
        'organizations' => $pdo->query("SELECT * FROM organizacoes ORDER BY nome_fantasia ASC")->fetchAll(PDO::FETCH_ASSOC),
        'contacts' => $pdo->query("SELECT c.*, o.nome_fantasia as organizacao_nome FROM contatos c JOIN organizacoes o ON c.organizacao_id = o.id ORDER BY c.nome ASC")->fetchAll(PDO::FETCH_ASSOC),
        'clients_pf' => $pdo->query("SELECT * FROM clientes_pf ORDER BY nome ASC")->fetchAll(PDO::FETCH_ASSOC),
        'funnels' => $pdo->query("SELECT * FROM funis")->fetchAll(PDO::FETCH_ASSOC),
        'stages' => $pdo->query("SELECT * FROM etapas_funil ORDER BY ordem ASC")->fetchAll(PDO::FETCH_ASSOC),
        'proposals' => $proposals,
        'pre_proposals' => $pre_proposals,
        'fornecedores' => $fornecedores,
        'vendasFornecedores' => $vendas_fornecedores,
        'agendamentos' => $agendamentos,
        'leads' => $leads,
        'products' => $products,
        'priceTable' => $price_table,
        'kits' => $kits_data,
        'empenhos' => $empenhos,
        'notas_fiscais' => $notas_fiscais
    ];
    json_response($response_data);
}

function handle_get_stats($pdo)
{
    $sql_kpis = "SELECT COUNT(*) as total_opps, SUM(valor) as total_value FROM oportunidades";
    $stmt_kpis = $pdo->prepare($sql_kpis);
    $stmt_kpis->execute();
    $kpis = $stmt_kpis->fetch(PDO::FETCH_ASSOC);

    $stmt_fechado_id = $pdo->query("SELECT id FROM etapas_funil WHERE nome = 'Fechado' LIMIT 1");
    $fechado_id = $stmt_fechado_id->fetchColumn();
    $won_count = 0;

    if ($fechado_id) {
        $won_sql = "SELECT COUNT(*) FROM oportunidades WHERE etapa_id = ?";
        $stmt_won = $pdo->prepare($won_sql);
        $stmt_won->execute([$fechado_id]);
        $stmt_won->execute([$fechado_id]);
        $won_count = $stmt_won->fetchColumn();
    }

    // --- NOVO: Valor Aprovado (Propostas) ---
    $sql_approved = "SELECT SUM(valor_total) FROM propostas WHERE status = 'Aprovada'";
    $stmt_approved = $pdo->prepare($sql_approved);
    $stmt_approved->execute();
    $approved_value = $stmt_approved->fetchColumn();
    // ----------------------------------------

    $kpis['total_opps'] = $kpis['total_opps'] ?? 0;
    $kpis['total_value'] = $kpis['total_value'] ?? 0;
    $won_count = $won_count ?? 0;

    $kpis['conversion_rate'] = $kpis['total_opps'] > 0 ? ($won_count / $kpis['total_opps']) * 100 : 0;
    $kpis['conversion_rate'] = $kpis['total_opps'] > 0 ? ($won_count / $kpis['total_opps']) * 100 : 0;
    $kpis['avg_deal_size'] = $kpis['total_opps'] > 0 ? $kpis['total_value'] / $kpis['total_opps'] : 0;
    $kpis['approved_proposals_value'] = $approved_value ?? 0; // Adiciona ao array de retorno

    $sql_stages = "SELECT ef.nome, COUNT(o.id) as count FROM etapas_funil ef LEFT JOIN oportunidades o ON ef.id = o.etapa_id GROUP BY ef.id ORDER BY ef.ordem";
    $stmt_stages = $pdo->prepare($sql_stages);
    $stmt_stages->execute();
    $opps_by_stage = $stmt_stages->fetchAll(PDO::FETCH_ASSOC);

    $stmt_users = $pdo->query("SELECT u.nome, COUNT(o.id) as count FROM usuarios u LEFT JOIN oportunidades o ON u.id = o.usuario_id GROUP BY u.id, u.nome");
    $opps_by_user = $stmt_users->fetchAll(PDO::FETCH_ASSOC);

    $stmt_fornecedores = $pdo->query("SELECT f.nome, SUM(vf.valor_total) as total_vendido FROM fornecedores f LEFT JOIN vendas_fornecedores vf ON f.id = vf.fornecedor_id GROUP BY f.id, f.nome");
    $sales_by_fornecedor = $stmt_fornecedores->fetchAll(PDO::FETCH_ASSOC);

    json_response([
        'success' => true,
        'kpis' => $kpis,
        'oppsByStage' => $opps_by_stage,
        'oppsByUser' => $opps_by_user,
        'salesByFornecedor' => $sales_by_fornecedor
    ]);
}

function handle_create_venda_fornecedor($pdo, $data)
{
    if (empty($data['titulo']) || empty($data['data_venda']) || empty($data['fornecedor_id'])) {
        json_response(['success' => false, 'error' => 'Campos obrigatórios ausentes.'], 400);
        return; // Adiciona return
    }

    $sql = "INSERT INTO vendas_fornecedores (fornecedor_id, organizacao_id, usuario_id, titulo, data_venda, origem, descricao_produto, fabricante_marca, modelo, quantidade, valor_unitario, valor_total, notas, cliente_pf_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"; // Adicionado cliente_pf_id
    $stmt = $pdo->prepare($sql);
    $success = $stmt->execute([
        $data['fornecedor_id'],
        $data['organizacao_id'] ?? null,
        $_SESSION['user_id'],
        $data['titulo'],
        $data['data_venda'],
        $data['origem'] ?? null,
        $data['descricao_produto'] ?? null,
        $data['fabricante_marca'] ?? null,
        $data['modelo'] ?? null,
        $data['quantidade'] ?? 1,
        $data['valor_unitario'] ?? 0.00,
        $data['valor_total'] ?? 0.00,
        $data['notas'] ?? null,
        $data['cliente_pf_id'] ?? null // Adicionado cliente_pf_id
    ]);

    if ($success) {
        $lastId = $pdo->lastInsertId();
        // ***** ALTERAÇÃO: Adicionado LEFT JOIN com clientes_pf *****
        $stmt_new = $pdo->prepare("
             SELECT
                 vf.*,
                 f.nome as fornecedor_nome,
                 o.nome_fantasia as organizacao_nome,
                 pf.nome as cliente_pf_nome, -- Adicionado
                 u.nome as usuario_nome
             FROM vendas_fornecedores vf
             JOIN fornecedores f ON vf.fornecedor_id = f.id
             LEFT JOIN organizacoes o ON vf.organizacao_id = o.id
             LEFT JOIN clientes_pf pf ON vf.cliente_pf_id = pf.id -- Adicionado
             JOIN usuarios u ON vf.usuario_id = u.id
             WHERE vf.id = ?
         ");
        // ***** FIM DA ALTERAÇÃO *****
        $stmt_new->execute([$lastId]);
        json_response(['success' => true, 'venda_fornecedor' => $stmt_new->fetch(PDO::FETCH_ASSOC)]);
    } else {
        json_response(['success' => false, 'error' => 'Falha ao cadastrar a venda.'], 500);
    }
}

function handle_update_venda_fornecedor($pdo, $data)
{
    if (empty($data['id']) || empty($data['titulo']) || empty($data['data_venda']) || empty($data['fornecedor_id'])) {
        json_response(['success' => false, 'error' => 'ID e outros campos obrigatórios ausentes para atualização.'], 400);
        return;
    }

    $sql = "UPDATE vendas_fornecedores SET
                 fornecedor_id = ?,
                 organizacao_id = ?,
                 titulo = ?,
                 data_venda = ?,
                 origem = ?,
                 descricao_produto = ?,
                 fabricante_marca = ?,
                 modelo = ?,
                 quantidade = ?,
                 valor_unitario = ?,
                 valor_total = ?,
                 notas = ?,
                 cliente_pf_id = ?
             WHERE id = ?";

    $stmt = $pdo->prepare($sql);
    $success = $stmt->execute([
        $data['fornecedor_id'],
        $data['organizacao_id'] ?? null,
        $data['titulo'],
        $data['data_venda'],
        $data['origem'] ?? null,
        $data['descricao_produto'] ?? null,
        $data['fabricante_marca'] ?? null,
        $data['modelo'] ?? null,
        $data['quantidade'] ?? 1,
        $data['valor_unitario'] ?? 0.00,
        $data['valor_total'] ?? 0.00,
        $data['notas'] ?? null,
        $data['cliente_pf_id'] ?? null, // Adicionado
        $data['id']
    ]);

    if ($success) {
        // ***** ALTERAÇÃO: Adicionado LEFT JOIN com clientes_pf *****
        $stmt_updated = $pdo->prepare("
             SELECT
                 vf.*,
                 f.nome as fornecedor_nome,
                 o.nome_fantasia as organizacao_nome,
                 pf.nome as cliente_pf_nome, -- Adicionado
                 u.nome as usuario_nome
             FROM vendas_fornecedores vf
             JOIN fornecedores f ON vf.fornecedor_id = f.id
             LEFT JOIN organizacoes o ON vf.organizacao_id = o.id
             LEFT JOIN clientes_pf pf ON vf.cliente_pf_id = pf.id -- Adicionado
             JOIN usuarios u ON vf.usuario_id = u.id
             WHERE vf.id = ?
         ");
        // ***** FIM DA ALTERAÇÃO *****
        $stmt_updated->execute([$data['id']]);
        $updated_venda = $stmt_updated->fetch(PDO::FETCH_ASSOC);
        json_response(['success' => true, 'venda_fornecedor' => $updated_venda]);
    } else {
        json_response(['success' => false, 'error' => 'Falha ao atualizar a venda.'], 500);
    }
}

function handle_delete_venda_fornecedor($pdo, $data)
{
    if (empty($data['id'])) {
        json_response(['success' => false, 'error' => 'ID da venda é obrigatório para exclusão.'], 400);
        return;
    }

    $sql = "DELETE FROM vendas_fornecedores WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $success = $stmt->execute([$data['id']]);

    if ($success) {
        json_response(['success' => true, 'deletedId' => $data['id']]);
    } else {
        json_response(['success' => false, 'error' => 'Falha ao excluir a venda.'], 500);
    }
}
?>