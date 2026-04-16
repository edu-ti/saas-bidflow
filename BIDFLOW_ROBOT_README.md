# 🤖 BidFlow RPA Robot

Robô de automação para raspagem de editais de licitação em portais de compras públicas.

## 📋 Funcionalidades

- ✅ Raspagem automática de editais em portais de compras
- ✅ Download de PDFs de editais
- ✅ Upload automático para o backend Laravel
- ✅ Logging completo com arquivos de log
- ✅ Configuração via variáveis de ambiente
- ✅ Modo demonstração para testes
- ✅ Suporte a múltiplos portais (Comprasnet, TCE-SP)
- ✅ Tratamento de erros e retries automáticos

## 🚀 Instalação

### Pré-requisitos

```bash
Python 3.10+
pip
Playwright
requests
```

### Instalação das dependências

```bash
pip install playwright requests
playwright install chromium
```

## ⚙️ Configuração

### Variáveis de Ambiente

| Variável | Descrição | Default | Obrigatório |
|----------|-----------|---------|-------------|
| `BIDFLOW_API_TOKEN` | Token de autenticação da API | - | ✅ Sim |
| `BIDFLOW_API_URL` | URL base da API | `http://localhost:8000/api` | ❌ |
| `BIDFLOW_SEARCH_TERM` | Termo de pesquisa | `Material Hospitalar` | ❌ |
| `BIDFLOW_OPPORTUNITY_ID` | ID da oportunidade | `1` | ❌ |
| `BIDFLOW_HEADLESS` | Modo headless do navegador | `true` | ❌ |
| `BIDFLOW_TIMEOUT` | Timeout em segundos | `30` | ❌ |
| `BIDFLOW_DOWNLOAD_DIR` | Diretório de downloads | `./downloads` | ❌ |
| `BIDFLOW_MAX_RETRIES` | Máximo de tentativas | `3` | ❌ |
| `BIDFLOW_RETRY_DELAY` | Delay entre tentativas (s) | `5` | ❌ |

### Exemplo de configuração

```bash
# Linux/macOS
export BIDFLOW_API_TOKEN='seu-token-aqui'
export BIDFLOW_API_URL='http://localhost:8000/api'
export BIDFLOW_SEARCH_TERM='Material Hospitalar'

# Windows (CMD)
set BIDFLOW_API_TOKEN=seu-token-aqui
set BIDFLOW_API_URL=http://localhost:8000/api
```

## 💻 Uso

### Modo normal (raspagem real)

```bash
python bidflow_rpa_robot.py
```

### Com termo de pesquisa personalizado

```bash
python bidflow_rpa_robot.py --search "Equipamentos Médicos"
```

### Modo demonstração (simulação)

```bash
python bidflow_rpa_robot.py --demo
```

### Portal específico

```bash
python bidflow_rpa_robot.py --portal tce_sp
```

## 🧪 Testador de Integrações

O arquivo `test_bidflow_bot.py` testa as integrações de IA e alertas:

### Executar todos os testes

```bash
export BIDFLOW_API_TOKEN='seu-token-aqui'
python test_bidflow_bot.py
```

### Teste específico

```bash
python test_bidflow_bot.py --test insights
python test_bidflow_bot.py --test alerts
python test_bidflow_bot.py --test predict
python test_bidflow_bot.py --test parse
python test_bidflow_bot.py --test pdf
```

## 📁 Estrutura de Arquivos

```
bidflow_rpa_robot.py      # Robô principal
test_bidflow_bot.py        # Testador de integrações
downloads/                 # Diretório de downloads
bidflow_robot_YYYYMMDD.log # Arquivos de log
```

## 🔧 Arquitetura

### Classes

- **BidFlowConfig**: Centraliza configurações do robô
- **BidFlowAPI**: Cliente para comunicação com a API Laravel
- **ComprasnetScraper**: Scraper especializado para portais de compras
- **BidFlowRobot**: Orquestrador principal

### Fluxo de Execução

1. Validação de configurações
2. Configuração do navegador (Playwright)
3. Pesquisa de licitações no portal
4. Extração de resultados
5. Download de PDFs dos editais
6. Upload para o backend Laravel
7. Logging e tratamento de erros

## 🐛 Troubleshooting

### Erro: "Variável BIDFLOW_API_TOKEN não configurada"

```bash
export BIDFLOW_API_TOKEN='seu-token-aqui'
```

### Erro: "Conexão recusada"

Verifique se o backend Laravel está rodando:

```bash
cd backend
php artisan serve
```

### Erro: "Browser not found"

Instale os navegadores do Playwright:

```bash
playwright install chromium
```

## 📝 Logs

Os logs são salvos em arquivos diários:

```
bidflow_robot_20260412.log
```

Formato do log:

```
2026-04-12 10:30:45 - BidFlowRobot - INFO - BidFlow Robot - Iniciando execução
2026-04-12 10:30:46 - BidFlowRobot - INFO - Navegador configurado com sucesso
2026-04-12 10:30:50 - BidFlowRobot - INFO - Pesquisando termo: 'Material Hospitalar'
```

## 🔐 Segurança

- ✅ Token de API via variável de ambiente (não hardcoded)
- ✅ Navegador headless em produção
- ✅ Timeout configurável para evitar hangs
- ✅ Tratamento de erros em todas as operações

## 🚧 Roadmap

- [ ] Suporte a mais portais de licitação
- [ ] Extração estruturada de dados do edital via IA
- [ ] Agendamento automático de raspagens
- [ ] Dashboard de métricas de raspagem
- [ ] Notificações em tempo real via WebSocket

## 📄 Licença

Propriedade do BidFlow - Todos os direitos reservados.
