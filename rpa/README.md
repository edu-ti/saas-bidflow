# BidFlow RPA Robot

Robô de automação para raspagem de editais de licitações. Utiliza Playwright para acessar portais de compras públicas, pesquisar licitações, baixar editais em PDF e enviar para o backend Laravel.

## O que o robô faz

1. Acessa portais de compras públicas (Comprasnet, Gov.br, TCE-SP, etc.)
2. Pesquisa licitações por termo definido
3. Extrai resultados e metadados das licitações
4. Baixa editais em PDF
5. Envia os arquivos para a API do BidFlow como anexos de oportunidades

## Variáveis de ambiente necessárias

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `BIDFLOW_API_TOKEN` | Token de autenticação da API | (obrigatório) |
| `BIDFLOW_API_URL` | URL base da API | `http://localhost:8000/api` |
| `BIDFLOW_SEARCH_TERM` | Termo de pesquisa | `Material Hospitalar` |
| `BIDFLOW_OPPORTUNITY_ID` | ID da oportunidade no BidFlow | `1` |
| `BIDFLOW_HEADLESS` | Executar navegador em modo headless | `true` |
| `BIDFLOW_TIMEOUT` | Timeout em segundos | `30` |
| `BIDFLOW_DOWNLOAD_DIR` | Diretório para downloads | `./downloads` |
| `BIDFLOW_MAX_RETRIES` | Máximo de tentativas | `3` |
| `BIDFLOW_RETRY_DELAY` | Delay entre tentativas (segundos) | `5` |

## Como executar

### Com Docker Compose (recomendado)

```bash
# Executar o robô com Docker
docker compose run rpa python bidflow_rpa_robot.py

# Executar em modo demonstração (sem acesso a portais)
docker compose run rpa python bidflow_rpa_robot.py --demo

# Executar com termo de pesquisa específico
docker compose run rpa python bidflow_rpa_robot.py --search "Serviços de Limpeza"
```

### Diretamente com Python

```bash
# Instalar dependências
cd rpa
pip install -r requirements.txt
playwright install chromium

# Executar
export BIDFLOW_API_TOKEN="seu-token-aqui"
python bidflow_rpa_robot.py

# Ou com argumentos
python bidflow_rpa_robot.py --search "Material de Escritório" --demo
```

## Argumentos disponíveis

- `--search TERMO` - Define o termo de pesquisa
- `--demo` - Modo demonstração (não acessa portais externos)
- `--portal` - Portal a utilizar (`comprasnet` ou `tce_sp`)

## Estrutura de arquivos

```
rpa/
├── bidflow_rpa_robot.py   # Código principal do robô
├── requirements.txt       # Dependências Python
└── README.md             # Este arquivo
```