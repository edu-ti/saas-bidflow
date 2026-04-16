@echo off
REM BidFlow - Script de Inicialização para Windows CMD
echo.
echo BidFlow - Iniciando servicos...
echo.

REM Verificar se Docker está rodando
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Docker nao esta rodando!
    echo    Inicie o Docker Desktop e tente novamente.
    echo.
    pause
    exit /b 1
)

echo Docker esta rodando
echo.

REM Iniciar containers
echo Iniciando containers...
docker compose up -d

if %errorlevel% equ 0 (
    echo.
    echo Containers iniciados com sucesso!
    echo.
    echo Servicos disponiveis:
    echo    - Backend API: http://localhost:8000
    echo    - Frontend Dev: Execute 'npm run dev' no diretorio frontend/
    echo.
    echo Para ver logs:
    echo    docker compose logs -f
    echo.
    echo Para parar:
    echo    docker compose down
) else (
    echo.
    echo Falha ao iniciar containers
    echo    Execute 'docker compose logs' para ver detalhes.
)

echo.
pause
