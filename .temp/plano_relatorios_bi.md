# 📋 Plano de Execução — Página Unificada "Relatórios & BI"

## Objetivo
Unificar as duas páginas atuais de relatórios (`/reports` — Reports.tsx e `/reports-dashboard` — ReportsDashboard.tsx) em uma **única página** localizada em `/reports` chamada **"Relatórios & BI"**, com **3 abas internas**, inspiradas na lógica do sistema legado (`.temp/reports-OUTRO_SISTEMA.js`).

---

## Estrutura de Abas

| # | Aba | Origem | Descrição |
|---|-----|--------|-----------|
| 1 | **Dashboard BI** | Atual `Reports.tsx` (reformulado) | KPIs de licitações + vendas, gráficos de performance mensal, distribuição por categoria, funil por etapa |
| 2 | **Relatórios Detalhes** | Atual `ReportsDashboard.tsx` (renomeado) | Filtros avançados (mês, ano, UF, vendedor, fornecedor), abas internas (Visão Geral, Licitações, Vendas, Fornecedores, Equipe), exportação PDF/Excel |
| 3 | **Metas e Comissões** | **NOVA** (baseado em `.temp` linhas 401-795) | Gestão de performance financeira: seleção de período, tabela Vendedor × Meta × Vendas × Fixo × Comissão × Diferença × Total a Pagar, modal de configuração de metas e comissões por vendedor/fornecedor |

---

## Alterações Planejadas

### 1. Frontend — Novo Componente Container

**Arquivo:** `frontend/src/components/ReportsBIPage.tsx` (NOVO)

- Componente-pai que renderiza:
  - Header com título "Relatórios & BI"
  - **3 botões de aba** (estilo pill/tab): `Dashboard BI` | `Relatórios Detalhes` | `Metas e Comissões`
  - Estado `activeTab` para alternar entre os conteúdos
- Cada aba renderiza seu componente interno:
  - `<ReportsDashboardBI />` (conteúdo atual do `Reports.tsx`)
  - `<ReportsDetailed />` (conteúdo atual do `ReportsDashboard.tsx`)
  - `<GoalsAndCommissions />` (novo componente)

### 2. Frontend — Aba "Dashboard BI"

**Arquivo:** `frontend/src/components/reports/ReportsDashboardBI.tsx` (NOVO)

- Move o conteúdo atual de `Reports.tsx` para cá
- Remove header e tab interna (fica apenas o corpo com KPIs + gráficos)
- Exportação mantida

### 3. Frontend — Aba "Relatórios Detalhes"

**Arquivo:** `frontend/src/components/reports/ReportsDetailed.tsx` (NOVO)

- Move o conteúdo atual de `ReportsDashboard.tsx` para cá
- Remove header principal (fica dentro do container-pai)
- Mantém as sub-abas internas (Visão Geral, Licitações, Vendas, Fornecedores, Equipe)
- Mantém os filtros e exportação

### 4. Frontend — Aba "Metas e Comissões" (NOVA)

**Arquivo:** `frontend/src/components/reports/GoalsAndCommissions.tsx` (NOVO)

Baseado na lógica do `.temp/reports-OUTRO_SISTEMA.js` (linhas 401-795), adaptado para React + Tech-Noir:

- **Header-banner** com seleção de período (data início/fim) e botões Processar / Exportar / Config. Metas
- **Tabela de resultados** (após clicar "Processar"):
  - Colunas: Vendedor | Meta | Vendas | Fixo (R$) | Comissão (%) | Diferença | Trimestre | Valor a Pagar
  - Linha de totais no rodapé
- **Modal "Configurar Metas"** (reutiliza o `GoalSettingsModal` existente ou cria um novo):
  - Tabela editável: Vendedor | Meta (R$) | Fixo (R$) | % Comissão | Ativo
  - Botão "Adicionar Vendedor"
  - Seção "Metas por Fornecedor / Estados" com grid de inputs mensais (Jan-Dez) por UF

### 5. Backend — Endpoint de Commission Analysis

**Arquivo:** `backend/app/Http/Controllers/ReportController.php`

- Novo método `commissionAnalysis(Request $request)`:
  - Busca todos os vendedores com suas metas (`Goal`) e vendas ganhas (`Opportunity`) no período
  - Calcula: `comissão = vendas × (% / 100)`, `total = fixo + comissão`, `diferença = vendas - meta`
  - Retorna array de objetos por vendedor

**Arquivo:** `backend/app/Services/ReportService.php`

- Novo método `getCommissionAnalysis(Request $request)`:
  - Query vendedores com `commission_config` (nova migration ou campo no model User/Goal)
  - Cruza com oportunidades ganhas no período filtrado

**Arquivo:** `backend/routes/api.php`

- Nova rota: `GET /api/reports/commission-analysis`

### 6. Backend — Commission Config (Configurações de Comissão)

**Migration:** `create_commission_configs_table`

Campos:
- `id`, `company_id`, `user_id`, `meta_mensal` (decimal), `salario_fixo` (decimal), `percentual_comissao` (decimal, default 1.00), `ativo` (boolean), `year` (integer), `timestamps`

**Model:** `CommissionConfig`

**Controller:** Endpoints para salvar/listar configs:
- `GET /api/commission-configs` — lista configs do tenant
- `POST /api/commission-configs` — cria/atualiza configs em batch

### 7. Routing — App.tsx

- Remover rota `/reports-dashboard` (separada)
- Manter apenas `/reports` apontando para `<ReportsBIPage />`
- Remover import de `ReportsDashboard`

### 8. Sidebar — Sidebar.tsx

- Remover o item separado `reports-dashboard` / "BI Inteligente"
- Manter apenas `reports` / "Relatórios & BI"

---

## Arquivos Afetados (Resumo)

| Ação | Arquivo |
|------|---------|
| **CRIAR** | `frontend/src/components/ReportsBIPage.tsx` |
| **CRIAR** | `frontend/src/components/reports/ReportsDashboardBI.tsx` |
| **CRIAR** | `frontend/src/components/reports/ReportsDetailed.tsx` |
| **CRIAR** | `frontend/src/components/reports/GoalsAndCommissions.tsx` |
| **CRIAR** | `backend/database/migrations/xxxx_create_commission_configs_table.php` |
| **CRIAR** | `backend/app/Models/CommissionConfig.php` |
| **EDITAR** | `backend/app/Http/Controllers/ReportController.php` (add methods) |
| **EDITAR** | `backend/app/Services/ReportService.php` (add methods) |
| **EDITAR** | `backend/routes/api.php` (add routes) |
| **EDITAR** | `frontend/src/App.tsx` (unify route) |
| **EDITAR** | `frontend/src/components/Sidebar.tsx` (remove BI entry) |
| **DELETAR** | `frontend/src/components/Reports.tsx` (movido p/ subcomponente) |
| **DELETAR** | `frontend/src/components/ReportsDashboard.tsx` (movido p/ subcomponente) |

---

## Ordem de Execução

1. ✅ Backend: criar migration + model `CommissionConfig`
2. ✅ Backend: adicionar métodos `commissionAnalysis` + rotas
3. ✅ Frontend: criar pasta `reports/` e mover componentes internos
4. ✅ Frontend: criar `GoalsAndCommissions.tsx`
5. ✅ Frontend: criar `ReportsBIPage.tsx` (container com abas)
6. ✅ Frontend: atualizar `App.tsx` (rota unificada)
7. ✅ Frontend: atualizar `Sidebar.tsx` (remover item duplicado)

---

> [!IMPORTANT]
> **Aguardando aprovação do USER antes de executar qualquer alteração.**
