<?php
// api/handlers/product_handler.php

// ============================================================
// PRODUTOS DO CATÁLOGO – CRUD
// ============================================================

function handle_upload_product_image()
{
    if (isset($_FILES['product_image']) && $_FILES['product_image']['error'] == 0) {
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $filename = $_FILES['product_image']['name'];
        $filetype = pathinfo($filename, PATHINFO_EXTENSION);
        if (!in_array(strtolower($filetype), $allowed)) {
            json_response(['success' => false, 'error' => 'Tipo de ficheiro inválido.'], 400); return;
        }
        $upload_dir = 'uploads/products/';
        $base_path  = dirname(__DIR__, 2);
        $dest_dir   = $base_path . '/' . $upload_dir;
        if (!is_dir($dest_dir) && !mkdir($dest_dir, 0777, true)) {
            json_response(['success' => false, 'error' => 'Falha ao criar o diretório de uploads.'], 500); return;
        }
        $new_filename = uniqid('prod_') . '.' . strtolower($filetype);
        if (move_uploaded_file($_FILES['product_image']['tmp_name'], $dest_dir . $new_filename)) {
            json_response(['success' => true, 'url' => $upload_dir . $new_filename]); return;
        } else {
            json_response(['success' => false, 'error' => 'Falha ao mover o ficheiro.'], 500); return;
        }
    }
    json_response(['success' => false, 'error' => 'Nenhum ficheiro enviado.'], 400);
}

function handle_create_product($pdo, $data)
{
    if (!in_array($_SESSION['role'], ['Gestor', 'Analista', 'Comercial', 'Especialista'])) {
        json_response(['success' => false, 'error' => 'Acesso negado.'], 403); return;
    }
    if (!isset($data['nome_produto'])) {
        json_response(['success' => false, 'error' => 'Campo obrigatório ausente: nome_produto'], 400); return;
    }
    if (!isset($data['valor_unitario']) || !is_numeric($data['valor_unitario'])) {
        json_response(['success' => false, 'error' => 'Valor unitário inválido.'], 400); return;
    }
    $stmt = $pdo->prepare("INSERT INTO produtos (nome_produto, fabricante, modelo, descricao_detalhada, valor_unitario, unidade_medida, imagem_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $ok = $stmt->execute([
        $data['nome_produto'],
        empty($data['fabricante'])          ? null : $data['fabricante'],
        empty($data['modelo'])              ? null : $data['modelo'],
        empty($data['descricao_detalhada']) ? null : $data['descricao_detalhada'],
        $data['valor_unitario'],
        empty($data['unidade_medida'])      ? 'Unidade' : $data['unidade_medida'],
        empty($data['imagem_url'])          ? null : $data['imagem_url'],
    ]);
    if ($ok) {
        $id = $pdo->lastInsertId();
        $stmt2 = $pdo->prepare("SELECT * FROM produtos WHERE id = ?");
        $stmt2->execute([$id]);
        json_response(['success' => true, 'product' => $stmt2->fetch(PDO::FETCH_ASSOC)]);
    } else {
        json_response(['success' => false, 'error' => 'Falha ao criar o produto.'], 500);
    }
}

function handle_update_product($pdo, $data)
{
    if (empty($data['id'])) {
        json_response(['success' => false, 'error' => 'ID do produto é obrigatório.'], 400); return;
    }
    if (!in_array($_SESSION['role'], ['Gestor', 'Analista', 'Comercial', 'Especialista'])) {
        json_response(['success' => false, 'error' => 'Acesso negado.'], 403); return;
    }
    if (!isset($data['valor_unitario']) || !is_numeric($data['valor_unitario'])) {
        json_response(['success' => false, 'error' => 'Valor unitário inválido.'], 400); return;
    }
    $stmt = $pdo->prepare("UPDATE produtos SET nome_produto=?, fabricante=?, modelo=?, descricao_detalhada=?, valor_unitario=?, unidade_medida=?, imagem_url=? WHERE id=?");
    $ok = $stmt->execute([
        $data['nome_produto'],
        empty($data['fabricante'])          ? null : $data['fabricante'],
        empty($data['modelo'])              ? null : $data['modelo'],
        empty($data['descricao_detalhada']) ? null : $data['descricao_detalhada'],
        $data['valor_unitario'],
        empty($data['unidade_medida'])      ? 'Unidade' : $data['unidade_medida'],
        empty($data['imagem_url'])          ? null : $data['imagem_url'],
        $data['id'],
    ]);
    if ($ok) {
        $stmt2 = $pdo->prepare("SELECT * FROM produtos WHERE id = ?");
        $stmt2->execute([$data['id']]);
        json_response(['success' => true, 'product' => $stmt2->fetch(PDO::FETCH_ASSOC)]);
    } else {
        json_response(['success' => false, 'error' => 'Falha ao atualizar o produto.'], 500);
    }
}

