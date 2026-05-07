# BidFlow SaaS

Plataforma SaaS completa para gestão de licitações e processos comerciais. O sistema oferece funcionalidades de CRM, gestão de oportunidades, contratos, controle financeiro, automação de marketing e robôs RPA para raspagem de editais.

## Stack Tecnológica

| Componente | Tecnologia |
|------------|------------|
| Backend | Laravel (PHP 8.2) |
| Banco de Dados | PostgreSQL 15 |
| Cache/Queue | Redis 7 |
| Frontend | React (Node 20) |
| RPA | Python com Playwright |
| Infraestrutura | Docker, Nginx |
| Servidor Web | Nginx ( Alpine) |

## Arquitetura de Subdomínios

O sistema utiliza subdomínios para separar os contextos:

- **`master.seudominio.com.br`** → Painel administrativo master (gestão de tenants, planos, super admin)
- **`app.seudominio.com.br`** → Painel dos clientes/tenants (gestão própria)

## Requisitos

- Docker e Docker Compose instalados
- Domínio configurado com registros DNS para `master.*` e `app.*`
- Para desenvolvimento local, configure o arquivo `/etc/hosts`:
  ```
  127.0.0.1 master.localhost
  127.0.0.1 app.localhost
  ```

## Instalação e Configuração

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/bidflow.git
cd bidflow
```

### 2. Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp backend/.env.example backend/.env

# Gerar chave da aplicação
docker compose run app php artisan key:generate
```

### 3. Configurar o Docker Compose

Edite o arquivo `.env` com suas configurações:

```env
# Domínios
MASTER_DOMAIN=master.localhost
APP_DOMAIN=app.localhost

# Banco de dados
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=bidflow
DB_USERNAME=postgres
DB_PASSWORD=secret

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=
REDIS_PORT=6379
QUEUE_CONNECTION=redis
CACHE_STORE=redis

# App
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost
```

### 4. Subir os containers

```bash
docker compose up -d
```

### 5. Rodar migrations e seeds

```bash
docker compose exec app php artisan migrate --force
docker compose exec app php artisan db:seed
```

### 6. Acessar a aplicação

- Painel Master: `http://master.localhost`
- Painel Tenant: `http://app.localhost` (após criar um tenant)
- Frontend React: `http://localhost:3000`

## Variáveis de Ambiente Importantes

| Variável | Descrição | Exemplo |
|-----------|-----------|---------|
| `MASTER_DOMAIN` | Domínio do painel master | `master.localhost` |
| `APP_DOMAIN` | Domínio dos tenants | `app.localhost` |
| `APP_KEY` | Chave da aplicação Laravel | `base64:xxxx` |
| `DB_CONNECTION` | Driver do banco | `pgsql` |
| `DB_HOST` | Host do banco de dados | `db` |
| `DB_DATABASE` | Nome do banco | `bidflow` |
| `DB_USERNAME` | Usuário do banco | `postgres` |
| `DB_PASSWORD` | Senha do banco | `secret` |
| `REDIS_HOST` | Host do Redis | `redis` |
| `QUEUE_CONNECTION` | Driver de filas | `redis` |
| `BIDFLOW_API_TOKEN` | Token para RPA | (seu token) |

## Estrutura do Projeto

```
bidflow/
├── backend/                 # Aplicação Laravel
│   ├── app/                 # Código fonte (Models, Controllers, Services)
│   ├── config/              # Arquivos de configuração
│   ├── database/            # Migrations, Seeders, Factories
│   ├── routes/             # Definição de rotas API/Web
│   ├── tests/              # Testes Feature/Unit
│   └── .env.example        # Exemplo de variáveis de ambiente
│
├── frontend/               # Aplicação React
│   ├── src/                # Código fonte
│   ├── public/             # Arquivos públicos
│   └── package.json        # Dependências Node
│
├── rpa/                    # Robô RPA Python
│   ├── bidflow_rpa_robot.py # Código do robô
│   ├── requirements.txt    # Dependências Python
│   └── README.md          # Documentação
│
├── docker/                 # Configurações Docker
│   ├── nginx/              # Configuração do Nginx
│   │   ├── conf.d/         # Configurações compartilhadas
│   │   ├── sites/          # Configurações por domínio
│   │   └── ssl/            # Certificados SSL
│   ├── php/                # Dockerfile PHP
│   ├── python/             # Dockerfile Python
│   └── react/              # Dockerfile React
│
├── .github/                 # GitHub Actions
│   ├── workflows/          # Pipelines CI/CD
│   │   ├── ci.yml         # Testes e lint
│   │   └── deploy.yml     # Deploy automático
│   └── README.md          # Configuração de secrets
│
├── docker-compose.yml      # Orquestração de containers
└── README.md              # Este arquivo
```

## Pipelines CI/CD

### CI (`.github/workflows/ci.yml`)

Executa automaticamente em:
- Push para branches `main`, `develop`, `feature/**`
- Pull Requests para `main` e `develop`

Jobs:
- **backend-tests**: Testes Laravel (PHPUnit), migrations, phpstan
- **frontend-lint**: Lint e build do React

### Deploy (`.github/workflows/deploy.yml`)

Executa em:
- Push para branch `main`
-手动 via `workflow_dispatch`

Jobs:
- **build-and-push**: Build e push das imagens Docker
- **deploy**: SSH para o servidor e execução dos comandos

### Configuração de Secrets

Para ativar o deploy automático, configure os seguintes secrets no GitHub:

1. `DOCKER_USERNAME` - Usuário do Docker Hub
2. `DOCKER_PASSWORD` - Senha do Docker Hub
3. `DEPLOY_HOST` - IP do servidor
4. `DEPLOY_USER` - Usuário SSH
5. `DEPLOY_SSH_KEY` - Chave SSH privada

Consulte `.github/README.md` para instruções detalhadas.

## Serviços Docker

| Serviço | Descrição | Porta |
|---------|-----------|-------|
| `app` | PHP-FPM Laravel | 9000 |
| `web` | Nginx | 80, 443 |
| `frontend` | React App | 3000 |
| `db` | PostgreSQL | 5432 |
| `redis` | Redis | 6379 |
| `worker` | Queue Worker | - |
| `cron` | Agendador Laravel | - |
| `rpa` | Robô RPA | - |

## Comandos Úteis

```bash
# Ver logs
docker compose logs -f app

# Acessar container
docker compose exec app bash

# Recriar containers
docker compose up -d --build

# Parar serviços
docker compose down

# Executar comandos artisan
docker compose exec app php artisan migrate
docker compose exec app php artisan cache:clear
```

## Licença

MIT License - sinta-se livre para usar e modificar este projeto.