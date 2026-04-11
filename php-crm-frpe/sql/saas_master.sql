-- SaaS Master Database Schema
-- Este arquivo define o banco de dados master que controla todos os tenants
-- Execute este SQL primeiro para criar o banco de dados central

CREATE DATABASE IF NOT EXISTS saas_master CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saas_master;

-- Tabela de planos disponíveis
CREATE TABLE IF NOT EXISTS planos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slug VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2) NOT NULL DEFAULT 0,
    descricao TEXT,
    modulos JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir planos padrão
INSERT INTO planos (slug, nome, preco, descricao, modulos) VALUES
('free', 'Gratuito', 0.00, 'Plano básico com funcionalidades essenciais', '["crm"]'),
('starter', 'Starter', 97.00, 'Plano inicial com mais funcionalidades', '["crm", "agenda"]'),
('pro', 'Pro', 197.00, 'Plano profissional com módulo de licitações', '["crm", "agenda", "licitacao"]'),
('enterprise', 'Enterprise', 497.00, 'Plano enterprise com todos os módulos', '["crm", "agenda", "licitacao", "radar", "agente_ia"]');

-- Tabela de tenants (clientes)
CREATE TABLE IF NOT EXISTS tenants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slug VARCHAR(100) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) UNIQUE,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    plano_id INT NOT NULL DEFAULT 1,
    status ENUM('ativo', 'inativo', 'pendente', 'suspenso') DEFAULT 'pendente',
    db_name VARCHAR(100) NOT NULL UNIQUE,
    dominio VARCHAR(255),
    modulos JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expira_em DATE,
    FOREIGN KEY (plano_id) REFERENCES planos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de usuários por tenant (autenticação centralizada)
CREATE TABLE IF NOT EXISTS tenant_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'user') DEFAULT 'user',
    ativo TINYINT(1) DEFAULT 1,
    ultimo_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tenant_email (tenant_id, email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice para busca rápida por domínio
CREATE INDEX idx_tenants_dominio ON tenants(dominio);
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenant_users_email ON tenant_users(email);
