#!/bin/bash

# BidFlow RPA Robot - Script de Execução
# Use este script para executar o robô BidFlow

set -e

echo "🤖 BidFlow RPA Robot"
echo "===================="

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "📋 Copie .env.example para .env e configure as variáveis:"
    echo "   cp .env.example .env"
    echo "   nano .env"
    exit 1
fi

# Carregar variáveis do .env
set -a
source .env
set +a

# Verificar token
if [ -z "$BIDFLOW_API_TOKEN" ]; then
    echo "❌ ERRO: BIDFLOW_API_TOKEN não configurado no .env"
    exit 1
fi

# Função de ajuda
show_help() {
    echo ""
    echo "📋 Uso: $0 [OPÇÃO]"
    echo ""
    echo "Opções:"
    echo "  run          Executar robô em modo normal"
    echo "  demo         Executar em modo demonstração"
    echo "  test         Executar testador de integrações"
    echo "  search TERMO  Pesquisar com termo específico"
    echo "  help         Mostrar esta ajuda"
    echo ""
}

# Processar argumentos
case "${1:-help}" in
    run)
        echo "🚀 Iniciando robô BidFlow..."
        echo "   Termo: ${BIDFLOW_SEARCH_TERM:-Material Hospitalar}"
        echo "   URL: ${BIDFLOW_API_URL:-http://localhost:8000/api}"
        echo ""
        python bidflow_rpa_robot.py
        ;;
    demo)
        echo "🎭 Iniciando modo demonstração..."
        python bidflow_rpa_robot.py --demo
        ;;
    test)
        echo "🧪 Executando testador de integrações..."
        python test_bidflow_bot.py
        ;;
    search)
        if [ -z "$2" ]; then
            echo "❌ ERRO: Informe o termo de pesquisa"
            echo "   Exemplo: $0 search 'Equipamentos Médicos'"
            exit 1
        fi
        echo "🔍 Pesquisando: '$2'"
        python bidflow_rpa_robot.py --search "$2"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "❌ Opção inválida: $1"
        show_help
        exit 1
        ;;
esac
