<?php
// api/handlers/finance_handler.php

function handle_create_empenho($pdo, $data)
{
    if (empty($data['oportunidade_id']) || empty($data['numero'])) {
        json_response(['success' => false, 'error' => 'ID do Contrato e Número do Empenho são obrigatórios.'], 400);
        return;
    }

    $sql = "INSERT INTO empenhos (oportunidade_id, numero, valor, data_emissao, data_prevista, documento_url, documento_nome, documento_tipo, itens) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);

    // Converte valor de R$ para decimal
    $valorRaw = $data['valor'] ?? '0';
    $valorRaw = str_replace('R$', '', $valorRaw);
    $valorRaw = str_replace('.', '', $valorRaw);
    $valorRaw = str_replace(',', '.', $valorRaw);
    $valorFormatado = (float) trim($valorRaw);
    // Lidar com array de itens (converte para JSON)
    $itensJson = isset($data['itens']) ? json_encode($data['itens'], JSON_UNESCAPED_UNICODE) : null;

    try {
        $success = $stmt->execute([
            $data['oportunidade_id'],
            $data['numero'],
            $valorFormatado,
            $data['data_emissao'] ?? null,
            $data['data_prevista'] ?? null,
            $data['documento_url'] ?? null,
            $data['documento_nome'] ?? null,
            $data['documento_tipo'] ?? 'Empenho',
            $itensJson
        ]);

        if ($success) {
            $lastId = $pdo->lastInsertId();
            $stmt_new = $pdo->prepare("SELECT e.*, o.numero_edital as numero_contrato, org.nome_fantasia as organizacao_nome FROM empenhos e LEFT JOIN oportunidades o ON e.oportunidade_id = o.id LEFT JOIN organizacoes org ON o.organizacao_id = org.id WHERE e.id = ?");
            $stmt_new->execute([$lastId]);
            json_response(['success' => true, 'empenho' => $stmt_new->fetch(PDO::FETCH_ASSOC)]);
        } else {
            json_response(['success' => false, 'error' => 'Falha ao cadastrar empenho. SQL Error.'], 500);
        }
    } catch (Exception $e) {
        error_log("Erro Create Empenho: " . $e->getMessage());
        json_response(['success' => false, 'error' => 'Falha no banco de dados: ' . $e->getMessage()], 500);
    }
}

function handle_create_nota_fiscal($pdo, $data)
{
    if (empty($data['oportunidade_id']) || empty($data['numero'])) {
        json_response(['success' => false, 'error' => 'ID do Contrato e Número da Nota são obrigatórios.'], 400);
        return;
    }

    $sql = "INSERT INTO notas_fiscais (empenho_id, oportunidade_id, numero, valor, data_faturamento, data_prevista, documento_url, documento_nome, documento_tipo, itens) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);

    // Converte valor de R$ para decimal
    $valorRaw = $data['valor'] ?? '0';
    $valorRaw = str_replace('R$', '', $valorRaw);
    $valorRaw = str_replace('.', '', $valorRaw);
    $valorRaw = str_replace(',', '.', $valorRaw);
    $valorFormatado = (float) trim($valorRaw);

    $empenho_id = !empty($data['empenho_id']) ? $data['empenho_id'] : null;

    // Lidar com array de itens (converte para JSON)
    $itensJson = isset($data['itens']) ? json_encode($data['itens'], JSON_UNESCAPED_UNICODE) : null;

    try {
        $success = $stmt->execute([
            $empenho_id,
            $data['oportunidade_id'],
            $data['numero'],
            $valorFormatado,
            $data['data_faturamento'] ?? null,
            $data['data_prevista'] ?? null, // Importante para o novo filtro de data no funil
            $data['documento_url'] ?? null,
            $data['documento_nome'] ?? null,
            $data['documento_tipo'] ?? 'Nota Fiscal',
            $itensJson
        ]);

        if ($success) {
            $lastId = $pdo->lastInsertId();
            $stmt_new = $pdo->prepare("SELECT nf.*, o.numero_edital as numero_contrato, org.nome_fantasia as organizacao_nome FROM notas_fiscais nf LEFT JOIN oportunidades o ON nf.oportunidade_id = o.id LEFT JOIN organizacoes org ON o.organizacao_id = org.id WHERE nf.id = ?");
            $stmt_new->execute([$lastId]);
            json_response(['success' => true, 'nota_fiscal' => $stmt_new->fetch(PDO::FETCH_ASSOC)]);
        } else {
            json_response(['success' => false, 'error' => 'Falha ao cadastrar nota fiscal. SQL Error.'], 500);
        }
    } catch (Exception $e) {
        error_log("Erro Create NF: " . $e->getMessage());
        json_response(['success' => false, 'error' => 'Falha no banco de dados: ' . $e->getMessage()], 500);
    }
}