function handle_delete_product($pdo, $data)
{
    if (empty($data['id'])) {
        json_response(['success' => false, 'error' => 'ID do produto é obrigatório.'], 400); return;
    }
    if (!in_array($_SESSION['role'], ['Gestor', 'Analista', 'Comercial'])) {
        json_response(['success' => false, 'error' => 'Acesso negado.'], 403); return;
    }
    $stmt = $pdo->prepare("SELECT imagem_url FROM produtos WHERE id = ?");
    $stmt->execute([$data['id']]);
    $image_url = $stmt->fetchColumn();

    $stmt = $pdo->prepare("DELETE FROM produtos WHERE id = ?");
    $ok = $stmt->execute([$data['id']]);
    if ($ok) {
        if ($image_url) {
            $base_path   = dirname(__DIR__, 2);
            $url_path    = parse_url($image_url, PHP_URL_PATH);
            $script_dir  = dirname($_SERVER['SCRIPT_NAME']);
            $base_url    = rtrim(str_replace('/api', '', $script_dir), '/');
            $relative    = ltrim(str_replace($base_url, '', $url_path), '/');
            $full        = $base_path . '/' . $relative;
            if (file_exists($full)) @unlink($full);
        }
        json_response(['success' => true]);
    } else {
        json_response(['success' => false, 'error' => 'Falha ao excluir o produto.'], 500);
    }
}

// ============================================================
// TABELA DE PREÇO – CABEÇALHO (MASTER)
// ============================================================

/** Retorna todas as tabelas de preço com seus itens. */
function handle_get_price_tables($pdo, $data)
{
    $tables  = $pdo->query("SELECT * FROM tabela_preco ORDER BY nome_tabela ASC")->fetchAll(PDO::FETCH_ASSOC);
    $stmt_i  = $pdo->prepare("SELECT * FROM tabela_preco_itens WHERE tabela_preco_id = ? ORDER BY id ASC");
    foreach ($tables as &$t) {
        $stmt_i->execute([$t['id']]);
        $t['itens'] = $stmt_i->fetchAll(PDO::FETCH_ASSOC);
    }
    json_response(['success' => true, 'tables' => $tables]);
}

/** Cria uma nova tabela de preço (cabeçalho). */
function handle_create_price_table($pdo, $data)
{
    if (!in_array($_SESSION['role'], ['Gestor', 'Analista', 'Comercial', 'Especialista'])) {
        json_response(['success' => false, 'error' => 'Acesso negado.'], 403); return;
    }
    if (empty($data['codigo']) || empty($data['nome_tabela'])) {
        json_response(['success' => false, 'error' => 'Código e Nome são obrigatórios.'], 400); return;
    }
    $stmt = $pdo->prepare("INSERT INTO tabela_preco (codigo, nome_tabela) VALUES (?, ?)");
    $ok   = $stmt->execute([trim($data['codigo']), trim($data['nome_tabela'])]);
    if ($ok) {
        $id = $pdo->lastInsertId();
        $stmt2 = $pdo->prepare("SELECT * FROM tabela_preco WHERE id = ?");
        $stmt2->execute([$id]);
        $t = $stmt2->fetch(PDO::FETCH_ASSOC);
        $t['itens'] = [];
        json_response(['success' => true, 'table' => $t]);
    } else {
        json_response(['success' => false, 'error' => 'Falha ao criar tabela.'], 500);
    }
}

/** Atualiza cabeçalho de uma tabela de preço. */
function handle_update_price_table($pdo, $data)
{
    if (!in_array($_SESSION['role'], ['Gestor', 'Analista', 'Comercial', 'Especialista'])) {
        json_response(['success' => false, 'error' => 'Acesso negado.'], 403); return;
    }
    if (empty($data['id'])) { json_response(['success' => false, 'error' => 'ID obrigatório.'], 400); return; }
    $stmt = $pdo->prepare("UPDATE tabela_preco SET codigo=?, nome_tabela=? WHERE id=?");
    $ok   = $stmt->execute([trim($data['codigo']), trim($data['nome_tabela']), $data['id']]);
    if ($ok) {
        $stmt2 = $pdo->prepare("SELECT * FROM tabela_preco WHERE id = ?");
        $stmt2->execute([$data['id']]);
        $t = $stmt2->fetch(PDO::FETCH_ASSOC);
        $stmt3 = $pdo->prepare("SELECT * FROM tabela_preco_itens WHERE tabela_preco_id = ? ORDER BY id ASC");
        $stmt3->execute([$data['id']]);
        $t['itens'] = $stmt3->fetchAll(PDO::FETCH_ASSOC);
        json_response(['success' => true, 'table' => $t]);
    } else {
        json_response(['success' => false, 'error' => 'Falha ao atualizar.'], 500);
    }
}

