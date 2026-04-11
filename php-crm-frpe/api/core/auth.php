<?php
// api/core/auth.php

// Definição das roles
define('ROLE_SUPER_ADMIN', 'SUPER_ADMIN');
define('ROLE_DIRETOR', 'DIRETOR');
define('ROLE_GESTOR', 'GESTOR');
define('ROLE_ANALISTA', 'ANALISTA');
define('ROLE_COMERCIAL', 'COMERCIAL');
define('ROLE_FINANCEIRO', 'FINANCEIRO');
define('ROLE_VENDEDOR', 'VENDEDOR');
define('ROLE_TECNICO', 'TECNICO');
define('ROLE_ESPECIALISTA', 'ESPECIALISTA');
define('ROLE_MARKETING', 'MARKETING');

require_once __DIR__ . '/Database.php';

/**
 * Verifica se o usuário tem uma permissão específica.
 * Suporta tanto o formato novo ('canSeeLeads') quanto o legado ('leads.view').
 */
function hasPermission($requiredPerm)
{
    if (session_status() === PHP_SESSION_NONE)
        session_start();

    // Bypass para Super Usuários (garantia extra)
    if (isset($_SESSION['role']) && in_array(strtoupper($_SESSION['role']), ['SUPER_ADMIN', 'DIRETOR', 'GESTOR', 'ANALISTA'])) {
        return true;
    }

    // Verifica na sessão
    if (isset($_SESSION['permissions']) && is_array($_SESSION['permissions'])) {
        // Retorna true se a chave existir e for verdadeira
        return !empty($_SESSION['permissions'][$requiredPerm]);
    }

    return false;
}

/**
 * Carrega as permissões do banco e gera o array híbrido (Frontend + Backend).
 */
function get_user_permissions_from_db($user_role, $pdo = null)
{
    try {
        if ($pdo === null) {
            $db = new Database();
            $pdo = $db->getConnection();
        }

        // 1. Obter ID da role
        $stmtRole = $pdo->prepare("SELECT id FROM roles WHERE name = ?");
        $stmtRole->execute([$user_role]);
        $roleId = $stmtRole->fetchColumn();

        if (!$roleId) {
            if ($user_role === 'SUPER_ADMIN')
                return generate_full_access_flags();
            return [];
        }

        // 2. Super usuários: Acesso Total
        if (in_array(strtoupper($user_role), ['SUPER_ADMIN', 'DIRETOR', 'GESTOR', 'ANALISTA'])) {
            return generate_full_access_flags();
        }

        // 3. Buscar permissões granulares
        $sql = "SELECT p.resource, p.action 
                FROM role_permissions rp 
                JOIN permissions p ON rp.permission_id = p.id 
                WHERE rp.role_id = ? AND rp.allowed = 1";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$roleId]);
        $rawPerms = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 4. Mapear para formato Híbrido
        return map_db_perms_hybrid($rawPerms);

    } catch (Exception $e) {
        error_log("Erro ao carregar permissões: " . $e->getMessage());
        return [];
    }
}

function generate_full_access_flags()
{
    // Retorna array com TODAS as chaves possíveis como true
    // Mistura chaves de UI (canSee) e chaves de Resource (leads.view)
    return [
        // UI Flags
        'canSeeDashboard' => true,
        'canSeeLeads' => true,
        'canManageLeads' => true,
        'canSeeLeadsOnline' => true,
        'canManageLeadsOnline' => true,
        'canSeeAgenda' => true,
        'canManageAgenda' => true,
        'canSeeClients' => true,
        'canManageClients' => true,
        'canSeeProposals' => true,
        'canManageProposals' => true,
        'canPrintProposals' => true,
        'canDeleteProposals' => true,
        'canSeeCatalog' => true,
        'canManageCatalog' => true,
        'canSeeMarketing' => true,
        'canManageMarketing' => true,
        'canSeeReports' => true,
        'canSeeSettings' => true,
        'canEditSettings' => true,

        // Backend Resource Flags (Compatibilidade)
        'dashboard.view' => true,
        'leads.view' => true,
        'leads.create' => true,
        'leads.edit' => true,
        'leads.move' => true,
        'leads.delete' => true,
        'leads_online.view' => true,
        'leads_online.manage' => true,
        'agenda.view' => true,
        'agenda.create' => true,
        'agenda.edit' => true,
        'agenda.delete' => true,
        'clients.view' => true,
        'clients.create' => true,
        'clients.edit' => true,
        'clients.delete' => true,
        'proposals.view' => true,
        'proposals.create' => true,
        'proposals.edit' => true,
        'proposals.print' => true,
        'proposals.delete' => true,
        'products.view' => true,
        'products.create' => true,
        'products.edit' => true,
        'products.delete' => true,
        'marketing_module.view' => true,
        'marketing_module.manage' => true,
        'reports.view' => true,
        'reports.export' => true,
        'settings.view' => true,
        'settings.edit' => true
    ];
}

