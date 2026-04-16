# BidFlow - Script de Inicialização
# Use este script para iniciar todos os serviços do BidFlow

Write-Host "🚀 Iniciando BidFlow..." -ForegroundColor Green
Write-Host ""

# Verificar se Docker está rodando
try {
    docker info | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: Docker não está rodando!" -ForegroundColor Red
    Write-Host "   Inicie o Docker Desktop e tente novamente." -ForegroundColor Yellow
    exit 1
}

# Iniciar containers
Write-Host "📦 Iniciando containers..." -ForegroundColor Cyan
docker compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Containers iniciados com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Serviços disponíveis:" -ForegroundColor Cyan
    Write-Host "   - Backend API: http://localhost:8000" -ForegroundColor White
    Write-Host "   - Frontend Dev: Execute 'npm run dev' no diretório frontend/" -ForegroundColor White
    Write-Host "   - Database: Porta removida para segurança (acesse via app)" -ForegroundColor White
    Write-Host "   - Redis: Porta removida para segurança (acesse via app)" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Para ver logs:" -ForegroundColor Cyan
    Write-Host "   docker compose logs -f" -ForegroundColor White
    Write-Host ""
    Write-Host "🛑 Para parar:" -ForegroundColor Cyan
    Write-Host "   docker compose down" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Falha ao iniciar containers" -ForegroundColor Red
    Write-Host "   Execute 'docker compose logs' para ver detalhes." -ForegroundColor Yellow
}