/** Exclui uma tabela de preço (CASCADE remove também os itens, salvo se estiverem em kits). */
function handle_delete_price_table($pdo, $data)
{
    if (!in_array($_SESSION['role'], ['Gestor', 'Analista', 'Comercial'])) {
        json_response(['success' => false, 'error' => 'Acesso negado.'], 403); return;
    }
    if (empty($data['id'])) { json_response(['success' => false, 'error' => 'ID obrigatório.'], 400); return; }
    // Verifica uso em kits
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM kit_itens ki INNER JOIN tabela_preco_itens tpi ON ki.tabela_preco_item_id = tpi.id WHERE tpi.tabela_preco_id = ?");
    $stmt->execute([$data['id']]);
    if ($stmt->fetchColumn() > 0) {
        json_response(['success' => false, 'error' => 'Itens desta tabela estão em uso em Kits. Remova-os antes de excluir.'], 409); return;
    }
    $ok = $pdo->prepare("DELETE FROM tabela_preco WHERE id=?")->execute([$data['id']]);
    json_response($ok ? ['success' => true] : ['success' => false, 'error' => 'Falha ao excluir.'], $ok ? 200 : 500);
}

// ============================================================
// TABELA DE PREÇO – ITENS (DETAIL)
// ============================================================

/** Cria um novo item dentro de uma tabela de preço. */
function handle_create_price_table_item($pdo, $data)
{
    if (!in_array($_SESSION['role'], ['Gestor', 'Analista', 'Comercial', 'Especialista'])) {
        json_response(['success' => false, 'error' => 'Acesso negado.'], 403); return;
    }
    if (empty($data['tabela_preco_id']) || empty($data['descricao'])) {
        json_response(['success' => false, 'error' => 'tabela_preco_id e descricao são obrigatórios.'], 400); return;
    }
    if (!isset($data['valor_unitario']) || !is_numeric($data['valor_unitario'])) {
        json_response(['success' => false, 'error' => 'Valor unitário inválido.'], 400); return;
    }
    $stmt = $pdo->prepare("INSERT INTO tabela_preco_itens (tabela_preco_id, referencia, descricao, valor_unitario, fabricante, observacoes) VALUES (?,?,?,?,?,?)");
    $ok   = $stmt->execute([
        (int)$data['tabela_preco_id'],
        empty($data['referencia'])  ? null : trim($data['referencia']),
        trim($data['descricao']),
        (float)$data['valor_unitario'],
        empty($data['fabricante'])  ? null : trim($data['fabricante']),
        empty($data['observacoes']) ? null : trim($data['observacoes']),
    ]);
    if ($ok) {
        $id = $pdo->lastInsertId();
        $stmt2 = $pdo->prepare("SELECT * FROM tabela_preco_itens WHERE id = ?");
        $stmt2->execute([$id]);
        json_response(['success' => true, 'item' => $stmt2->fetch(PDO::FETCH_ASSOC)]);
    } else {
        json_response(['success' => false, 'error' => 'Falha ao criar item.'], 500);
    }
}

