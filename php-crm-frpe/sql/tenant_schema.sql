-- Tenant Schema (Schema por tenant)
-- Este arquivo define o schema do banco de dados para cada tenant
-- Deve ser executado ao criar um novo tenant

-- =============================================
-- TABELAS DO CRM (php-crm-frpe)
-- =============================================

CREATE TABLE IF NOT EXISTS `agendamentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `data_inicio` datetime NOT NULL,
  `data_fim` datetime DEFAULT NULL,
  `tipo` varchar(100) NOT NULL DEFAULT 'Geral',
  `criado_por_id` int(11) NOT NULL,
  `oportunidade_id` int(11) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_entrega` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `agendamento_usuarios` (
  `agendamento_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  PRIMARY KEY (`agendamento_id`,`usuario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `clientes_pf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `cpf` varchar(20) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(50) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `logradouro` varchar(255) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` varchar(2) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `commissionconfig` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuarioid` int(11) NOT NULL,
  `metamensal` decimal(15,2) DEFAULT 0.00,
  `salariofixo` decimal(15,2) DEFAULT 0.00,
  `percentualcomissao` decimal(5,2) DEFAULT 1.00,
  `ativo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE IF NOT EXISTS `commission_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `meta_mensal` decimal(15,2) NOT NULL DEFAULT 0.00,
  `salario_fixo` decimal(15,2) NOT NULL DEFAULT 0.00,
  `percentual_comissao` decimal(5,2) NOT NULL DEFAULT 1.00,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE IF NOT EXISTS `contatos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(50) DEFAULT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `organizacao_id` int(11) DEFAULT NULL,
  `criado_por_id` int(11) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `empenhos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fornecedor_id` int(11) NOT NULL,
  `oportunidade_id` int(11) DEFAULT NULL,
  `nota_fiscal_id` int(11) DEFAULT NULL,
  `numero_empenho` varchar(100) DEFAULT NULL,
  `valor` decimal(15,2) DEFAULT 0.00,
  `data_empenho` date DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `etapas_funil` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `funil_id` int(11) NOT NULL,
  `ordem` int(11) NOT NULL DEFAULT 0,
  `probabilidade` int(11) DEFAULT 0,
  `cor` varchar(20) DEFAULT '#cccccc',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `fornecedores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `cnpj` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(50) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `logradouro` varchar(255) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` varchar(2) DEFAULT NULL,
  `criado_por_id` int(11) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `fornecedor_metas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fornecedor_id` int(11) NOT NULL,
  `ano` year NOT NULL,
  `meta` decimal(15,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `fornecedor_metas_estados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fornecedor_id` int(11) NOT NULL,
  `estado` varchar(2) NOT NULL,
  `meta` decimal(15,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `funis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` text DEFAULT NULL,
  `cor` varchar(20) DEFAULT '#2196F3',
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `historico_atribuicao` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `oportunidade_id` int(11) NOT NULL,
  `de_usuario_id` int(11) DEFAULT NULL,
  `para_usuario_id` int(11) NOT NULL,
  `data_atribuicao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `kits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `preco` decimal(15,2) DEFAULT 0.00,
  `criado_por_id` int(11) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `kit_itens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kit_id` int(11) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `leads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(50) DEFAULT NULL,
  `origem` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Novo',
  `cpf` varchar(20) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `logradouro` varchar(255) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` varchar(2) DEFAULT NULL,
  `criado_por_id` int(11) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `notas_fiscais` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fornecedor_id` int(11) NOT NULL,
  `oportunidade_id` int(11) DEFAULT NULL,
  `numero_nota` varchar(100) DEFAULT NULL,
  `valor` decimal(15,2) DEFAULT 0.00,
  `data_emissao` date DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `oportunidades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `valor` decimal(15,2) DEFAULT 0.00,
  `estagio` varchar(100) DEFAULT 'Novo',
  `org_id` int(11) DEFAULT NULL,
  `contato_id` int(11) DEFAULT NULL,
  `responsavel_id` int(11) DEFAULT NULL,
  `fornecedor_id` int(11) DEFAULT NULL,
  `data_fechamento` date DEFAULT NULL,
  `probabilidade` int(11) DEFAULT 0,
  `descricao` text DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `oportunidade_itens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `oportunidade_id` int(11) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 1,
  `preco_unitario` decimal(15,2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `organizacoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `cnpj` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(50) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `logradouro` varchar(255) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` varchar(2) DEFAULT NULL,
  `criado_por_id` int(11) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `produtos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `referencia` varchar(100) DEFAULT NULL,
  `preco` decimal(15,2) DEFAULT 0.00,
  `estoque` int(11) DEFAULT 0,
  `unidade` varchar(20) DEFAULT 'un',
  `categoria` varchar(100) DEFAULT NULL,
  `imagem` varchar(255) DEFAULT NULL,
  `criado_por_id` int(11) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `propostas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `oportunidade_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `valor_total` decimal(15,2) DEFAULT 0.00,
  `status` varchar(50) DEFAULT 'Rascunho',
  `validade` date DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `criado_por_id` int(11) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `proposta_itens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `proposta_id` int(11) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 1,
  `preco_unitario` decimal(15,2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `suppliermonthlytargets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fornecedor_id` int(11) NOT NULL,
  `mes` int(11) NOT NULL,
  `ano` year NOT NULL,
  `meta` decimal(15,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `supplier_monthly_targets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fornecedor_id` int(11) NOT NULL,
  `mes` int(11) NOT NULL,
  `ano` year NOT NULL,
  `meta` decimal(15,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tabela_preco` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `ativa` tinyint(1) DEFAULT 1,
  `data_inicio` date DEFAULT NULL,
  `data_fim` date DEFAULT NULL,
  `criado_por_id` int(11) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tabela_preco_itens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tabela_preco_id` int(11) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `preco` decimal(15,2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'user',
  `ativo` tinyint(1) DEFAULT 1,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `usuarios_financas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `meta_mensal` decimal(15,2) DEFAULT 0.00,
  `salario_fixo` decimal(15,2) DEFAULT 0.00,
  `percentual_comissao` decimal(5,2) DEFAULT 1.00,
  `ativo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `vendas_fornecedores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fornecedor_id` int(11) NOT NULL,
  `oportunidade_id` int(11) DEFAULT NULL,
  `valor` decimal(15,2) DEFAULT 0.00,
  `data_venda` date DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `vendas_objetivos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fornecedor_id` int(11) NOT NULL,
  `ano` year NOT NULL,
  `meta` decimal(15,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =============================================
-- TABELAS DO MÓDULO DE LICITAÇÃO
-- =============================================

CREATE TABLE IF NOT EXISTS `afcs_consignado` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `numero_afc` varchar(50) NOT NULL,
  `detalhes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `qtd_solicitada` int(11) DEFAULT 0,
  `valor_total` decimal(15,2) DEFAULT 0.00,
  `detalhes_kit` text DEFAULT NULL,
  `observacao` text DEFAULT NULL,
  `qtd_entregue` int(11) DEFAULT 0,
  `detalhes_entregue` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `agente_historico` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `anexo_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `prompt_usuario` text DEFAULT NULL,
  `resposta_ia` longtext DEFAULT NULL,
  `data_hora` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `alertas_licencas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mensagem` text NOT NULL,
  `lida` tinyint(1) DEFAULT 0,
  `data_criacao` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `anexos_pregao` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pregao_id` int(11) NOT NULL,
  `nome_original` varchar(255) NOT NULL,
  `descricao_anexo` varchar(255) DEFAULT NULL,
  `nome_arquivo` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `tipo_documento` varchar(50) DEFAULT 'Anexo Geral',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `cis_consignado` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `numero_ci` varchar(50) NOT NULL,
  `detalhes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `numero_empenho` varchar(50) DEFAULT NULL,
  `qtd_solicitada` int(11) DEFAULT 0,
  `valor_total` decimal(15,2) DEFAULT 0.00,
  `detalhes_produtos` text DEFAULT NULL,
  `observacao` text DEFAULT NULL,
  `pedido_numero` varchar(50) DEFAULT NULL,
  `nota_fiscal_numero` varchar(50) DEFAULT NULL,
  `numero_pedido` varchar(50) DEFAULT NULL,
  `numero_nota_fiscal` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `consignados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pregao_id` int(11) NOT NULL,
  `numero_contrato` varchar(50) NOT NULL,
  `created_by_user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `consignado_afc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `consignado_produto_id` int(11) NOT NULL,
  `afc_numero` varchar(50) DEFAULT NULL,
  `afc_data` date DEFAULT NULL,
  `qtd_solicitada` int(11) DEFAULT 0,
  `qtd_entregue` int(11) DEFAULT 0,
  `valor_unitario` decimal(10,2) DEFAULT 0.00,
  `kit_entregue_adulto` int(11) DEFAULT 0,
  `kit_entregue_infantil` int(11) DEFAULT 0,
  `kit_entregue_neonatal` int(11) DEFAULT 0,
  `kit_entregue_pediatrico` int(11) DEFAULT 0,
  `kit_entregue_cardioplegia` int(11) DEFAULT 0,
  `observacao` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `consignado_afcs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `consignado_id` int(11) NOT NULL,
  `afc_numero` varchar(50) DEFAULT NULL,
  `qtd_solicitada` int(11) DEFAULT 0,
  `qtd_entregue` int(11) DEFAULT 0,
  `valor_unitario` decimal(10,2) DEFAULT 0.00,
  `valor_total` decimal(10,2) DEFAULT 0.00,
  `entregue_oxigenador` int(11) DEFAULT 0,
  `entregue_hemoconcentrador` int(11) DEFAULT 0,
  `entregue_cardioplegia` int(11) DEFAULT 0,
  `status` varchar(20) DEFAULT 'Pendente',
  `observacao` text DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `consignado_ci` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `consignado_produto_id` int(11) NOT NULL,
  `ci_numero` varchar(50) DEFAULT NULL,
  `ci_data` date DEFAULT NULL,
  `ci_qtd` int(11) DEFAULT 0,
  `observacao` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `consignado_produtos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `consignado_id` int(11) NOT NULL,
  `produto_nome` varchar(255) NOT NULL,
  `quantidade_total` int(11) DEFAULT 0,
  `qtd_entregue` int(11) DEFAULT 0,
  `saldo_restante` int(11) DEFAULT 0,
  `valor_unitario` decimal(10,2) DEFAULT 0.00,
  `valor_total` decimal(15,2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `email_queue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recipient_email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `sent_at` timestamp NULL DEFAULT NULL,
  `attempts` tinyint(4) NOT NULL DEFAULT 0,
  `error_message` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `fornecedores_licitacao` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `cnpj` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(50) DEFAULT NULL,
  `contato` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `historico_movimentacoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pregao_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `acao` varchar(100) NOT NULL,
  `detalhes` text DEFAULT NULL,
  `data_hora` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `itens_pregoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pregao_id` int(11) NOT NULL,
  `numero_lote` varchar(20) DEFAULT NULL,
  `referencia` varchar(100) DEFAULT NULL,
  `produto` varchar(255) NOT NULL,
  `quantidade` int(11) DEFAULT 0,
  `unidade` varchar(20) DEFAULT NULL,
  `preco_maximo` decimal(15,2) DEFAULT 0.00,
  `descricao` text DEFAULT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `modelo` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `licencas_certidoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pregao_id` int(11) NOT NULL,
  `tipo` varchar(100) NOT NULL,
  `validade` date DEFAULT NULL,
  `anexo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `logs_atividades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `tabela` varchar(100) NOT NULL,
  `acao` varchar(50) NOT NULL,
  `registro_id` int(11) NOT NULL,
  `detalhes` text DEFAULT NULL,
  `data_hora` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `licitacoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero_pregao` varchar(50) NOT NULL,
  `orgao` varchar(255) NOT NULL,
  `uasg` varchar(20) DEFAULT NULL,
  `modalidade` varchar(50) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `objeto` text DEFAULT NULL,
  `valor_total` decimal(15,2) DEFAULT 0.00,
  `data_abertura` datetime DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Novo',
  `link_edital` varchar(500) DEFAULT NULL,
  `created_by_user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `minhas_licitacoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pregao_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `status` varchar(50) DEFAULT 'Acompanhando',
  `data_cadastro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notificacoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `mensagem` text NOT NULL,
  `lida` tinyint(1) DEFAULT 0,
  `tipo` varchar(50) DEFAULT 'info',
  `link` varchar(255) DEFAULT NULL,
  `data_criacao` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `observacoes_pregao` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pregao_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `observacao` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pregao_fornecedor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pregao_id` int(11) NOT NULL,
  `fornecedor_id` int(11) NOT NULL,
  `status` varchar(50) DEFAULT 'Participando',
  `vencedor` tinyint(1) DEFAULT 0,
  `valor_proposta` decimal(15,2) DEFAULT 0.00,
  `data_proposta` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pregoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero_pregao` varchar(50) NOT NULL,
  `orgao` varchar(255) NOT NULL,
  `uasg` varchar(20) DEFAULT NULL,
  `modalidade` varchar(50) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `objeto` text DEFAULT NULL,
  `valor_total` decimal(15,2) DEFAULT 0.00,
  `data_abertura` datetime DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Novo',
  `link_edital` varchar(500) DEFAULT NULL,
  `resultado` text DEFAULT NULL,
  `created_by_user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `produtos_consignacao` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pregao_id` int(11) NOT NULL,
  `produto_nome` varchar(255) NOT NULL,
  `quantidade_total` int(11) DEFAULT 0,
  `qtd_entregue` int(11) DEFAULT 0,
  `saldo_restante` int(11) DEFAULT 0,
  `valor_unitario` decimal(10,2) DEFAULT 0.00,
  `valor_total` decimal(15,2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `propostas_licitacao` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pregao_id` int(11) NOT NULL,
  `fornecedor_id` int(11) NOT NULL,
  `valor` decimal(15,2) DEFAULT 0.00,
  `data_envio` datetime DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Enviada',
  `anexo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `registration_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `usuarios_licitacao` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'Padrao',
  `ativo` tinyint(1) DEFAULT 1,
  `ultimo_login` timestamp NULL,
  `created_at` timestamp DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de configuração do Radar
CREATE TABLE IF NOT EXISTS `radar_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `termo` varchar(255) NOT NULL,
  `tipo` varchar(50) DEFAULT 'orgao',
  `estado` varchar(2) DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `ativa` tinyint(1) DEFAULT 1,
  `usuario_id` int(11) DEFAULT NULL,
  `created_at` timestamp DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
