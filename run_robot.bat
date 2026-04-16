@echo off
REM BidFlow RPA Robot - Script de Execução para Windows
REM Use este script para executar o robô BidFlow

echo.
echo BidFlow RPA Robot
echo ====================
echo.

REM Verificar se .env existe
if not exist .env (
    echo Arquivo .env nao encontrado!
    echo Copie .env.example para .env e configure as variaveis:
    echo    copy .env.example .env
    echo.
    pause
    exit /b 1
)

REM Carregar variáveis do .env (manual para Windows)
for /f "tokens=*" %%a in (.env) do (
    set %%a
)

REM Verificar token
if "%BIDFLOW_API_TOKEN%"=="" (
    echo ERRO: BIDFLOW_API_TOKEN nao configurado no .env
    echo.
    pause
    exit /b 1
)

REM Menu de opções
echo Escolha uma opcao:
echo.
echo 1. Executar robo em modo normal
echo 2. Executar em modo demonstracao
echo 3. Executar testador de integroacoes
echo 4. Pesquisar com termo especifico
echo 5. Sair
echo.
set /p opcao="Digite o numero da opcao: "

if "%opcao%"=="1" (
    echo.
    echo Iniciando robo BidFlow...
    echo    Termo: %BIDFLOW_SEARCH_TERM%
    echo    URL: %BIDFLOW_API_URL%
    echo.
    python bidflow_rpa_robot.py
) else if "%opcao%"=="2" (
    echo.
    echo Iniciando modo demonstracao...
    python bidflow_rpa_robot.py --demo
) else if "%opcao%"=="3" (
    echo.
    echo Executando testador de integroacoes...
    python test_bidflow_bot.py
) else if "%opcao%"=="4" (
    echo.
    set /p termo="Digite o termo de pesquisa: "
    echo Pesquisando: "%termo%"
    python bidflow_rpa_robot.py --search "%termo%"
) else if "%opcao%"=="5" (
    echo Saindo...
    exit /b 0
) else (
    echo Opcao invalida!
    pause
    exit /b 1
)

echo.
pause