/** Atualiza um item de tabela de preço. */
function handle_update_price_table_item($pdo, $data)
{
    if (!in_array($_SESSION['role'], ['Gestor', 'Analista', 'Comercial', 'Especialista'])) {
        json_response(['success' => false, 'error' => 'Acesso negado.'], 403); return;
    }
    if (empty($data['id'])) { json_response(['success' => false, 'error' => 'ID obrigatório.'], 400); return; }
    if (!isset($data['valor_unitario']) || !is_numeric($data['valor_unitario'])) {
        json_response(['success' => false, 'error' => 'Valor unitário inválido.'], 400); return;
    }
    $stmt = $pdo->prepare("UPDATE tabela_preco_itens SET referencia=?,descricao=?,valor_unitario=?,fabricante=?,observacoes=? WHERE id=?");
    $ok   = $stmt->execute([
        empty($data['referencia'])  ? null : trim($data['referencia']),
        trim($data['descricao']),
        (float)$data['valor_unitario'],
        empty($data['fabricante'])  ? null : trim($data['fabricante']),
        empty($data['observacoes']) ? null : trim($data['observacoes']),
        $data['id'],
    ]);
    if ($ok) {
        $stmt2 = $pdo->prepare("SELECT * FROM tabela_preco_itens WHERE id = ?");
        $stmt2->execute([$data['id']]);
        json_response(['success' => true, 'item' => $stmt2->fetch(PDO::FETCH_ASSOC)]);
    } else {
        json_response(['success' => false, 'error' => 'Falha ao atualizar.'], 500);
    }
}

/** Exclui um item (bloqueia se usado em kit). */
function handle_delete_price_table_item($pdo, $data)
{
    if (!in_array($_SESSION['role'], ['Gestor', 'Analista', 'Comercial'])) {
        json_response(['success' => false, 'error' => 'Acesso negado.'], 403); return;
    }
    if (empty($data['id'])) { json_response(['success' => false, 'error' => 'ID obrigatório.'], 400); return; }
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM kit_itens WHERE tabela_preco_item_id = ?");
    $stmt->execute([$data['id']]);
    if ($stmt->fetchColumn() > 0) {
        json_response(['success' => false, 'error' => 'Este item está em uso em um Kit e não pode ser excluído.'], 409); return;
    }
    $ok = $pdo->prepare("DELETE FROM tabela_preco_itens WHERE id=?")->execute([$data['id']]);
    json_response($ok ? ['success' => true] : ['success' => false, 'error' => 'Falha ao excluir.'], $ok ? 200 : 500);
}

// ============================================================
// KITS – CRUD
// ============================================================

