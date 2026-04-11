<?php
// api/handlers/user_handler.php

require_once dirname(__DIR__, 2) . '/config.php';

function handle_create_user($pdo, $data)
{
    if ($_SESSION['role'] !== 'Gestor' && $_SESSION['role'] !== 'Analista') {
        json_response(['success' => false, 'error' => 'Acesso negado.'], 403);
    }
    if (empty($data['nome']) || empty($data['email']) || empty($data['senha']) || empty($data['role']) || empty($data['status'])) {
        json_response(['success' => false, 'error' => 'Todos os campos são obrigatórios.'], 400);
    }

    $hashed_password = hashPassword($data['senha']);

    $sql = "INSERT INTO usuarios (nome, email, telefone, cargo, senha, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $success = $stmt->execute([
        $data['nome'],
        $data['email'],
        isset($data['telefone']) ? $data['telefone'] : null,
        isset($data['cargo']) ? $data['cargo'] : null,
        $hashed_password,
        $data['role'],
        $data['status']
    ]);

    if ($success) {
        $lastId = $pdo->lastInsertId();
        $stmt_new = $pdo->prepare("SELECT id, nome, email, telefone, cargo, role, status FROM usuarios WHERE id = ?");
        $stmt_new->execute([$lastId]);
        json_response(['success' => true, 'user' => $stmt_new->fetch(PDO::FETCH_ASSOC)]);
    } else {
        json_response(['success' => false, 'error' => 'Falha ao criar usuário.'], 500);
    }
}

function handle_update_user($pdo, $data)
{
    if ($_SESSION['role'] !== 'Gestor' && $_SESSION['role'] !== 'Analista') {
        json_response(['success' => false, 'error' => 'Acesso negado.'], 403);
    }
    if (empty($data['id']) || empty($data['nome']) || empty($data['email']) || empty($data['role']) || empty($data['status'])) {
        json_response(['success' => false, 'error' => 'Campos obrigatórios ausentes.'], 400);
    }

    $params = [
        $data['nome'],
        $data['email'],
        isset($data['telefone']) ? $data['telefone'] : null,
        isset($data['cargo']) ? $data['cargo'] : null,
        $data['role'],
        $data['status']
    ];

    $sql = "UPDATE usuarios SET nome = ?, email = ?, telefone = ?, cargo = ?, role = ?, status = ?";

    if (!empty($data['senha'])) {
        $hashed_password = hashPassword($data['senha']);
        $sql .= ", senha = ?";
        $params[] = $hashed_password;
    }

    $sql .= " WHERE id = ?";
    $params[] = $data['id'];

    $stmt = $pdo->prepare($sql);
    $success = $stmt->execute($params);

    if ($success) {
        $stmt_updated = $pdo->prepare("SELECT id, nome, email, telefone, cargo, role, status FROM usuarios WHERE id = ?");
        $stmt_updated->execute([$data['id']]);
        json_response(['success' => true, 'user' => $stmt_updated->fetch(PDO::FETCH_ASSOC)]);
    } else {
        json_response(['success' => false, 'error' => 'Falha ao atualizar usuário.'], 500);
    }
}

function handle_delete_user($pdo, $data)
{
    if ($_SESSION['role'] !== 'Gestor' && $_SESSION['role'] !== 'Analista') {
        json_response(['success' => false, 'error' => 'Acesso negado.'], 403);
    }
    if (empty($data['id'])) {
        json_response(['success' => false, 'error' => 'ID do usuário não fornecido.'], 400);
    }
    if ($data['id'] == $_SESSION['user_id']) {
        json_response(['success' => false, 'error' => 'Você não pode excluir sua própria conta.'], 400);
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
        $success = $stmt->execute([$data['id']]);
        json_response(['success' => true, 'message' => 'Usuário excluído com sucesso.']);
    } catch (PDOException $e) {
        // Erro 23000: Violação de restrição de integridade (possui vínculos)
        if ($e->getCode() == '23000') {
            try {
                // Marcamos como deletado logicamente (soft delete)
                $stmt = $pdo->prepare("UPDATE usuarios SET status = 'Inativo', deleted_at = NOW() WHERE id = ?");
                $stmt->execute([$data['id']]);

                // Retornar usuário atualizado para o frontend refletir a mudança (embora agora ele deva sumir)
                $stmt_updated = $pdo->prepare("SELECT id, nome, email, telefone, cargo, role, status FROM usuarios WHERE id = ?");
                $stmt_updated->execute([$data['id']]);
                
                json_response([
                    'success' => true,
                    'message' => 'O usuário possui registros vinculados e não pôde ser excluído permanentemente. Por segurança, ele foi arquivado e desativado.',
                    'user' => $stmt_updated->fetch(PDO::FETCH_ASSOC)
                ]);
            } catch (PDOException $ex) {
                json_response(['success' => false, 'error' => 'Erro ao arquivar usuário: ' . $ex->getMessage()], 500);
            }
        } else {
            json_response(['success' => false, 'error' => 'Erro ao excluir usuário: ' . $e->getMessage()], 500);
        }
    }
}

