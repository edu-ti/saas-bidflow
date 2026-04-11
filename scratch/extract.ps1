$tables = @("usuarios", "usuarios_financas", "fornecedores", "oportunidades", "funis", "etapas_funil", "pregoes", "alertas_licencas", "configuracoes")
$files = @("D:\SISTEMAS\saas-bidflow\scratch\crm_schema.sql", "D:\SISTEMAS\saas-bidflow\scratch\licitaweb_schema.sql")

foreach ($file in $files) {
    Write-Host "File: $file"
    $content = Get-Content $file -Raw
    foreach ($table in $tables) {
        $pattern = "(?is)CREATE TABLE \`$table\` \([^;]+;"
        if ($content -match $pattern) {
            Write-Host $matches[0]
            Write-Host "--------------------"
        }
    }
}