function _get_kit_full($pdo, $kit_id)
{
    $stmt = $pdo->prepare("SELECT * FROM kits WHERE id = ?");
    $stmt->execute([$kit_id]);
    $kit = $stmt->fetch(PDO::FETCH_ASSOC);
    $stmt2 = $pdo->prepare("
        SELECT ki.id, ki.kit_id, ki.tabela_preco_item_id, ki.quantidade, ki.valor_unitario_snapshot,
               tpi.referencia, tpi.descricao, tpi.fabricante,
               tp.codigo as tabela_codigo, tp.nome_tabela
        FROM kit_itens ki
        INNER JOIN tabela_preco_itens tpi ON tpi.id = ki.tabela_preco_item_id
        INNER JOIN tabela_preco tp ON tp.id = tpi.tabela_preco_id
        WHERE ki.kit_id = ? ORDER BY ki.id ASC
    ");
    $stmt2->execute([$kit_id]);
    $kit['itens'] = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    return $kit;
}

function handle_get_kits($pdo, $data)
{
    $kits = $pdo->query("SELECT * FROM kits ORDER BY nome ASC")->fetchAll(PDO::FETCH_ASSOC);
    $stmt = $pdo->prepare("
        SELECT ki.id, ki.kit_id, ki.tabela_preco_item_id, ki.quantidade, ki.valor_unitario_snapshot,
               tpi.referencia, tpi.descricao, tpi.fabricante,
               tp.codigo as tabela_codigo, tp.nome_tabela
        FROM kit_itens ki
        INNER JOIN tabela_preco_itens tpi ON tpi.id = ki.tabela_preco_item_id
        INNER JOIN tabela_preco tp ON tp.id = tpi.tabela_preco_id
        WHERE ki.kit_id = ? ORDER BY ki.id ASC
    ");
    foreach ($kits as &$kit) { $stmt->execute([$kit['id']]); $kit['itens'] = $stmt->fetchAll(PDO::FETCH_ASSOC); }
    json_response(['success' => true, 'kits' => $kits]);
}

function handle_create_kit($pdo, $data)
{
    if (!in_array($_SESSION['role'], ['Gestor', 'Analista', 'Comercial', 'Especialista'])) {
        json_response(['success' => false, 'error' => 'Acesso negado.'], 403); return;
    }
    if (empty($data['nome'])) { json_response(['success' => false, 'error' => 'Nome obrigatório.'], 400); return; }

    $itens = isset($data['itens']) && is_array($data['itens']) ? $data['itens'] : [];
    $total = 0;
    foreach ($itens as $i) {
        $total += (float)($i['valor_unitario_snapshot'] ?? 0) * (int)($i['quantidade'] ?? 1);
    }

    try {
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO kits (codigo, nome, descricao, valor_total) VALUES (?,?,?,?)");
        $stmt->execute([
            (isset($data['codigo']) && $data['codigo'] !== '') ? trim($data['codigo']) : null,
            trim($data['nome']),
            (isset($data['descricao']) && $data['descricao'] !== '') ? trim($data['descricao']) : null,
            $total
        ]);
        $kid = (int)$pdo->lastInsertId();

        if (!empty($itens)) {
            $si = $pdo->prepare("INSERT INTO kit_itens (kit_id, tabela_preco_item_id, quantidade, valor_unitario_snapshot) VALUES (?,?,?,?)");
            foreach ($itens as $i) {
                $item_id = (int)($i['tabela_preco_item_id'] ?? 0);
                if ($item_id <= 0) continue;
                $si->execute([$kid, $item_id, max(1, (int)($i['quantidade'] ?? 1)), (float)($i['valor_unitario_snapshot'] ?? 0)]);
            }
        }

        $pdo->commit();
        json_response(['success' => true, 'kit' => _get_kit_full($pdo, $kid)]);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log('handle_create_kit PDOException: ' . $e->getMessage());
        json_response(['success' => false, 'error' => 'Erro BD: ' . $e->getMessage()], 500);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log('handle_create_kit Exception: ' . $e->getMessage());
        json_response(['success' => false, 'error' => 'Erro: ' . $e->getMessage()], 500);
    }
}

function handle_update_kit($pdo, $data)
{
    if (!in_array($_SESSION['role'], ['Gestor', 'Analista', 'Comercial', 'Especialista'])) {
        json_response(['success' => false, 'error' => 'Acesso negado.'], 403); return;
    }
    if (empty($data['id'])) { json_response(['success' => false, 'error' => 'ID obrigatório.'], 400); return; }
    if (empty($data['nome'])) { json_response(['success' => false, 'error' => 'Nome obrigatório.'], 400); return; }

    $itens = isset($data['itens']) && is_array($data['itens']) ? $data['itens'] : [];
    $total = 0;
    foreach ($itens as $i) {
        $total += (float)($i['valor_unitario_snapshot'] ?? 0) * (int)($i['quantidade'] ?? 1);
    }

    try {
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("UPDATE kits SET codigo=?,nome=?,descricao=?,valor_total=? WHERE id=?");
        $stmt->execute([
            (isset($data['codigo']) && $data['codigo'] !== '') ? trim($data['codigo']) : null,
            trim($data['nome']),
            (isset($data['descricao']) && $data['descricao'] !== '') ? trim($data['descricao']) : null,
            $total,
            (int)$data['id']
        ]);

        $pdo->prepare("DELETE FROM kit_itens WHERE kit_id=?")->execute([(int)$data['id']]);

        if (!empty($itens)) {
            $si = $pdo->prepare("INSERT INTO kit_itens (kit_id, tabela_preco_item_id, quantidade, valor_unitario_snapshot) VALUES (?,?,?,?)");
            foreach ($itens as $i) {
                $item_id = (int)($i['tabela_preco_item_id'] ?? 0);
                if ($item_id <= 0) continue;
                $si->execute([(int)$data['id'], $item_id, max(1, (int)($i['quantidade'] ?? 1)), (float)($i['valor_unitario_snapshot'] ?? 0)]);
            }
        }

        $pdo->commit();
        json_response(['success' => true, 'kit' => _get_kit_full($pdo, $data['id'])]);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log('handle_update_kit PDOException: ' . $e->getMessage());
        json_response(['success' => false, 'error' => 'Erro BD: ' . $e->getMessage()], 500);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log('handle_update_kit Exception: ' . $e->getMessage());
        json_response(['success' => false, 'error' => 'Erro: ' . $e->getMessage()], 500);
    }
}

function handle_delete_kit($pdo, $data)
{
    if (!in_array($_SESSION['role'], ['Gestor', 'Analista', 'Comercial'])) {
        json_response(['success' => false, 'error' => 'Acesso negado.'], 403); return;
    }
    if (empty($data['id'])) { json_response(['success' => false, 'error' => 'ID obrigatório.'], 400); return; }
    $ok = $pdo->prepare("DELETE FROM kits WHERE id=?")->execute([$data['id']]);
    json_response($ok ? ['success' => true] : ['success' => false, 'error' => 'Falha ao excluir.'], $ok ? 200 : 500);
}

?>