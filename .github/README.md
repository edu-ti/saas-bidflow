# GitHub Actions - Configuração de Secrets

Para que os pipelines de CI/CD funcionem corretamente, você precisa configurar os seguintes secrets no repositório GitHub.

## Configurar Secrets

1. Acesse o repositório no GitHub
2. Vá para **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**

## Secrets Necessários

### Pipeline CI (`.github/workflows/ci.yml`)

Não são necessários secrets para o pipeline de CI, pois os testes são executados em containers isolados.

---

### Pipeline Deploy (`.github/workflows/deploy.yml`)

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `DOCKER_USERNAME` | Usuário do Docker Hub ou registry | `meu-usuario` |
| `DOCKER_PASSWORD` | Senha ou token de acesso ao Docker Hub | `xxxxx` |
| `DEPLOY_HOST` | IP ou hostname do servidor de produção | `192.168.1.100` |
| `DEPLOY_USER` | Usuário SSH do servidor | `deploy` |
| `DEPLOY_SSH_KEY` | Chave SSH privada (sem passphrase) | Conteúdo da chave privada |

---

## Configuração do Servidor

Para que o deploy funcione, o servidor deve estar configurado com:

1. **Docker e Docker Compose** instalados
2. **SSH** configurado com a chave pública correspondente à chave privada configurada no secret
3. Diretório `/opt/bidflow/` criado com os arquivos do projeto
4. Arquivo `.env` configurado com as variáveis de produção

### Estrutura esperada no servidor:

```bash
/opt/bidflow/
├── backend/
├── docker/
├── docker-compose.yml
├── .env
└── ...
```

### Adicionar chave SSH no agente (servidor):

```bash
# Gerar chave (se não existir)
ssh-keygen -t ed25519 -C "deploy@bidflow"

# Adicionar ao agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### Adicionar chave pública no authorized_keys:

```bash
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
```

---

## Executar Deploy Manualmente

1. Vá para a aba **Actions** no GitHub
2. Selecione o workflow **Deploy**
3. Clique em **Run workflow**
4. Selecione a branch `main` e confirme

---

## Troubleshooting

### Erro de conexão SSH
- Verifique se o IP/hostname está correto no secret `DEPLOY_HOST`
- Confirme que a chave pública está no `authorized_keys` do servidor

### Erro ao fazer pull das imagens
- Verifique se as credenciais do Docker Hub estão corretas
- Confirme que o usuário tem acesso ao repositório no Docker Hub

### Erro ao executar comandos artisan
- Verifique que o arquivo `.env` existe no servidor
- Confirme que o container está rodando: `docker compose ps`