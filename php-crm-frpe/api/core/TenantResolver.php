<?php
// api/core/TenantResolver.php
// Responsável por resolver o tenant atual a partir do JWT ou subdomínio

require_once __DIR__ . '/../config.php';

class TenantResolver
{
    private static ?PDO $masterPdo = null;
    private static array $tenantCache = [];

    public static function getMasterConnection(): PDO
    {
        if (self::$masterPdo === null) {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=saas_master;charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            self::$masterPdo = new PDO(dsn, DB_USER, DB_PASS, $options);
        }
        return self::$masterPdo;
    }

    public static function resolve(?string $jwtToken = null): ?array
    {
        $payload = null;

        if ($jwtToken) {
            $payload = JWTAuth::verify($jwtToken);
        }

        if ($payload && isset($payload['tenant_id'])) {
            return self::resolveByTenantId($payload['tenant_id']);
        }

        if ($payload && isset($payload['slug'])) {
            return self::resolveBySlug($payload['slug']);
        }

        $subdomain = self::getSubdomainFromHost();
        if ($subdomain) {
            return self::resolveBySlug($subdomain);
        }

        return null;
    }

    public static function resolveByTenantId(int $tenantId): ?array
    {
        if (isset(self::$tenantCache[$tenantId])) {
            return self::$tenantCache[$tenantId];
        }

        $pdo = self::getMasterConnection();
        $stmt = $pdo->prepare("
            SELECT t.*, p.modulos 
            FROM tenants t 
            LEFT JOIN planos p ON t.plano_id = p.id 
            WHERE t.id = ? AND t.status = 'ativo'
        ");
        $stmt->execute([$tenantId]);
        $tenant = $stmt->fetch();

        if ($tenant) {
            $tenant['modulos'] = json_decode($tenant['modulos'] ?: '[]', true);
            self::$tenantCache[$tenantId] = $tenant;
        }

        return $tenant ?: null;
    }

    public static function resolveBySlug(string $slug): ?array
    {
        $cacheKey = 'slug_' . $slug;
        if (isset(self::$tenantCache[$cacheKey])) {
            return self::$tenantCache[$cacheKey];
        }

        $pdo = self::getMasterConnection();
        $stmt = $pdo->prepare("
            SELECT t.*, p.modulos 
            FROM tenants t 
            LEFT JOIN planos p ON t.plano_id = p.id 
            WHERE t.slug = ? AND t.status = 'ativo'
        ");
        $stmt->execute([$slug]);
        $tenant = $stmt->fetch();

        if ($tenant) {
            $tenant['modulos'] = json_decode($tenant['modulos'] ?: '[]', true);
            self::$tenantCache[$cacheKey] = $tenant;
            self::$tenantCache[$tenant['id']] = $tenant;
        }

        return $tenant ?: null;
    }

    public static function hasModule(string $module, ?string $jwtToken = null): bool
    {
        $tenant = self::resolve($jwtToken);
        
        if (!$tenant) {
            return false;
        }

        $modulos = $tenant['modulos'] ?: [];
        return in_array($module, $modulos, true);
    }

    private static function getSubdomainFromHost(): ?string
    {
        if (!isset($_SERVER['HTTP_HOST'])) {
            return null;
        }

        $host = $_SERVER['HTTP_HOST'];
        $parts = explode('.', $host);

        if (count($parts) >= 3) {
            $possibleSubdomain = $parts[0];
            if ($possibleSubdomain !== 'www' && $possibleSubdomain !== 'app' && $possibleSubdomain !== 'api') {
                return $possibleSubdomain;
            }
        }

        return null;
    }

    public static function getTenantFromRequest(): ?array
    {
        $token = JWTAuth::fromRequest();
        return self::resolve($token);
    }
}