function map_db_perms_hybrid($dbPerms)
{
    // Flags Padrão UI (Inicia tudo como false)
    $flags = [
        'canSeeDashboard' => false,
        'canSeeLeads' => false,
        'canManageLeads' => false,
        'canSeeLeadsOnline' => false,
        'canManageLeadsOnline' => false,
        'canSeeAgenda' => false,
        'canManageAgenda' => false,
        'canSeeClients' => false,
        'canManageClients' => false,
        'canSeeProposals' => false,
        'canManageProposals' => false,
        'canPrintProposals' => false,
        'canDeleteProposals' => false,
        'canSeeCatalog' => false,
        'canManageCatalog' => false,
        'canSeeMarketing' => false,
        'canManageMarketing' => false,
        'canSeeReports' => false,
        'canSeeSettings' => false,
        'canEditSettings' => false
    ];

    foreach ($dbPerms as $p) {
        $r = $p['resource'];
        $a = $p['action'];

        // 1. Gera flag compatível com Backend: 'resource.action'
        // Isso permite que hasPermission('leads.view') funcione
        $flags["$r.$a"] = true;

        // 2. Mapeamento Lógico para UI (Javascript)
        if ($r === 'dashboard' && $a === 'view')
            $flags['canSeeDashboard'] = true;

        if ($r === 'leads' && $a === 'view')
            $flags['canSeeLeads'] = true;
        if ($r === 'leads' && ($a === 'create' || $a === 'edit'))
            $flags['canManageLeads'] = true;

        if ($r === 'leads_online' && $a === 'view')
            $flags['canSeeLeadsOnline'] = true;
        if ($r === 'leads_online' && $a === 'manage')
            $flags['canManageLeadsOnline'] = true;

        if ($r === 'agenda' && $a === 'view')
            $flags['canSeeAgenda'] = true;
        if ($r === 'agenda' && ($a === 'create' || $a === 'edit'))
            $flags['canManageAgenda'] = true;

        if ($r === 'clients' && $a === 'view')
            $flags['canSeeClients'] = true;
        if ($r === 'clients' && ($a === 'create' || $a === 'edit'))
            $flags['canManageClients'] = true;

        if ($r === 'proposals' && $a === 'view')
            $flags['canSeeProposals'] = true;
        if ($r === 'proposals' && ($a === 'create' || $a === 'edit'))
            $flags['canManageProposals'] = true;
        if ($r === 'proposals' && $a === 'print')
            $flags['canPrintProposals'] = true;
        if ($r === 'proposals' && $a === 'delete')
            $flags['canDeleteProposals'] = true;

        if ($r === 'catalog' && $a === 'view')
            $flags['canSeeCatalog'] = true; // Alias para products
        if ($r === 'products' && $a === 'view')
            $flags['canSeeCatalog'] = true;
        if ($r === 'products' && ($a === 'create' || $a === 'edit'))
            $flags['canManageCatalog'] = true;

        if ($r === 'marketing' && $a === 'view')
            $flags['canSeeMarketing'] = true;
        if ($r === 'marketing_module' && $a === 'view')
            $flags['canSeeMarketing'] = true;
        if (($r === 'marketing' || $r === 'marketing_module') && $a === 'manage')
            $flags['canManageMarketing'] = true;

        if ($r === 'reports' && $a === 'view')
            $flags['canSeeReports'] = true;

        if ($r === 'settings' && $a === 'view')
            $flags['canSeeSettings'] = true;
        if ($r === 'settings' && $a === 'edit')
            $flags['canEditSettings'] = true;
    }

    return $flags;
}
?>