function handle_update_empenho($pdo, $data)
{
    if (empty($data['id'])) {
        json_response(['success' => false, 'error' => 'ID do Empenho é obrigatório para atualização.'], 400);
        return;
    }

    $id = intval($data['id']);

    // Converte valor
    $valorRaw = $data['valor'] ?? '0';
    $valorRaw = str_replace('R$', '', $valorRaw);
    $valorRaw = str_replace('.', '', $valorRaw);
    $valorRaw = str_replace(',', '.', $valorRaw);
    $valorFormatado = (float) trim($valorRaw);

    $itensJson = isset($data['itens']) ? json_encode($data['itens'], JSON_UNESCAPED_UNICODE) : null;

    $sql = "UPDATE empenhos SET numero = ?, valor = ?, data_emissao = ?, data_prevista = ?, itens = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);

    try {
        $success = $stmt->execute([
            $data['numero'],
            $valorFormatado,
            $data['data_emissao'] ?? null,
            $data['data_prevista'] ?? null,
            $itensJson,
            $id
        ]);

        if ($success) {
            $stmt_new = $pdo->prepare("SELECT e.*, o.numero_edital as numero_contrato, org.nome_fantasia as organizacao_nome FROM empenhos e LEFT JOIN oportunidades o ON e.oportunidade_id = o.id LEFT JOIN organizacoes org ON o.organizacao_id = org.id WHERE e.id = ?");
            $stmt_new->execute([$id]);
            json_response(['success' => true, 'empenho' => $stmt_new->fetch(PDO::FETCH_ASSOC)]);
        } else {
            json_response(['success' => false, 'error' => 'Falha ao atualizar empenho. SQL Error.'], 500);
        }
    } catch (Exception $e) {
        error_log("Erro Update Empenho: " . $e->getMessage());
        json_response(['success' => false, 'error' => 'Falha no banco de dados: ' . $e->getMessage()], 500);
    }
}

function handle_delete_empenho($pdo, $data)
{
    if (empty($data['id'])) {
        json_response(['success' => false, 'error' => 'ID do Empenho é obrigatório para exclusão.'], 400);
        return;
    }

    $id = intval($data['id']);
    $sql = "DELETE FROM empenhos WHERE id = ?";
    $stmt = $pdo->prepare($sql);

    try {
        if ($stmt->execute([$id])) {
            json_response(['success' => true, 'message' => 'Empenho excluído com sucesso.']);
        } else {
            json_response(['success' => false, 'error' => 'Falha ao excluir o Empenho.'], 500);
        }
    } catch (Exception $e) {
        error_log("Erro Delete Empenho: " . $e->getMessage());
        json_response(['success' => false, 'error' => 'Falha no banco de dados: ' . $e->getMessage()], 500);
    }
}

function handle_update_nota_fiscal($pdo, $data)
{
    if (empty($data['id'])) {
        json_response(['success' => false, 'error' => 'ID da Nota Fiscal é obrigatório para atualização.'], 400);
        return;
    }

    $id = intval($data['id']);
    $empenho_id = !empty($data['empenho_id']) ? intval($data['empenho_id']) : null;

    $valorRaw = $data['valor'] ?? '0';
    $valorRaw = str_replace('R$', '', $valorRaw);
    $valorRaw = str_replace('.', '', $valorRaw);
    $valorRaw = str_replace(',', '.', $valorRaw);
    $valorFormatado = (float) trim($valorRaw);

    $itensJson = isset($data['itens']) ? json_encode($data['itens'], JSON_UNESCAPED_UNICODE) : null;

    $sql = "UPDATE notas_fiscais SET empenho_id = ?, numero = ?, valor = ?, data_faturamento = ?, data_prevista = ?, itens = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);

    try {
        $success = $stmt->execute([
            $empenho_id,
            $data['numero'],
            $valorFormatado,
            $data['data_faturamento'] ?? null,
            $data['data_prevista'] ?? null,
            $itensJson,
            $id
        ]);

        if ($success) {
            $stmt_new = $pdo->prepare("SELECT nf.*, o.numero_edital as numero_contrato, org.nome_fantasia as organizacao_nome FROM notas_fiscais nf LEFT JOIN oportunidades o ON nf.oportunidade_id = o.id LEFT JOIN organizacoes org ON o.organizacao_id = org.id WHERE nf.id = ?");
            $stmt_new->execute([$id]);
            json_response(['success' => true, 'nota_fiscal' => $stmt_new->fetch(PDO::FETCH_ASSOC)]);
        } else {
            json_response(['success' => false, 'error' => 'Falha ao atualizar nota fiscal. SQL Error.'], 500);
        }
    } catch (Exception $e) {
        error_log("Erro Update NF: " . $e->getMessage());
        json_response(['success' => false, 'error' => 'Falha no banco de dados: ' . $e->getMessage()], 500);
    }
}

function handle_delete_nota_fiscal($pdo, $data)
{
    if (empty($data['id'])) {
        json_response(['success' => false, 'error' => 'ID da Nota Fiscal é obrigatório para exclusão.'], 400);
        return;
    }

    $id = intval($data['id']);
    $sql = "DELETE FROM notas_fiscais WHERE id = ?";
    $stmt = $pdo->prepare($sql);

    try {
        if ($stmt->execute([$id])) {
            json_response(['success' => true, 'message' => 'Nota fiscal excluída com sucesso.']);
        } else {
            json_response(['success' => false, 'error' => 'Falha ao excluir a nota fiscal.'], 500);
        }
    } catch (Exception $e) {
        error_log("Erro Delete NF: " . $e->getMessage());
        json_response(['success' => false, 'error' => 'Falha no banco de dados: ' . $e->getMessage()], 500);
    }
}
?>