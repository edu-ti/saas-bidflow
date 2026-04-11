<?php
// api/handlers/auth_handler.php

// Não é mais necessário o require_once aqui, pois o api.php já o carrega.

function handle_login($pdo, $data) {
    if (empty($data['email']) || empty($data['senha'])) {
        json_response(['success' => false, 'error' => 'Email e senha são obrigatórios.'], 400);
    }

    $stmt = $pdo->prepare("SELECT id, nome, role, senha FROM usuarios WHERE email = ? AND status = 'Ativo'");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch();

    if ($user && password_verify($data['senha'], $user['senha'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['nome'] = $user['nome'];
        $_SESSION['role'] = $user['role'];
        json_response(['success' => true]);
    } else {
        json_response(['success' => false, 'error' => 'Email ou senha inválidos.'], 401);
    }
}

function handle_logout() {
    session_unset();
    session_destroy();
    json_response(['success' => true]);
}