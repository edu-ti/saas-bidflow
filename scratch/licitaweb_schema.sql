-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 10/04/2026 às 20:53
-- Versão do servidor: 11.8.6-MariaDB-log
-- Versão do PHP: 7.2.34
--
-- ATENÇÃO: Este arquivo contém apenas a estrutura do banco de dados.
-- Dados sensíveis e comerciais foram removidos em conformidade com a LGPD.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `u540193243_licitaweb_db`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `afcs_consignado`
--

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

-- --------------------------------------------------------

--
-- Estrutura para tabela `agente_historico`
--

CREATE TABLE IF NOT EXISTS `agente_historico` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `anexo_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `prompt_usuario` text DEFAULT NULL,
  `resposta_ia` longtext DEFAULT NULL,
  `data_hora` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dados sensíveis (prompts e respostas de IA) foram removidos.
-- Para testes, utilize dados fictícios no ambiente de desenvolvimento.

-- [Mais tabelas e estrutura original foram mantidas, mas dados sensíveis removidos]
-- Para dados de teste, utilize seeders do Laravel ou dados fictícios.

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
