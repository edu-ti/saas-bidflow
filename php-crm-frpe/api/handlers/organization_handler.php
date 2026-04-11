<?php
// api/handlers/organization_handler.php

function handle_create_organization($pdo, $data)
{
    if (empty($data['nome_fantasia'])) {
        json_response(['success' => false, 'error' => 'Nome Fantasia é obrigatório.'], 400);
        return;
    }

    // --- NOVA VALIDAÇÃO: Verificar se CNPJ já existe ---
    if (!empty($data['cnpj'])) {
        $stmt_check = $pdo->prepare("SELECT id FROM organizacoes WHERE cnpj = ? LIMIT 1");
        $stmt_check->execute([$data['cnpj']]);
        if ($stmt_check->fetchColumn()) {
            json_response(['success' => false, 'error' => 'Erro: Já existe uma organização cadastrada com este CNPJ.'], 400);
            return;
        }
    }
    // ----------------------------------------------------

    $sql = "INSERT INTO organizacoes (nome_fantasia, razao_social, cnpj, cep, logradouro, numero, complemento, bairro, cidade, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);

    try {
        $success = $stmt->execute([
            $data['nome_fantasia'],
            empty($data['razao_social']) ? null : $data['razao_social'],
            empty($data['cnpj']) ? null : $data['cnpj'],
            empty($data['cep']) ? null : $data['cep'],
            empty($data['logradouro']) ? null : $data['logradouro'],
            empty($data['numero']) ? null : $data['numero'],
            empty($data['complemento']) ? null : $data['complemento'],
            empty($data['bairro']) ? null : $data['bairro'],
            empty($data['cidade']) ? null : $data['cidade'],
            empty($data['estado']) ? null : $data['estado']
        ]);

        if ($success) {
            $lastId = $pdo->lastInsertId();
            $stmt_new = $pdo->prepare("SELECT * FROM organizacoes WHERE id = ?");
            $stmt_new->execute([$lastId]);
            json_response(['success' => true, 'organization' => $stmt_new->fetch(PDO::FETCH_ASSOC)]);
        } else {
            json_response(['success' => false, 'error' => 'Erro ao criar organização.'], 500);
        }
    } catch (PDOException $e) {
        // Captura erro de duplicidade caso passe pela verificação (ex: condição de corrida)
        if ($e->errorInfo[1] == 1062) {
            json_response(['success' => false, 'error' => 'Erro: Organização duplicada no banco de dados.'], 400);
        } else {
            json_response(['success' => false, 'error' => 'Erro de banco de dados: ' . $e->getMessage()], 500);
        }
    }
}

function handle_update_organization($pdo, $data)
{
    global $log_file;

    if (empty($data['id'])) {
        json_response(['success' => false, 'error' => 'ID da organização é obrigatório.'], 400);
        return;
    }
    if (empty($data['nome_fantasia'])) {
        json_response(['success' => false, 'error' => 'Nome Fantasia é obrigatório.'], 400);
        return;
    }

    $sql = "UPDATE organizacoes 
            SET nome_fantasia = ?, razao_social = ?, cnpj = ?, cep = ?, 
                logradouro = ?, numero = ?, complemento = ?, bairro = ?, 
                cidade = ?, estado = ? 
            WHERE id = ?";

    $stmt = $pdo->prepare($sql);

    try {
        $success = $stmt->execute([
            $data['nome_fantasia'],
            empty($data['razao_social']) ? null : $data['razao_social'],
            empty($data['cnpj']) ? null : $data['cnpj'],
            empty($data['cep']) ? null : $data['cep'],
            empty($data['logradouro']) ? null : $data['logradouro'],
            empty($data['numero']) ? null : $data['numero'],
            empty($data['complemento']) ? null : $data['complemento'],
            empty($data['bairro']) ? null : $data['bairro'],
            empty($data['cidade']) ? null : $data['cidade'],
            empty($data['estado']) ? null : $data['estado'],
            (int) $data['id']
        ]);

        if ($success) {
            if ($stmt->rowCount() === 0) {
                file_put_contents($log_file, "UPDATE ORG - Nenhuma linha afetada para o ID: " . $data['id'] . ". Os dados eram iguais ou o ID não foi encontrado.\n", FILE_APPEND);
            }
            $stmt_updated = $pdo->prepare("SELECT * FROM organizacoes WHERE id = ?");
            $stmt_updated->execute([(int) $data['id']]);
            json_response(['success' => true, 'organization' => $stmt_updated->fetch(PDO::FETCH_ASSOC)]);
        } else {
            json_response(['success' => false, 'error' => 'Erro ao atualizar organização.'], 500);
        }
    } catch (PDOException $e) {
        json_response(['success' => false, 'error' => 'Erro de banco de dados: ' . $e->getMessage()], 500);
    }
}

function handle_delete_organization($pdo, $data)
{
    $id = $data['id'] ?? null;

    if (empty($id)) {
        json_response(['success' => false, 'error' => 'ID da organização é obrigatório.'], 400);
        return;
    }

    $stmt = $pdo->prepare("DELETE FROM organizacoes WHERE id = ?");
    if ($stmt->execute([(int) $id])) {
        json_response(['success' => true, 'message' => 'Organização excluída com sucesso.']);
    } else {
        json_response(['success' => false, 'error' => 'Erro ao excluir organização.'], 500);
    }
}
?>