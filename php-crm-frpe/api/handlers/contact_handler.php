<?php
// api/handlers/contact_handler.php

function handle_create_contact($pdo, $data)
{
    if (empty($data['nome']) || empty($data['organizacao_id'])) {
        json_response(['success' => false, 'error' => 'Nome e Organização são obrigatórios.'], 400);
        return;
    }

    // --- NOVA VALIDAÇÃO: Verificar se E-mail já existe ---
    if (!empty($data['email'])) {
        $stmt_check = $pdo->prepare("SELECT id FROM contatos WHERE email = ? LIMIT 1");
        $stmt_check->execute([$data['email']]);
        if ($stmt_check->fetchColumn()) {
            json_response(['success' => false, 'error' => 'Erro: Este e-mail de contato já está cadastrado.'], 400);
            return;
        }
    }
    // -----------------------------------------------------

    $sql = "INSERT INTO contatos (nome, organizacao_id, cargo, setor, email, telefone) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);

    try {
        $success = $stmt->execute([
            $data['nome'],
            $data['organizacao_id'],
            empty($data['cargo']) ? null : $data['cargo'],
            empty($data['setor']) ? null : $data['setor'],
            empty($data['email']) ? null : $data['email'],
            empty($data['telefone']) ? null : $data['telefone']
        ]);

        if ($success) {
            $lastId = $pdo->lastInsertId();
            $stmt_new = $pdo->prepare("SELECT c.*, o.nome_fantasia as organizacao_nome FROM contatos c JOIN organizacoes o ON c.organizacao_id = o.id WHERE c.id = ?");
            $stmt_new->execute([$lastId]);
            json_response(['success' => true, 'contact' => $stmt_new->fetch(PDO::FETCH_ASSOC)]);
        } else {
            json_response(['success' => false, 'error' => 'Erro ao criar contato.'], 500);
        }
    } catch (PDOException $e) {
        if ($e->errorInfo[1] == 1062) {
            json_response(['success' => false, 'error' => 'Erro: Contato duplicado (e-mail já existe).'], 400);
        } else {
            json_response(['success' => false, 'error' => 'Erro de banco de dados: ' . $e->getMessage()], 500);
        }
    }
}

function handle_update_contact($pdo, $data)
{
    global $log_file;

    if (empty($data['id'])) {
        json_response(['success' => false, 'error' => 'ID do contato é obrigatório.'], 400);
        return;
    }
    if (empty($data['nome']) || empty($data['organizacao_id'])) {
        json_response(['success' => false, 'error' => 'Nome e Organização são obrigatórios.'], 400);
        return;
    }

    $sql = "UPDATE contatos SET nome = ?, organizacao_id = ?, cargo = ?, setor = ?, email = ?, telefone = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);

    try {
        $success = $stmt->execute([
            $data['nome'],
            $data['organizacao_id'],
            empty($data['cargo']) ? null : $data['cargo'],
            empty($data['setor']) ? null : $data['setor'],
            empty($data['email']) ? null : $data['email'],
            empty($data['telefone']) ? null : $data['telefone'],
            (int) $data['id']
        ]);

        if ($success) {
            if ($stmt->rowCount() === 0) {
                file_put_contents($log_file, "UPDATE CONTACT - Nenhuma linha afetada para o ID: " . $data['id'] . ". Os dados eram iguais ou o ID não foi encontrado.\n", FILE_APPEND);
            }
            $stmt_updated = $pdo->prepare("SELECT c.*, o.nome_fantasia as organizacao_nome FROM contatos c JOIN organizacoes o ON c.organizacao_id = o.id WHERE c.id = ?");
            $stmt_updated->execute([(int) $data['id']]);
            json_response(['success' => true, 'contact' => $stmt_updated->fetch(PDO::FETCH_ASSOC)]);
        } else {
            json_response(['success' => false, 'error' => 'Erro ao atualizar contato.'], 500);
        }
    } catch (PDOException $e) {
        json_response(['success' => false, 'error' => 'Erro de banco de dados: ' . $e->getMessage()], 500);
    }
}

function handle_delete_contact($pdo, $data)
{
    $id = $data['id'] ?? null;

    if (empty($id)) {
        json_response(['success' => false, 'error' => 'ID do contato é obrigatório.'], 400);
        return;
    }

    $stmt = $pdo->prepare("DELETE FROM contatos WHERE id = ?");
    if ($stmt->execute([(int) $id])) {
        json_response(['success' => true, 'message' => 'Contato excluído com sucesso.']);
    } else {
        json_response(['success' => false, 'error' => 'Erro ao excluir contato.'], 500);
    }
}
?>