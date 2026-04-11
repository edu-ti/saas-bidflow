<?php
// api/handlers/rbac_handler.php

require_once __DIR__ . '/../core/auth.php';

/**
 * Retorna todas as roles cadastradas.
 * Assumindo tabela 'roles' ou usando constantes do auth.php se a tabela não estiver populada.
 * O usuário disse que criou tables roles(name).
 */
function handle_get_roles($pdo)
{
    global $roles_permissions; // Fallback se DB vazio

    try {
        $stmt = $pdo->query("SELECT * FROM roles ORDER BY name ASC");
        $roles_db = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($roles_db)) {
            // Se tabela vazia, usa as constantes do PHP para garantir que o sistema não pare
            // e sugere os nomes para o frontend
            $roles_list = [];
            $defined_roles = [
                ROLE_SUPER_ADMIN,
                ROLE_DIRETOR,
                ROLE_GESTOR,
                ROLE_COMERCIAL,
                ROLE_VENDEDOR,
                ROLE_MARKETING,
                ROLE_ANALISTA,
                ROLE_FINANCEIRO,
                ROLE_TECNICO
            ];
            foreach ($defined_roles as $r) {
                $roles_list[] = ['name' => $r]; // Formato simular tabela
            }
            json_response(['success' => true, 'roles' => $roles_list, 'source' => 'code']);
        } else {
            json_response(['success' => true, 'roles' => $roles_db, 'source' => 'db']);
        }
    } catch (PDOException $e) {
        // Fallback robusto
        json_response(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

/**
 * Retorna o catálogo de permissões (Resource x Actions) para montar a matriz na UI.
 * Tabela: permissions(resource, action, label)
 */
function handle_get_permissions_catalog($pdo)
{
    try {
        $stmt = $pdo->query("SELECT * FROM permissions ORDER BY resource ASC, action ASC");
        $perms = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Se tabela vazia, define um catálogo padrão em memória para inicialização
        if (empty($perms)) {
            $default_catalog = _get_default_permission_catalog();
            json_response(['success' => true, 'catalog' => $default_catalog, 'source' => 'code']);
        } else {
            // Agrupar por resource para facilitar o frontend?
            // O frontend pediu "agrupados para montar a matriz".
            // Vamos retornar lista plana e o front agrupa, ou agrupar aqui.
            // Retornando plano é mais flexível, mas vamos facilitar:
            $grouped = [];
            foreach ($perms as $p) {
                $grouped[$p['resource']][] = $p;
            }
            json_response(['success' => true, 'catalog' => $perms, 'grouped' => $grouped, 'source' => 'db']);
        }

    } catch (PDOException $e) {
        json_response(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

/**
 * Retorna permissões ativas para uma role específica.
 * Query: role_permissions e/ou 'hasPermission' lógica
 */
function handle_get_role_permissions($pdo)
{
    $role_name = $_GET['role'] ?? '';

    if (empty($role_name)) {
        json_response(['success' => false, 'error' => 'Role não informada'], 400);
        return;
    }

    // Busca ID da role (se usar ID) ou usa name direto
    // A query assume que roles tem ID. O prompt diz "roles(name)".
    // Vamos verificar se a tabela roles tem ID.
    // O prompt diz: "roles(name)", "permissions(resource, action, label)", "role_permissions(role_id, permission_id, allowed)"
    // Isso implica que roles tem ID sim (role_id na FK).

    try {
        // 1. Get Role ID
        $stmt_role = $pdo->prepare("SELECT id FROM roles WHERE name = ?");
        $stmt_role->execute([$role_name]);
        $role_id = $stmt_role->fetchColumn();

        if (!$role_id) {
            // Role não existe no banco? Pode ser uma role hardcoded antiga?
            // Retorna vazio
            json_response(['success' => true, 'permissions' => []]);
            return;
        }

        // 2. Get Permissions
        $sql = "
            SELECT p.resource, p.action, rp.allowed
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role_id = ?
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$role_id]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        json_response(['success' => true, 'permissions' => $rows]);

    } catch (PDOException $e) {
        json_response(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

/**
 * Salva permissões para uma role.
 * Body: { role: 'MARKETING', permissions: [ {resource:'leads', action:'view', allowed:true}, ... ] }
 */
function handle_save_role_permissions($pdo, $data)
{
    if (!can_edit_permissions($_SESSION['role'] ?? '')) {
        json_response(['success' => false, 'error' => 'Sem permissão para editar perfis'], 403);
        return;
    }

    $role_name = $data['role'] ?? '';
    $perms_input = $data['permissions'] ?? []; // Array de {resource, action, allowed}

    if (empty($role_name)) {
        json_response(['success' => false, 'error' => 'Role obrigatória'], 400);
        return;
    }

    try {
        $pdo->beginTransaction();

        // 1. Resolve Role ID
        $stmt_role = $pdo->prepare("SELECT id FROM roles WHERE name = ?");
        $stmt_role->execute([$role_name]);
        $role_id = $stmt_role->fetchColumn();

        if (!$role_id) {
            // Tenta criar se não existe? O prompt diz que tabelas existem.
            // Melhor erro se não existir.
            throw new Exception("Role '$role_name' não encontrada na tabela 'roles'.");
        }

        // 2. Processa cada permissão
        // Otimização: Carregar IDs de permissões em memória
        $all_perms = $pdo->query("SELECT id, resource, action FROM permissions")->fetchAll(PDO::FETCH_ASSOC);
        $perm_map = []; // "resource|action" => id
        foreach ($all_perms as $p) {
            $perm_map[$p['resource'] . '|' . $p['action']] = $p['id'];
        }

        // Prepara statements
        // Estratégia: UPSERT ou DELETE+INSERT?
        // role_permissions(role_id, permission_id, allowed)
        // Se usar MySQL: INSERT ... ON DUPLICATE KEY UPDATE allowed = ?

        $stmt_upsert = $pdo->prepare("
            INSERT INTO role_permissions (role_id, permission_id, allowed) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE allowed = VALUES(allowed)
        ");

        foreach ($perms_input as &$item) {
            $res = $item['resource'];
            $act = $item['action'];

            // Cast to bool/int for logic
            $allowed = !empty($item['allowed']);

            // REGRA DE NEGÓCIO: MOVE exige EDIT
            if ($act === 'move' && $allowed) {
                // Procura 'edit' no payload e força true
                foreach ($perms_input as &$p_ref) {
                    if ($p_ref['resource'] === $res && $p_ref['action'] === 'edit') {
                        $p_ref['allowed'] = true;
                        break;
                    }
                }
            }

            // Hardcoded restriction REMOVED. Database is source of truth.
            // if ($role_name === ROLE_MARKETING) { ... }

            // Atualiza valor final no item (garantia)
            $item['allowed'] = $allowed;
        }
        unset($item); // Break reference

        // Loop final para salvar
        foreach ($perms_input as $item) {
            $key = $item['resource'] . '|' . $item['action'];
            if (isset($perm_map[$key])) {
                $perm_id = $perm_map[$key];
                $val = !empty($item['allowed']) ? 1 : 0;
                $stmt_upsert->execute([$role_id, $perm_id, $val]);
            }
        }

        $pdo->commit();
        json_response(['success' => true]);

    } catch (Exception $e) {
        $pdo->rollBack();
        json_response(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// Helpers Locais

function can_edit_permissions($user_role)
{
    $allowed = [
        strtoupper(ROLE_SUPER_ADMIN),
        strtoupper(ROLE_DIRETOR),
        strtoupper(ROLE_GESTOR),
        'CEO',
        'GESTOR COMERCIAL'
    ];
    return in_array(strtoupper($user_role), $allowed);
}

function _get_default_permission_catalog()
{
    // Retorna array simulando o banco
    return [
        ['resource' => 'leads', 'action' => 'view', 'label' => 'Ver Leads'],
        ['resource' => 'leads', 'action' => 'create', 'label' => 'Criar Lead'],
        ['resource' => 'leads', 'action' => 'edit', 'label' => 'Editar Lead'],
        ['resource' => 'leads', 'action' => 'move', 'label' => 'Mover Lead'],
        ['resource' => 'settings', 'action' => 'view', 'label' => 'Acessar Configurações'],
        ['resource' => 'products', 'action' => 'view', 'label' => 'Ver Catálogo'],
        ['resource' => 'clients', 'action' => 'view', 'label' => 'Ver Clientes'],
        // ... (adicionar conforme uso real)
    ];
}
?>