-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 10/04/2026 às 20:53
-- Versão do servidor: 11.8.6-MariaDB-log
-- Versão do PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `u540193243_crmfr_db`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `agendamentos`
--

CREATE TABLE `agendamentos` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `data_inicio` datetime NOT NULL,
  `data_fim` datetime DEFAULT NULL,
  `tipo` varchar(100) NOT NULL DEFAULT 'Geral',
  `criado_por_id` int(11) NOT NULL,
  `oportunidade_id` int(11) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_entrega` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `agendamentos`
--

INSERT INTO `agendamentos` (`id`, `titulo`, `descricao`, `data_inicio`, `data_fim`, `tipo`, `criado_por_id`, `oportunidade_id`, `data_criacao`, `data_entrega`) VALUES
(23, 'Teste de Controle de entrega', '', '2026-03-06 10:00:00', NULL, 'Controle de Entrega', 1, NULL, '2026-03-02 18:59:00', '2026-03-06');

-- --------------------------------------------------------

--
-- Estrutura para tabela `agendamento_usuarios`
--

CREATE TABLE `agendamento_usuarios` (
  `agendamento_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `agendamento_usuarios`
--

INSERT INTO `agendamento_usuarios` (`agendamento_id`, `usuario_id`) VALUES
(23, 1),
(23, 2),
(23, 7);

-- --------------------------------------------------------

--
-- Estrutura para tabela `clientes_pf`
--

CREATE TABLE `clientes_pf` (
  `id` int(11) NOT NULL,
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
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `clientes_pf`
--

INSERT INTO `clientes_pf` (`id`, `nome`, `cpf`, `data_nascimento`, `email`, `telefone`, `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `data_criacao`) VALUES
(21, 'MURILO MOTA', '16408977472', NULL, NULL, NULL, '57955000', 'R PADRE JOSÉ MARIA WENNKES, 200', NULL, NULL, 'CENTRO', 'Maragogi', 'AL', '2025-10-28 12:29:54'),
(22, 'QUITERIA MARIA DOS SANTOS', '04886469442', NULL, NULL, '996826732', '57032088', 'R Prefeito José Soares Camêlo, 163', NULL, NULL, 'Jacarecica', 'Maceió', 'AL', '2025-10-28 12:29:54'),
(23, 'ALEXANDRE HENRIQUE GOUVEIA DANTAS', '32339518415', NULL, NULL, NULL, '58040000', 'AV Presidente Epitácio Pessoa, 475', NULL, NULL, 'Torre', 'João Pessoa', 'PB', '2025-10-28 12:29:54'),
(24, 'FERNANDO SANTOS CARNEIRO', '08694737434', NULL, NULL, NULL, '58030001', 'AV Presidente Epitácio Pessoa, 1133', NULL, NULL, 'Estados', 'João Pessoa', 'PB', '2025-10-28 12:29:54'),
(25, 'MARTA LUCIA DE ALBUQUERQUE', '33829721404', NULL, NULL, NULL, '58410200', 'R Basílio Araújo, 540', NULL, NULL, 'Catolé', 'Campina Grande', 'PB', '2025-10-28 12:29:54'),
(26, 'MUCIO FERNANDO RIBEIRO', '13483366415', NULL, NULL, '999018793', '53140100', 'R Aluísio de Azevedo, 00', NULL, NULL, 'Jardim Atlântico', 'Olinda', 'PE', '2025-10-28 12:29:54'),
(27, 'DR.HELMITON VIEIRA', '50708945449', NULL, NULL, '998056286', '55012740', 'R Saldanha Marinho, 0', NULL, NULL, 'Maurício de Nassau', 'Caruaru', 'PE', '2025-10-28 12:29:54'),
(28, 'GIRLENE HENRIQUE DA SILVA', '04479136460', NULL, NULL, '997016015', '54220295', 'AV Bom Jesus, 195', NULL, NULL, 'Curado', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:29:54'),
(29, 'MANOEL VIEIRA DE OLIVEIRA', '25455850415', NULL, NULL, '981201908', '59612207', 'R Francisco Bessa, 0', NULL, NULL, 'Nova Betânia', 'Mossoró', 'RN', '2025-10-28 12:29:54'),
(30, 'ANA CAROLINE GONDIM MONTEIRO', '09890635429', NULL, NULL, '31317878', '53130410', 'AV Doutor José Augusto Moreira, 0', NULL, NULL, 'Casa Caiada', 'Olinda', 'PE', '2025-10-28 12:29:54'),
(31, 'THALITA MELO DE BRITO PEREIRA', '05264899444', NULL, NULL, '40096204', '58101462', 'R Leonor Viana de Souza Carvalho, 0', NULL, NULL, 'Poço', 'Cabedelo', 'PB', '2025-10-28 12:29:54'),
(32, 'JOSÉ ADOLFO BEZERRA DE MELO JUNIOR', '82149437449', NULL, NULL, '981591019', '55014385', 'R Fernão Dias Paes, 0', NULL, NULL, 'Maurício de Nassau', 'Caruaru', 'PE', '2025-10-28 12:29:54'),
(33, 'RAFAELA JALES PEREIRA DINIZ', '06518717432', NULL, NULL, NULL, '59611270', 'R Dalton Cunha, 1063', NULL, NULL, 'Abolição', 'Mossoró', 'RN', '2025-10-28 12:29:54'),
(34, 'EDUARDO CARNEIRO DE BRITO', '03035253471', NULL, NULL, '998435930', '58280000', 'R  MARCOS BARBOSA, 104', NULL, NULL, 'CENTRO', 'Mamanguape', 'PB', '2025-10-28 12:29:54'),
(35, 'FABIO SOBRAL BARBOSA', '02238559442', NULL, NULL, NULL, '52061060', 'R Jáder de Andrade, 404', NULL, NULL, 'Casa Forte', 'Recife', 'PE', '2025-10-28 12:29:54'),
(36, 'SANDRO JOSÉ DA SILVA', '82116091420', NULL, NULL, NULL, '50791500', 'R Desembargador Paulo André, 45', NULL, NULL, 'Curado', 'Recife', 'PE', '2025-10-28 12:29:54'),
(37, 'BRUNA MIRANDA MOTTA CAMPOS', '06426138428', NULL, NULL, '988635015', '50810200', 'R Monsenhor João Barbalho, 252', NULL, NULL, 'Várzea', 'Recife', 'PE', '2025-10-28 12:29:54'),
(38, 'DR NILDO', '09423975410', NULL, NULL, NULL, '58755000', 'R  José Alves de Medeiros, , 297', NULL, NULL, 'CRUZEIRO', 'Princesa Isabel', 'PB', '2025-10-28 12:29:54'),
(39, 'GABRIELA VIANNA DE ANDRADE LIMA', '10172016410', NULL, NULL, NULL, '52011080', 'R João Ramos, 285', NULL, NULL, 'Graças', 'Recife', 'PE', '2025-10-28 12:29:54'),
(40, 'MARIA JOSE DOS SANTOS MOURA', '02472777469', NULL, NULL, '999295533', '57241433', 'QD QD C  LOT BELA VISTA II , 23', NULL, NULL, 'BELA VISTA', 'São Miguel dos Campos', 'AL', '2025-10-28 12:29:54'),
(41, 'ELVIO DOMINGUES DA COSTA JUNIOR', '98491172149', NULL, NULL, NULL, '50750510', 'AV Prefeito Lima Castro, 300', NULL, NULL, 'Ilha do Retiro', 'Recife', 'PE', '2025-10-28 12:29:54'),
(42, 'GABRIELA OHANA MENEZES MELO MACEDO', '09507771450', NULL, NULL, '998734902', '51021300', 'R Jorge Couceiro da Costa Eiras, 443', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:29:54'),
(43, 'GERCIVAN DOS SANTOS ALVES', '06682040440', NULL, NULL, '994704405', '55270000', 'R José Lopes de Oliveira, 3', NULL, NULL, 'Campo Grande', 'Venturosa', 'PE', '2025-10-28 12:29:54'),
(44, 'GERMANO DE SOUSA GRANJA', '00980082420', NULL, NULL, '991066398', '56220000', 'R Alfredo Clementino, 206', NULL, NULL, 'CENTRO', 'Bodocó', 'PE', '2025-10-28 12:29:54'),
(45, 'GILSON GODOY', '30451051491', NULL, NULL, '994442151', '59066100', 'R Anderson de Abreu, RN', NULL, NULL, 'Candelária', 'Natal', 'RN', '2025-10-28 12:29:54'),
(46, 'GRAZIELE AQUILA DE SOUZA BRANDAO', '07373291490', NULL, NULL, '999447773', '52050500', 'AV Santos Dumont, 1491', NULL, NULL, 'Rosarinho', 'Recife', 'PE', '2025-10-28 12:29:54'),
(47, 'GUSTAVO LUIZ ROCHA REBOUCAS', '04533156401', NULL, NULL, '994088519', '59609807', 'R Praia de Pitangui, SN', NULL, NULL, 'Bela Vista', 'Mossoró', 'RN', '2025-10-28 12:29:54'),
(48, 'HALLISON CASTRO DA COSTA', '03524348483', NULL, NULL, '987611572', '59655000', 'R dos Calafates, 52', NULL, NULL, 'CENTRO', 'Areia Branca', 'RN', '2025-10-28 12:29:54'),
(49, 'HÉLDER CORRÊA', '47045779453', NULL, NULL, '992283636', '50070280', 'R Joaquim de Brito, 240', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:29:54'),
(50, 'HELEN KALIDJA NOVAIS DA SILVA', '11693026457', NULL, NULL, '991703570', '52021030', 'R Alfredo de Medeiros, 115', NULL, NULL, 'Espinheiro', 'Recife', 'PE', '2025-10-28 12:29:54'),
(51, 'HIARLES BARRETO SAMPAIO BRITO', '03528115440', NULL, NULL, '988846569', '58400180', 'AV Marechal Floriano Peixoto, SN', NULL, NULL, 'Centro', 'Campina Grande', 'PB', '2025-10-28 12:29:54'),
(52, 'HUGO JOSÉ DE CARVALHO FLORÊNCIO', '09041607420', NULL, NULL, '998511122', '52041020', 'R Engenheiro Sampaio, 68', NULL, NULL, 'Rosarinho', 'Recife', 'PE', '2025-10-28 12:29:54'),
(53, 'INALDO FREIRE', '47566329472', NULL, NULL, '999740454', '50070500', 'R Prefeito Jorge Martins, SN', NULL, NULL, 'Paissandu', 'Recife', 'PE', '2025-10-28 12:29:54'),
(54, 'MARIA EUGÊNIA SOUTO MAIOR PAULA', '59009519449', NULL, NULL, '998763294', '55730000', 'R professor josé gomes cabral, 80', NULL, NULL, 'Centro', 'Bom Jardim', 'PE', '2025-10-28 12:29:54'),
(55, 'MARIA JOSÉ RIBEIRO MARTINS CAMELO', '05265673334', NULL, NULL, '999262891', '58039190', 'AV Silvino Lopes, 419', NULL, NULL, 'Tambaú', 'João Pessoa', 'PB', '2025-10-28 12:29:54'),
(56, 'MARIA JOSILETE ARAUJO DA SILVA', '04361218404', NULL, NULL, '996303339', '59343000', 'R PRESIDENTE VARGAS, 194', NULL, NULL, 'CENTRO', 'Jardim do Seridó', 'RN', '2025-10-28 12:29:54'),
(57, 'MARIA NATÁLIA PEREIRA SIQUEIRA', '10860395480', NULL, NULL, '999469898', '56327170', 'R Rubem Franca, S/N', NULL, NULL, 'Boa Esperança', 'Petrolina', 'PE', '2025-10-28 12:29:54'),
(58, 'MARIANA DE ANDRADE AMARAL', '06513366437', NULL, NULL, '996069689', '52050145', 'R Simão Mendes, 92', NULL, NULL, 'Tamarineira', 'Recife', 'PE', '2025-10-28 12:29:54'),
(59, 'MATHEUS PEIXOTO DANTAS', '08333453465', NULL, NULL, '996320171', '59106160', 'R São Francisco, 336', NULL, NULL, 'Igapó', 'Natal', 'RN', '2025-10-28 12:29:54'),
(60, 'MICHELLE FERREIRA NEVES DA LUZ CORDEIRO', '05112658401', NULL, NULL, '998015040', '51021120', 'R General Americano Freire, 764', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:29:54'),
(61, 'NALUCIA DO SOCORRO CAVALCANTE DINIZ DE CARVALHO', '28478401415', NULL, NULL, '987216487', '58407673', 'R Antônio Barbosa de Menezes, 111', NULL, NULL, 'Mirante', 'Campina Grande', 'PB', '2025-10-28 12:29:54'),
(62, 'NELLY MARIA SAMPAIO E FERREIRA', '09136216410', NULL, NULL, '991845208', '51020011', 'R dos Navegantes, 2584', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:29:54'),
(63, 'ORESTES NEVES DE ALBUQUERQUE', '50773810463', NULL, NULL, '999037315', '56600000', 'R Cícero Lacerda Júnior, 114', NULL, NULL, 'Centro', 'Sertânia', 'PE', '2025-10-28 12:29:54'),
(64, 'ORLANDO GOMES DE OLIVEIRA', '08272883449', NULL, NULL, '998668926', '58037030', 'AV Governador Argemiro de Figueiredo, 860', NULL, NULL, 'Jardim Oceania', 'João Pessoa', 'PB', '2025-10-28 12:29:54'),
(65, 'PABLO ALMEIDA MACEDO NORTE', '07177946446', NULL, NULL, '998581800', '58401282', 'R João da Silva Pimentel, 391', NULL, NULL, 'Conceição', 'Campina Grande', 'PB', '2025-10-28 12:29:54'),
(66, 'ÍTALO KAIO BEZERRA VASCONCELOS', '06429144437', NULL, NULL, '999656769', '56302320', 'R Coronel Amorim, 217', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:29:54'),
(67, 'ITALO MARTINS FORMIGA', '06238651490', NULL, NULL, '996204500', '58050570', 'R Manoel Camelo de Lacerda, 254', NULL, NULL, 'Castelo Branco', 'João Pessoa', 'PB', '2025-10-28 12:29:54'),
(68, 'IZAIAS FRANCISCO DE SOUZA JUNIOR', '02566220433', NULL, NULL, '971179089', '55038360', 'R das Flores, SN', NULL, NULL, 'Boa Vista', 'Caruaru', 'PE', '2025-10-28 12:29:54'),
(69, 'JACKSON FERREIRA NETO', '03815683424', NULL, NULL, '988082646', '56327020', 'R Juazeiro, 280', NULL, NULL, 'Boa Esperança', 'Petrolina', 'PE', '2025-10-28 12:29:54'),
(70, 'JEOVÁ CORDEIRO DE MORAIS JÚNIOR', '02807550401', NULL, NULL, '988141267', '56328800', 'R Francisco de Assis Cavalcanti, 111', NULL, NULL, 'Colônia Imperial', 'Petrolina', 'PE', '2025-10-28 12:29:54'),
(71, 'JOAB DE SOUSA SALES', '20579527468', NULL, NULL, '991127694', '58900000', 'R FRANCISCO DERCIO SARAIVA, 405', NULL, NULL, 'CENTRO', 'Cajazeiras', 'PB', '2025-10-28 12:29:54'),
(72, 'JOABE JACK DE MENEZES', '81972245449', NULL, NULL, '988437304', '56912450', 'R Joaquim Godoy, 388', NULL, NULL, 'Nossa Senhora da Penha', 'Serra Talhada', 'PE', '2025-10-28 12:29:54'),
(73, 'JOANA DARC FERNANDES BRAGA CARDOSO', '00098187406', NULL, NULL, '998811114', '58031270', 'R Bancário Francisco Mendes Sobreira, 51', NULL, NULL, 'Pedro Gondim', 'João Pessoa', 'PB', '2025-10-28 12:29:54'),
(74, 'JOÃO GABRIEL', '11635639786', NULL, NULL, '999210012', '53990000', 'R Nice Cordeiro, 8', NULL, NULL, 'FLORESTA VELHA', 'Fernando de Noronha', 'PE', '2025-10-28 12:29:54'),
(75, 'JOÃO INACIO DA SILVA FILHO', '40225860449', NULL, NULL, '985562039', '50770130', 'R Acre, SN', NULL, NULL, 'Afogados', 'Recife', 'PE', '2025-10-28 12:29:54'),
(76, 'PAULO ADERSON SOBREIRA MAGALHAES DE CARVALHO', '05784731432', NULL, NULL, '994648722', '55012100', 'R Gonçalves Dias, 302', NULL, NULL, 'Maurício de Nassau', 'Caruaru', 'PE', '2025-10-28 12:29:54'),
(77, 'RENATO MAX FARIA', '05300718785', NULL, NULL, '996822094', '59020300', 'AV Campos Sales, 901', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:29:54'),
(78, 'RICARDO DENES FONSECA', '51365740625', NULL, NULL, '999806713', '50070460', 'R Senador José Henrique, 224', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:29:54'),
(79, 'ROBERTO VITAL', '08612285453', NULL, NULL, '999277121', '59064480', 'R Professor Moura Rabelo, 1904', NULL, NULL, 'Candelária', 'Natal', 'RN', '2025-10-28 12:29:54'),
(80, 'RODRIGO BANDEIRA', '05209972470', NULL, NULL, '987475849', '59056450', 'AV Nascimento de Castro, 1930', NULL, NULL, 'Lagoa Nova', 'Natal', 'RN', '2025-10-28 12:29:54'),
(81, 'RODRIGO PINTO PEDROSA', '03062983418', NULL, NULL, '30405999', '52061540', 'AV Dezessete de Agosto, 2483', NULL, NULL, 'Casa Forte', 'Recife', 'PE', '2025-10-28 12:29:54'),
(82, 'RODRIGO WESLLEY DE PAIVA VIEIRA', '11368151809', NULL, NULL, '81510102', '58748970', 'R José Vidal, SN', NULL, NULL, 'Centro', 'Água Branca', 'PB', '2025-10-28 12:29:54'),
(83, 'ROMMEL DE ANDRADE JUREBA', '85912220400', NULL, NULL, '31817100', '50100060', 'R dos Palmares, SN', NULL, NULL, 'Santo Amaro', 'Recife', 'PE', '2025-10-28 12:29:54'),
(84, 'ROMULO LEAL', '01447150317', NULL, NULL, '991025723', '58045230', 'R Tabelião José Ramalho Leite, 1217', NULL, NULL, 'Cabo Branco', 'João Pessoa', 'PB', '2025-10-28 12:29:54'),
(85, 'ROOSEVELT DE MENEZES GOMES JUNIOR', '02760292401', NULL, NULL, '981992853', '52070040', 'R Doutor Genaro Guimarães, 90', NULL, NULL, 'Casa Amarela', 'Recife', 'PE', '2025-10-28 12:29:54'),
(86, 'RYAN KLEBER BEZEERA DE ANDRADE', '07272368497', NULL, NULL, '998610882', '52050150', 'R Padre Roma, 34', NULL, NULL, 'Tamarineira', 'Recife', 'PE', '2025-10-28 12:29:54'),
(87, 'SABRINA SOUZA AUGUSTO', '05456825333', NULL, NULL, '991129449', '56328180', 'R Cabrobó, 40', NULL, NULL, 'Vila Eduardo', 'Petrolina', 'PE', '2025-10-28 12:29:54'),
(88, 'HOLIVER NICOLAS MOURA', '07858802593', NULL, NULL, NULL, '50070280', 'R Joaquim de Brito, 240', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:29:54'),
(89, 'JANSON PANTA DOS PRAZERES', '11369632436', NULL, NULL, NULL, '54756055', 'R Prefeito Josué Pereira, 23', NULL, NULL, 'Tabatinga', 'Camaragibe', 'PE', '2025-10-28 12:29:54'),
(90, 'JOICY BRASIL FERREIRA DA SILVA', '09241925426', NULL, NULL, '995769199', '53210230', 'R Francisco Gomes, 213', NULL, NULL, 'Caixa D\'Água', 'Olinda', 'PE', '2025-10-28 12:29:54'),
(91, 'JONNY VITOR DINIZ', '04783286485', NULL, NULL, '997470551', '55297050', 'AV Rui Barbosa, 1410', NULL, NULL, 'Heliópolis', 'Garanhuns', 'PE', '2025-10-28 12:29:54'),
(92, 'EVANDRO SABINO DE FARIAS', '04449584449', NULL, NULL, '88111338', '58407664', 'AV Engenheiro José Celino Filho, 95', NULL, NULL, 'Mirante', 'Campina Grande', 'PB', '2025-10-28 12:29:54'),
(93, 'SADY ARMSTRONG', '79097367468', NULL, NULL, '991344554', '59064160', 'R Nelson Geraldo Freire, 800', NULL, NULL, 'Lagoa Nova', 'Natal', 'RN', '2025-10-28 12:29:54'),
(94, 'SANDRA CUNHA', '30535611404', NULL, NULL, '999841304', '58042040', 'R José Florentino Júnior, 582', NULL, NULL, 'Tambauzinho', 'João Pessoa', 'PB', '2025-10-28 12:29:54'),
(95, 'SANDRO INACIO DO CARMO', '07289097408', NULL, NULL, '996603209', '52041260', 'R Rodolfo de Holanda, 284', NULL, NULL, 'Encruzilhada', 'Recife', 'PE', '2025-10-28 12:29:54'),
(96, 'SAULO VASCONCELOS VIEIRA', '02430414465', NULL, NULL, '33216010', '59600155', 'R Juvenal Lamartine, 582', NULL, NULL, 'Centro', 'Mossoró', 'RN', '2025-10-28 12:29:54'),
(97, 'SEBASTIÃO CAMPOS', '19250937008', NULL, NULL, '981673024', '59020400', 'AV Prudente de Morais, 6695', NULL, NULL, 'Petrópolis', 'Natal', 'RN', '2025-10-28 12:29:54'),
(98, 'SEBASTIÃO ROCHA FILHO', '09465308404', NULL, NULL, '998438900', '59200000', 'R PEDRO MEDERIRO, SN', NULL, NULL, 'SANTA CRUZ', 'Santa Cruz', 'RN', '2025-10-28 12:29:54'),
(99, 'SÉRGIO MEDEIROS DA SILVA JÚNIOR', '07428568447', NULL, NULL, '996526776', '54460260', 'R Padre Nestor de Alencar, 5780', NULL, NULL, 'Barra de Jangada', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:29:54'),
(100, 'SILVIA MARIA DE VASCONCELOS VIEIRA', '10826351468', NULL, NULL, '999939888', '59618740', 'R Juvenal Lamartine, 562', NULL, NULL, 'Bom Jardim', 'Mossoró', 'RN', '2025-10-28 12:29:54'),
(101, 'SILVIO HOCK DE PAFFER FILHO', '54462576420', NULL, NULL, '991118686', '52020212', 'R Conselheiro Portela, 162', NULL, NULL, 'Graças', 'Recife', 'PE', '2025-10-28 12:29:54'),
(102, 'TAINÁ MARIA DE SOUZA VIDAL', '04843296422', NULL, NULL, '993910514', '51021130', 'R Coronel Anízio Rodrigues Coelho, SN', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:29:54'),
(103, 'TALES PEREIRA DE ALBUQUERQUE', '01425671403', NULL, NULL, '993091415', '58400290', 'R Treze de Maio, 269', NULL, NULL, 'Centro', 'Campina Grande', 'PB', '2025-10-28 12:29:54'),
(104, 'TAMARA LOPES GONÇALVES', '08028669484', NULL, NULL, '999941555', '50010010', 'R Siqueira Campos, SN', NULL, NULL, 'Santo Antônio', 'Recife', 'PE', '2025-10-28 12:29:54'),
(105, 'TATIANA ONOFRE GAMA', '06326672490', NULL, NULL, '991192249', '58032063', 'R Capitão Antônio Mendes de Souza Neto, 252', NULL, NULL, 'Miramar', 'João Pessoa', 'PB', '2025-10-28 12:29:54'),
(106, 'THAIS TAVARES DE SOUSA', '91214629172', NULL, NULL, '971046307', '51160035', 'R Le Parc, 100', NULL, NULL, 'Imbiribeira', 'Recife', 'PE', '2025-10-28 12:29:54'),
(107, 'THIAGO FONTENELE MARQUES', '58565086372', NULL, NULL, '981956141', '55012075', 'R Maria de Lourdes Casé Porto, 51', NULL, NULL, 'Maurício de Nassau', 'Caruaru', 'PE', '2025-10-28 12:29:54'),
(108, 'VAGNER MALAN DE MACEDO', '01435009452', NULL, NULL, '999883974', '56355000', 'R José Clementino Rodrigues Coelho, 148', NULL, NULL, 'CENTRO', 'Dormentes', 'PE', '2025-10-28 12:29:54'),
(109, 'MARIO CAVALCANTI', '01358717435', NULL, NULL, '988570108', '56302110', 'AV Cardoso de Sá, 1176', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:29:54'),
(110, 'CICERO WANDSON LUIZ MACEDO DE OLIVEIRA', '01403383499', NULL, NULL, '981818150', '56360000', 'R AFRANIO DE M FRANCO, 70', NULL, NULL, 'centro', 'Afrânio', 'PE', '2025-10-28 12:29:54'),
(111, 'KLEIBER MARCIANO LIMA BOMFIM', '61520349300', NULL, NULL, NULL, '61766110', 'AL Panamá, 423', NULL, NULL, 'Cidade Alpha', 'Eusébio', 'CE', '2025-10-28 12:29:54'),
(112, 'Pollyanna Gonçalves Pereira Silva', '09682377463', NULL, NULL, NULL, '50070600', 'R São Gonçalo, 423', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:29:54'),
(113, 'ANDREA VIANNA DE ANDRADE LIMA', '46152903491', NULL, NULL, '992064444', '52011080', 'R João Ramos, 142', NULL, NULL, 'Graças', 'Recife', 'PE', '2025-10-28 12:29:54'),
(114, 'PAULO FERNANDO BRAGA E TRIGO QUERETTE', '03572500443', NULL, NULL, '971086919', '55016445', 'R Artur Antônio da Silva, 625', NULL, NULL, 'Universitário', 'Caruaru', 'PE', '2025-10-28 12:29:54'),
(115, 'PAULO MABESOONE', '76386147472', NULL, NULL, '999253455', '52041045', 'R Caio Pereira, 175', NULL, NULL, 'Rosarinho', 'Recife', 'PE', '2025-10-28 12:29:54'),
(116, 'PAULO MAPURUNGA', '53723589472', NULL, NULL, '999464684', '50010030', 'R Frei Vicente do Salvador, S/N', NULL, NULL, 'Santo Antônio', 'Recife', 'PE', '2025-10-28 12:29:54'),
(117, 'PEDRO HENRIQUE LIMA VELOSO', '44594593453', NULL, NULL, '981247530', '55295335', 'R Doutor José Mariano, 77', NULL, NULL, 'Santo Antônio', 'Garanhuns', 'PE', '2025-10-28 12:29:54'),
(118, 'PEDRO HENRIQUE RODRIGUES DA SILVA', '04979272410', NULL, NULL, '981738658', '55296390', 'AV Frei Caneca, 219', NULL, NULL, 'Heliópolis', 'Garanhuns', 'PE', '2025-10-28 12:29:54'),
(119, 'IREMAR SALVIANO DE MACEDO NETO', '03078969436', NULL, NULL, '999811944', '52050145', 'R Simão Mendes, 200', NULL, NULL, 'Tamarineira', 'Recife', 'PE', '2025-10-28 12:29:54'),
(120, 'CARLOS ROBERTO DA SILVA', '16525450420', NULL, NULL, '991211460', '51110340', 'AV Doutor Dirceu Velloso Toscano de Brito, 63', NULL, NULL, 'Pina', 'Recife', 'PE', '2025-10-28 12:29:54'),
(121, 'PERSIO ANTUNES', '35471867572', NULL, NULL, '988064353', '56302110', 'AV Cardoso de Sá, 2040', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:29:54'),
(122, 'PETER JAMES DE MELO SANTOS', '00942720423', NULL, NULL, '999797597', '51020270', 'R Faustino Porto, 197', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:29:54'),
(123, 'RAFAEL BUARQUE DE MACEDO GADELHA', '04557314465', NULL, NULL, '999571380', '52050100', 'R Neto de Mendonça, 67', NULL, NULL, 'Tamarineira', 'Recife', 'PE', '2025-10-28 12:29:54'),
(124, 'RAFAEL DA NOBREGA BONFIM', '09484088473', NULL, NULL, '996238988', '58707130', 'R Antônio Torres, 390', NULL, NULL, 'Monte Castelo', 'Patos', 'PB', '2025-10-28 12:29:54'),
(125, 'RAFAEL NOBREGA', '08851601429', NULL, NULL, '982778930', '51020150', 'R Aristides Muniz, 121', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:29:54'),
(126, 'RAFAEL RICARDO DE OLIVEIRA TRAVASSOS', '01378677439', NULL, NULL, '996487159', '50610160', 'R Hermógenes de Morais, 252', NULL, NULL, 'Madalena', 'Recife', 'PE', '2025-10-28 12:29:54'),
(127, 'RAILTON BEZERRA DE MELO', '27511278434', NULL, NULL, '34239120', '52010260', 'R Jornalista Paulo Bittencourt, SN', NULL, NULL, 'Derby', 'Recife', 'PE', '2025-10-28 12:29:54'),
(128, 'VANESSA CARDOSO PEREIRA', '92662277300', NULL, NULL, '988650112', '56310785', 'R Ipê, 200', NULL, NULL, 'COHAB Massangano', 'Petrolina', 'PE', '2025-10-28 12:29:54'),
(129, 'VICTOR MARIANO DA SILVA', '70751786446', NULL, NULL, '999937174', '59040000', 'R Doutor Mário Negócio, 1885CASTIMOVEIS@GMAIL.COM', NULL, NULL, 'Alecrim', 'Natal', 'RN', '2025-10-28 12:29:54'),
(130, 'VINICIUS PEREIRA DANTAS', '09935154440', NULL, NULL, '987828860', '59056570', 'R Doutor José Gonçalves, SN', NULL, NULL, 'Lagoa Nova', 'Natal', 'RN', '2025-10-28 12:29:54'),
(131, 'WAGNER FRANCESCHINI', '07626658400', NULL, NULL, '35211751', '51030065', 'R Sá e Souza, SN', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:29:54'),
(132, 'WAGNER MENDES DA ENCARNACAO', '00294959700', NULL, NULL, '999101324', '59082120', 'R Antônio Madruga, 1959', NULL, NULL, 'Capim Macio', 'Natal', 'RN', '2025-10-28 12:29:54'),
(133, 'ISLY MARIA LUCENA DE BARROS', '58121781434', NULL, NULL, '987370656', '52060100', 'R Sebastião Alves, 81', NULL, NULL, 'Tamarineira', 'Recife', 'PE', '2025-10-28 12:29:54'),
(134, 'JOSE COUTINHO DO REGO NETO', '02711854493', NULL, NULL, '988390593', '51130040', 'R Major Armando de Souza Melo, SN', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:29:54'),
(135, 'JOSE DA SILVA RAMOS JUNIOR', '43125875404', NULL, NULL, '985857999', '53370530', 'R Atlântico, 32', NULL, NULL, 'Ouro Preto', 'Olinda', 'PE', '2025-10-28 12:29:54'),
(136, 'JOSÉ FRANCISCO VIEIRA DE PAULA', '12744336491', NULL, NULL, '999210016', '59618740', 'R Juvenal Lamartine, 562', NULL, NULL, 'Bom Jardim', 'Mossoró', 'RN', '2025-10-28 12:29:54'),
(137, 'JOSÉ HENRIQUE FELIX DE LISBOA', '08375966452', NULL, NULL, '973029722', '55012075', 'R Maria de Lourdes Casé Porto, 128', NULL, NULL, 'Maurício de Nassau', 'Caruaru', 'PE', '2025-10-28 12:29:54'),
(138, 'JOSÉ JOELSON ALVES DE LIMA JÚNIOR', '05166766440', NULL, NULL, '988787687', '56895000', 'R Cassiano Gomes da Silva , 198', NULL, NULL, 'Centro', 'Santa Cruz da Baixa Verde', 'PE', '2025-10-28 12:29:54'),
(139, 'JOSÉ LEUDO FREITAS HIPOLITO', '04001295407', NULL, NULL, '998592318', '58707060', 'R José Crispim, 76', NULL, NULL, 'Monte Castelo', 'Patos', 'PB', '2025-10-28 12:29:54'),
(140, 'JOSÉ ROBERTO BRITTO LOPES', '56646887420', NULL, NULL, '999837817', '59020300', 'AV Campos Sales, 762', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:29:54'),
(141, 'JOSÉ ROBERTO COELHO FERREIRA ROCHA', '06747632460', NULL, NULL, '999013122', '56327025', 'R Sobradinho, 30', NULL, NULL, 'Boa Esperança', 'Petrolina', 'PE', '2025-10-28 12:29:54'),
(142, 'JOSEMARIO MARINHO', '02996062442', NULL, NULL, '992003821', '59108500', 'AV Doutor José Francisco da Silva, RN', NULL, NULL, 'Potengi', 'Natal', 'RN', '2025-10-28 12:29:54'),
(143, 'JOVANE PEREIRA DANTAS', '48070688491', NULL, NULL, '999333337', '59140971', 'R Tenente Osório, 825', NULL, NULL, 'Santos Reis', 'Parnamirim', 'PE', '2025-10-28 12:29:54'),
(144, 'JULIA NOBREGA DE BRITO', '07766680483', NULL, NULL, '933107882', '51011220', 'R Atlântico, 62', NULL, NULL, 'Pina', 'Recife', 'PE', '2025-10-28 12:29:54'),
(145, 'WALDIR TENORIO', '02049448481', NULL, NULL, '981439999', '56912440', 'R Inocêncio Gomes de Andrade, 696', NULL, NULL, 'Nossa Senhora da Penha', 'Serra Talhada', 'PE', '2025-10-28 12:29:54'),
(146, 'WALTER AUGUSTO RICARTE DE AZEVEDO', '05002390455', NULL, NULL, '91223254', '58030230', 'AV Acre, 601', NULL, NULL, 'Estados', 'João Pessoa', 'PB', '2025-10-28 12:29:54'),
(147, 'WASHIRGTON SOARES', '03620847428', NULL, NULL, '999767984', '52020015', 'R da Hora, 593', NULL, NULL, 'Espinheiro', 'Recife', 'PE', '2025-10-28 12:29:54'),
(148, 'WELLIGTON NASCIMENTO DA TRINDADE', '10655729488', NULL, NULL, '996443941', '59054440', 'R Escritora Myriam Coeli, 17', NULL, NULL, 'Dix-Sept Rosado', 'Natal', 'RN', '2025-10-28 12:29:54'),
(149, 'WILLIAM NOVAES DE GOIS', '48745570582', NULL, NULL, '99928061', '51021070', 'AV Hélio Falcão, 415', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:29:54'),
(150, 'XENIA JACINTO SANTOS', '01061979407', NULL, NULL, '988416858', '54759380', 'R dos Lírios, 7', NULL, NULL, 'Bairro Novo do Carmelo', 'Camaragibe', 'PE', '2025-10-28 12:29:54'),
(151, 'ZENILDO NUNES DA SILVA', '25018574453', NULL, NULL, '988752298', '56315070', 'R Professor Auri Campos Coelho , 120', NULL, NULL, 'Alto do Cocar', 'Petrolina', 'PE', '2025-10-28 12:29:54'),
(152, 'KENNYO ESTEVÃO FERNANDES SANTOS', '07816874464', NULL, NULL, '981824455', '59082210', 'R José Mauro de Vasconcelos, 1915', NULL, NULL, 'Capim Macio', 'Natal', 'RN', '2025-10-28 12:29:54'),
(153, 'LAMBERTO DE OLIVEIRA SALES NETO', '74780450497', NULL, NULL, '87376112', '52060100', 'R Sebastião Alves, SN', NULL, NULL, 'Tamarineira', 'Recife', 'PE', '2025-10-28 12:29:54'),
(154, 'LEANDRO BOBRZIK', '88221326020', NULL, NULL, '986740650', '55016410', 'AV Monte Cassino, SN', NULL, NULL, 'Universitário', 'Caruaru', 'PE', '2025-10-28 12:29:54'),
(155, 'LEDA ALVES DA SILVA GOMES', '81737190478', NULL, NULL, '987408125', '58028700', 'R Professora Maria Ester Bezerra Mesquita, 275', NULL, NULL, 'Ipês', 'João Pessoa', 'PB', '2025-10-28 12:29:54'),
(156, 'LELA CRISTINA DE MORAIS VILARINHO', '90411129449', NULL, NULL, '996362835', '59148900', 'EST para CATRE, SN', NULL, NULL, 'Emaús', 'Parnamirim', 'RN', '2025-10-28 12:29:54'),
(157, 'LEONCIO BEM SIDRIM', '09532139435', NULL, NULL, '981566845', '51020120', 'R Amaro Albino Pimentel, 101', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:29:54'),
(158, 'LOUISIANE CAROL RIBEIRO', '01246689413', NULL, NULL, '988155831', '56312385', 'AV Professor Simão Amorim Durando, 363', NULL, NULL, 'São Gonçalo', 'Petrolina', 'PE', '2025-10-28 12:29:54'),
(159, 'LUAN MARTINS', '07553792411', NULL, NULL, '999694503', '58704000', 'R Horácio Nóbrega, 695', NULL, NULL, 'Belo Horizonte', 'Patos', 'PB', '2025-10-28 12:29:54'),
(160, 'LUCAS CAVALCANTE NOVAES NETO', '05776289416', NULL, NULL, '982626789', '56180000', 'R Treze de Maio, SN', NULL, NULL, 'Centro', 'Cabrobó', 'PE', '2025-10-28 12:29:54'),
(161, 'LUCAS EDUARDO', '04839353360', NULL, NULL, '998697239', '52050060', 'AV Doutor Malaquias, 145', NULL, NULL, 'Graças', 'Recife', 'PE', '2025-10-28 12:29:54'),
(162, 'LUCAS MARQUES ALECRIM', '05523965405', NULL, NULL, '996554880', '51021360', 'R Desembargador João Paes, SN', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:29:54'),
(163, 'LUCAS XAVIER', '94782407300', NULL, NULL, '999088870', '58010001', 'AV Beaurepaire Rohan, SN', NULL, NULL, 'Centro', 'João Pessoa', 'PB', '2025-10-28 12:29:54'),
(164, 'ACACINEIDE CAMILO DINIZ', '96394498491', NULL, NULL, '982144710', '58125000', 'R JOSÉ SALDANHA, 455', '455', NULL, 'CENTRO', 'Alagoa Nova', 'PB', '2025-10-28 12:29:54'),
(165, 'ADRIANO COSTA DO NASCIMENTO', '81311923420', NULL, NULL, '996323339', '59065080', 'R Manhã Parnasiana, 3562', NULL, NULL, 'Candelária', 'Natal', 'RN', '2025-10-28 12:29:54'),
(166, 'ADRIANO GURGEL', '55660274900', NULL, NULL, '96230808', '59106028', 'R São João, 00', NULL, NULL, 'Igapó', 'Natal', 'RN', '2025-10-28 12:29:54'),
(167, 'AFONSO CELSO REIS E SILVA', '61882526104', NULL, NULL, '999525846', '59020240', 'R Ceará Mirim, 1140', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:29:54'),
(168, 'AGTONIO ANGELO DA CUNHA', '34250433404', NULL, NULL, '999584654', '59598000', 'R PRINCESA ISABEL, 8', NULL, NULL, 'CENTRO', 'Guamaré', 'RN', '2025-10-28 12:29:54'),
(169, 'ALEKSANDER DE AZEVEDO DANTAS', '67385214487', NULL, NULL, '987263987', '59300000', 'R Augusto Monteiro, 84', NULL, NULL, 'CENTRO', 'Caicó', 'RN', '2025-10-28 12:29:54'),
(170, 'ALEXANDRE ALMEIDA', '09663902450', NULL, NULL, '988854330', '58415443', 'R João Joviano de Medeiros, 211', NULL, NULL, 'Cruzeiro', 'Campina Grande', 'PB', '2025-10-28 12:29:54'),
(171, 'ALINNE GONCALVES BARBOSA DOS SANTOS', '08355534425', NULL, NULL, '999981405', '55014320', 'AV Doutor Pedro Jordão, 955', NULL, NULL, 'Maurício de Nassau', 'Caruaru', 'PE', '2025-10-28 12:29:54'),
(172, 'IMARA CORREIA DE QUEIROZ BARBOSA', '02716519463', NULL, NULL, NULL, '58410003', 'R Benjamin Constant, 170', NULL, NULL, 'Estação Velha', 'Campina Grande', 'PB', '2025-10-28 12:29:54'),
(173, 'LUCIANA DA ROCHA CABRAL', '05449270445', NULL, NULL, '995214180', '56200000', 'R Mimosa, 987', NULL, NULL, 'Capela de São Braz', 'Ouricuri', 'PE', '2025-10-28 12:29:54'),
(174, 'MARCELO ROSENDO', '04678774408', NULL, NULL, '997860486', '55016520', 'R Vitor Hugo, 61', NULL, NULL, 'Universitário', 'Caruaru', 'PE', '2025-10-28 12:29:54'),
(175, 'MARCKSON J. DE SOUZA ASSIS', '03898811476', NULL, NULL, '991043772', '59070500', 'AV Rio Grande do Norte, SN', NULL, NULL, 'Cidade da Esperança', 'Natal', 'RN', '2025-10-28 12:29:54'),
(176, 'MARCOS ANTONIO FERREIRA DO NASCIMENTO', '28939522400', NULL, NULL, '996571046', '59380000', 'R Rozildo Pereira, 190', NULL, NULL, 'Parque Dourado', 'Currais Novos', 'RN', '2025-10-28 12:29:54'),
(177, 'MARCUS VINICIUS LIMA DE BARROS CARVALHO', '05385641480', NULL, NULL, '999227441', '58200000', 'R Dr.  João Benevides, 5', NULL, NULL, 'Bairro novo', 'Guarabira', 'PB', '2025-10-28 12:29:54'),
(178, 'MARIA ARYANNE AURÉLIO DA COSTA BEZERRA', '06071709482', NULL, NULL, '99872529', '56700000', 'AV Brasil, 200', NULL, NULL, 'jardim Boa Vista', 'São José do Egito', 'PE', '2025-10-28 12:29:54'),
(179, 'ALLAN DHEYVSON FELIZOLA LUCENA', '65288440387', NULL, NULL, '999848829', '58765000', 'AV Governador João Agripino Filho, 100', NULL, NULL, 'CENTRO', 'Piancó', 'PB', '2025-10-28 12:29:54'),
(180, 'ALMIR BARBOSA DOS SANTOS', '65671490430', NULL, NULL, '999813061', '55014320', 'AV Doutor Pedro Jordão, 950', NULL, NULL, 'Maurício de Nassau', 'Caruaru', 'PE', '2025-10-28 12:29:54'),
(181, 'ANDRE LUIZ CORREIA RAMOS', '03082109489', NULL, NULL, '988405100', '58400122', 'R Sandra Borborema, 61', NULL, NULL, 'Centro', 'Campina Grande', 'PB', '2025-10-28 12:29:54'),
(182, 'ANDRE RICARDO DO SANTOS TABOSA', '02155868405', NULL, NULL, '996398877', '55016480', 'AV José Mariano de Lima, 119', NULL, NULL, 'Universitário', 'Caruaru', 'PE', '2025-10-28 12:29:54'),
(183, 'ANGELICA SOUZA FRANÇA ROCHA', '05467120450', NULL, NULL, '35232605', '59507000', 'R OURO NEGRO, 216', NULL, NULL, 'CENTRO', 'Alto do Rodrigues', 'RN', '2025-10-28 12:29:54'),
(184, 'ANTONIO AMORIM DE ARAUJO FILHO', '01078987483', NULL, NULL, '996072244', '59015060', 'R Almeida Castro, 998', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:29:54'),
(185, 'ANTONIO AROLDO TEXEIRA JÚNIOR', '05458127390', NULL, NULL, '981095259', '59020310', 'R Doutor João Chaves, 940', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:29:54'),
(186, 'Antônio Diego Campos Falcão', '92297455453', NULL, NULL, '988771972', '50610000', 'R Real da Torre, 292', NULL, NULL, 'Madalena', 'Recife', 'PE', '2025-10-28 12:29:54'),
(187, 'ANTÔNIO FLÁVIO ARAÚJO MENDES', '01201793181', NULL, NULL, '73304205', '51011902', 'AV Engenheiro Domingos Ferreira, 636', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:29:54'),
(188, 'Milena Maria dos Santos Honório', '90727380478', NULL, NULL, '985893784', '54315013', 'TRA Travessa Estrada da Batalha, 1615', NULL, NULL, 'Prazeres', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:29:54'),
(189, 'ANTÔNIO GODÊ DE MORAES', '04330144409', NULL, NULL, '998359641', '56820000', 'R Dr. Roberto nogueira lima, 216', NULL, NULL, 'CENTRO', 'Carnaíba', 'PE', '2025-10-28 12:29:54'),
(190, 'ANTONIO ITALO ALVES DE SOUSA', '03501654405', NULL, NULL, '996677659', '59607070', 'AV Professor Gilberto Ferreira de Melo, 608', NULL, NULL, 'Aeroporto', 'Mossoró', 'RN', '2025-10-28 12:29:54'),
(191, 'ARICESA GELIANE FARIAS RIBEIRO', '01094020303', NULL, NULL, '991223254', '58043150', 'R Manoel Gualberto, 601', NULL, NULL, 'Miramar', 'João Pessoa', 'PB', '2025-10-28 12:29:54'),
(192, 'ARISTÓFILO COELHO DA SILVA', '09339097483', NULL, NULL, '996153435', '56328160', 'R Duarte Coelho, 50', NULL, NULL, 'Vila Eduardo', 'Petrolina', 'PE', '2025-10-28 12:29:54'),
(193, 'ARLETE BORGES DOMINGUES', '16034279453', NULL, NULL, '991067806', '58052000', 'R Bancário Sérgio Guerra, 33', NULL, NULL, 'Anatólia', 'João Pessoa', 'PB', '2025-10-28 12:29:54'),
(194, 'ARTHUR CARVALHO DE MACEDO', '08707018436', NULL, NULL, '998009596', '59215000', 'PCA DIX SEPT ROSADO, 136', NULL, NULL, 'CENTRO', 'Nova Cruz', 'RN', '2025-10-28 12:29:54'),
(195, 'BENEDITO SAVIO DURAND GOMES', '39521761415', NULL, NULL, '988321962', '58401462', 'R Deputado Norberto Leal, 980', NULL, NULL, 'Alto Branco', 'Campina Grande', 'PB', '2025-10-28 12:29:54'),
(196, 'BRUNA COELHO DE MACEDO', '10270109463', NULL, NULL, '999679730', '56355000', 'R José Coelho de Macedo, 409', NULL, NULL, 'Centro', 'Dormentes', 'PE', '2025-10-28 12:29:54'),
(197, 'BRUNO FERREIRA DE ARAUJO', '00963056492', NULL, NULL, '991098398', '59162000', 'R BARAO DE MIPIBU, 56', NULL, NULL, 'Centro', 'São José de Mipibu', 'RN', '2025-10-28 12:29:54'),
(198, 'BRUNO JOSÉ PEIXOTO COUTINHO', '04329107430', NULL, NULL, '999790704', '50610140', 'R Altinho, 70', NULL, NULL, 'Madalena', 'Recife', 'PE', '2025-10-28 12:29:54'),
(199, 'BRUNO RICARDO TELES', '09996768490', NULL, NULL, '991442113', '55540000', 'R PIAUI, 789', NULL, NULL, 'SANTO ONOFRE', 'Palmares', 'PE', '2025-10-28 12:29:54'),
(200, 'CARLOS ANTÔNIO ARAUJO OLIVEIRA', '37380109472', NULL, NULL, '99651223', '58900000', 'R CAJAZEIRA, 00', NULL, NULL, 'Centro', 'Cajazeiras', 'PB', '2025-10-28 12:29:54'),
(201, 'CARLOS EUGENIO VEIGA DOS SANTOS', '09783466453', NULL, NULL, '996108000', '55298040', 'R Fernando Cordeiro de Melo, 12', NULL, NULL, 'Heliópolis', 'Garanhuns', 'PE', '2025-10-28 12:29:54'),
(202, 'Gerson Barbosa do Nascimento', '52398579468', NULL, NULL, '94813101', '59300000', 'LOC Av. Cel. Martiniano, 460', NULL, NULL, 'Centro', 'Caicó', 'RN', '2025-10-28 12:29:54'),
(203, 'DIEGO VITAL CAMPOS', '04558921489', NULL, NULL, '999759569', '55012075', 'R Maria de Lourdes Casé Porto, 51', NULL, NULL, 'Maurício de Nassau', 'Caruaru', 'PE', '2025-10-28 12:29:54'),
(204, 'DIOGO RODRIGUES DA SILVA', '04138529462', NULL, NULL, '989942772', '52011050', 'R Amélia, 430', NULL, NULL, 'Graças', 'Recife', 'PE', '2025-10-28 12:29:54'),
(205, 'DIXON FRADIK MEDEIROS LIMA', '02698915447', NULL, NULL, '987176157', '59607330', 'AV João da Escóssia, 1728', NULL, NULL, 'Nova Betânia', 'Mossoró', 'RN', '2025-10-28 12:29:54'),
(206, 'ESDRAS GASPAR', '04735064400', NULL, NULL, '987054712', '50070280', 'R Joaquim de Brito, 00', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:29:54'),
(207, 'ITALO KUMAMOTO', '81140753258', NULL, NULL, '93026680', '58040491', 'AV Rui Barbosa, 00', NULL, NULL, 'Torre', 'João Pessoa', 'PB', '2025-10-28 12:29:54'),
(208, 'CAROL VIRGINIA GOIS LEANDRO', '75470500420', NULL, NULL, '987827424', '55608680', 'R Alto do Reservatório, 00', NULL, NULL, 'Bela Vista', 'Vitória de Santo Antão', 'PE', '2025-10-28 12:29:54'),
(209, 'CÍCERO SABINO NETO', '06975973423', NULL, NULL, '996128193', '59960000', 'R Antônio Alves Pontes, 220', NULL, NULL, 'CENTRO', 'Pilões', 'RN', '2025-10-28 12:29:54'),
(210, 'CINTIA KELLY MONTEIRO DE OLIVEIRA', '03804807437', NULL, NULL, '987516147', '55016360', 'AV Brasil, 1247', NULL, NULL, 'Universitário', 'Caruaru', 'PE', '2025-10-28 12:29:54'),
(211, 'CLÁUDIO D\' AVILA LINS FILHO', '69005028491', NULL, NULL, '996284878', '58045010', 'AV Cabo Branco, 3144', NULL, NULL, 'Cabo Branco', 'João Pessoa', 'PB', '2025-10-28 12:29:54'),
(212, 'CREUZA MACEDO GOES ROCHA', '01789234514', NULL, NULL, '999988580', '59062530', 'R Tereza Campos, 2468', NULL, NULL, 'Lagoa Nova', 'Natal', 'RN', '2025-10-28 12:29:54'),
(213, 'DANIEL VILELA DE HOLANDA', '01342890485', NULL, NULL, '988422955', '51190575', 'AV Senador Robert Kennedy, 511', NULL, NULL, 'Imbiribeira', 'Recife', 'PE', '2025-10-28 12:29:54'),
(214, 'DANIELLE RODRIGUES BARBOZA', '01960839403', NULL, NULL, '991062306', '52050180', 'PCA Professor Fleming, 117', NULL, NULL, 'Jaqueira', 'Recife', 'PE', '2025-10-28 12:29:54'),
(215, 'DANILO BRENO AMORIN NUNES', '07932800447', NULL, NULL, '999210518', '58010001', 'AV Beaurepaire Rohan, 00', NULL, NULL, 'Centro', 'João Pessoa', 'PB', '2025-10-28 12:29:54'),
(216, 'DAVI BARBOSA SOARES', '09923621480', NULL, NULL, '995634702', '50720605', 'R Bráulio Gonçalves, 3', NULL, NULL, 'Madalena', 'Recife', 'PE', '2025-10-28 12:29:54'),
(217, 'DAYVSON DA SILVA BRÁS', '08362330422', NULL, NULL, '999572888', '59151490', 'R Rosilda Melo, 333', NULL, NULL, 'Nova Parnamirim', 'Parnamirim', 'RN', '2025-10-28 12:29:54'),
(218, 'DÉLIO YANE OLIVEIRA DE MEDEIROS', '05195254427', NULL, NULL, '981911296', '59300000', 'R Manoel Felipe, 95', NULL, NULL, 'Centro', 'Caicó', 'RN', '2025-10-28 12:29:54'),
(219, 'DEMOSTENES BATISTA VERAS', '22628770415', NULL, NULL, '981152018', '55012040', 'AV Oswaldo Cruz, 217', NULL, NULL, 'Maurício de Nassau', 'Caruaru', 'PE', '2025-10-28 12:29:54'),
(220, 'EDELVAN CARNEIRO HOLANDO', '04771640300', NULL, NULL, '987294595', '50070280', 'R Joaquim de Brito, 240', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:29:54'),
(221, 'EDILSON RUBEM CAVANCANTI ANDRADE', '28106067491', NULL, NULL, '999983215', '56304210', 'R Tobias Barreto, 8', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:29:54'),
(222, 'EDMILSON HENAUTH', '86263692472', NULL, NULL, '999746498', '55680000', 'R 13 DE MAIO, 110', NULL, NULL, 'CENTRO', 'Bonito', 'PE', '2025-10-28 12:29:54'),
(223, 'EDSON VIANA DA SILVA', '04155110466', NULL, NULL, '994078969', '55700000', 'R VIGARIO JOAQUIM PINTO, 238', NULL, NULL, 'CENTRO', 'Limoeiro', 'PE', '2025-10-28 12:29:54'),
(224, 'EDUARDO ZAPATERRA CAMPOS', '35100696842', NULL, NULL, '997820005', '50670901', 'AV Professor Moraes Rego, 1235', NULL, NULL, 'Iputinga', 'Recife', 'PE', '2025-10-28 12:29:54'),
(225, 'ELDER GIL ALVES DA CRUZ', '04228742483', NULL, NULL, '999530289', '56000000', 'R Joaquim Sampaio, 178', NULL, NULL, 'Nossa Senhora das Graças', 'Salgueiro', 'PE', '2025-10-28 12:29:54'),
(226, 'EMANUEL KENNEDY FEITOSA LIMA', '00816195374', NULL, NULL, '996860815', '59625900', 'AV Francisco Mota, 572', NULL, NULL, 'Presidente Costa e Silva', 'Mossoró', 'RN', '2025-10-28 12:29:54'),
(227, 'EMILIO DIAS COSTA', '02728576459', NULL, NULL, '999846161', '55865000', 'R Jair da Cunha Andrade, 51', NULL, NULL, 'Centro', 'Macaparana', 'PE', '2025-10-28 12:29:54'),
(228, 'EPITÁCIO LEITE ROLIM FILHO', '80582656400', NULL, NULL, '988043333', '50610100', 'AV Beira Rio Governador Eduardo Campos, 825', NULL, NULL, 'Madalena', 'Recife', 'PE', '2025-10-28 12:29:54'),
(229, 'ERIEGLY DE SOUSA SANTOS', '04041797462', NULL, NULL, '996316525', '58187000', 'AV CASTELO BRANCO, 331', NULL, NULL, 'MONTE SANTO', 'Picuí', 'PB', '2025-10-28 12:29:54'),
(230, 'FABIO FERNANDES', '02768026409', NULL, NULL, '993422525', '58010001', 'AV Beaurepaire Rohan, 00', NULL, NULL, 'Centro', 'João Pessoa', 'PB', '2025-10-28 12:29:54'),
(231, 'MARIA DAMIANA ARAÚJO DE MORAIS', '01832464466', NULL, NULL, '996820507', '59343000', 'AV DOUTOR FERNANDES, 479', NULL, NULL, 'CENTRO', 'Jardim do Seridó', 'RN', '2025-10-28 12:29:54'),
(232, 'FABYANA DE ANDRADE', '02058504488', NULL, NULL, '991425979', '53130390', 'R João Clementino Montarroyos, 178', NULL, NULL, 'Casa Caiada', 'Olinda', 'PE', '2025-10-28 12:29:54'),
(233, 'FELIPE CABRAL', '04601347440', NULL, NULL, '996624888', '59612045', 'R Dona Lidinha Falcão, 1301', NULL, NULL, 'Bela Vista', 'Mossoró', 'RN', '2025-10-28 12:29:54'),
(234, 'FELIPE DOMINGOS LIMA', '05683492459', NULL, NULL, '988377546', '56308185', 'R Manoel Antônio Galdino, 80', NULL, NULL, 'Atrás da Banca', 'Petrolina', 'PE', '2025-10-28 12:29:54'),
(235, 'FELIX LIMA', '40199029415', NULL, NULL, '986097162', '55900000', 'R da Telpe, SN', NULL, NULL, 'Centro', 'Goiana', 'PE', '2025-10-28 12:29:54'),
(236, 'FERNANDO ANTÔNIO MOUTINHO FONTELLES FILHO', '07426126439', NULL, NULL, '997977374', '52030172', 'R Marechal Deodoro, 570', NULL, NULL, 'Encruzilhada', 'Recife', 'PE', '2025-10-28 12:29:54'),
(237, 'FLAVIO ALISSON DE CARVALHO', '04360408404', NULL, NULL, '988828080', '51021220', 'R Doutor Raul Lafayette, 80', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:29:54'),
(238, 'FRANCILINO RODRGUES LEITE RANGEL', '07667646643', NULL, NULL, '996991112', '58046088', 'R Bancário Elias Feliciano Madruga, 300', NULL, NULL, 'Altiplano Cabo Branco', 'João Pessoa', 'PB', '2025-10-28 12:29:54'),
(239, 'FRANCISCO DA PAZ SIQUEIRA', '12669822487', NULL, NULL, '986221327', '58400052', 'AV Presidente Getúlio Vargas, 625', NULL, NULL, 'Centro', 'Campina Grande', 'PB', '2025-10-28 12:29:54'),
(240, 'FRANCISCO DE ASSIS ALVES DE SOUSA', '04000196472', NULL, NULL, '83342134', '58700450', 'R Peregrino Filho, 322', NULL, NULL, 'Centro', 'Patos', 'PB', '2025-10-28 12:29:54'),
(241, 'FRANCISCO JESUS ALONSO CRUZ', '01477728422', NULL, NULL, '999549081', '55016755', 'AL Gercino Tabosa, 1', NULL, NULL, 'Universitário', 'Caruaru', 'PE', '2025-10-28 12:29:54'),
(242, 'FRANCISCO JURANDIR DE LIMA JUNIOR', '08325977400', NULL, NULL, '981414750', '59108210', 'R Campo Maior, 3680', NULL, NULL, 'Potengi', 'Natal', 'RN', '2025-10-28 12:29:54'),
(243, 'FRANCISCO NAPOLEÃO TULIO VARELA BARCA', '87791803453', NULL, NULL, '996322210', '59611190', 'R Jeremias da Rocha, 123', NULL, NULL, 'Santo Antônio', 'Mossoró', 'RN', '2025-10-28 12:29:54'),
(244, 'ALYSSON RODRIGO FERREIRA CAVALCANTI', '01960554409', NULL, NULL, '988123778', '56332710', 'AV João Pernambuco, 935', NULL, NULL, 'Fernando Idalino', 'Petrolina', 'PE', '2025-10-28 12:29:54'),
(245, 'DEBORA VITORIA SANTOS', '70720749450', NULL, NULL, '993020519', '56328900', 'AV Cardoso de Sá, KM 2', NULL, NULL, 'Vila Eduardo', 'Petrolina', 'PE', '2025-10-28 12:29:54'),
(246, 'MISAEL MUSTAFA DA SILVA', '77441893453', NULL, NULL, '992619196', '53030010', 'AV Presidente Getúlio Vargas, 1605', NULL, NULL, 'Bairro Novo', 'Olinda', 'PE', '2025-10-28 12:29:54'),
(247, 'DANILO CESAR OLIVEIRA DE CERQUEIRA', '07272982403', NULL, NULL, '993027717', '57265060', 'R Pedro Macário, 99', NULL, NULL, 'Centro', 'Teotônio Vilela', 'AL', '2025-10-28 12:29:54'),
(248, 'SILVIA HELENA PESSOA DE OLIVEIRA', '05536446452', NULL, NULL, NULL, '52060000', 'AV Parnamirim, 95', NULL, NULL, 'Parnamirim', 'Recife', 'PE', '2025-10-28 12:29:54'),
(249, 'TARCISIO ESDRAS ARAUJO MOURA', '01170609414', NULL, NULL, '91647972', '56328020', 'AV Cardoso de Sá, 312', NULL, NULL, 'Vila Eduardo', 'Petrolina', 'PE', '2025-10-28 12:29:54'),
(250, 'ARNALDO LUIS MORTATTI', '15986356896', NULL, NULL, NULL, '59092500', 'AV Deputado Antônio Florêncio de Queiroz, 2995', NULL, NULL, 'Ponta Negra', 'Natal', 'RN', '2025-10-28 12:29:54'),
(251, 'MARIA LETICIA GONÇALVES GUERRA DE OLIVEIRA', '02406154416', NULL, NULL, NULL, '50050290', 'AV Governador Agamenon Magalhães, 2291', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:29:54'),
(252, 'SIDNEY SANTOS DE MORAIS', '08364643460', NULL, NULL, '997487635', '50630170', 'R Paes Cabral, 88', NULL, NULL, 'Cordeiro', 'Recife', 'PE', '2025-10-28 12:29:54'),
(253, 'JACQUES VOLNEI BARCELOS DOS SANTOS', '54767040000', NULL, NULL, '999198414', '57038760', 'R Coronel Mário Saraiva, 44', NULL, NULL, 'Guaxuma', 'Maceió', 'AL', '2025-10-28 12:29:54'),
(254, 'ALINE DE FREITAS BRITO', '05669126432', NULL, NULL, '999331400', '50710510', 'R Costa Gomes, 150', NULL, NULL, 'Madalena', 'Recife', 'PE', '2025-10-28 12:29:54'),
(255, 'CAMILA QUEIROGA DA SILVEIRA', '01883464579', NULL, NULL, '996414455', '50800090', 'R Alcides Codeceira, 320', NULL, NULL, 'Iputinga', 'Recife', 'PE', '2025-10-28 12:29:54'),
(256, 'DR. IVONEI FACHINELLO', '60594659272', NULL, NULL, '999169875', '55012040', 'AV Oswaldo Cruz, 217', NULL, NULL, 'Maurício de Nassau', 'Caruaru', 'PE', '2025-10-28 12:29:54'),
(257, 'JOSÉ WINALAN OLIVEIRA', '06623446427', NULL, NULL, '996529748', '55014287', 'R Moreno, 19', NULL, NULL, 'Maurício de Nassau', 'Caruaru', 'PE', '2025-10-28 12:29:54'),
(258, 'LUCAS IAN', '09887951404', NULL, NULL, '999504740', '52020070', 'R Barão de Itamaracá, 78', NULL, NULL, 'Espinheiro', 'Recife', 'PE', '2025-10-28 12:29:54'),
(259, 'MAURICIO NUNES DA SILVA', '05125901768', NULL, NULL, '34232022', '50050290', 'AV Governador Agamenon Magalhães, 2291', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:29:54'),
(260, 'CLAUDIA SORELLE CAVALCANTI SANTANA', '05785348438', NULL, NULL, '994275313', '55200000', 'R Salvino Burgos, 103', NULL, NULL, 'Pedra Redonda', 'Pesqueira', 'PE', '2025-10-28 12:29:54'),
(261, 'JOÃO DE ASSIS ALVES JUNIOR', '02347297406', NULL, NULL, '998156888', '55720000', 'R Coronel José Ferreira da Silva, 58', NULL, NULL, 'Boa Vista', 'João Alfredo', 'PE', '2025-10-28 12:29:54'),
(262, 'DEBORA SILVA', '09991303405', NULL, NULL, '996262745', '55670000', 'R José Gomes Cabral, 181', NULL, NULL, 'Centro', 'São Joaquim do Monte', 'PE', '2025-10-28 12:29:54'),
(263, 'RAONI REGO SOARES', '01417647400', NULL, NULL, '981497067', '55292272', 'AV Bom Pastor, S/N', NULL, NULL, 'Boa Vista', 'Garanhuns', 'PE', '2025-10-28 12:29:54'),
(264, 'FRED TENORIO LIMA', '05004308454', NULL, NULL, '981238800', '55292715', 'R Professora Maria das Mercês Vieira, 08', NULL, NULL, 'Boa Vista', 'Garanhuns', 'PE', '2025-10-28 12:29:54'),
(265, 'AUGUSTO CESAR SOARES DE AMORIM', '10142401404', NULL, NULL, '999384224', '56506520', 'R Idelfonso Freire, 02', NULL, NULL, 'Centro', 'Arcoverde', 'PE', '2025-10-28 12:29:54'),
(266, 'SALIANA MACEDO', '06298827463', NULL, NULL, '992046024', '55140000', 'R Theodomiro das Neves , S/N', NULL, NULL, 'Tacaimbó', 'Tacaimbó', 'PE', '2025-10-28 12:29:54'),
(267, 'STEPHANO KELPS DOS SANTOS SÁ', '07416361400', NULL, NULL, '999149606', '56400000', 'R Coronel Francisco Barros do Nascimento , 429', NULL, NULL, 'Centro', 'Floresta', 'PE', '2025-10-28 12:29:54'),
(268, 'FERNANDO FRANÇA', '02735434400', NULL, NULL, '988123779', '56332465', 'AV Melquíades Quirino, 140', NULL, NULL, 'Pedra do Bode', 'Petrolina', 'PE', '2025-10-28 12:29:54'),
(269, 'MARIA BETANIA RODRIGUES BEZERRA', '93700075472', NULL, NULL, NULL, '59022000', 'AV Senador Salgado Filho, 1718', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:29:54'),
(270, 'MARIA CICERA NICACIO DE SOUZA', '78800080472', NULL, NULL, '991101653', '57160000', 'R  DAS OSTRAS, 26', NULL, NULL, 'FRANCES', 'Marechal Deodoro', 'AL', '2025-10-28 12:29:54'),
(271, 'ADSON DE ALMEIDA LOPES', '01119113466', NULL, NULL, '999326666', '57030170', 'AV Doutor Antônio Gouveia, 952', NULL, NULL, 'Pajuçara', 'Maceió', 'AL', '2025-10-28 12:29:54'),
(272, 'ANA CATARINA DE MORAES BARROS CAMPOS', '04365468413', NULL, NULL, NULL, '50070280', 'R Joaquim de Brito, 240', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:29:54'),
(273, 'DAVYD MARCONDY DE OLIVEIRA ALVES', '', NULL, NULL, '', '55022150', 'Rua João Faustino Vila Nova', '156', NULL, 'Rendeiras', 'Caruaru', 'PE', '2025-12-09 12:52:30'),
(280, 'RENAN FIGUEIREDO', '06516246473', NULL, 'renanffreitas@gmail.com', '83996515455', '58.500000', NULL, NULL, NULL, NULL, 'Monteiro', 'PB', '2026-01-13 12:28:48'),
(281, 'Douglas Primo da Silva', '10783036493', NULL, 'primodouglasdp@gmail.com', '81997201677', '50040-180', 'Rua Dois de Julho', '251', NULL, 'Santo Amaro', 'Recife', 'PE', '2026-01-27 15:11:38'),
(282, 'teste', '09797941450', NULL, NULL, '', '53090520', 'Rua Setenta e Sete', NULL, NULL, 'Rio Doce', 'Olinda', 'PE', '2026-02-07 20:41:23'),
(283, 'AUDES DIOGENES DE MAGALHÃES FEITOSA ', '59467770415', NULL, NULL, '', '50610000', 'Rua Real da Torre', NULL, NULL, 'Madalena', 'Recife', 'PE', '2026-02-12 20:51:37'),
(290, 'Dr. Leonardo', '00000000000', NULL, 'frpe@frpe.com.br', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-09 18:34:46'),
(291, 'FERNANDA VITORIA FRAGOSO SALES ', '13402921499', NULL, NULL, '8198067870', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-24 14:31:50'),
(295, 'DR. IGOR COSTA ', '000000000000', NULL, NULL, '87988680115', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-01 20:53:40');

-- --------------------------------------------------------

--
-- Estrutura para tabela `commissionconfig`
--

CREATE TABLE `commissionconfig` (
  `id` int(11) NOT NULL,
  `usuarioid` int(11) NOT NULL,
  `metamensal` decimal(15,2) DEFAULT 0.00,
  `salariofixo` decimal(15,2) DEFAULT 0.00,
  `percentualcomissao` decimal(5,2) DEFAULT 1.00,
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `commission_config`
--

CREATE TABLE `commission_config` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `meta_mensal` decimal(15,2) DEFAULT 0.00,
  `salario_fixo` decimal(15,2) DEFAULT 0.00,
  `percentual_comissao` decimal(5,2) DEFAULT 1.00,
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `commission_config`
--

INSERT INTO `commission_config` (`id`, `usuario_id`, `meta_mensal`, `salario_fixo`, `percentual_comissao`, `ativo`) VALUES
(33, 2, 300000.00, 3000.00, 1.00, 1),
(34, 4, 300000.00, 3000.00, 1.00, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `contatos`
--

CREATE TABLE `contatos` (
  `id` int(11) NOT NULL,
  `organizacao_id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `cargo` varchar(255) DEFAULT NULL,
  `setor` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(50) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `contatos`
--

INSERT INTO `contatos` (`id`, `organizacao_id`, `nome`, `cargo`, `setor`, `email`, `telefone`, `data_criacao`) VALUES
(7, 915, 'Adila Aquino', NULL, 'Compras', 'adilaquinonascimento@yahoo.com', '11 99822-3342', '2025-11-14 18:55:33'),
(8, 591, 'MARIA JOSE', NULL, 'ADM', 'CLNICA@HCCARDIO.COM.BR', '84 8895-9254', '2025-11-17 18:03:50'),
(9, 916, 'Mayara', NULL, 'Administração', 'CONTABILIDADE@UNIT.BR', '(79) 3218-2140', '2025-11-24 12:22:01'),
(10, 448, 'Jelza', 'secretaria', 'Dr. Audes', NULL, ' 81 99610-4985', '2025-12-01 20:53:31'),
(11, 917, 'Roger', NULL, 'ADM', NULL, '81994432560', '2025-12-02 18:28:03'),
(12, 345, 'ARTUR ARAUJO', NULL, 'ADM', NULL, '81982427758', '2025-12-02 18:36:28'),
(13, 915, 'Adila Aquino', NULL, NULL, NULL, NULL, '2025-12-14 19:43:59'),
(14, 359, 'Sunderlene Abreu', 'Engenheira', 'Engenharia clínica', 'eclinicahse@gigavida.com.br', '81 33147914/999300164', '2026-01-09 12:42:05'),
(15, 937, 'Romualdo', NULL, 'compras', 'FINANCEIROEQUIPASAUDE@GMAIL.COM', '(83) 3271-3480 / 83 99404-2316', '2026-01-09 18:51:35'),
(16, 495, 'GILTON VASCONCELOS', 'secretaria', 'Engenharia clínica', 'SAUDE@TRIUNFO.PE.GOV.BR', '(87) 9105-5012/ (87) 3846-1365 (87)99961-1889', '2026-01-16 14:53:49'),
(17, 271, 'Jair', 'Gerente', NULL, NULL, '81 99954-9183', '2026-01-21 14:12:25'),
(18, 939, 'DIOGO FEITOSA ', 'Engenheiro', 'Engenharia clínica', 'engenhariaclinica@saudecaruaru.pe.gov.br', ' (81) 3701-2400/ (81) 3701-2437  (84) 99846-8546', '2026-01-23 21:11:33'),
(19, 936, 'a', NULL, NULL, 'FINANCEIROCUPER2@GMAIL.COM', '(81) 9223-6919', '2026-01-26 15:35:07'),
(20, 513, 'Pedro', 'Encarregado', 'Financeiro', NULL, ' 81 99195-6800 Pedro / 81 99955-9113 Edson', '2026-01-26 15:59:47'),
(21, 227, 'Emanuelle Araújo', 'Engenheira Clínica', 'Engeharia Clínica ', 'emanuelle.araujo@americasmed.com.br', '(81)991961430', '2026-01-27 13:48:14'),
(22, 617, 'HELMITON VIEIRA DE MOURA', 'SOCIO PROPIETARIO', 'DIRETORIA', NULL, '81998056286', '2026-01-29 18:24:42'),
(23, 940, 'GUILHERME', NULL, NULL, NULL, '(21) 2234-1928 /21 96920-0506', '2026-01-30 18:54:49'),
(24, 941, ' Dr Márcio Rossani - (83) 99372-4419', 'Diretor médico', 'Diretoria', 'CONTABILIDADE@UNIMED.CAMPINAGRANDE.BR', '(83) 2101-6579/ (83) 2101-657', '2026-02-02 17:55:50'),
(25, 942, 'Thatianne Lima', 'Assistente de compras', 'COMPRAS', 'compras.hec@fmsa.org.br', ' (81) 99438-2875 (Ligação e Whatsapp)', '2026-02-02 20:09:50'),
(26, 249, 'Nathália Giovanna ', 'Coordenadora de Tecnologia Médica', 'Engenharia Clínica', 'unimedmaternoinfantl@tecsaude.com.br', '(81)97331 5382', '2026-02-10 17:35:09'),
(27, 438, 'Arlindo Matias ', 'Superintendente de Compras', 'Compras', 'arlindo.filho@unimed.campinagrande.br', '(83)993066485', '2026-02-10 18:06:41'),
(28, 317, 'Dra Thaíza Nobre ', 'Pesquisadora', 'Fisioterapia', NULL, '(84)99625 0778', '2026-02-13 14:44:26'),
(29, 317, 'Dra Karol Souza ', 'Pesquisadora', 'Fisioterapia', NULL, '(83)988160210', '2026-02-19 16:24:54'),
(30, 841, 'Hugo Moura', 'Comprador', 'Compras', NULL, '(81)997311718', '2026-02-24 13:04:05'),
(31, 321, 'Allyson Bortoli', 'Engenheiro Clínico', 'Engeharia Clínica ', 'allyson.bortoli@rhp.com.br', '(81)992151604', '2026-02-25 18:45:35'),
(32, 952, 'Fátima', 'Enfermeira', 'Exames', NULL, '(81)988733139', '2026-02-25 18:56:23'),
(33, 954, 'DENIS CHARLES ALVES FERNANDES', 'Técnico em Segurança do Trabalho', 'Administração', 'denis.fernandes@aurenenergia.com.br', '(87) 8175-3946', '2026-03-03 19:58:34'),
(34, 561, 'Maria', 'Compradora', 'Administração', NULL, ' 84 99983-8406', '2026-03-05 13:56:57'),
(35, 363, 'Hugo Cavalcanti', 'Coordenador de Compras', 'Compras', 'hugo.cavalcanti@fghsaude.org.br', '81997311718', '2026-03-24 11:38:06'),
(36, 28, 'Hélder Vasconcelos', 'Comprador', 'Administração', NULL, '81 97914-0403', '2026-03-27 17:07:35'),
(37, 967, 'Sheyla', NULL, 'Administração', NULL, '(83) 3365-1001/ (83) 3365-1058 (83) 98124-3711', '2026-03-31 14:07:28'),
(38, 53, 'Rodrigo', NULL, NULL, NULL, '11911402251', '2026-03-31 18:31:56'),
(39, 969, 'ANDREA SILVEIRA ', 'GERENTE ', NULL, 'gerencia_pe@apabb.org.br', '81 997930000', '2026-04-01 20:04:11'),
(40, 747, 'Henrique', 'Engenheiro Clínico', 'Engenharia Clínica', 'hgv@engebio-ne.com.br', '81988036781', '2026-04-06 18:28:07'),
(41, 43, 'Eduardo ', NULL, NULL, NULL, '81 98824-4190', '2026-04-08 17:58:09'),
(42, 972, 'Juliana ', NULL, NULL, 'julianajuly24@hotmail.com', NULL, '2026-04-10 19:55:24');

-- --------------------------------------------------------

--
-- Estrutura para tabela `empenhos`
--

CREATE TABLE `empenhos` (
  `id` int(11) NOT NULL,
  `oportunidade_id` int(11) NOT NULL,
  `numero` varchar(255) NOT NULL,
  `valor` decimal(10,2) NOT NULL DEFAULT 0.00,
  `data_emissao` date DEFAULT NULL,
  `data_prevista` date DEFAULT NULL,
  `documento_url` varchar(512) DEFAULT NULL,
  `documento_nome` varchar(255) DEFAULT NULL,
  `documento_tipo` varchar(100) DEFAULT NULL,
  `itens` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Despejando dados para a tabela `empenhos`
--

INSERT INTO `empenhos` (`id`, `oportunidade_id`, `numero`, `valor`, `data_emissao`, `data_prevista`, `documento_url`, `documento_nome`, `documento_tipo`, `itens`, `created_at`) VALUES
(5, 217, '2025NE002730', 478158.60, '2026-03-10', '2026-03-16', NULL, NULL, 'Empenho', '[{\"base_item_id\":151,\"descricao\":\"(275071-6) - CONJUNTO DE CIRCULACAO EXTRACORPOREA - OXIGENADOR DE MEMBRANA DIFUSA ADULTO COM FILTRO ARTERIAL, RESERVATORIO VENOSO E CARDIOTOMIA MONTADO EM ESTRUTURA VEDADA COM A SUPERFICIE INTERNA TOTALMENTE REVESTIDA DE SUBSTANCIA COM CARACTERISITCAS HID\",\"lote\":\"COTA PRINCIPAL 1 - LOTE 01\",\"item\":\"01\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":60,\"valor_unitario\":\"3758.31\",\"total_faturado\":0},{\"base_item_id\":152,\"descricao\":\"(498569-9) - CONJUNTO DE CIRCULACAO EXTRACORPOREA - ADULTO, PACIENTE ATE 110 KG, COMPOSTO POR OXIGENADOR DE MEMBRANA COM PERMUTADOR DE CALOR EM ACO INOXIDAVEL E FILTRO ARTERIAL EM CASCATA INTEGRADO PRIME 225 ML, FLUXO MAXIMO 7,0 L\\/MIN, MEMBRANA 1,65 M2, R\",\"lote\":\"COTA PRINCIPAL 1 - LOTE 01\",\"item\":\"02\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":60,\"valor_unitario\":\"4211.00\",\"total_faturado\":0},{\"base_item_id\":153,\"descricao\":\"(195846-1) - SISTEMA DE OXIGENADOR MEMBRANA ADULTO - HEMOCONCENTRADOR H-500 PARA CIRCULACAO EXTRACORPOREA, EM POLICARBONATO E FIBRAS DE POLIETERSULFONA, COM DIAMETRO EXTERNO DA FIBRA, AREA EFETIVA DE MEMBRANA COM SUPORTE, CONCENTRA OS ELEMENTOS DO SANGUE\",\"lote\":\"COTA PRINCIPAL 1 - LOTE 01\",\"item\":\"03\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"2445.74\",\"total_faturado\":0},{\"base_item_id\":154,\"descricao\":\"(275071-6) - CONJUNTO DE CIRCULACAO EXTRACORPOREA - OXIGENADOR DE MEMBRANA DIFUSA ADULTO COM FILTRO ARTERIAL, RESERVATORIO VENOSO E CARDIOTOMIA MONTADO EM ESTRUTURA VEDADA COM A SUPERFICIE INTERNA TOTALMENTE REVESTIDA DE SUBSTANCIA COM CARACTERISITCAS HID\",\"lote\":\"COTA RESERVADA 1 - LOTE 01\",\"item\":\"01\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"3758.31\",\"total_faturado\":0},{\"base_item_id\":155,\"descricao\":\"(498569-9) - CONJUNTO DE CIRCULACAO EXTRACORPOREA - ADULTO, PACIENTE ATE 110 KG, COMPOSTO POR OXIGENADOR DE MEMBRANA COM PERMUTADOR DE CALOR EM ACO INOXIDAVEL E FILTRO ARTERIAL EM CASCATA INTEGRADO PRIME 225 ML, FLUXO MAXIMO 7,0 L\\/MIN, MEMBRANA 1,65 M2, R\",\"lote\":\"COTA RESERVADA 1 - LOTE 01\",\"item\":\"02\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4211.00\",\"total_faturado\":0},{\"base_item_id\":156,\"descricao\":\"(195846-1) - SISTEMA DE OXIGENADOR MEMBRANA ADULTO - HEMOCONCENTRADOR H-500 PARA CIRCULACAO EXTRACORPOREA, EM POLICARBONATO E FIBRAS DE POLIETERSULFONA, COM DIAMETRO EXTERNO DA FIBRA, AREA EFETIVA DE MEMBRANA COM SUPORTE, CONCENTRA OS ELEMENTOS DO SANGUE\",\"lote\":\"COTA RESERVADA 1 - LOTE 01\",\"item\":\"03\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"2445.74\",\"total_faturado\":0}]', '2026-03-03 21:23:58'),
(13, 226, '000231', 5699.02, '2026-02-05', '2026-02-06', NULL, NULL, 'Empenho', '[{\"base_item_id\":172,\"descricao\":\"CÂNULA VENOSA, PARA CIRCULAÇÃO EXTRACORPÓREA, CALIBRE 28\\/36 FR, ARAMADA, RETA, ADULTO, DUPLO ESTÁGIO, COMPRIMENTO CERCA DE 40 cm, confeccionada EM TUBO PVC reforçado internamente com armação de aço inoxidável, aramado; adaptável a conector de 1\\/2 polegada\",\"lote\":\"UNICO\",\"item\":\"33\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CÂNULA VENOSA\",\"quantidade\":0,\"valor_unitario\":\"513.03\",\"total_faturado\":0},{\"base_item_id\":173,\"descricao\":\"CÂNULA, material silicone, tipo VENTILAÇÃO, formato estilete maleável, trava dupla, conector, características adicionais ponta arredondada, múltiplos orifícios, DIÂMETRO 20 FRENCH, COMPRIMENTO 36,8 CM, esterilidade uso único, estéril\",\"lote\":\"UNICO\",\"item\":\"40\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CÂNULA VENTILAÇÃO\",\"quantidade\":0,\"valor_unitario\":\"520.00\",\"total_faturado\":0},{\"base_item_id\":174,\"descricao\":\"KIT AUTOTRANSFUSÃO ADULTO para procedimentos de RECUPERAÇÃO SANGUÍNEA INTRAOPERATÓRIA, composto no mínimo por: BOLSA PARA TRANSFERÊNCIA com CAPACIDADE 1.000 ml; BOLSA DE DESCARTE de 10 litros, RESERVATÓRIO PARA COLETA com CAPACIDADE MÍNIMA 3.000 ml com FI\",\"lote\":\"UNICO\",\"item\":\"60\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"XTRA\",\"quantidade\":2,\"valor_unitario\":\"2849.51\",\"total_faturado\":0},{\"base_item_id\":175,\"descricao\":\"KIT AUTOTRANSFUSÃO ADULTO para procedimentos de RECUPERAÇÃO SANGUÍNEA INTRAOPERATÓRIA, composto no mínimo por: BOLSA PARA TRANSFERÊNCIA com CAPACIDADE 1.000 ml; BOLSA DE DESCARTE de 10 litros, RESERVATÓRIO PARA COLETA com CAPACIDADE MÍNIMA 3.000 ml com FI\",\"lote\":\"UNICO\",\"item\":\"61\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"XTRA\",\"quantidade\":0,\"valor_unitario\":\"2849.51\",\"total_faturado\":0},{\"base_item_id\":176,\"descricao\":\"SENSOR CONTÍNUO de parâmetros hemodinâmicos para monitoramento contínuo da tendência DE DÉBITO CARDÍACO MINIMAMENTE INVASIVO por pressão de pulso, com avaliação de parâmetros hemodinâmicos, material polímero, modelo cateter arterial, contendo extensor com\",\"lote\":\"UNICO\",\"item\":\"70\",\"fabricante\":\"MASIMO\",\"modelo\":\"LIDCO\",\"quantidade\":0,\"valor_unitario\":\"2200.00\",\"total_faturado\":0}]', '2026-03-12 10:34:50'),
(14, 220, '2026NE000186', 9354.00, '2026-02-24', '2026-02-25', NULL, NULL, 'Empenho', '[{\"base_item_id\":157,\"descricao\":\"SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO CONJUNTO PARA CIRCULAÇÃO EXTRA CORPÓREA PEDIÁTRICO, COMPOSTO DE: OXIGENADOR MEMBRANA RESERVATÓRIO PARA CARDIOTOMIA, CONJUNTO DE TUBOS COM UMA OU DUAS CAVAS COM ARTERIAL, HEMOCONTRADOR, CONJUNTO P CIRCULAÇÃO ASSIST\",\"lote\":\"LOTE 03\",\"item\":\"03\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":2,\"valor_unitario\":\"4677.00\",\"total_faturado\":0},{\"base_item_id\":158,\"descricao\":\"415331-6 SISTEMA DE OXIGENADOR MEMBRANA NEONATAL - COMPOSTO DE: OXIGENADOR MEMBRANA COM CARDIOTOMIA INTEGRADA, CONJUNTO DE TUBOS COM FILTRO ARTERIAL, HEMOCONCENTRADOR EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS.\",\"lote\":\"LOTE 04\",\"item\":\"04\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"3837.39\",\"total_faturado\":0},{\"base_item_id\":159,\"descricao\":\"311297-7 BOMBA CENTRIFUGA NEONATAL - CONJUNTO P CIRCULAÇÃO ASSISTIDA EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS\",\"lote\":\"LOTE 04 \",\"item\":\"05\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"913.61\",\"total_faturado\":0},{\"base_item_id\":160,\"descricao\":\"305035-1 SISTEMA DE OXIGENADOR MEMBRANA ADULTO BAIXO PRIMER CONJUNTO CIRCULAÇÃO EXTRACORPÓREA, COMPOSTO DE: OXIGENADOR MEMBRANA COM RESERVATÓRIO VENOSO ACOPLADO, FILTRO DE LINHA ARTERIAL ACOPLADO. CONJUNTO DE TUBOS PRÉ- MONTADO COM UMA OU DAS CAVAS. HEMOC\",\"lote\":\"LOTE 05\",\"item\":\"06\",\"fabricante\":\"LVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4166.00\",\"total_faturado\":0},{\"base_item_id\":161,\"descricao\":\"416384-2 SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO - COMPOSTO DE: OXIGENADOR DE MEMBRANA COM CARDIOTOMIA INTEGRADA, VOLUME MAXIMO DO PRIMING DE 90 ML, PACIENTE DE 5 KG ATÉ 20 KG. CONJUNTO DE TUBOS COM FILTRO INTEGRADO. KIT CANULA CAVA ÚNICA OU DUPLA. CONJ\",\"lote\":\"LOTE 06\",\"item\":\"07\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4610.00\",\"total_faturado\":0}]', '2026-03-12 12:01:10'),
(15, 220, '2026NE000173', 4751.00, '2026-02-24', '2026-02-25', NULL, NULL, 'Empenho', '[{\"base_item_id\":157,\"descricao\":\"SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO CONJUNTO PARA CIRCULAÇÃO EXTRA CORPÓREA PEDIÁTRICO, COMPOSTO DE: OXIGENADOR MEMBRANA RESERVATÓRIO PARA CARDIOTOMIA, CONJUNTO DE TUBOS COM UMA OU DUAS CAVAS COM ARTERIAL, HEMOCONTRADOR, CONJUNTO P CIRCULAÇÃO ASSIST\",\"lote\":\"LOTE 03\",\"item\":\"03\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4677.00\",\"total_faturado\":0},{\"base_item_id\":158,\"descricao\":\"415331-6 SISTEMA DE OXIGENADOR MEMBRANA NEONATAL - COMPOSTO DE: OXIGENADOR MEMBRANA COM CARDIOTOMIA INTEGRADA, CONJUNTO DE TUBOS COM FILTRO ARTERIAL, HEMOCONCENTRADOR EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS.\",\"lote\":\"LOTE 04\",\"item\":\"04\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":1,\"valor_unitario\":\"3837.39\",\"total_faturado\":0},{\"base_item_id\":159,\"descricao\":\"311297-7 BOMBA CENTRIFUGA NEONATAL - CONJUNTO P CIRCULAÇÃO ASSISTIDA EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS\",\"lote\":\"LOTE 04 \",\"item\":\"05\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":1,\"valor_unitario\":\"913.61\",\"total_faturado\":0},{\"base_item_id\":160,\"descricao\":\"305035-1 SISTEMA DE OXIGENADOR MEMBRANA ADULTO BAIXO PRIMER CONJUNTO CIRCULAÇÃO EXTRACORPÓREA, COMPOSTO DE: OXIGENADOR MEMBRANA COM RESERVATÓRIO VENOSO ACOPLADO, FILTRO DE LINHA ARTERIAL ACOPLADO. CONJUNTO DE TUBOS PRÉ- MONTADO COM UMA OU DAS CAVAS. HEMOC\",\"lote\":\"LOTE 05\",\"item\":\"06\",\"fabricante\":\"LVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4166.00\",\"total_faturado\":0},{\"base_item_id\":161,\"descricao\":\"416384-2 SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO - COMPOSTO DE: OXIGENADOR DE MEMBRANA COM CARDIOTOMIA INTEGRADA, VOLUME MAXIMO DO PRIMING DE 90 ML, PACIENTE DE 5 KG ATÉ 20 KG. CONJUNTO DE TUBOS COM FILTRO INTEGRADO. KIT CANULA CAVA ÚNICA OU DUPLA. CONJ\",\"lote\":\"LOTE 06\",\"item\":\"07\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4610.00\",\"total_faturado\":0}]', '2026-03-12 12:05:05'),
(16, 220, '2026NE000185', 4751.00, '2026-02-24', '2026-02-25', NULL, NULL, 'Empenho', '[{\"base_item_id\":157,\"descricao\":\"SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO CONJUNTO PARA CIRCULAÇÃO EXTRA CORPÓREA PEDIÁTRICO, COMPOSTO DE: OXIGENADOR MEMBRANA RESERVATÓRIO PARA CARDIOTOMIA, CONJUNTO DE TUBOS COM UMA OU DUAS CAVAS COM ARTERIAL, HEMOCONTRADOR, CONJUNTO P CIRCULAÇÃO ASSIST\",\"lote\":\"LOTE 03\",\"item\":\"03\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4677.00\",\"total_faturado\":0},{\"base_item_id\":158,\"descricao\":\"415331-6 SISTEMA DE OXIGENADOR MEMBRANA NEONATAL - COMPOSTO DE: OXIGENADOR MEMBRANA COM CARDIOTOMIA INTEGRADA, CONJUNTO DE TUBOS COM FILTRO ARTERIAL, HEMOCONCENTRADOR EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS.\",\"lote\":\"LOTE 04\",\"item\":\"04\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":1,\"valor_unitario\":\"3837.39\",\"total_faturado\":0},{\"base_item_id\":159,\"descricao\":\"311297-7 BOMBA CENTRIFUGA NEONATAL - CONJUNTO P CIRCULAÇÃO ASSISTIDA EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS\",\"lote\":\"LOTE 04 \",\"item\":\"05\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":1,\"valor_unitario\":\"913.61\",\"total_faturado\":0},{\"base_item_id\":160,\"descricao\":\"305035-1 SISTEMA DE OXIGENADOR MEMBRANA ADULTO BAIXO PRIMER CONJUNTO CIRCULAÇÃO EXTRACORPÓREA, COMPOSTO DE: OXIGENADOR MEMBRANA COM RESERVATÓRIO VENOSO ACOPLADO, FILTRO DE LINHA ARTERIAL ACOPLADO. CONJUNTO DE TUBOS PRÉ- MONTADO COM UMA OU DAS CAVAS. HEMOC\",\"lote\":\"LOTE 05\",\"item\":\"06\",\"fabricante\":\"LVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4166.00\",\"total_faturado\":0},{\"base_item_id\":161,\"descricao\":\"416384-2 SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO - COMPOSTO DE: OXIGENADOR DE MEMBRANA COM CARDIOTOMIA INTEGRADA, VOLUME MAXIMO DO PRIMING DE 90 ML, PACIENTE DE 5 KG ATÉ 20 KG. CONJUNTO DE TUBOS COM FILTRO INTEGRADO. KIT CANULA CAVA ÚNICA OU DUPLA. CONJ\",\"lote\":\"LOTE 06\",\"item\":\"07\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4610.00\",\"total_faturado\":0}]', '2026-03-12 12:06:53'),
(17, 220, '2026NE000179', 4166.00, '2026-02-24', '2026-02-25', NULL, NULL, 'Empenho', '[{\"base_item_id\":157,\"descricao\":\"SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO CONJUNTO PARA CIRCULAÇÃO EXTRA CORPÓREA PEDIÁTRICO, COMPOSTO DE: OXIGENADOR MEMBRANA RESERVATÓRIO PARA CARDIOTOMIA, CONJUNTO DE TUBOS COM UMA OU DUAS CAVAS COM ARTERIAL, HEMOCONTRADOR, CONJUNTO P CIRCULAÇÃO ASSIST\",\"lote\":\"LOTE 03\",\"item\":\"03\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4677.00\",\"total_faturado\":0},{\"base_item_id\":158,\"descricao\":\"415331-6 SISTEMA DE OXIGENADOR MEMBRANA NEONATAL - COMPOSTO DE: OXIGENADOR MEMBRANA COM CARDIOTOMIA INTEGRADA, CONJUNTO DE TUBOS COM FILTRO ARTERIAL, HEMOCONCENTRADOR EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS.\",\"lote\":\"LOTE 04\",\"item\":\"04\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"3837.39\",\"total_faturado\":0},{\"base_item_id\":159,\"descricao\":\"311297-7 BOMBA CENTRIFUGA NEONATAL - CONJUNTO P CIRCULAÇÃO ASSISTIDA EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS\",\"lote\":\"LOTE 04 \",\"item\":\"05\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"913.61\",\"total_faturado\":0},{\"base_item_id\":160,\"descricao\":\"305035-1 SISTEMA DE OXIGENADOR MEMBRANA ADULTO BAIXO PRIMER CONJUNTO CIRCULAÇÃO EXTRACORPÓREA, COMPOSTO DE: OXIGENADOR MEMBRANA COM RESERVATÓRIO VENOSO ACOPLADO, FILTRO DE LINHA ARTERIAL ACOPLADO. CONJUNTO DE TUBOS PRÉ- MONTADO COM UMA OU DAS CAVAS. HEMOC\",\"lote\":\"LOTE 05\",\"item\":\"06\",\"fabricante\":\"LVANOVA\",\"modelo\":\"CEC\",\"quantidade\":1,\"valor_unitario\":\"4166.00\",\"total_faturado\":0},{\"base_item_id\":161,\"descricao\":\"416384-2 SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO - COMPOSTO DE: OXIGENADOR DE MEMBRANA COM CARDIOTOMIA INTEGRADA, VOLUME MAXIMO DO PRIMING DE 90 ML, PACIENTE DE 5 KG ATÉ 20 KG. CONJUNTO DE TUBOS COM FILTRO INTEGRADO. KIT CANULA CAVA ÚNICA OU DUPLA. CONJ\",\"lote\":\"LOTE 06\",\"item\":\"07\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4610.00\",\"total_faturado\":0}]', '2026-03-12 12:09:36'),
(18, 220, '2026NE000178', 4166.00, '2026-02-24', '2026-02-25', NULL, NULL, 'Empenho', '[{\"base_item_id\":157,\"descricao\":\"SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO CONJUNTO PARA CIRCULAÇÃO EXTRA CORPÓREA PEDIÁTRICO, COMPOSTO DE: OXIGENADOR MEMBRANA RESERVATÓRIO PARA CARDIOTOMIA, CONJUNTO DE TUBOS COM UMA OU DUAS CAVAS COM ARTERIAL, HEMOCONTRADOR, CONJUNTO P CIRCULAÇÃO ASSIST\",\"lote\":\"LOTE 03\",\"item\":\"03\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4677.00\",\"total_faturado\":0},{\"base_item_id\":158,\"descricao\":\"415331-6 SISTEMA DE OXIGENADOR MEMBRANA NEONATAL - COMPOSTO DE: OXIGENADOR MEMBRANA COM CARDIOTOMIA INTEGRADA, CONJUNTO DE TUBOS COM FILTRO ARTERIAL, HEMOCONCENTRADOR EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS.\",\"lote\":\"LOTE 04\",\"item\":\"04\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"3837.39\",\"total_faturado\":0},{\"base_item_id\":159,\"descricao\":\"311297-7 BOMBA CENTRIFUGA NEONATAL - CONJUNTO P CIRCULAÇÃO ASSISTIDA EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS\",\"lote\":\"LOTE 04 \",\"item\":\"05\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"913.61\",\"total_faturado\":0},{\"base_item_id\":160,\"descricao\":\"305035-1 SISTEMA DE OXIGENADOR MEMBRANA ADULTO BAIXO PRIMER CONJUNTO CIRCULAÇÃO EXTRACORPÓREA, COMPOSTO DE: OXIGENADOR MEMBRANA COM RESERVATÓRIO VENOSO ACOPLADO, FILTRO DE LINHA ARTERIAL ACOPLADO. CONJUNTO DE TUBOS PRÉ- MONTADO COM UMA OU DAS CAVAS. HEMOC\",\"lote\":\"LOTE 05\",\"item\":\"06\",\"fabricante\":\"LVANOVA\",\"modelo\":\"CEC\",\"quantidade\":1,\"valor_unitario\":\"4166.00\",\"total_faturado\":0},{\"base_item_id\":161,\"descricao\":\"416384-2 SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO - COMPOSTO DE: OXIGENADOR DE MEMBRANA COM CARDIOTOMIA INTEGRADA, VOLUME MAXIMO DO PRIMING DE 90 ML, PACIENTE DE 5 KG ATÉ 20 KG. CONJUNTO DE TUBOS COM FILTRO INTEGRADO. KIT CANULA CAVA ÚNICA OU DUPLA. CONJ\",\"lote\":\"LOTE 06\",\"item\":\"07\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4610.00\",\"total_faturado\":0}]', '2026-03-12 12:11:26'),
(19, 220, '2026NE000184', 8332.00, '2026-02-24', '2026-02-25', NULL, NULL, 'Empenho', '[{\"base_item_id\":157,\"descricao\":\"SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO CONJUNTO PARA CIRCULAÇÃO EXTRA CORPÓREA PEDIÁTRICO, COMPOSTO DE: OXIGENADOR MEMBRANA RESERVATÓRIO PARA CARDIOTOMIA, CONJUNTO DE TUBOS COM UMA OU DUAS CAVAS COM ARTERIAL, HEMOCONTRADOR, CONJUNTO P CIRCULAÇÃO ASSIST\",\"lote\":\"LOTE 03\",\"item\":\"03\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4677.00\",\"total_faturado\":0},{\"base_item_id\":158,\"descricao\":\"415331-6 SISTEMA DE OXIGENADOR MEMBRANA NEONATAL - COMPOSTO DE: OXIGENADOR MEMBRANA COM CARDIOTOMIA INTEGRADA, CONJUNTO DE TUBOS COM FILTRO ARTERIAL, HEMOCONCENTRADOR EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS.\",\"lote\":\"LOTE 04\",\"item\":\"04\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"3837.39\",\"total_faturado\":0},{\"base_item_id\":159,\"descricao\":\"311297-7 BOMBA CENTRIFUGA NEONATAL - CONJUNTO P CIRCULAÇÃO ASSISTIDA EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS\",\"lote\":\"LOTE 04 \",\"item\":\"05\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"913.61\",\"total_faturado\":0},{\"base_item_id\":160,\"descricao\":\"305035-1 SISTEMA DE OXIGENADOR MEMBRANA ADULTO BAIXO PRIMER CONJUNTO CIRCULAÇÃO EXTRACORPÓREA, COMPOSTO DE: OXIGENADOR MEMBRANA COM RESERVATÓRIO VENOSO ACOPLADO, FILTRO DE LINHA ARTERIAL ACOPLADO. CONJUNTO DE TUBOS PRÉ- MONTADO COM UMA OU DAS CAVAS. HEMOC\",\"lote\":\"LOTE 05\",\"item\":\"06\",\"fabricante\":\"LVANOVA\",\"modelo\":\"CEC\",\"quantidade\":2,\"valor_unitario\":\"4166.00\",\"total_faturado\":0},{\"base_item_id\":161,\"descricao\":\"416384-2 SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO - COMPOSTO DE: OXIGENADOR DE MEMBRANA COM CARDIOTOMIA INTEGRADA, VOLUME MAXIMO DO PRIMING DE 90 ML, PACIENTE DE 5 KG ATÉ 20 KG. CONJUNTO DE TUBOS COM FILTRO INTEGRADO. KIT CANULA CAVA ÚNICA OU DUPLA. CONJ\",\"lote\":\"LOTE 06\",\"item\":\"07\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4610.00\",\"total_faturado\":0}]', '2026-03-12 12:13:42'),
(20, 220, '2026NE000180', 12498.00, '2026-02-24', '2026-02-25', NULL, NULL, 'Empenho', '[{\"base_item_id\":157,\"descricao\":\"SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO CONJUNTO PARA CIRCULAÇÃO EXTRA CORPÓREA PEDIÁTRICO, COMPOSTO DE: OXIGENADOR MEMBRANA RESERVATÓRIO PARA CARDIOTOMIA, CONJUNTO DE TUBOS COM UMA OU DUAS CAVAS COM ARTERIAL, HEMOCONTRADOR, CONJUNTO P CIRCULAÇÃO ASSIST\",\"lote\":\"LOTE 03\",\"item\":\"03\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4677.00\",\"total_faturado\":0},{\"base_item_id\":158,\"descricao\":\"415331-6 SISTEMA DE OXIGENADOR MEMBRANA NEONATAL - COMPOSTO DE: OXIGENADOR MEMBRANA COM CARDIOTOMIA INTEGRADA, CONJUNTO DE TUBOS COM FILTRO ARTERIAL, HEMOCONCENTRADOR EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS.\",\"lote\":\"LOTE 04\",\"item\":\"04\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"3837.39\",\"total_faturado\":0},{\"base_item_id\":159,\"descricao\":\"311297-7 BOMBA CENTRIFUGA NEONATAL - CONJUNTO P CIRCULAÇÃO ASSISTIDA EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS\",\"lote\":\"LOTE 04 \",\"item\":\"05\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"913.61\",\"total_faturado\":0},{\"base_item_id\":160,\"descricao\":\"305035-1 SISTEMA DE OXIGENADOR MEMBRANA ADULTO BAIXO PRIMER CONJUNTO CIRCULAÇÃO EXTRACORPÓREA, COMPOSTO DE: OXIGENADOR MEMBRANA COM RESERVATÓRIO VENOSO ACOPLADO, FILTRO DE LINHA ARTERIAL ACOPLADO. CONJUNTO DE TUBOS PRÉ- MONTADO COM UMA OU DAS CAVAS. HEMOC\",\"lote\":\"LOTE 05\",\"item\":\"06\",\"fabricante\":\"LVANOVA\",\"modelo\":\"CEC\",\"quantidade\":3,\"valor_unitario\":\"4166.00\",\"total_faturado\":0},{\"base_item_id\":161,\"descricao\":\"416384-2 SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO - COMPOSTO DE: OXIGENADOR DE MEMBRANA COM CARDIOTOMIA INTEGRADA, VOLUME MAXIMO DO PRIMING DE 90 ML, PACIENTE DE 5 KG ATÉ 20 KG. CONJUNTO DE TUBOS COM FILTRO INTEGRADO. KIT CANULA CAVA ÚNICA OU DUPLA. CONJ\",\"lote\":\"LOTE 06\",\"item\":\"07\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4610.00\",\"total_faturado\":0}]', '2026-03-12 12:15:41'),
(21, 220, '2026NE000177', 12498.00, '2026-02-24', '2026-02-25', NULL, NULL, 'Empenho', '[{\"base_item_id\":157,\"descricao\":\"SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO CONJUNTO PARA CIRCULAÇÃO EXTRA CORPÓREA PEDIÁTRICO, COMPOSTO DE: OXIGENADOR MEMBRANA RESERVATÓRIO PARA CARDIOTOMIA, CONJUNTO DE TUBOS COM UMA OU DUAS CAVAS COM ARTERIAL, HEMOCONTRADOR, CONJUNTO P CIRCULAÇÃO ASSIST\",\"lote\":\"LOTE 03\",\"item\":\"03\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4677.00\",\"total_faturado\":0},{\"base_item_id\":158,\"descricao\":\"415331-6 SISTEMA DE OXIGENADOR MEMBRANA NEONATAL - COMPOSTO DE: OXIGENADOR MEMBRANA COM CARDIOTOMIA INTEGRADA, CONJUNTO DE TUBOS COM FILTRO ARTERIAL, HEMOCONCENTRADOR EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS.\",\"lote\":\"LOTE 04\",\"item\":\"04\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"3837.39\",\"total_faturado\":0},{\"base_item_id\":159,\"descricao\":\"311297-7 BOMBA CENTRIFUGA NEONATAL - CONJUNTO P CIRCULAÇÃO ASSISTIDA EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS\",\"lote\":\"LOTE 04 \",\"item\":\"05\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"913.61\",\"total_faturado\":0},{\"base_item_id\":160,\"descricao\":\"305035-1 SISTEMA DE OXIGENADOR MEMBRANA ADULTO BAIXO PRIMER CONJUNTO CIRCULAÇÃO EXTRACORPÓREA, COMPOSTO DE: OXIGENADOR MEMBRANA COM RESERVATÓRIO VENOSO ACOPLADO, FILTRO DE LINHA ARTERIAL ACOPLADO. CONJUNTO DE TUBOS PRÉ- MONTADO COM UMA OU DAS CAVAS. HEMOC\",\"lote\":\"LOTE 05\",\"item\":\"06\",\"fabricante\":\"LVANOVA\",\"modelo\":\"CEC\",\"quantidade\":3,\"valor_unitario\":\"4166.00\",\"total_faturado\":0},{\"base_item_id\":161,\"descricao\":\"416384-2 SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO - COMPOSTO DE: OXIGENADOR DE MEMBRANA COM CARDIOTOMIA INTEGRADA, VOLUME MAXIMO DO PRIMING DE 90 ML, PACIENTE DE 5 KG ATÉ 20 KG. CONJUNTO DE TUBOS COM FILTRO INTEGRADO. KIT CANULA CAVA ÚNICA OU DUPLA. CONJ\",\"lote\":\"LOTE 06\",\"item\":\"07\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4610.00\",\"total_faturado\":0}]', '2026-03-12 12:18:33'),
(22, 220, '2026NE000175', 12498.00, '2026-02-24', '2026-02-25', NULL, NULL, 'Empenho', '[{\"base_item_id\":157,\"descricao\":\"SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO CONJUNTO PARA CIRCULAÇÃO EXTRA CORPÓREA PEDIÁTRICO, COMPOSTO DE: OXIGENADOR MEMBRANA RESERVATÓRIO PARA CARDIOTOMIA, CONJUNTO DE TUBOS COM UMA OU DUAS CAVAS COM ARTERIAL, HEMOCONTRADOR, CONJUNTO P CIRCULAÇÃO ASSIST\",\"lote\":\"LOTE 03\",\"item\":\"03\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4677.00\",\"total_faturado\":0},{\"base_item_id\":158,\"descricao\":\"415331-6 SISTEMA DE OXIGENADOR MEMBRANA NEONATAL - COMPOSTO DE: OXIGENADOR MEMBRANA COM CARDIOTOMIA INTEGRADA, CONJUNTO DE TUBOS COM FILTRO ARTERIAL, HEMOCONCENTRADOR EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS.\",\"lote\":\"LOTE 04\",\"item\":\"04\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"3837.39\",\"total_faturado\":0},{\"base_item_id\":159,\"descricao\":\"311297-7 BOMBA CENTRIFUGA NEONATAL - CONJUNTO P CIRCULAÇÃO ASSISTIDA EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS\",\"lote\":\"LOTE 04 \",\"item\":\"05\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"913.61\",\"total_faturado\":0},{\"base_item_id\":160,\"descricao\":\"305035-1 SISTEMA DE OXIGENADOR MEMBRANA ADULTO BAIXO PRIMER CONJUNTO CIRCULAÇÃO EXTRACORPÓREA, COMPOSTO DE: OXIGENADOR MEMBRANA COM RESERVATÓRIO VENOSO ACOPLADO, FILTRO DE LINHA ARTERIAL ACOPLADO. CONJUNTO DE TUBOS PRÉ- MONTADO COM UMA OU DAS CAVAS. HEMOC\",\"lote\":\"LOTE 05\",\"item\":\"06\",\"fabricante\":\"LVANOVA\",\"modelo\":\"CEC\",\"quantidade\":3,\"valor_unitario\":\"4166.00\",\"total_faturado\":0},{\"base_item_id\":161,\"descricao\":\"416384-2 SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO - COMPOSTO DE: OXIGENADOR DE MEMBRANA COM CARDIOTOMIA INTEGRADA, VOLUME MAXIMO DO PRIMING DE 90 ML, PACIENTE DE 5 KG ATÉ 20 KG. CONJUNTO DE TUBOS COM FILTRO INTEGRADO. KIT CANULA CAVA ÚNICA OU DUPLA. CONJ\",\"lote\":\"LOTE 06\",\"item\":\"07\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4610.00\",\"total_faturado\":0}]', '2026-03-12 12:21:48'),
(23, 220, '2026NE000174', 12498.00, '2026-02-24', '2026-02-25', NULL, NULL, 'Empenho', '[{\"base_item_id\":157,\"descricao\":\"SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO CONJUNTO PARA CIRCULAÇÃO EXTRA CORPÓREA PEDIÁTRICO, COMPOSTO DE: OXIGENADOR MEMBRANA RESERVATÓRIO PARA CARDIOTOMIA, CONJUNTO DE TUBOS COM UMA OU DUAS CAVAS COM ARTERIAL, HEMOCONTRADOR, CONJUNTO P CIRCULAÇÃO ASSIST\",\"lote\":\"LOTE 03\",\"item\":\"03\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4677.00\",\"total_faturado\":0},{\"base_item_id\":158,\"descricao\":\"415331-6 SISTEMA DE OXIGENADOR MEMBRANA NEONATAL - COMPOSTO DE: OXIGENADOR MEMBRANA COM CARDIOTOMIA INTEGRADA, CONJUNTO DE TUBOS COM FILTRO ARTERIAL, HEMOCONCENTRADOR EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS.\",\"lote\":\"LOTE 04\",\"item\":\"04\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"3837.39\",\"total_faturado\":0},{\"base_item_id\":159,\"descricao\":\"311297-7 BOMBA CENTRIFUGA NEONATAL - CONJUNTO P CIRCULAÇÃO ASSISTIDA EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS\",\"lote\":\"LOTE 04 \",\"item\":\"05\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"913.61\",\"total_faturado\":0},{\"base_item_id\":160,\"descricao\":\"305035-1 SISTEMA DE OXIGENADOR MEMBRANA ADULTO BAIXO PRIMER CONJUNTO CIRCULAÇÃO EXTRACORPÓREA, COMPOSTO DE: OXIGENADOR MEMBRANA COM RESERVATÓRIO VENOSO ACOPLADO, FILTRO DE LINHA ARTERIAL ACOPLADO. CONJUNTO DE TUBOS PRÉ- MONTADO COM UMA OU DAS CAVAS. HEMOC\",\"lote\":\"LOTE 05\",\"item\":\"06\",\"fabricante\":\"LVANOVA\",\"modelo\":\"CEC\",\"quantidade\":3,\"valor_unitario\":\"4166.00\",\"total_faturado\":0},{\"base_item_id\":161,\"descricao\":\"416384-2 SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO - COMPOSTO DE: OXIGENADOR DE MEMBRANA COM CARDIOTOMIA INTEGRADA, VOLUME MAXIMO DO PRIMING DE 90 ML, PACIENTE DE 5 KG ATÉ 20 KG. CONJUNTO DE TUBOS COM FILTRO INTEGRADO. KIT CANULA CAVA ÚNICA OU DUPLA. CONJ\",\"lote\":\"LOTE 06\",\"item\":\"07\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4610.00\",\"total_faturado\":0}]', '2026-03-12 12:23:32'),
(24, 220, '2026NE000183', 12498.00, '2026-02-24', '2026-02-25', NULL, NULL, 'Empenho', '[{\"base_item_id\":157,\"descricao\":\"SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO CONJUNTO PARA CIRCULAÇÃO EXTRA CORPÓREA PEDIÁTRICO, COMPOSTO DE: OXIGENADOR MEMBRANA RESERVATÓRIO PARA CARDIOTOMIA, CONJUNTO DE TUBOS COM UMA OU DUAS CAVAS COM ARTERIAL, HEMOCONTRADOR, CONJUNTO P CIRCULAÇÃO ASSIST\",\"lote\":\"LOTE 03\",\"item\":\"03\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4677.00\",\"total_faturado\":0},{\"base_item_id\":158,\"descricao\":\"415331-6 SISTEMA DE OXIGENADOR MEMBRANA NEONATAL - COMPOSTO DE: OXIGENADOR MEMBRANA COM CARDIOTOMIA INTEGRADA, CONJUNTO DE TUBOS COM FILTRO ARTERIAL, HEMOCONCENTRADOR EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS.\",\"lote\":\"LOTE 04\",\"item\":\"04\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"3837.39\",\"total_faturado\":0},{\"base_item_id\":159,\"descricao\":\"311297-7 BOMBA CENTRIFUGA NEONATAL - CONJUNTO P CIRCULAÇÃO ASSISTIDA EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS\",\"lote\":\"LOTE 04 \",\"item\":\"05\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"913.61\",\"total_faturado\":0},{\"base_item_id\":160,\"descricao\":\"305035-1 SISTEMA DE OXIGENADOR MEMBRANA ADULTO BAIXO PRIMER CONJUNTO CIRCULAÇÃO EXTRACORPÓREA, COMPOSTO DE: OXIGENADOR MEMBRANA COM RESERVATÓRIO VENOSO ACOPLADO, FILTRO DE LINHA ARTERIAL ACOPLADO. CONJUNTO DE TUBOS PRÉ- MONTADO COM UMA OU DAS CAVAS. HEMOC\",\"lote\":\"LOTE 05\",\"item\":\"06\",\"fabricante\":\"LVANOVA\",\"modelo\":\"CEC\",\"quantidade\":3,\"valor_unitario\":\"4166.00\",\"total_faturado\":0},{\"base_item_id\":161,\"descricao\":\"416384-2 SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO - COMPOSTO DE: OXIGENADOR DE MEMBRANA COM CARDIOTOMIA INTEGRADA, VOLUME MAXIMO DO PRIMING DE 90 ML, PACIENTE DE 5 KG ATÉ 20 KG. CONJUNTO DE TUBOS COM FILTRO INTEGRADO. KIT CANULA CAVA ÚNICA OU DUPLA. CONJ\",\"lote\":\"LOTE 06\",\"item\":\"07\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4610.00\",\"total_faturado\":0}]', '2026-03-12 12:27:09'),
(25, 220, '2026NE000181', 12498.00, '2026-02-24', '2026-02-25', NULL, NULL, 'Empenho', '[{\"base_item_id\":157,\"descricao\":\"SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO CONJUNTO PARA CIRCULAÇÃO EXTRA CORPÓREA PEDIÁTRICO, COMPOSTO DE: OXIGENADOR MEMBRANA RESERVATÓRIO PARA CARDIOTOMIA, CONJUNTO DE TUBOS COM UMA OU DUAS CAVAS COM ARTERIAL, HEMOCONTRADOR, CONJUNTO P CIRCULAÇÃO ASSIST\",\"lote\":\"LOTE 03\",\"item\":\"03\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4677.00\",\"total_faturado\":0},{\"base_item_id\":158,\"descricao\":\"415331-6 SISTEMA DE OXIGENADOR MEMBRANA NEONATAL - COMPOSTO DE: OXIGENADOR MEMBRANA COM CARDIOTOMIA INTEGRADA, CONJUNTO DE TUBOS COM FILTRO ARTERIAL, HEMOCONCENTRADOR EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS.\",\"lote\":\"LOTE 04\",\"item\":\"04\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"3837.39\",\"total_faturado\":0},{\"base_item_id\":159,\"descricao\":\"311297-7 BOMBA CENTRIFUGA NEONATAL - CONJUNTO P CIRCULAÇÃO ASSISTIDA EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS\",\"lote\":\"LOTE 04 \",\"item\":\"05\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"913.61\",\"total_faturado\":0},{\"base_item_id\":160,\"descricao\":\"305035-1 SISTEMA DE OXIGENADOR MEMBRANA ADULTO BAIXO PRIMER CONJUNTO CIRCULAÇÃO EXTRACORPÓREA, COMPOSTO DE: OXIGENADOR MEMBRANA COM RESERVATÓRIO VENOSO ACOPLADO, FILTRO DE LINHA ARTERIAL ACOPLADO. CONJUNTO DE TUBOS PRÉ- MONTADO COM UMA OU DAS CAVAS. HEMOC\",\"lote\":\"LOTE 05\",\"item\":\"06\",\"fabricante\":\"LVANOVA\",\"modelo\":\"CEC\",\"quantidade\":3,\"valor_unitario\":\"4166.00\",\"total_faturado\":0},{\"base_item_id\":161,\"descricao\":\"416384-2 SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO - COMPOSTO DE: OXIGENADOR DE MEMBRANA COM CARDIOTOMIA INTEGRADA, VOLUME MAXIMO DO PRIMING DE 90 ML, PACIENTE DE 5 KG ATÉ 20 KG. CONJUNTO DE TUBOS COM FILTRO INTEGRADO. KIT CANULA CAVA ÚNICA OU DUPLA. CONJ\",\"lote\":\"LOTE 06\",\"item\":\"07\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4610.00\",\"total_faturado\":0}]', '2026-03-12 12:28:36'),
(26, 220, '2026NE000187', 4166.00, '2026-02-24', '2026-02-25', NULL, NULL, 'Empenho', '[{\"base_item_id\":157,\"descricao\":\"SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO CONJUNTO PARA CIRCULAÇÃO EXTRA CORPÓREA PEDIÁTRICO, COMPOSTO DE: OXIGENADOR MEMBRANA RESERVATÓRIO PARA CARDIOTOMIA, CONJUNTO DE TUBOS COM UMA OU DUAS CAVAS COM ARTERIAL, HEMOCONTRADOR, CONJUNTO P CIRCULAÇÃO ASSIST\",\"lote\":\"LOTE 03\",\"item\":\"03\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4677.00\",\"total_faturado\":0},{\"base_item_id\":158,\"descricao\":\"415331-6 SISTEMA DE OXIGENADOR MEMBRANA NEONATAL - COMPOSTO DE: OXIGENADOR MEMBRANA COM CARDIOTOMIA INTEGRADA, CONJUNTO DE TUBOS COM FILTRO ARTERIAL, HEMOCONCENTRADOR EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS.\",\"lote\":\"LOTE 04\",\"item\":\"04\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"3837.39\",\"total_faturado\":0},{\"base_item_id\":159,\"descricao\":\"311297-7 BOMBA CENTRIFUGA NEONATAL - CONJUNTO P CIRCULAÇÃO ASSISTIDA EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS\",\"lote\":\"LOTE 04 \",\"item\":\"05\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"913.61\",\"total_faturado\":0},{\"base_item_id\":160,\"descricao\":\"305035-1 SISTEMA DE OXIGENADOR MEMBRANA ADULTO BAIXO PRIMER CONJUNTO CIRCULAÇÃO EXTRACORPÓREA, COMPOSTO DE: OXIGENADOR MEMBRANA COM RESERVATÓRIO VENOSO ACOPLADO, FILTRO DE LINHA ARTERIAL ACOPLADO. CONJUNTO DE TUBOS PRÉ- MONTADO COM UMA OU DAS CAVAS. HEMOC\",\"lote\":\"LOTE 05\",\"item\":\"06\",\"fabricante\":\"LVANOVA\",\"modelo\":\"CEC\",\"quantidade\":1,\"valor_unitario\":\"4166.00\",\"total_faturado\":0},{\"base_item_id\":161,\"descricao\":\"416384-2 SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO - COMPOSTO DE: OXIGENADOR DE MEMBRANA COM CARDIOTOMIA INTEGRADA, VOLUME MAXIMO DO PRIMING DE 90 ML, PACIENTE DE 5 KG ATÉ 20 KG. CONJUNTO DE TUBOS COM FILTRO INTEGRADO. KIT CANULA CAVA ÚNICA OU DUPLA. CONJ\",\"lote\":\"LOTE 06\",\"item\":\"07\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4610.00\",\"total_faturado\":0}]', '2026-03-12 12:30:28'),
(27, 220, '2026NE000182', 12498.00, '2026-02-24', '2026-02-25', NULL, NULL, 'Empenho', '[{\"base_item_id\":157,\"descricao\":\"SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO CONJUNTO PARA CIRCULAÇÃO EXTRA CORPÓREA PEDIÁTRICO, COMPOSTO DE: OXIGENADOR MEMBRANA RESERVATÓRIO PARA CARDIOTOMIA, CONJUNTO DE TUBOS COM UMA OU DUAS CAVAS COM ARTERIAL, HEMOCONTRADOR, CONJUNTO P CIRCULAÇÃO ASSIST\",\"lote\":\"LOTE 03\",\"item\":\"03\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4677.00\",\"total_faturado\":0},{\"base_item_id\":158,\"descricao\":\"415331-6 SISTEMA DE OXIGENADOR MEMBRANA NEONATAL - COMPOSTO DE: OXIGENADOR MEMBRANA COM CARDIOTOMIA INTEGRADA, CONJUNTO DE TUBOS COM FILTRO ARTERIAL, HEMOCONCENTRADOR EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS.\",\"lote\":\"LOTE 04\",\"item\":\"04\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"3837.39\",\"total_faturado\":0},{\"base_item_id\":159,\"descricao\":\"311297-7 BOMBA CENTRIFUGA NEONATAL - CONJUNTO P CIRCULAÇÃO ASSISTIDA EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS\",\"lote\":\"LOTE 04 \",\"item\":\"05\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"913.61\",\"total_faturado\":0},{\"base_item_id\":160,\"descricao\":\"305035-1 SISTEMA DE OXIGENADOR MEMBRANA ADULTO BAIXO PRIMER CONJUNTO CIRCULAÇÃO EXTRACORPÓREA, COMPOSTO DE: OXIGENADOR MEMBRANA COM RESERVATÓRIO VENOSO ACOPLADO, FILTRO DE LINHA ARTERIAL ACOPLADO. CONJUNTO DE TUBOS PRÉ- MONTADO COM UMA OU DAS CAVAS. HEMOC\",\"lote\":\"LOTE 05\",\"item\":\"06\",\"fabricante\":\"LVANOVA\",\"modelo\":\"CEC\",\"quantidade\":3,\"valor_unitario\":\"4166.00\",\"total_faturado\":0},{\"base_item_id\":161,\"descricao\":\"416384-2 SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO - COMPOSTO DE: OXIGENADOR DE MEMBRANA COM CARDIOTOMIA INTEGRADA, VOLUME MAXIMO DO PRIMING DE 90 ML, PACIENTE DE 5 KG ATÉ 20 KG. CONJUNTO DE TUBOS COM FILTRO INTEGRADO. KIT CANULA CAVA ÚNICA OU DUPLA. CONJ\",\"lote\":\"LOTE 06\",\"item\":\"07\",\"fabricante\":\"LIVANOVA\",\"modelo\":\"CEC\",\"quantidade\":0,\"valor_unitario\":\"4610.00\",\"total_faturado\":0}]', '2026-03-12 12:44:25');

-- --------------------------------------------------------

--
-- Estrutura para tabela `etapas_funil`
--

CREATE TABLE `etapas_funil` (
  `id` int(11) NOT NULL,
  `funil_id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `ordem` int(11) NOT NULL,
  `cor` varchar(20) DEFAULT '#cccccc',
  `probabilidade` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `etapas_funil`
--

INSERT INTO `etapas_funil` (`id`, `funil_id`, `nome`, `ordem`, `cor`, `probabilidade`) VALUES
(1, 1, 'Prospectando', 1, '#cccccc', 10),
(2, 1, 'Contato', 2, '#cccccc', 20),
(3, 1, 'Treinamentos', 7, '#cccccc', 30),
(4, 1, 'Proposta', 4, '#cccccc', 50),
(5, 1, 'Negociação', 3, '#cccccc', 80),
(6, 1, 'Fechado', 5, '#cccccc', 100),
(7, 1, 'Pós-venda', 8, '#cccccc', 100),
(8, 1, 'Recusado', 9, '#cccccc', 0),
(14, 2, 'Captação de Edital', 1, '#3498db', 10),
(15, 2, 'Acolhimento de propostas', 2, '#f1c40f', 20),
(17, 2, 'Em análise Técnica', 3, '#9b59b6', 40),
(18, 2, 'Homologado', 4, '#27ae60', 50),
(19, 2, 'Ata/Carona', 5, '#1abc9c', 90),
(20, 2, 'Empenhado', 6, '#2c3e50', 95),
(21, 2, 'Contrato', 7, '#c0392b', 100),
(22, 2, 'Desclassificado', 8, '#7f8c8d', 0),
(23, 2, 'Revogado', 10, '#e74c3c', 0),
(24, 2, 'Fracassado', 9, '#95a5a6', 0),
(25, 2, 'Anulado', 11, '#34495e', 0),
(26, 2, 'Suspenso', 12, '#e67e22', 0),
(27, 1, 'Controle de Entrega', 6, '#8e44ad', 0),
(28, 1, 'Faturado', 10, '#2c3e50', 0),
(29, 3, 'Clientes', 1, '#1e40af', 10),
(30, 3, 'Aguardando Faturamento', 2, '#ca8a04', 50),
(31, 3, 'Faturado', 3, '#166534', 100);

-- --------------------------------------------------------

--
-- Estrutura para tabela `fornecedores`
--

CREATE TABLE `fornecedores` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `fornecedores`
--

INSERT INTO `fornecedores` (`id`, `nome`) VALUES
(1, 'INSTRAMED'),
(2, 'MICROMED'),
(3, 'LIVANOVA'),
(4, 'NIPRO'),
(5, 'MASIMO'),
(6, 'BRASIL MEDICA'),
(7, 'HEALTH'),
(8, 'MERIL'),
(9, 'SIGMAFIX');

-- --------------------------------------------------------

--
-- Estrutura para tabela `fornecedor_metas`
--

CREATE TABLE `fornecedor_metas` (
  `id` int(11) NOT NULL,
  `fornecedor_id` int(11) NOT NULL,
  `ano` int(11) NOT NULL,
  `meta_anual` decimal(15,2) DEFAULT 0.00,
  `meta_mensal` decimal(15,2) DEFAULT 0.00,
  `user_targets_enabled` tinyint(1) DEFAULT 1,
  `meta_mensal_json` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `fornecedor_metas`
--

INSERT INTO `fornecedor_metas` (`id`, `fornecedor_id`, `ano`, `meta_anual`, `meta_mensal`, `user_targets_enabled`, `meta_mensal_json`) VALUES
(13, 6, 2026, 374422.90, 0.00, 1, NULL),
(14, 1, 2025, 0.00, 0.00, 1, NULL),
(15, 1, 2026, 2797953.59, 0.00, 1, NULL),
(19, 2, 2026, 2962754.25, 0.00, 1, NULL),
(23, 7, 2026, 1748250.00, 0.00, 1, NULL),
(24, 3, 2026, 5450000.00, 0.00, 1, NULL),
(29, 5, 2026, 0.00, 0.00, 1, NULL),
(31, 4, 2026, 1740000.00, 0.00, 1, NULL),
(34, 9, 2026, 0.00, 0.00, 1, NULL),
(47, 8, 2026, 0.00, 0.00, 1, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `fornecedor_metas_estados`
--

CREATE TABLE `fornecedor_metas_estados` (
  `id` int(11) NOT NULL,
  `fornecedor_id` int(11) NOT NULL,
  `ano` int(11) NOT NULL,
  `estado` varchar(2) NOT NULL,
  `meta_anual` decimal(15,2) DEFAULT 0.00,
  `meta_mensal_json` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `fornecedor_metas_estados`
--

INSERT INTO `fornecedor_metas_estados` (`id`, `fornecedor_id`, `ano`, `estado`, `meta_anual`, `meta_mensal_json`) VALUES
(21, 6, 2026, 'PE', 93605.76, '{\"1\":7800.48,\"2\":7800.48,\"3\":7800.48,\"4\":7800.48,\"5\":7800.48,\"6\":7800.48,\"7\":7800.48,\"8\":7800.48,\"9\":7800.48,\"10\":7800.48,\"11\":7800.48,\"12\":7800.48}'),
(22, 6, 2026, 'PB', 93605.76, '{\"1\":7800.48,\"2\":7800.48,\"3\":7800.48,\"4\":7800.48,\"5\":7800.48,\"6\":7800.48,\"7\":7800.48,\"8\":7800.48,\"9\":7800.48,\"10\":7800.48,\"11\":7800.48,\"12\":7800.48}'),
(23, 6, 2026, 'RN', 93605.64, '{\"1\":7800.47,\"2\":7800.47,\"3\":7800.47,\"4\":7800.47,\"5\":7800.47,\"6\":7800.47,\"7\":7800.47,\"8\":7800.47,\"9\":7800.47,\"10\":7800.47,\"11\":7800.47,\"12\":7800.47}'),
(24, 6, 2026, 'AL', 93605.74, '{\"1\":7800.47,\"2\":7800.47,\"3\":7800.48,\"4\":7800.48,\"5\":7800.48,\"6\":7800.48,\"7\":7800.48,\"8\":7800.48,\"9\":7800.48,\"10\":7800.48,\"11\":7800.48,\"12\":7800.48}'),
(25, 1, 2025, 'PE', 0.00, '{\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}'),
(26, 1, 2025, 'PB', 0.00, '{\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}'),
(27, 1, 2025, 'RN', 0.00, '{\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}'),
(28, 1, 2026, 'PE', 2797953.59, '{\"1\":174228.58,\"2\":164006.24,\"3\":159006.24,\"4\":193099.12,\"5\":324055.68,\"6\":275924.81,\"7\":234228.54,\"8\":299228.54,\"9\":219793.95,\"10\":275924.81,\"11\":244228.54,\"12\":234228.54}'),
(29, 1, 2026, 'PB', 0.00, '{\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}'),
(38, 2, 2026, 'PE', 500500.00, '{\"1\":250000,\"2\":250500,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}'),
(39, 2, 2026, 'PB', 385750.00, '{\"1\":185250,\"2\":200500,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}'),
(40, 2, 2026, 'RN', 2076504.25, '{\"1\":185654.25,\"2\":1890850,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}'),
(43, 1, 2026, 'AL', 0.00, '{\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}'),
(51, 7, 2026, 'PE', 582750.00, '{\"1\":27500,\"2\":33000,\"3\":60500,\"4\":33000,\"5\":77000,\"6\":76800,\"7\":44000,\"8\":38500,\"9\":60450,\"10\":38500,\"11\":71500,\"12\":22000}'),
(52, 7, 2026, 'PB', 582750.00, '{\"1\":27500,\"2\":33000,\"3\":60500,\"4\":33000,\"5\":77000,\"6\":76800,\"7\":44000,\"8\":38500,\"9\":60450,\"10\":38500,\"11\":71500,\"12\":22000}'),
(54, 7, 2026, 'AL', 582750.00, '{\"1\":27500,\"2\":33000,\"3\":60500,\"4\":33000,\"5\":77000,\"6\":76800,\"7\":44000,\"8\":38500,\"9\":60450,\"10\":38500,\"11\":71500,\"12\":22000}'),
(55, 3, 2026, 'PE', 2750000.00, '{\"1\":150000,\"2\":150000,\"3\":200000,\"4\":200000,\"5\":350000,\"6\":350000,\"7\":350000,\"8\":200000,\"9\":200000,\"10\":200000,\"11\":200000,\"12\":200000}'),
(56, 3, 2026, 'PB', 0.00, '{\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}'),
(57, 3, 2026, 'AL', 2700000.00, '{\"1\":0,\"2\":0,\"3\":150000,\"4\":150000,\"5\":300000,\"6\":300000,\"7\":300000,\"8\":300000,\"9\":300000,\"10\":300000,\"11\":300000,\"12\":300000}'),
(73, 5, 2026, 'PE', 0.00, '{\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}'),
(74, 5, 2026, 'PB', 0.00, '{\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}'),
(75, 5, 2026, 'RN', 0.00, '{\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}'),
(79, 4, 2026, 'PE', 1740000.00, '{\"1\":145000,\"2\":145000,\"3\":145000,\"4\":145000,\"5\":145000,\"6\":145000,\"7\":145000,\"8\":145000,\"9\":145000,\"10\":145000,\"11\":145000,\"12\":145000}'),
(88, 9, 2026, 'PE', 0.00, '{\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}'),
(89, 9, 2026, 'PB', 0.00, '{\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}'),
(90, 9, 2026, 'RN', 0.00, '{\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}'),
(91, 9, 2026, 'AL', 0.00, '{\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}'),
(122, 4, 2026, 'PB', 0.00, '{\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}'),
(123, 8, 2026, 'PE', 0.00, '{\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}'),
(124, 8, 2026, 'PB', 0.00, '{\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}'),
(125, 8, 2026, 'RN', 0.00, '{\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0}');

-- --------------------------------------------------------

--
-- Estrutura para tabela `funis`
--

CREATE TABLE `funis` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `funis`
--

INSERT INTO `funis` (`id`, `nome`, `descricao`) VALUES
(1, 'Funil de Vendas Padrão', 'Funil principal para prospecção de novos clientes.'),
(2, 'Funil Licitações', NULL),
(3, 'Contratos', 'Funil Financeiro para acompanhamento de contratos e faturamentos');

-- --------------------------------------------------------

--
-- Estrutura para tabela `historico_atribuicao`
--

CREATE TABLE `historico_atribuicao` (
  `id` int(11) NOT NULL,
  `oportunidade_id` int(11) NOT NULL,
  `usuario_anterior_id` int(11) DEFAULT NULL,
  `usuario_novo_id` int(11) NOT NULL,
  `data_transferencia` timestamp NOT NULL DEFAULT current_timestamp(),
  `usuario_transferencia_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `kits`
--

CREATE TABLE `kits` (
  `id` int(11) NOT NULL,
  `codigo` varchar(50) DEFAULT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `valor_total` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `kits`
--

INSERT INTO `kits` (`id`, `codigo`, `nome`, `descricao`, `valor_total`, `created_at`, `updated_at`) VALUES
(1, '1723.2024', 'HAM - CEC - LOTE01-ITEM01', NULL, 4211.00, '2026-03-11 16:49:20', '2026-03-11 18:42:52'),
(2, '1723.2024', 'HAM - CEC - LOTE01-ITEM02', NULL, 3758.31, '2026-03-11 18:44:45', '2026-03-11 18:44:45'),
(3, '2869.24', 'PROCAPE - CEC - LOTE03-ITEM03', NULL, 4677.00, '2026-03-12 11:27:44', '2026-03-12 11:27:44'),
(4, '2869.24', 'PROCAPE - CEC - LOTE04-ITEM04-05', NULL, 4751.00, '2026-03-12 11:29:36', '2026-03-12 11:29:36'),
(5, '2869.24', 'PROCAPE - CEC - LOTE05-ITEM06', NULL, 4166.00, '2026-03-12 11:32:27', '2026-03-12 11:32:27'),
(6, '2869.24', 'PROCAPE - CEC - LOTE06-ITEM07', NULL, 4677.00, '2026-03-12 11:35:24', '2026-03-12 11:35:24');

-- --------------------------------------------------------

--
-- Estrutura para tabela `kit_itens`
--

CREATE TABLE `kit_itens` (
  `id` int(11) NOT NULL,
  `kit_id` int(11) NOT NULL,
  `tabela_preco_item_id` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 1,
  `valor_unitario_snapshot` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `kit_itens`
--

INSERT INTO `kit_itens` (`id`, `kit_id`, `tabela_preco_item_id`, `quantidade`, `valor_unitario_snapshot`) VALUES
(12, 1, 5, 1, 350.00),
(13, 1, 3, 1, 1592.05),
(14, 1, 6, 1, 681.00),
(15, 1, 8, 1, 390.68),
(16, 1, 10, 1, 571.27),
(17, 1, 11, 1, 626.00),
(18, 2, 13, 1, 230.00),
(19, 2, 18, 1, 400.00),
(20, 2, 17, 1, 525.00),
(21, 2, 16, 1, 390.00),
(22, 2, 14, 1, 1392.31),
(23, 2, 15, 1, 821.00),
(24, 3, 39, 1, 681.00),
(25, 3, 40, 1, 626.00),
(26, 3, 41, 1, 391.00),
(27, 3, 42, 1, 800.00),
(28, 3, 43, 1, 2179.00),
(29, 4, 24, 1, 630.00),
(30, 4, 25, 1, 389.09),
(31, 4, 26, 1, 418.30),
(32, 4, 27, 1, 913.61),
(33, 4, 28, 1, 2400.00),
(34, 5, 30, 1, 681.00),
(35, 5, 31, 1, 626.00),
(36, 5, 32, 1, 391.00),
(37, 5, 35, 1, 800.00),
(38, 5, 37, 1, 1668.00),
(39, 6, 39, 1, 681.00),
(40, 6, 40, 1, 626.00),
(41, 6, 41, 1, 391.00),
(42, 6, 42, 1, 800.00),
(43, 6, 43, 1, 2179.00);

-- --------------------------------------------------------

--
-- Estrutura para tabela `leads`
--

CREATE TABLE `leads` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(50) DEFAULT NULL,
  `origem` varchar(100) NOT NULL DEFAULT 'Meta Ads',
  `sub_origem` varchar(255) DEFAULT NULL,
  `campanha` varchar(255) DEFAULT NULL,
  `observacao` text DEFAULT NULL,
  `produto` varchar(255) DEFAULT NULL,
  `produto_interesse` varchar(100) DEFAULT NULL,
  `form_id` varchar(255) DEFAULT NULL,
  `leadgen_id` varchar(255) DEFAULT NULL,
  `dados_brutos` text DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Novo',
  `data_chegada` timestamp NOT NULL DEFAULT current_timestamp(),
  `oportunidade_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `leads`
--

INSERT INTO `leads` (`id`, `nome`, `email`, `telefone`, `origem`, `sub_origem`, `campanha`, `observacao`, `produto`, `produto_interesse`, `form_id`, `leadgen_id`, `dados_brutos`, `status`, `data_chegada`, `oportunidade_id`) VALUES
(10, 'Lídia Rocha', 'masantos.lidia@outlook.com', '+5581999890075', 'Meta Ads', NULL, NULL, NULL, NULL, NULL, '1814290879464646', '1538095770518569', '{\n    \"created_time\": \"2025-10-14T12:14:50+0000\",\n    \"id\": \"1538095770518569\",\n    \"field_data\": [\n        {\n            \"name\": \"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\n            \"values\": [\n                \"81999890075\"\n            ]\n        },\n        {\n            \"name\": \"email\",\n            \"values\": [\n                \"masantos.lidia@outlook.com\"\n            ]\n        },\n        {\n            \"name\": \"full_name\",\n            \"values\": [\n                \"L\\u00eddia Rocha\"\n            ]\n        },\n        {\n            \"name\": \"phone_number\",\n            \"values\": [\n                \"+5581999890075\"\n            ]\n        }\n    ]\n}', 'novo', '2025-10-14 12:14:56', NULL),
(11, 'Katia Oliveira', 'nanny_isa@hotmail.com', '+5587991466089', 'Meta Ads', NULL, NULL, NULL, NULL, NULL, '2239635346507878', '1699761530664534', '{\n    \"created_time\": \"2025-10-14T13:45:53+0000\",\n    \"id\": \"1699761530664534\",\n    \"field_data\": [\n        {\n            \"name\": \"email\",\n            \"values\": [\n                \"nanny_isa@hotmail.com\"\n            ]\n        },\n        {\n            \"name\": \"nome_completo\",\n            \"values\": [\n                \"Katia Oliveira\"\n            ]\n        },\n        {\n            \"name\": \"telefone\",\n            \"values\": [\n                \"+5587991466089\"\n            ]\n        },\n        {\n            \"name\": \"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\n            \"values\": [\n                \"87991466089\"\n            ]\n        }\n    ]\n}', 'novo', '2025-10-14 13:45:56', NULL),
(17, 'Hugo Andrey', 'handreyu@gmail.com', '86999052321', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-14T23:57:30+0000\",\"id\":\"1542638306761067\",\"field_data\":[{\"name\":\"email\",\"values\":[\"handreyu@gmail.com\"]},{\"name\":\"nome_completo\",\"values\":[\"Hugo Andrey\"]},{\"name\":\"telefone\",\"values\":[\"+5586999052321\"]},{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"86999052321\"]}]}', 'Novo', '2025-10-14 23:57:34', NULL),
(18, 'Luiz Farias Costa', 'lulinha_fariasc@hotmail.com', '82999703465', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-15T12:20:08+0000\",\"id\":\"787420764204101\",\"field_data\":[{\"name\":\"email\",\"values\":[\"lulinha_fariasc@hotmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Luiz Farias Costa\"]},{\"name\":\"phone_number\",\"values\":[\"+5582999703465\"]},{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"82999703465\"]}]}', 'Novo', '2025-10-15 12:20:13', NULL),
(24, 'Marcos José de Moura', 'mjmmarcosmoura@gmail.com', '84981836429', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-16T14:36:57+0000\",\"id\":\"2223781094780469\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"84981836429\"]},{\"name\":\"email\",\"values\":[\"mjmmarcosmoura@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Marcos Jos\\u00e9 de Moura\"]},{\"name\":\"phone_number\",\"values\":[\"+5584981836429\"]}]}', 'Novo', '2025-10-16 14:37:03', NULL),
(25, 'JPS', 'jpaulosuassuna@gmail.com', '84 999048498', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-16T14:42:29+0000\",\"id\":\"1480502396536408\",\"field_data\":[{\"name\":\"email\",\"values\":[\"jpaulosuassuna@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"JPS\"]},{\"name\":\"phone_number\",\"values\":[\"84999048498\"]},{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"84 999048498\"]}]}', 'Novo', '2025-10-16 14:42:34', NULL),
(26, 'Gil Montanha', 'gil_gpsf@hotmail.com', '81989060202', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-16T22:08:19+0000\",\"id\":\"1485793766005005\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81989060202\"]},{\"name\":\"email\",\"values\":[\"gil_gpsf@hotmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Gil Montanha\"]},{\"name\":\"phone_number\",\"values\":[\"+5581989060202\"]}]}', 'Novo', '2025-10-16 22:08:23', NULL),
(29, 'Gabriel', 'gabriel.alencarl29@gmail.com', 'Qual valor? 084981110754', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-18T00:06:00+0000\",\"id\":\"1333681295098853\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"Qual valor? 084981110754\"]},{\"name\":\"email\",\"values\":[\"gabriel.alencarl29@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Gabriel\"]},{\"name\":\"phone_number\",\"values\":[\"+5584981110754\"]}]}', 'Cliente Potencial', '2025-10-18 00:06:05', NULL),
(30, 'Berna Cavalcante', 'dantoncavalcantedesouza@gmail.com', '81985167508', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-18T01:08:02+0000\",\"id\":\"1116608563951202\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81985167508\"]},{\"name\":\"email\",\"values\":[\"dantoncavalcantedesouza@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Berna Cavalcante\"]},{\"name\":\"phone_number\",\"values\":[\"+5581985167508\"]}]}', 'Cliente Potencial', '2025-10-18 01:08:07', NULL),
(31, 'Felipe Lyra', 'lyra.engenharia@gmail.com', '83 988566384', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-18T01:56:47+0000\",\"id\":\"804951585764617\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"83 988566384\"]},{\"name\":\"email\",\"values\":[\"lyra.engenharia@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Felipe Lyra\"]},{\"name\":\"phone_number\",\"values\":[\"+5583988566384\"]}]}', 'Cliente Potencial', '2025-10-18 01:56:52', NULL),
(32, 'Junior Hentz', 'juniorhentz@hotmail.com', '81981708308', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-18T12:19:47+0000\",\"id\":\"796816126611688\",\"field_data\":[{\"name\":\"email\",\"values\":[\"juniorhentz@hotmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Junior Hentz\"]},{\"name\":\"phone_number\",\"values\":[\"+5581981708308\"]},{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81981708308\"]}]}', 'Novo', '2025-10-18 12:19:52', NULL),
(33, 'Rafaello Fernandes', 'rafaelafernandesdelima@gmail.com', '87996097891', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-18T16:07:04+0000\",\"id\":\"25602899955977289\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"87996097891\"]},{\"name\":\"email\",\"values\":[\"rafaelafernandesdelima@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Rafaello Fernandes\"]},{\"name\":\"phone_number\",\"values\":[\"+5587996097891\"]}]}', 'Cliente Potencial', '2025-10-18 16:07:10', NULL),
(34, '𝐽𝑢𝑢ℎ 𝐶𝑜𝑠𝑡𝑎', 'junny94.costa@gmail.com', '82998396215', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-19T07:32:08+0000\",\"id\":\"3692346951072128\",\"field_data\":[{\"name\":\"email\",\"values\":[\"junny94.costa@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"\\ud835\\udc3d\\ud835\\udc62\\ud835\\udc62\\u210e \\ud835\\udc36\\ud835\\udc5c\\ud835\\udc60\\ud835\\udc61\\ud835\\udc4e\"]},{\"name\":\"phone_number\",\"values\":[\"+5582998396215\"]},{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"82998396215\"]}]}', 'Novo', '2025-10-19 07:32:13', NULL),
(35, 'BrenoNobre', 'brnobre1982@gmail.com', '83996336756', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-19T10:41:05+0000\",\"id\":\"1921092835123005\",\"field_data\":[{\"name\":\"email\",\"values\":[\"brnobre1982@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"BrenoNobre\"]},{\"name\":\"phone_number\",\"values\":[\"+5583996336756\"]},{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"83996336756\"]}]}', 'Novo', '2025-10-19 10:41:09', NULL),
(36, 'Iannagi Souza', 'iannagi_souza@hotmail.com', 'Sim', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-19T15:50:12+0000\",\"id\":\"1346850579690417\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"Sim\"]},{\"name\":\"email\",\"values\":[\"iannagi_souza@hotmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Iannagi Souza\"]},{\"name\":\"phone_number\",\"values\":[\"+5584996622487\"]}]}', 'Novo', '2025-10-19 15:50:17', NULL),
(37, 'Raqueline Ramos', 'iranipessoa863@gmail.com', '81988023705', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-19T16:04:34+0000\",\"id\":\"1524440855419670\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81988023705\"]},{\"name\":\"email\",\"values\":[\"iranipessoa863@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Raqueline Ramos\"]},{\"name\":\"phone_number\",\"values\":[\"+5581985336232\"]}]}', 'Novo', '2025-10-19 16:04:38', NULL),
(38, 'Andreza Mara Reinaldo Quirino', 'andrezamara59@gmail.com', '92050057', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-19T16:41:53+0000\",\"id\":\"1136772548604735\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"92050057\"]},{\"name\":\"email\",\"values\":[\"andrezamara59@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Andreza Mara Reinaldo Quirino\"]},{\"name\":\"phone_number\",\"values\":[\"+5584992050057\"]}]}', 'Novo', '2025-10-19 16:41:57', NULL),
(39, 'Renata Patricia', 'renatapatriciaaraujo21@gmail.com', '81988309709', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-19T18:00:05+0000\",\"id\":\"1608841013614941\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81988309709\"]},{\"name\":\"email\",\"values\":[\"renatapatriciaaraujo21@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Renata Patricia\"]},{\"name\":\"phone_number\",\"values\":[\"+5581988309709\"]}]}', 'Novo', '2025-10-19 18:00:09', NULL),
(41, 'Thaís Araújo', 'tagomara7@gmail.com', '81996526673', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-20T11:25:36+0000\",\"id\":\"1557844318722613\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81996526673\"]},{\"name\":\"email\",\"values\":[\"tagomara7@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Tha\\u00eds Ara\\u00fajo\"]},{\"name\":\"phone_number\",\"values\":[\"+5581996526674\"]}]}', 'Cliente Potencial', '2025-10-20 11:25:43', NULL),
(42, 'Jéssica Silva', 'pavsub2023.2@gmail.com', '81985923634', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-20T12:06:27+0000\",\"id\":\"1083929410308459\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81985923634\"]},{\"name\":\"email\",\"values\":[\"pavsub2023.2@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"J\\u00e9ssica Silva\"]},{\"name\":\"phone_number\",\"values\":[\"+5581985923634\"]}]}', 'Novo', '2025-10-20 12:06:32', NULL),
(43, 'Natalia vilela', 'joaofalcaosobral@hotmail.com', '87996043826', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-20T22:47:23+0000\",\"id\":\"1111710677655280\",\"field_data\":[{\"name\":\"email\",\"values\":[\"joaofalcaosobral@hotmail.com\"]},{\"name\":\"nome_completo\",\"values\":[\"Natalia vilela\"]},{\"name\":\"telefone\",\"values\":[\"+5587996043826\"]},{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"87996043826\"]}]}', 'Novo', '2025-10-20 22:47:28', NULL),
(44, 'Márcia Moura', '25marciamoura@gmail.com', '81 999225490', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-21T11:01:59+0000\",\"id\":\"1148271823478603\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81 999225490\"]},{\"name\":\"email\",\"values\":[\"25marciamoura@gmail.com\"]},{\"name\":\"nome_completo\",\"values\":[\"M\\u00e1rcia Moura\"]},{\"name\":\"telefone\",\"values\":[\"+558199225490\"]}]}', 'Novo', '2025-10-21 11:02:04', NULL),
(45, 'Lindomar Souza', 'lindomarsouzaufrn@gmail.com', '84 99949 8595', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-21T16:21:04+0000\",\"id\":\"2014423829412351\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"84 99949 8595\"]},{\"name\":\"email\",\"values\":[\"lindomarsouzaufrn@gmail.com\"]},{\"name\":\"nome_completo\",\"values\":[\"Lindomar Souza\"]},{\"name\":\"telefone\",\"values\":[\"+5584999498595\"]}]}', 'Novo', '2025-10-21 16:21:09', NULL),
(46, 'Antonnya Duart', 'freetimeconsult7@gmail.com', '81992843253', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-21T17:35:33+0000\",\"id\":\"1369335914852789\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81992843253\"]},{\"name\":\"email\",\"values\":[\"freetimeconsult7@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Antonnya Duart\"]},{\"name\":\"phone_number\",\"values\":[\"+558192843253\"]}]}', 'Novo', '2025-10-21 17:35:36', NULL),
(47, 'Ricardo Gouveia Da Silva', 'blogdoricardolima@gmail.com', '81994989308', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-21T17:48:17+0000\",\"id\":\"1176333157243083\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81994989308\"]},{\"name\":\"email\",\"values\":[\"blogdoricardolima@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Ricardo Gouveia Da Silva\"]},{\"name\":\"phone_number\",\"values\":[\"+558194989308\"]}]}', 'Novo', '2025-10-21 17:48:21', NULL),
(48, 'Janathan Melo', 'rutelinemelo1@gmail.com', '84 98780-2551', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-21T23:00:06+0000\",\"id\":\"841657021724934\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"84 98780-2551\"]},{\"name\":\"email\",\"values\":[\"rutelinemelo1@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Janathan Melo\"]},{\"name\":\"phone_number\",\"values\":[\"+84999128736\"]}]}', 'Novo', '2025-10-21 23:00:10', NULL),
(49, 'José Neto Siqueira', 'netosahara@hotmail.com', '81992467285', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-22T00:42:27+0000\",\"id\":\"807372145254481\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81992467285\"]},{\"name\":\"email\",\"values\":[\"netosahara@hotmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Jos\\u00e9 Neto Siqueira\"]},{\"name\":\"phone_number\",\"values\":[\"+5581992467285\"]}]}', 'Novo', '2025-10-22 00:42:31', NULL),
(50, 'Manuelly Vasconcelos', 'manuandrade105@gmail.com', '81982770698', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-22T01:57:32+0000\",\"id\":\"831659012881818\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81982770698\"]},{\"name\":\"email\",\"values\":[\"manuandrade105@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Manuelly Vasconcelos\"]},{\"name\":\"phone_number\",\"values\":[\"+5581982770698\"]}]}', 'Novo', '2025-10-22 01:57:36', NULL),
(51, 'Mavio Almeida', 'maviothi@gmail.com', '81985981927', 'Meta Ads', NULL, NULL, NULL, 'Não informado', '', NULL, NULL, '{\"created_time\":\"2025-10-22T02:51:35+0000\",\"id\":\"1356155699459075\",\"field_data\":[{\"name\":\"email\",\"values\":[\"maviothi@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Mavio Almeida\"]},{\"name\":\"phone_number\",\"values\":[\"+5581988021726\"]},{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81985981927\"]}]}', 'Novo', '2025-10-22 02:51:40', NULL),
(52, 'Rivonaldo Filho Condutor', 'rjsmonteiro@hotmail.com', 'Qual valor?', 'Meta Ads', NULL, NULL, NULL, 'Não informado', NULL, NULL, NULL, '{\"created_time\":\"2025-10-22T10:44:37+0000\",\"id\":\"4162846903963027\",\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"Qual valor?\"]},{\"name\":\"email\",\"values\":[\"rjsmonteiro@hotmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Rivonaldo Filho Condutor\"]},{\"name\":\"phone_number\",\"values\":[\"+558294045770\"]}]}', 'Novo', '2025-10-22 10:44:42', NULL),
(57, 'Paulo', NULL, '(84) 9402-1477', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(59, 'Compras HG e HMJ', NULL, '(81) 9257-2119', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(60, 'Euzi', NULL, '(81) 8667-8801', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(61, 'Alessandra', NULL, '(81)9732-2716', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(62, 'Jeisa', NULL, '(81) 9738-5662', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(66, 'Gabi', NULL, '(81) 8759-6864', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(67, 'Inaldo Junior - Jmed', NULL, '(81) 8253-8817', 'Enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(68, 'Ivonete', NULL, '(83) 9399-8056', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(69, 'Rejane', NULL, '(81) 8279-3645', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(70, 'Pedro Hapvida Macio', NULL, '(82) 8870-9709', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(71, 'Clube de Campo Alvorada', NULL, '(81) 8758-8176', 'Enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(73, 'José Severino', NULL, '(81) 9466-5108', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(74, 'Alanides', NULL, '(81) 8419-4692', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(75, 'Sandra Alves', NULL, '(81) 9410-4837', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(76, 'Gaudencio Araujo', NULL, '(81) 9376-2694', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(77, 'Maladena Hospital De Avila', NULL, '(81) 9685-6612', 'Enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(78, 'Bryanna', NULL, '(81) 9225-4334', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(79, 'Antonio Macio', NULL, '(82) 9412-8856', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(80, 'Sem nome', NULL, '(87) 8160-5797', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(81, 'Lavinha', NULL, '(87) 8160-8764', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(82, 'Souza Filho', NULL, '(81) 9276-9576', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(83, 'Sem nome', NULL, '(81) 8788-3479', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(85, 'Gilvani Oliveira', NULL, '(81) 8690-9328', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(86, 'Stbio', NULL, '(87) 8109-2494', 'Enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(88, 'Ana Claudia - SCB saude mental', NULL, '(81)  9849-3451', 'Enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(89, 'Henrique', NULL, '(81) 8377-8626', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(90, 'Julio Cesar', NULL, '(81) 9717-7289', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(91, 'Wilson Ouriques', NULL, '(83) 99304-9722', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(92, 'Norma', NULL, '(81) 9675-2815', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(93, 'Aparecida', NULL, '(89) 9405-2612', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(94, 'Dora Laurentino', NULL, '(81) 9962-7938', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(95, 'Jussara - Secretaria de Saude JP', NULL, '(83) 9326-8446', 'Enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(96, 'Eduardo Barbosa', NULL, '(81) 9654-3595', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(98, 'Bianca - Manutenção Oncologia Dor', NULL, '(81) 8140-3835', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(99, 'Janilene Alves', NULL, '(81) 8652-7693', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(100, 'Clélio Júnior', NULL, '(81) 9606-0640', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(101, 'Maria do Carmo Fraga', NULL, '(81) 8825-1705', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(102, 'Cristina Leite', NULL, '(82) 8868-2452', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(103, 'Não informado', NULL, '(82) 9422-0333', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(104, 'Mariana Araujo', NULL, '(81) 9994-6386', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(105, 'Neide', NULL, '(83) 8722-3639', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(106, 'Ednaldo Bruno', NULL, '(84) 9686-9335', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(107, 'Jose Kebson', NULL, '(81) 9633-9084', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(108, 'Cícera', NULL, '(87) 8150-8762', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(109, 'Bruno', NULL, '(82) 9940-5190', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(110, 'Carmen', NULL, '(81) 8804-0228', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(111, 'Cleiton', NULL, '(81) 9184-1511', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(112, 'Robson', NULL, '(82) 9644-0488', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(113, 'Hospital São Paulo CC', NULL, '(86) 8804-8563', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(114, 'Marta Suelene', NULL, '(81) 9948-9398', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(115, 'Felipe', NULL, '(81) 7308-9706', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(117, 'Marcos Túlio', NULL, '(81) 99676-0743', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(118, 'Evandro Batista da Silva', '1', '(81)98330-2947', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(119, 'Marcone Ramalho', NULL, '(81) 98408-0477', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(120, 'Valéria', NULL, '(81) 98911-6200', 'Não Enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(121, 'Maria do Carmo Gouveia', NULL, '(81) 99890-3912', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(122, 'Não informado', NULL, '(84) 99653-2405', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(124, 'Ana Luisa', NULL, '(83) 98767-4380', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(125, 'Patricia Valentina', NULL, '(81) 99874-1386', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(126, 'Marcone Ramalho', NULL, '(81) 8408-0477', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(128, 'Amanda Santos', NULL, '(81) 99885-9910', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(129, 'Sérgio Gomes', NULL, '(81) 98577-6339', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(130, 'Cecilia telles', NULL, '(81) 99628-5700', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(131, 'Izabela', NULL, '(81) 98230-7845', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(132, 'Rayellen Gomes', NULL, '(81) 98915-9142', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(133, 'Dra Adeline', NULL, '(81) 9456-4176', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(134, 'Ariadne Farias', NULL, '(81) 98415-0633', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(135, 'Francisco Felipe', NULL, '(84) 99879-4963', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(136, 'Brenda', NULL, '(87) 98124-0424', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(137, 'Patricia Rocha', NULL, '(81) 99382-4009', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(138, 'Paiva', NULL, '(81) 99951-3952', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(139, 'Não informado', NULL, '(81) 98364-7268', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(140, 'Roberta', NULL, '(81) 99612-0233', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(142, 'Katarina', NULL, '(81) 97904-3723', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(143, 'Sanderson', NULL, '(81) 98633-7156', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(144, 'Ana Paula', NULL, '(81) 98349-4120', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(145, 'Luanna Holanda', NULL, '(81) 98498-5879', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(146, 'Não informado', NULL, '(81) 98483-2475', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(147, 'Ronaldo Luis', NULL, '(81) 98884-2585', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(148, 'Kp Estética Facial e Corporal', NULL, '(81) 99317-8039', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(149, 'Maria Priscila', NULL, '(81) 99849-3558', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(150, 'Elizete Bernardo', NULL, '(81) 98669-2869', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(151, 'Adriana', NULL, '(87) 99916-2807', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(154, 'Mary', NULL, '(82) 99611-5589', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(155, 'Não informado', NULL, '(81) 98831-8889', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(156, 'Jardel', NULL, '(81) 99346-1017', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(157, 'Marcos Tenório Oliveira', NULL, '(82) 98871-2215', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(158, 'Fausto', NULL, '(81) 97912-1135', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(159, 'Não informado', NULL, '(81) 99481-9064', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(160, 'Isabel', NULL, '(81) 98315-1676', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(161, 'Esmeraldo', NULL, '(81) 98419-5187', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(162, 'Andreiza Lima', NULL, '(81) 99899-2247', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(163, 'Rosângela Assunção', NULL, '(81) 98484-1700', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(164, 'Cecy', NULL, '(81) 98881-1907', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(165, 'Geilda', NULL, '(81) 98432-3180', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(166, 'Arianne Ribeiro', NULL, '(83) 99665-3137', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(167, 'Sandy Oliveira', NULL, '(81) 98563-7792', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(168, 'Não informado', NULL, '(81) 99847-2966', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(169, 'Diógenes Lima', NULL, '(81) 98155-0348', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(171, 'Lara Medeiros', NULL, '(82) 99409-8599', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(172, 'Maria Vitória', NULL, '(81) 99286-7123', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(173, 'Dr. Ivany Junior', NULL, '(83) 99982-1545', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(174, 'Lucia', NULL, '(81) 98435-0960', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(175, 'Antonio', NULL, '(81) 98855-3625', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(176, 'Tania Begim', NULL, '(82) 99621-8479', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(177, 'Anna Barbara Aragão', NULL, '(81) 99726-4104', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(178, 'Leandro Fernandes', NULL, '(83) 98896-2065', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(179, 'Maria Clara Palmeira', NULL, '(82) 98886-2965', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(180, 'Singridy Mikaela', NULL, '(81) 98315-0971', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(181, 'Andreza Silva', NULL, '(81) 98699-6759', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(182, 'Marcione Andrade', NULL, '(81) 99448-1588', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(183, 'Mary', NULL, '(81) 98888-0629', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(184, 'Não informado', NULL, '(82) 99646-6918', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(185, 'Não informado', NULL, '(82) 97604-5107', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(186, 'Não informado', NULL, '(81) 99643-2645', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(187, 'Joana', NULL, '(83) 99913-0643', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(188, 'Não informado', NULL, '(81) 99810-5865', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(189, 'Daiva Ventura', NULL, '(81) 99401-6388', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(190, 'Não informado', NULL, '(81) 99809-5047', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(191, 'Mary', NULL, '(82) 99135-1063', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(192, 'Não informado', NULL, '(83) 98905-5464', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(193, 'Alyne', NULL, '(81) 99872-3055', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(194, 'Ilka Guerra', NULL, '(81) 99514-0274', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(195, 'Andreia', NULL, '(81) 99227-9234', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(197, 'Flavia', NULL, '(81) 98667-4495', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(198, 'Vanessa Karina', NULL, '(84) 99948-3812', 'Enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(199, 'Mirela Vaz', NULL, '(87) 99905-9595', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(201, 'Ana Caldas', NULL, '(82) 99640-3132', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(202, 'Nathy', NULL, '(81) 99967-9091', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(203, 'Veronica', NULL, '(81) 99524-0582', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(204, 'Taciana Correia', NULL, '(82) 99681-8909', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(205, 'Dr. Miguel', NULL, '(81) 97120-4885', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(206, 'Leila Vilela', NULL, '(82) 99822-9634', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(207, 'Carla Santos', NULL, '(81)99517-0330', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(208, 'Nary Rane', NULL, '(81) 99360-0232', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(209, 'Gisela Araujo', NULL, '(81) 99129-1329', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(210, 'Mirella Beltrão', NULL, '(81) 98821-6862', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(211, 'Adson Lopes', NULL, '(82) 99932-6666', 'Enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(212, 'Lorenzo', NULL, '(81) 99920-2323', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(213, 'Alice', NULL, '(81) 98771-9947', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(214, 'Allamberg', NULL, '(81) 99638-9478', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(215, 'Thiago Ramos', NULL, '(81) 99997-3695', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(216, 'Higor Cortez', NULL, '(84) 99903-2721', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(217, 'Joselina', NULL, '(84) 99668-8521', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(218, 'Poliana', NULL, '(81) 99956-3986', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(219, 'Tay Rb', NULL, '(81) 98698-8886', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(220, 'Luís Santino', NULL, '(81) 99380-1868', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(221, 'Socorro', NULL, '(83) 98861-6937', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(222, 'Ana', NULL, '(82) 99654-5746', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(223, 'Ivone', NULL, '(81) 98585-7610', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(224, 'Ketrelyn', NULL, '(82) 99829-9268', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(225, 'Milena', NULL, '(81) 98642-7628', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(226, 'Evelly Alves', NULL, '(81) 98873-5901', 'Enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(227, 'Anubia', NULL, '(83) 98153-8558', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(228, 'Rita Regis', NULL, '(84) 99959-8959', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(229, 'Fernando', NULL, '(84) 98831-4712', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(231, 'Eronildo Júnior', NULL, '(81) 99519-9436', 'Enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(232, 'Fernanda', NULL, '(81) 98661-3430', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(234, 'Bia Queiroz', NULL, '(81) 9264-8810', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(235, 'Dlania', NULL, '(81) 99498-0560', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(237, 'Compras Nordpharma', NULL, '(81) 99625-2093', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(238, 'Edneide', NULL, '(83) 98732-0187', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(239, 'Pedro', NULL, '(81) 99959-4068', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(240, 'Leo', NULL, '(81) 99827-3397', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(241, 'Cida Claudino', NULL, '(82) 99646-5187', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(242, 'Daniel Santos', NULL, '(81) 99526-8353', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(243, 'Frinscal Distribuidora', NULL, '(81) 99951-2101', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(245, 'Gilberto', NULL, '(87) 99932-2261', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(246, 'Rita Guilherme', NULL, '(81) 98547-8038', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(247, 'Francisco', NULL, '(84) 99987-7471', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(248, 'Edvalda', NULL, '(81) 99475-9665', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(249, 'Capelão Pr Jose Junior', NULL, '(84) 99610-6991', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(250, 'Não informado', NULL, '(81) 99691-4892', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(251, 'Não informado', NULL, '(83) 99673-0654', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(252, 'Comprasdualmed', NULL, '(87) 98115-0063', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(253, 'Sonia Brandão', NULL, '(81) 98767-3389', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(254, 'Luciana Petiz', NULL, '(81) 99846-9730', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(255, 'Lucimar', NULL, '(81) 99338-7399', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(256, 'Lais', NULL, '(81) 99332-6035', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(257, 'Jacinta Rodrigues', NULL, '(83) 98714-0490', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(258, 'Williams Freitas', NULL, '(81) 99212-8089', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(259, 'Alciram', NULL, '(82) 99608-9558', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(260, 'Não informado', NULL, '(88) 99913-6476', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(261, 'Mariana Bezerra', NULL, '(82) 99954-0473', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(262, 'Yenis', NULL, '(83) 99600-1912', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(263, 'Virginia', NULL, '(81) 99609-3653', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(265, 'Fabiana Nascimento', NULL, '(81) 98608-2795', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(266, 'Suely', NULL, '(81) 99367-7777', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(267, 'Paulo Dias', NULL, '(84) 99830-3158', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(268, 'Mario Monteio', NULL, '(84) 99619-7058', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(269, 'Vânia Medeiros', NULL, '(84) 99605-3989', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(270, 'João Joenio', NULL, '(83) 99964-3652', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(272, 'Andrely', NULL, '(81) 99865-7437', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(273, 'Não informado', NULL, '(83) 99349-2025', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(274, 'Larissa Galindo', NULL, '(81) 98915-7206', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(275, 'Marcos Valença', NULL, '(81) 99927-6533', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(276, 'Não informado', NULL, '(81) 98287-6228', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(278, 'Elton Guilherme', NULL, '(83) 98163-3678', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(279, 'Lara Almeida', NULL, '(87) 99992-9700', 'Não enviado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Novo', '2025-10-22 19:20:02', NULL),
(281, 'Alexandre Andrade', 'elianee.andrade1965@gmail.com', '82996997815', 'Meta Ads', NULL, NULL, NULL, NULL, 'FR_Oximetro', NULL, NULL, '{\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"82996997815\"]},{\"name\":\"email\",\"values\":[\"elianee.andrade1965@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Alexandre Andrade\"]},{\"name\":\"phone_number\",\"values\":[\"82996997815\"]}],\"form_id\":\"1814290879464646\",\"id\":\"1377837637188782\"}', 'Novo', '2025-10-23 15:41:25', NULL),
(282, 'Franklin Nascimento', 'franklinre13@gmail.com', 'Oi', 'Meta Ads', NULL, NULL, NULL, NULL, 'FR_Oximetro', NULL, NULL, '{\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"Oi\"]},{\"name\":\"email\",\"values\":[\"franklinre13@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Franklin Nascimento\"]},{\"name\":\"phone_number\",\"values\":[\"+5584991445986\"]}],\"form_id\":\"1814290879464646\",\"id\":\"1998541987650089\"}', 'Novo', '2025-10-23 16:57:52', NULL),
(283, 'Isabela Fernandes', 'isabela.fernandes@gmail.com', '84996219878', 'Meta Ads', NULL, NULL, NULL, NULL, 'FR_Ultrasoom', NULL, NULL, '{\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"84996219878\"]},{\"name\":\"email\",\"values\":[\"isabela.fernandes@gmail.com\"]},{\"name\":\"nome_completo\",\"values\":[\"Isabela Fernandes\"]},{\"name\":\"telefone\",\"values\":[\"+5584996219878\"]}],\"form_id\":\"2239635346507878\",\"id\":\"1330201108798609\"}', 'Novo', '2025-10-23 20:17:55', NULL),
(284, 'Jose Ramos Junior', 'juniormed.jsrj@outlook.com', '81985857999', 'Meta Ads', NULL, NULL, NULL, NULL, 'FR_Ultrasoom', NULL, NULL, '{\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81985857999\"]},{\"name\":\"email\",\"values\":[\"juniormed.jsrj@outlook.com\"]},{\"name\":\"nome_completo\",\"values\":[\"Jose Ramos Junior\"]},{\"name\":\"telefone\",\"values\":[\"+5581985857999\"]}],\"form_id\":\"2239635346507878\",\"id\":\"25288931894033297\"}', 'Novo', '2025-10-23 21:54:41', NULL);
INSERT INTO `leads` (`id`, `nome`, `email`, `telefone`, `origem`, `sub_origem`, `campanha`, `observacao`, `produto`, `produto_interesse`, `form_id`, `leadgen_id`, `dados_brutos`, `status`, `data_chegada`, `oportunidade_id`) VALUES
(285, 'Adriana  Amorim', 'dricaamorim@terra.com.br', '81997448840', 'Meta Ads', NULL, NULL, NULL, NULL, 'FR_Ultrasoom', NULL, NULL, '{\"field_data\":[{\"name\":\"email\",\"values\":[\"dricaamorim@terra.com.br\"]},{\"name\":\"nome_completo\",\"values\":[\"Adriana  Amorim\"]},{\"name\":\"telefone\",\"values\":[\"+5581997448840\"]},{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81997448840\"]}],\"form_id\":\"2239635346507878\",\"id\":\"1846377679599596\"}', 'Novo', '2025-10-24 01:06:28', NULL),
(286, 'Brando Kayke', 'caiqueherbert281@gmail.com', '84996844405', 'Meta Ads', NULL, NULL, NULL, NULL, 'FR_Oximetro', NULL, NULL, '{\"field_data\":[{\"name\":\"email\",\"values\":[\"caiqueherbert281@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Brando Kayke\"]},{\"name\":\"phone_number\",\"values\":[\"+5584996844405\"]},{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"84996844405\"]}],\"form_id\":\"1814290879464646\",\"id\":\"1481024166464568\"}', 'Novo', '2025-10-24 16:48:09', NULL),
(287, 'Erivaldo Santos', 'erijose2024@gmail.com', '81995030600', 'Meta Ads', NULL, NULL, NULL, NULL, 'FR_Oximetro', NULL, NULL, '{\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81995030600\"]},{\"name\":\"email\",\"values\":[\"erijose2024@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Erivaldo Santos\"]},{\"name\":\"phone_number\",\"values\":[\"+5581986802985\"]}],\"form_id\":\"1814290879464646\",\"id\":\"828779252968363\"}', 'Novo', '2025-10-24 19:33:02', NULL),
(288, 'Conceição Brito', 'mclb.2021@yahoo.com', '81 996164363', 'Meta Ads', NULL, NULL, NULL, NULL, 'FR_Oximetro', NULL, NULL, '{\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81 996164363\"]},{\"name\":\"email\",\"values\":[\"mclb.2021@yahoo.com\"]},{\"name\":\"full_name\",\"values\":[\"Concei\\u00e7\\u00e3o Brito\"]},{\"name\":\"phone_number\",\"values\":[\"+5581996164363\"]}],\"form_id\":\"1814290879464646\",\"id\":\"1168033857989584\"}', 'Novo', '2025-10-24 19:33:48', NULL),
(289, 'havana carla', 'havanacarla70@gmail.com', '81 986821867', 'Meta Ads', NULL, NULL, NULL, NULL, 'FR_Oximetro', NULL, NULL, '{\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81 986821867\"]},{\"name\":\"email\",\"values\":[\"havanacarla70@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"havana carla\"]},{\"name\":\"phone_number\",\"values\":[\"+5581986821867\"]}],\"form_id\":\"1814290879464646\",\"id\":\"1345262357244133\"}', 'Novo', '2025-10-25 02:24:30', NULL),
(290, 'Herickssen Medeiros', 'herick_guga@hotmail.com', '81995083070', 'Meta Ads', NULL, NULL, NULL, NULL, 'FR_Ultrasoom', NULL, NULL, '{\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81995083070\"]},{\"name\":\"email\",\"values\":[\"herick_guga@hotmail.com\"]},{\"name\":\"nome_completo\",\"values\":[\"Herickssen Medeiros\"]},{\"name\":\"telefone\",\"values\":[\"+5581995083070\"]}],\"form_id\":\"2239635346507878\",\"id\":\"1110198277770966\"}', 'Novo', '2025-10-25 10:54:24', NULL),
(291, 'Claudenice Leal', 'lealclaudenice1@gmail.com', 'Não', 'Meta Ads', NULL, NULL, NULL, NULL, 'FR_Oximetro', NULL, NULL, '{\"field_data\":[{\"name\":\"email\",\"values\":[\"lealclaudenice1@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Claudenice Leal\"]},{\"name\":\"phone_number\",\"values\":[\"+5581985285559\"]},{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"N\\u00e3o\"]}],\"form_id\":\"1814290879464646\",\"id\":\"3275950685902613\"}', 'Novo', '2025-10-25 17:17:33', NULL),
(292, 'Simoneide Ferreira', 'simoneideferreirasilva95@gmail.com', 'Qual valor', 'Meta Ads', NULL, NULL, NULL, NULL, 'FR_Oximetro', NULL, NULL, '{\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"Qual valor\"]},{\"name\":\"email\",\"values\":[\"simoneideferreirasilva95@gmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Simoneide Ferreira\"]},{\"name\":\"phone_number\",\"values\":[\"+5583993249280\"]}],\"form_id\":\"1814290879464646\",\"id\":\"852061077506486\"}', 'Novo', '2025-10-25 17:28:34', NULL),
(293, 'Luan Michael', 'luan.machado@hotmail.com', '84981237376', 'Meta Ads', NULL, NULL, NULL, NULL, 'FR_Oximetro', NULL, NULL, '{\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"84981237376\"]},{\"name\":\"email\",\"values\":[\"luan.machado@hotmail.com\"]},{\"name\":\"full_name\",\"values\":[\"Luan Michael\"]},{\"name\":\"phone_number\",\"values\":[\"+84981237376\"]}],\"form_id\":\"1814290879464646\",\"id\":\"4073798886216261\"}', 'Novo', '2025-10-26 00:23:29', NULL),
(295, 'Osglauter Izidio Izidio', 'centroodontomedico@bol.com.br', '81 99812-4570', 'Meta Ads', NULL, NULL, NULL, NULL, 'FR_Oximetro', NULL, NULL, '{\"field_data\":[{\"name\":\"poderia_nos_informar_seu_n\\u00famero_de_contato_ou_whatsapp_atualizado,_por_favor?\",\"values\":[\"81 99812-4570\"]},{\"name\":\"email\",\"values\":[\"centroodontomedico@bol.com.br\"]},{\"name\":\"full_name\",\"values\":[\"Osglauter Izidio Izidio\"]},{\"name\":\"phone_number\",\"values\":[\"+5581998124570\"]}],\"form_id\":\"1814290879464646\",\"id\":\"1307042894769737\"}', 'Novo', '2025-10-27 10:44:35', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `notas_fiscais`
--

CREATE TABLE `notas_fiscais` (
  `id` int(11) NOT NULL,
  `empenho_id` int(11) DEFAULT NULL,
  `oportunidade_id` int(11) NOT NULL,
  `numero` varchar(255) NOT NULL,
  `valor` decimal(10,2) NOT NULL DEFAULT 0.00,
  `data_faturamento` date DEFAULT NULL,
  `data_prevista` date DEFAULT NULL,
  `documento_url` varchar(512) DEFAULT NULL,
  `documento_nome` varchar(255) DEFAULT NULL,
  `documento_tipo` varchar(100) DEFAULT NULL,
  `itens` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Despejando dados para a tabela `notas_fiscais`
--

INSERT INTO `notas_fiscais` (`id`, `empenho_id`, `oportunidade_id`, `numero`, `valor`, `data_faturamento`, `data_prevista`, `documento_url`, `documento_nome`, `documento_tipo`, `itens`, `created_at`) VALUES
(5, 13, 226, '9080', 5699.02, '2026-02-06', '2026-02-06', NULL, NULL, 'Nota Fiscal', '[{\"_uid\":\"q3l13mm5n\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"UNICO\",\"item_empenho\":\"60\",\"descricao\":\"KIT DE ASPIRAÇÃO E COLETA DE SANGUE\\/AUTOTRANSFUSÃO XTRA-225\",\"unidade\":\"UN\",\"qtd_empenhada\":2,\"qtd_faturada\":2,\"valor_unitario\":2849.51,\"observacao\":\"\",\"produto_id\":21,\"valor_total\":5699.02}]', '2026-03-10 15:09:31'),
(6, 14, 220, '9305', 9354.00, '2026-02-26', '2026-02-26', NULL, NULL, 'Nota Fiscal', '[{\"_uid\":\"8tw174apv\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"CONJUNTO DE TUBOS INFANTIL C\\/FA CAVA DUPLA E BLISTER\",\"unidade\":\"UN\",\"qtd_empenhada\":2,\"qtd_faturada\":2,\"valor_unitario\":681,\"observacao\":\"\",\"produto_id\":39,\"valor_total\":1362},{\"_uid\":\"71fhukopw\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"SISTEMA DE CARDIOPLEGIA CRISTALOIDE ADULTO C\\/BOLSA\",\"unidade\":\"UN\",\"qtd_empenhada\":2,\"qtd_faturada\":2,\"valor_unitario\":626,\"observacao\":\"\",\"produto_id\":40,\"valor_total\":1252},{\"_uid\":\"tetm31mu1\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"HEMOCONCENTRADOR INFANTIL\",\"unidade\":\"UN\",\"qtd_empenhada\":2,\"qtd_faturada\":2,\"valor_unitario\":391,\"observacao\":\"\",\"produto_id\":41,\"valor_total\":782},{\"_uid\":\"tuybh0ovs\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"BOMBA CENTRIFUGA REV PHISIO\",\"unidade\":\"UN\",\"qtd_empenhada\":2,\"qtd_faturada\":2,\"valor_unitario\":800,\"observacao\":\"\",\"produto_id\":42,\"valor_total\":1600},{\"_uid\":\"njtryi4ya\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"OXIGENADOR MEMB. PEDIATRICO LILLIPUT D902\",\"unidade\":\"UN\",\"qtd_empenhada\":2,\"qtd_faturada\":2,\"valor_unitario\":2179,\"observacao\":\"\",\"produto_id\":43,\"valor_total\":4358}]', '2026-03-12 12:02:52'),
(7, 15, 220, '9321', 4751.00, '2026-02-25', '2026-02-25', NULL, NULL, 'Nota Fiscal', '[{\"_uid\":\"2qq2nnh9y\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"CONJUNTO DE TUBOS INFANTIL C\\/FA CAVA DUPLA E BLISTER\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":630,\"observacao\":\"\",\"produto_id\":24,\"valor_total\":630},{\"_uid\":\"xryfi0als\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"SISTEMA DE CARDIOPLEGIA CRISTALOIDE ADULTO C\\/BOLSA\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":389.09,\"observacao\":\"\",\"produto_id\":25,\"valor_total\":389.09},{\"_uid\":\"6jkquxnsd\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"HEMOCONCENTRADOR INFANTIL\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":418.3,\"observacao\":\"\",\"produto_id\":26,\"valor_total\":418.3},{\"_uid\":\"jsajzvxbn\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"BOMBA CENTRIFUGA REV PHISIO\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":913.61,\"observacao\":\"\",\"produto_id\":27,\"valor_total\":913.61},{\"_uid\":\"9q9gl2cc7\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"OXIGENADOR MEMB. NEONATO KIDS D100\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":2400,\"observacao\":\"\",\"produto_id\":28,\"valor_total\":2400}]', '2026-03-12 12:05:52'),
(8, 16, 220, '9300', 4751.00, '2026-02-25', '2026-02-25', NULL, NULL, 'Nota Fiscal', '[{\"_uid\":\"4jitb2b4c\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"CONJUNTO DE TUBOS INFANTIL C\\/FA CAVA DUPLA E BLISTER\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":630,\"observacao\":\"\",\"produto_id\":24,\"valor_total\":630},{\"_uid\":\"wjof45rie\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"SISTEMA DE CARDIOPLEGIA CRISTALOIDE ADULTO C\\/BOLSA\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":389.09,\"observacao\":\"\",\"produto_id\":25,\"valor_total\":389.09},{\"_uid\":\"31v02r4yz\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"HEMOCONCENTRADOR INFANTIL\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":418.3,\"observacao\":\"\",\"produto_id\":26,\"valor_total\":418.3},{\"_uid\":\"1fcuqi37t\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"BOMBA CENTRIFUGA REV PHISIO\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":913.61,\"observacao\":\"\",\"produto_id\":27,\"valor_total\":913.61},{\"_uid\":\"tlsxqlk3f\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"OXIGENADOR MEMB. NEONATO KIDS D100\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":2400,\"observacao\":\"\",\"produto_id\":28,\"valor_total\":2400}]', '2026-03-12 12:07:49'),
(9, 17, 220, '9283', 4166.00, '2026-02-25', '2026-02-25', NULL, NULL, 'Nota Fiscal', '[{\"_uid\":\"gevpkvb09\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"CONJUNTO DE TUBOS ADULTO S\\/FA CAVA DUPLA E BLISTER\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":681,\"observacao\":\"\",\"produto_id\":30,\"valor_total\":681},{\"_uid\":\"8rufzmwnq\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"SISTEMA DE CARDIOPLEGIA CRISTALOIDE ADULTO C\\/BOLSA\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":626,\"observacao\":\"\",\"produto_id\":31,\"valor_total\":626},{\"_uid\":\"ejrfpyvpf\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"HEMOCONCENTRADOR ADULTO\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":391,\"observacao\":\"\",\"produto_id\":32,\"valor_total\":391},{\"_uid\":\"h2fr6g1q3\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"BOMBA CENTRIFUGA REV PHISIO\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":800,\"observacao\":\"\",\"produto_id\":35,\"valor_total\":800},{\"_uid\":\"pzyvllve0\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"OXIGENADOR MEMB. ADULTO BAIXO PESO 6F\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":1668,\"observacao\":\"\",\"produto_id\":37,\"valor_total\":1668}]', '2026-03-12 12:10:15'),
(10, 18, 220, '9286', 4166.00, '2026-02-25', '2026-02-25', NULL, NULL, 'Nota Fiscal', '[{\"_uid\":\"3qc6hj704\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"CONJUNTO DE TUBOS ADULTO S\\/FA CAVA DUPLA E BLISTER\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":681,\"observacao\":\"\",\"produto_id\":30,\"valor_total\":681},{\"_uid\":\"xo1kyuf7a\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"SISTEMA DE CARDIOPLEGIA CRISTALOIDE ADULTO C\\/BOLSA\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":626,\"observacao\":\"\",\"produto_id\":31,\"valor_total\":626},{\"_uid\":\"3po71c0bc\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"HEMOCONCENTRADOR ADULTO\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":391,\"observacao\":\"\",\"produto_id\":32,\"valor_total\":391},{\"_uid\":\"uqo2qi1za\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"BOMBA CENTRIFUGA REV PHISIO\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":800,\"observacao\":\"\",\"produto_id\":35,\"valor_total\":800},{\"_uid\":\"0zgehcjd0\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"OXIGENADOR MEMB. ADULTO BAIXO PESO 6F\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":1668,\"observacao\":\"\",\"produto_id\":37,\"valor_total\":1668}]', '2026-03-12 12:12:03'),
(11, 19, 220, '9332', 8332.00, '2026-02-25', '2026-02-25', NULL, NULL, 'Nota Fiscal', '[{\"_uid\":\"xtg92j39b\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"CONJUNTO DE TUBOS ADULTO S\\/FA CAVA DUPLA E BLISTER\",\"unidade\":\"UN\",\"qtd_empenhada\":2,\"qtd_faturada\":2,\"valor_unitario\":681,\"observacao\":\"\",\"produto_id\":30,\"valor_total\":1362},{\"_uid\":\"rlaqnsm5h\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"SISTEMA DE CARDIOPLEGIA CRISTALOIDE ADULTO C\\/BOLSA\",\"unidade\":\"UN\",\"qtd_empenhada\":2,\"qtd_faturada\":2,\"valor_unitario\":626,\"observacao\":\"\",\"produto_id\":31,\"valor_total\":1252},{\"_uid\":\"338z2j5jz\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"HEMOCONCENTRADOR ADULTO\",\"unidade\":\"UN\",\"qtd_empenhada\":2,\"qtd_faturada\":2,\"valor_unitario\":391,\"observacao\":\"\",\"produto_id\":32,\"valor_total\":782},{\"_uid\":\"nf584by4i\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"BOMBA CENTRIFUGA REV PHISIO\",\"unidade\":\"UN\",\"qtd_empenhada\":2,\"qtd_faturada\":2,\"valor_unitario\":800,\"observacao\":\"\",\"produto_id\":35,\"valor_total\":1600},{\"_uid\":\"y0riwlg6q\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"OXIGENADOR MEMB. ADULTO BAIXO PESO 6F\",\"unidade\":\"UN\",\"qtd_empenhada\":2,\"qtd_faturada\":2,\"valor_unitario\":1668,\"observacao\":\"\",\"produto_id\":37,\"valor_total\":3336}]', '2026-03-12 12:14:22'),
(12, 20, 220, '9281', 12498.00, '2026-02-25', '2026-02-25', NULL, NULL, 'Nota Fiscal', '[{\"_uid\":\"f9kd80vgv\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"CONJUNTO DE TUBOS ADULTO S\\/FA CAVA DUPLA E BLISTER\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":681,\"observacao\":\"\",\"produto_id\":30,\"valor_total\":2043},{\"_uid\":\"rktstctdl\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"SISTEMA DE CARDIOPLEGIA CRISTALOIDE ADULTO C\\/BOLSA\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":626,\"observacao\":\"\",\"produto_id\":31,\"valor_total\":1878},{\"_uid\":\"1rlqo1e1e\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"HEMOCONCENTRADOR ADULTO\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":391,\"observacao\":\"\",\"produto_id\":32,\"valor_total\":1173},{\"_uid\":\"e9bfb555t\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"BOMBA CENTRIFUGA REV PHISIO\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":800,\"observacao\":\"\",\"produto_id\":35,\"valor_total\":2400},{\"_uid\":\"rxzcqepq8\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"OXIGENADOR MEMB. ADULTO BAIXO PESO 6F\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":1668,\"observacao\":\"\",\"produto_id\":37,\"valor_total\":5004}]', '2026-03-12 12:16:54'),
(13, 21, 220, '9288', 12498.00, '2026-02-25', '2026-02-25', NULL, NULL, 'Nota Fiscal', '[{\"_uid\":\"yt5a7wgl3\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"CONJUNTO DE TUBOS ADULTO S\\/FA CAVA DUPLA E BLISTER\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":681,\"observacao\":\"\",\"produto_id\":30,\"valor_total\":2043},{\"_uid\":\"d8ybw8u9g\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"SISTEMA DE CARDIOPLEGIA CRISTALOIDE ADULTO C\\/BOLSA\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":626,\"observacao\":\"\",\"produto_id\":31,\"valor_total\":1878},{\"_uid\":\"z0m5ldv6m\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"HEMOCONCENTRADOR ADULTO\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":391,\"observacao\":\"\",\"produto_id\":32,\"valor_total\":1173},{\"_uid\":\"90o999i62\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"BOMBA CENTRIFUGA REV PHISIO\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":800,\"observacao\":\"\",\"produto_id\":35,\"valor_total\":2400},{\"_uid\":\"ervibw9j9\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"OXIGENADOR MEMB. ADULTO BAIXO PESO 6F\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":1668,\"observacao\":\"\",\"produto_id\":37,\"valor_total\":5004}]', '2026-03-12 12:19:21'),
(14, 22, 220, '9290', 12498.00, '2026-02-25', '2026-02-25', NULL, NULL, 'Nota Fiscal', '[{\"_uid\":\"vxogym3sz\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"CONJUNTO DE TUBOS ADULTO S\\/FA CAVA DUPLA E BLISTER\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":681,\"observacao\":\"\",\"produto_id\":30,\"valor_total\":2043},{\"_uid\":\"5cqhqr6jg\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"SISTEMA DE CARDIOPLEGIA CRISTALOIDE ADULTO C\\/BOLSA\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":626,\"observacao\":\"\",\"produto_id\":31,\"valor_total\":1878},{\"_uid\":\"i9etszzog\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"HEMOCONCENTRADOR ADULTO\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":391,\"observacao\":\"\",\"produto_id\":32,\"valor_total\":1173},{\"_uid\":\"fnpdyzjsg\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"BOMBA CENTRIFUGA REV PHISIO\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":800,\"observacao\":\"\",\"produto_id\":35,\"valor_total\":2400},{\"_uid\":\"a4t7ihbye\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"OXIGENADOR MEMB. ADULTO BAIXO PESO 6F\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":1668,\"observacao\":\"\",\"produto_id\":37,\"valor_total\":5004}]', '2026-03-12 12:22:35'),
(15, 23, 220, '9292', 12498.00, '2026-02-25', '2026-02-25', NULL, NULL, 'Nota Fiscal', '[{\"_uid\":\"5zbrdvctr\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"CONJUNTO DE TUBOS ADULTO S\\/FA CAVA DUPLA E BLISTER\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":681,\"observacao\":\"\",\"produto_id\":30,\"valor_total\":2043},{\"_uid\":\"db18bc2y0\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"SISTEMA DE CARDIOPLEGIA CRISTALOIDE ADULTO C\\/BOLSA\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":626,\"observacao\":\"\",\"produto_id\":31,\"valor_total\":1878},{\"_uid\":\"66juijwcw\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"HEMOCONCENTRADOR ADULTO\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":391,\"observacao\":\"\",\"produto_id\":32,\"valor_total\":1173},{\"_uid\":\"o12rnxqk9\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"BOMBA CENTRIFUGA REV PHISIO\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":800,\"observacao\":\"\",\"produto_id\":35,\"valor_total\":2400},{\"_uid\":\"cxlfqvsd5\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"OXIGENADOR MEMB. ADULTO BAIXO PESO 6F\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":1668,\"observacao\":\"\",\"produto_id\":37,\"valor_total\":5004}]', '2026-03-12 12:24:17'),
(16, 24, 220, '9318', 12498.00, '2026-02-25', '2026-02-25', NULL, NULL, 'Nota Fiscal', '[{\"_uid\":\"gk4r76fvj\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"CONJUNTO DE TUBOS ADULTO S\\/FA CAVA DUPLA E BLISTER\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":681,\"observacao\":\"\",\"produto_id\":30,\"valor_total\":2043},{\"_uid\":\"jxtwhbirq\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"SISTEMA DE CARDIOPLEGIA CRISTALOIDE ADULTO C\\/BOLSA\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":626,\"observacao\":\"\",\"produto_id\":31,\"valor_total\":1878},{\"_uid\":\"q4widcvnb\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"HEMOCONCENTRADOR ADULTO\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":391,\"observacao\":\"\",\"produto_id\":32,\"valor_total\":1173},{\"_uid\":\"ljlisywkr\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"BOMBA CENTRIFUGA REV PHISIO\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":800,\"observacao\":\"\",\"produto_id\":35,\"valor_total\":2400},{\"_uid\":\"ononx0htv\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"OXIGENADOR MEMB. ADULTO BAIXO PESO 6F\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":1668,\"observacao\":\"\",\"produto_id\":37,\"valor_total\":5004}]', '2026-03-12 12:27:48'),
(17, 25, 220, '9314', 12498.00, '2026-02-25', '2026-02-25', NULL, NULL, 'Nota Fiscal', '[{\"_uid\":\"tckejkmf8\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"CONJUNTO DE TUBOS ADULTO S\\/FA CAVA DUPLA E BLISTER\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":681,\"observacao\":\"\",\"produto_id\":30,\"valor_total\":2043},{\"_uid\":\"q023dapaw\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"SISTEMA DE CARDIOPLEGIA CRISTALOIDE ADULTO C\\/BOLSA\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":626,\"observacao\":\"\",\"produto_id\":31,\"valor_total\":1878},{\"_uid\":\"svk04q8fc\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"HEMOCONCENTRADOR ADULTO\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":391,\"observacao\":\"\",\"produto_id\":32,\"valor_total\":1173},{\"_uid\":\"nt9y7ox0e\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"BOMBA CENTRIFUGA REV PHISIO\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":800,\"observacao\":\"\",\"produto_id\":35,\"valor_total\":2400},{\"_uid\":\"pmpajqctn\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"OXIGENADOR MEMB. ADULTO BAIXO PESO 6F\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":1668,\"observacao\":\"\",\"produto_id\":37,\"valor_total\":5004}]', '2026-03-12 12:29:42'),
(18, 26, 220, '9309', 4166.00, '2026-02-25', '2026-02-25', NULL, NULL, 'Nota Fiscal', '[{\"_uid\":\"xh9by050a\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"CONJUNTO DE TUBOS ADULTO S\\/FA CAVA DUPLA E BLISTER\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":681,\"observacao\":\"\",\"produto_id\":30,\"valor_total\":681},{\"_uid\":\"a1nwtfeqb\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"SISTEMA DE CARDIOPLEGIA CRISTALOIDE ADULTO C\\/BOLSA\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":626,\"observacao\":\"\",\"produto_id\":31,\"valor_total\":626},{\"_uid\":\"f2yxoqmdh\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"HEMOCONCENTRADOR ADULTO\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":391,\"observacao\":\"\",\"produto_id\":32,\"valor_total\":391},{\"_uid\":\"0yohvgi21\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"BOMBA CENTRIFUGA REV PHISIO\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":800,\"observacao\":\"\",\"produto_id\":35,\"valor_total\":800},{\"_uid\":\"h2582w86q\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"OXIGENADOR MEMB. ADULTO BAIXO PESO 6F\",\"unidade\":\"UN\",\"qtd_empenhada\":1,\"qtd_faturada\":1,\"valor_unitario\":1668,\"observacao\":\"\",\"produto_id\":37,\"valor_total\":1668}]', '2026-03-12 12:31:30'),
(19, 27, 220, '9316', 12498.00, '2026-02-25', '2026-02-25', NULL, NULL, 'Nota Fiscal', '[{\"_uid\":\"i5axycmmp\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"CONJUNTO DE TUBOS ADULTO S\\/FA CAVA DUPLA E BLISTER\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":681,\"observacao\":\"\",\"produto_id\":30,\"valor_total\":2043},{\"_uid\":\"iq0odk9j8\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"SISTEMA DE CARDIOPLEGIA CRISTALOIDE ADULTO C\\/BOLSA\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":626,\"observacao\":\"\",\"produto_id\":31,\"valor_total\":1878},{\"_uid\":\"v2dd6apjp\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"HEMOCONCENTRADOR ADULTO\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":391,\"observacao\":\"\",\"produto_id\":32,\"valor_total\":1173},{\"_uid\":\"w85r69mfh\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"BOMBA CENTRIFUGA REV PHISIO\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":800,\"observacao\":\"\",\"produto_id\":35,\"valor_total\":2400},{\"_uid\":\"io3s4qgyt\",\"fornecedor\":\"LIVANOVA\",\"lote\":\"\",\"item_empenho\":\"\",\"descricao\":\"OXIGENADOR MEMB. ADULTO BAIXO PESO 6F\",\"unidade\":\"UN\",\"qtd_empenhada\":3,\"qtd_faturada\":3,\"valor_unitario\":1668,\"observacao\":\"\",\"produto_id\":37,\"valor_total\":5004}]', '2026-03-12 12:45:12');

-- --------------------------------------------------------

--
-- Estrutura para tabela `oportunidades`
--

CREATE TABLE `oportunidades` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `numero_edital` varchar(255) DEFAULT NULL,
  `numero_processo` varchar(255) DEFAULT NULL,
  `organizacao_id` int(11) DEFAULT NULL,
  `fornecedor_id` int(11) DEFAULT NULL,
  `contato_id` int(11) DEFAULT NULL,
  `cliente_pf_id` int(11) DEFAULT NULL,
  `valor` decimal(20,2) DEFAULT 0.00,
  `etapa_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `comercial_user_id` int(11) DEFAULT NULL,
  `pre_proposal_number` varchar(255) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `descricao_produto` text DEFAULT NULL,
  `fabricante` varchar(255) DEFAULT NULL,
  `modelo` varchar(255) DEFAULT NULL,
  `quantidade` int(11) DEFAULT 1,
  `valor_unitario` decimal(20,2) DEFAULT 0.00,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_ultima_movimentacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `local_disputa` varchar(255) DEFAULT NULL,
  `uasg` varchar(50) DEFAULT NULL,
  `data_abertura` date DEFAULT NULL,
  `hora_disputa` time DEFAULT NULL,
  `modalidade` varchar(100) DEFAULT NULL,
  `objeto` text DEFAULT NULL,
  `motivo_perda` varchar(255) DEFAULT NULL,
  `documento_url` varchar(512) DEFAULT NULL,
  `documento_nome` varchar(255) DEFAULT NULL,
  `documento_tipo` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `oportunidades`
--

INSERT INTO `oportunidades` (`id`, `titulo`, `numero_edital`, `numero_processo`, `organizacao_id`, `fornecedor_id`, `contato_id`, `cliente_pf_id`, `valor`, `etapa_id`, `usuario_id`, `comercial_user_id`, `pre_proposal_number`, `notas`, `descricao_produto`, `fabricante`, `modelo`, `quantidade`, `valor_unitario`, `data_criacao`, `data_ultima_movimentacao`, `local_disputa`, `uasg`, `data_abertura`, `hora_disputa`, `modalidade`, `objeto`, `motivo_perda`, `documento_url`, `documento_nome`, `documento_tipo`) VALUES
(61, 'Oportunidade p/ Proposta: HOSPITAL UNIMED RECIFE III', NULL, NULL, 892, NULL, NULL, NULL, 29992.00, 8, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-10-30 12:32:59', '2026-01-27 01:17:09', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(65, 'Oportunidade p/ Proposta: UNIDADE DE DIAGNOSTICO CARDIOLOGICO LTDA', NULL, NULL, 894, NULL, NULL, NULL, 12569.00, 4, 2, NULL, NULL, NULL, 'DESFIBRILADOR ', 'INSTRAMED', 'APOLUS ', 1, 12569.00, '2025-11-04 15:11:04', '2025-11-04 15:11:04', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(69, 'Oportunidade p/ Proposta: NEWMED COMERCIO E SERVICOS DE EQUIPAMENTOS HOSPITALARES LTDA', NULL, NULL, 897, NULL, NULL, NULL, 102646.44, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-11-06 12:26:18', '2025-11-06 12:26:18', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(70, 'Oportunidade p/ Proposta: MARINA PORTO DO MAR', NULL, NULL, 898, NULL, NULL, NULL, 8471.00, 8, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-11-06 20:49:30', '2026-02-10 14:26:48', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(71, 'Oportunidade p/ Proposta: HOSPITAL MEMORIAL GUARARAPES', NULL, NULL, 384, NULL, NULL, NULL, 69000.00, 8, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-11-07 14:32:57', '2026-01-27 01:16:52', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(72, 'Oportunidade p/ Proposta: MAIS VIDA', NULL, NULL, 336, NULL, NULL, NULL, 28000.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-11-07 15:01:42', '2025-11-07 15:01:42', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(73, 'Oportunidade p/ Proposta: DORGIVAL HENRIQUES', NULL, NULL, 850, NULL, NULL, NULL, 36308.39, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-11-10 13:09:13', '2025-11-10 13:09:13', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(74, 'Oportunidade p/ Proposta: NEWMED COMERCIO E SERVICOS DE EQUIPAMENTOS HOSPITALARES LTDA', NULL, NULL, 897, NULL, NULL, NULL, 1230.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-11-10 20:31:38', '2025-11-10 20:31:38', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(75, 'Oportunidade p/ Proposta: GRUPO TUBRAN LTDA', NULL, NULL, 915, NULL, NULL, NULL, 46164.00, 4, 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-11-14 19:32:19', '2025-11-14 19:32:19', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(76, 'Oportunidade p/ Proposta: HC CARDIO', NULL, NULL, 591, NULL, NULL, NULL, 7990.00, 6, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-11-17 17:45:58', '2026-01-27 01:16:34', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(77, 'Oportunidade p/ Proposta: HC CARDIO', NULL, NULL, 591, NULL, NULL, NULL, 0.00, 6, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-11-17 17:47:12', '2026-01-27 01:16:26', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(78, 'Oportunidade p/ Proposta: CENTRO UNIVERSITARIO TIRADENTES DE PERNAMBUCO', NULL, NULL, 916, NULL, 9, NULL, 7990.00, 6, 8, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-11-24 12:29:04', '2026-01-27 01:16:17', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(79, 'Oportunidade p/ Proposta: THALITA MELO DE BRITO PEREIRA', NULL, NULL, NULL, NULL, NULL, 31, 7990.00, 6, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-11-24 20:26:58', '2026-01-27 01:16:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(80, 'Oportunidade p/ Proposta: RECONCILIAR SPA TERAPEUTICO', NULL, NULL, 917, NULL, NULL, NULL, 23082.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-11-26 12:08:05', '2025-11-26 12:08:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(81, 'Oportunidade p/ Proposta: RECONCILIAR SPA TERAPEUTICO', NULL, NULL, 917, NULL, NULL, NULL, 23082.00, 8, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-11-26 14:18:32', '2026-01-27 01:15:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(82, 'Oportunidade p/ Proposta: MAIS VIDA', NULL, NULL, 336, NULL, NULL, NULL, 116528.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-11-26 20:16:45', '2025-11-26 20:16:45', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(83, 'Oportunidade p/ Proposta: FELICITE CHECK UP', NULL, NULL, 448, NULL, 10, NULL, 7990.00, 6, 8, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-12-01 21:00:29', '2026-01-27 01:15:34', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(84, 'Oportunidade p/ Proposta: FELICITE CHECK UP', NULL, NULL, 448, NULL, 10, NULL, 0.00, 8, 8, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-12-01 21:11:15', '2026-01-27 01:15:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(85, 'Oportunidade p/ Proposta: RECONCILIAR SPA TERAPEUTICO', NULL, NULL, 917, NULL, 11, NULL, 8471.00, 4, 8, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-12-02 18:28:57', '2025-12-02 18:28:57', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(91, 'Oportunidade p/ Proposta: HOSPITAL DO CANCER DE PERNAMBUCO', NULL, NULL, 345, NULL, 12, NULL, 6840.00, 6, 8, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-12-02 19:20:05', '2026-03-27 17:12:07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(92, 'Oportunidade p/ Proposta: IAPES PESQUISA CLINICA', NULL, NULL, 918, NULL, NULL, NULL, 9106.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-12-03 12:25:59', '2025-12-03 12:25:59', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(93, 'Oportunidade p/ Proposta: IAPES PESQUISA CLINICA', NULL, NULL, 918, NULL, NULL, NULL, 12569.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-12-03 17:06:46', '2026-02-06 18:26:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(94, 'Oportunidade p/ Proposta: CASA DE SAUDE E MATERNIDADE DE CORURIPE', NULL, NULL, 923, NULL, NULL, NULL, 168000.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-12-04 19:24:32', '2025-12-04 19:24:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(95, 'Oportunidade p/ Proposta: CASA DE SAUDE E MATERNIDADE DE CORURIPE', NULL, NULL, 923, NULL, NULL, NULL, 2067000.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-12-04 19:26:33', '2025-12-04 19:26:33', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(96, 'Oportunidade p/ Proposta: DAVYD MARCONDY DE OLIVEIRA ALVES', NULL, NULL, NULL, NULL, NULL, 273, 16765.85, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-12-09 13:06:15', '2025-12-09 13:06:15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(97, 'Oportunidade p/ Proposta: MAIS VIDA', NULL, NULL, 336, NULL, NULL, NULL, 55444.00, 6, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-12-09 14:46:31', '2026-01-27 01:14:30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(98, 'Oportunidade p/ Proposta: SAFETY MED', NULL, NULL, 513, NULL, NULL, NULL, 10326.00, 6, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-12-09 20:40:47', '2026-01-27 01:14:20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(99, 'Oportunidade p/ Proposta: PRODEV EDUCACIONAL', NULL, NULL, 929, NULL, NULL, NULL, 9500.00, 8, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-12-11 19:13:44', '2026-01-27 01:13:58', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(100, 'Oportunidade p/ Proposta: SEOPE - SERVICO OFTALMOLOGICO DE PERNAMB', NULL, NULL, 318, NULL, NULL, NULL, 12569.00, 6, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-12-11 20:47:31', '2026-01-27 01:14:08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(101, 'Oportunidade p/ Proposta: CENTRO UNIVERSITARIO TIRADENTES DE PERNAMBUCO', NULL, NULL, 916, NULL, 9, NULL, 2372.40, 6, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-12-12 13:04:23', '2026-01-27 01:12:34', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(112, 'Oportunidade p/ Proposta: INTERNE HOME CARE', NULL, NULL, 393, NULL, NULL, NULL, 18182.00, 8, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-12-17 14:53:20', '2026-01-27 01:13:35', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(113, 'Oportunidade p/ Proposta: FERREIRA COSTA', NULL, NULL, 238, NULL, NULL, NULL, 615.00, 6, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-12-17 20:10:40', '2026-03-30 20:53:55', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(114, 'Oportunidade p/ Proposta: AMAURI PURCINO DA LUZ', NULL, NULL, 935, NULL, NULL, NULL, 9500.00, 8, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-12-18 19:54:06', '2026-01-27 01:13:19', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(115, 'Oportunidade p/ Proposta: CUPER', NULL, NULL, 936, NULL, NULL, NULL, 19625.85, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2025-12-23 17:28:36', '2025-12-23 17:28:36', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(120, 'Oportunidade p/ Proposta: GIGAVIDA TECNOLOGIA E SERVICO HOSPITALAR LTDA', NULL, NULL, 359, NULL, 14, NULL, 21000.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-09 12:48:45', '2026-01-09 12:48:45', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(124, 'Oportunidade p/ Proposta: RENAN FIGUEIREDO', NULL, NULL, NULL, NULL, NULL, 280, 18596.85, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-13 12:33:28', '2026-01-13 12:33:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(125, 'Oportunidade p/ Proposta: EQUIPASAUDE', NULL, NULL, 937, NULL, 15, NULL, 16942.00, 8, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-13 16:33:34', '2026-01-27 01:13:01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(127, 'Oportunidade p/ Proposta: RENAN FIGUEIREDO', NULL, NULL, NULL, NULL, NULL, 280, 9711.00, 4, 8, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-14 18:34:20', '2026-01-14 18:34:20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(128, 'Oportunidade p/ Proposta: RENAN FIGUEIREDO', NULL, NULL, NULL, NULL, NULL, 280, 10749.00, 4, 8, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-14 18:40:32', '2026-01-14 18:40:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(130, 'Oportunidade p/ Proposta: FUNDO MUNICIPAL DE SAUDE', NULL, NULL, 495, NULL, 16, NULL, 12876.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-16 16:10:44', '2026-01-16 16:10:44', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(131, 'Oportunidade p/ Proposta: FUNDO MUNICIPAL DE SAUDE TRIUNFO PE', NULL, NULL, 495, NULL, 16, NULL, 0.00, 8, 8, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-16 16:18:18', '2026-01-27 01:05:07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(137, 'Compressor Torácico E6', NULL, NULL, 938, NULL, NULL, NULL, 516920.00, 5, 4, NULL, NULL, 'Aguardando solicitação de carona por ATA', NULL, NULL, NULL, 1, 0.00, '2026-01-19 18:13:46', '2026-03-23 13:44:06', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(138, 'RAD G ', NULL, NULL, 938, NULL, NULL, NULL, 576000.00, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-19 18:24:25', '2026-03-23 13:43:58', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(142, 'US 2 Ai', NULL, NULL, 347, NULL, NULL, NULL, 43200.00, 1, 4, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-20 15:23:28', '2026-01-20 15:23:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(143, 'US Kosmos', NULL, NULL, 275, NULL, NULL, NULL, 47000.00, 1, 4, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-20 15:25:29', '2026-01-20 15:25:29', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(144, 'US Kosmos', NULL, NULL, 347, NULL, NULL, NULL, 188000.00, 1, 4, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-20 15:27:52', '2026-01-20 15:27:52', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(145, 'US Kosmos', NULL, NULL, 12, NULL, NULL, NULL, 440000.00, 1, 4, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-20 15:30:03', '2026-01-20 15:30:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(146, 'LÍDICO FR ', NULL, NULL, 229, NULL, NULL, NULL, 25000.00, 1, 4, NULL, NULL, 'Elaborar proposta pela FR, com comodato de 01 Monitor Root', NULL, NULL, NULL, 1, 0.00, '2026-01-20 16:52:39', '2026-01-20 16:52:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(148, 'Monitorização ', NULL, NULL, 890, NULL, NULL, NULL, 0.00, 1, 10, NULL, NULL, 'Aguardando data da cirurgia \nR$3.894,45. Cirurgia aconteceu com sucesso, foi informado ao estoque e comercial e já faturada.', NULL, NULL, NULL, 1, 0.00, '2026-01-20 17:35:59', '2026-01-20 17:35:59', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(149, 'Monitorização ', NULL, NULL, 890, NULL, NULL, NULL, 0.00, 1, 10, NULL, NULL, 'Hospital São Lucas . Cirurgia marcada para dia 13/02/26 às 14:00 horas.', NULL, NULL, NULL, 1, 0.00, '2026-01-20 17:53:43', '2026-01-20 17:53:43', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(150, 'Monitorização ', NULL, NULL, 890, NULL, NULL, NULL, 0.00, 1, 10, NULL, NULL, 'R$3894,45. Cirurgia aconteceu no dia 30/01 às 07:00 horas . Faturado para Vital Care e fez troca de 01 Sediline e 02 O3 na UTI no dia ( 02/02/26) informado ao estoque e comercial para faturamento.', NULL, NULL, NULL, 1, 0.00, '2026-01-20 17:56:41', '2026-01-20 17:56:41', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(154, 'Monitorização ', NULL, NULL, 156, NULL, NULL, NULL, 7462.02, 1, 10, NULL, NULL, 'Foi enviado o orçamento R$7.462,02\nCirurgia com sucesso passado para o estoque e comercial e aguarda a ordem de faturamento.\n', NULL, NULL, NULL, 1, 0.00, '2026-01-20 18:20:31', '2026-01-20 18:20:31', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(155, 'Oportunidade p/ Proposta: HNSN EPITACIO LTDA', NULL, NULL, 271, NULL, 17, NULL, 25000.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-21 14:17:23', '2026-01-21 14:17:23', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(156, 'US Kosmos', NULL, NULL, 275, NULL, NULL, NULL, 70000.00, 1, 4, NULL, NULL, 'Equipamento em demonstração com o Dr Carlos Antonio', NULL, NULL, NULL, 1, 0.00, '2026-01-22 18:05:05', '2026-01-22 18:05:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(157, 'Oportunidade p/ Proposta: FUNDO MUNICIPAL DE SAUDE DE CARUARU', NULL, NULL, 939, NULL, 18, NULL, 80250.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-23 21:29:59', '2026-01-23 21:29:59', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(158, 'Monitorização / placas de externo ', NULL, NULL, 156, NULL, NULL, NULL, 0.00, 1, 10, NULL, NULL, 'Cirurgia programada para dia 26/01 às 13:00 horas. Cirurgia aconteceu na data marcada , foi informado ao estoque e comercial. Aguardando ordem de faturamento do hospital. Bom dia! Procedimento já realizado e aguardando faturamento.', NULL, NULL, NULL, 1, 0.00, '2026-01-26 13:32:31', '2026-01-26 13:32:31', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(159, 'Oportunidade p/ Proposta: FUNDO MUNICIPAL DE SAUDE DE CARUARU', NULL, NULL, 939, NULL, 18, NULL, 23082.00, 4, 8, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-26 18:45:51', '2026-01-28 16:06:58', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(160, 'Oportunidade p/ Proposta: CASA DE SAUDE E MATERNIDADE DE CORURIPE', NULL, NULL, 923, NULL, NULL, NULL, 23082.00, 8, 8, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-26 18:59:01', '2026-03-27 16:54:38', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(167, 'Oportunidade p/ Proposta: GIGAVIDA TECNOLOGIA E SERVICO HOSPITALAR LTDA', NULL, NULL, 359, NULL, 14, NULL, 5800.00, 6, 4, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-27 13:43:52', '2026-01-27 13:53:09', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(168, 'Oportunidade p/ Proposta: HOSPITAL SANTA JOANA RECIFE', NULL, NULL, 227, NULL, 21, NULL, 7049.08, 8, 4, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-27 13:51:48', '2026-02-25 14:55:02', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(169, 'Oportunidade p/ Proposta: HOSPITAL SANTA JOANA RECIFE', NULL, NULL, 227, NULL, 21, NULL, 6698.18, 6, 4, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-27 15:06:50', '2026-01-27 15:06:50', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(170, 'Oportunidade p/ Proposta: Douglas Primo da Silva', NULL, NULL, NULL, NULL, NULL, 281, 49000.00, 6, 4, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-27 15:57:12', '2026-02-03 18:33:23', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(171, 'MINISTERIO DA DEFESA', '43/2026', '64132.005914/2025-19', 537, NULL, NULL, NULL, 88059.72, 18, 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-27 20:32:30', '2026-01-27 20:32:30', 'Comprasnet', NULL, '2026-01-27', '10:20:00', 'Pregão Eletrônico', 'A presente Ata tem por objeto o registro de preços para a eventual contratação de Material permanente do PAASSEx 2026 (Planejamento Anual de Atividades do Sistema de Saúde do Exército) para atender as necessidades das Organizações Militares integrantes do Grupo de Acompanhamento e Controle de Licitações Centralizadas da Guarnição do Recife (GCALC /Recife), especificados nos itens do Termo de Referência, anexo I do edital de licitação n.º 90007/2025, que é parte integrante desta Ata, assim como as propostas cujos preços tenham sido registrados, independentemente de transcrição.', NULL, NULL, NULL, NULL),
(173, 'SISTEMA DE ERGOMETRIA AIR', NULL, NULL, 617, NULL, 22, NULL, 79580.00, 6, 7, 7, '0001/2026', 'VALOR DO SISTEMA NOVO:\n\nSIST.ERGO PC AIR R$ 25.590,00\nESTEIRA C300.      R$ 49.990,00\nTOTAL R$ 75.590,00', NULL, NULL, NULL, 1, 0.00, '2026-01-29 18:19:01', '2026-03-18 11:51:06', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(174, 'Oportunidade p/ Proposta: UERJ', NULL, NULL, 940, NULL, 23, NULL, 110600.00, 4, 8, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-01-30 18:57:10', '2026-01-30 18:57:10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(175, 'VALVULAS MERIL', NULL, NULL, 450, NULL, NULL, NULL, 95000.00, 5, 7, 6, '0002/2026', 'REUNIAO COM A JULIANA  - GERENTE DE SUPLIMENTOS, VERIFICAR POSSIBILIDADE DE COMPRA DIRETA.(CADASTRO NO E-FISCO', NULL, NULL, NULL, 1, 0.00, '2026-02-02 18:26:58', '2026-02-23 11:47:12', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(176, 'Oportunidade p/ Proposta: HOSPITAL ERMIRIO COUTINHO', NULL, NULL, 942, NULL, 25, NULL, 105972.00, 4, 8, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-02 20:47:58', '2026-02-02 20:47:58', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(177, 'Oportunidade p/ Proposta: UNIMED C. GRANDE', NULL, NULL, 941, NULL, NULL, NULL, 138177.00, 8, 8, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-03 17:42:49', '2026-03-04 15:06:35', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(178, 'Oportunidade p/ Proposta: MAIS VIDA', NULL, NULL, 336, NULL, NULL, NULL, 658420.00, 6, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-05 13:57:34', '2026-03-23 20:42:16', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(179, 'Oportunidade p/ Proposta: UNIMED CAMPINA GRANDE', NULL, NULL, 438, NULL, NULL, NULL, 61943.00, 8, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-06 16:23:08', '2026-03-04 15:05:18', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(183, 'Oportunidade p/ Proposta: HOSPITAL AGAMENON MAGALHAES', NULL, NULL, 246, NULL, NULL, NULL, 15800.00, 4, 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-07 22:15:30', '2026-02-07 22:15:30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(186, 'Oportunidade p/ Proposta: HOSPITAL ERMIRIO COUTINHO', NULL, NULL, 942, NULL, NULL, NULL, 89000.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-09 13:22:46', '2026-02-09 13:22:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(188, 'teste', '234234', '4343434', 761, NULL, NULL, NULL, 92328.00, 14, 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-09 17:13:30', '2026-02-09 17:13:30', 'teste', NULL, '2026-02-11', NULL, 'Pregão Eletrônico', 'erserserserserserser', NULL, NULL, NULL, NULL),
(189, 'Oportunidade p/ Proposta: EBEM - EMPRESA BRASILEIRA DE ENGENHARIA MEDICA', NULL, NULL, 945, NULL, NULL, NULL, 6074.40, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-09 17:47:57', '2026-02-09 17:47:57', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(190, 'Oportunidade p/ Proposta: HOSPITAL UNIMED RECIFE', NULL, NULL, 946, NULL, NULL, NULL, 23732.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-10 16:31:00', '2026-02-10 16:55:51', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(191, 'Oportunidade p/ Proposta: HGMI - HOSPITAL GERAL MATERNO INFANTIL', NULL, NULL, 249, NULL, NULL, NULL, 23732.00, 4, 4, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-10 17:28:34', '2026-02-10 17:45:55', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(192, 'LÍDICO FR ', NULL, NULL, 438, NULL, 27, NULL, 17000.00, 7, 4, NULL, NULL, 'Pedido e contrato fechado. Treinamento completado.', NULL, NULL, NULL, 1, 0.00, '2026-02-10 18:11:04', '2026-03-17 18:54:57', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(194, 'Oportunidade p/ Proposta: CONDOMINIO RESIDENCIAL QUINTAS DA PRAIA', NULL, NULL, 947, NULL, NULL, NULL, 9500.00, 8, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-13 14:35:09', '2026-03-30 20:52:41', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(197, 'Oportunidade p/ Proposta: 31 BATALHAO DE INFANTARIA MOTORIZADO', NULL, NULL, 763, NULL, NULL, NULL, 15010.00, 4, 12, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-12 14:41:57', '2026-02-12 14:41:57', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(198, 'Oportunidade p/ Proposta: MAIS VIDA', NULL, NULL, 336, NULL, NULL, NULL, 1000.00, 5, 7, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-12 17:23:30', '2026-02-12 17:23:30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(199, 'Oportunidade p/ Proposta: AUDES DIOGENES DE MAGALHÃES FEITOSA ', NULL, NULL, NULL, NULL, NULL, 283, 10837.40, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-12 20:54:35', '2026-02-12 20:54:35', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(200, 'Oportunidade p/ Proposta: 13.618.705 ELLYZANDRA KAROLLINE CALAZANS', NULL, NULL, 221, NULL, NULL, NULL, 23082.00, 4, 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-13 14:55:52', '2026-02-13 14:55:52', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(201, 'US Kosmos FUNPEC', NULL, NULL, 317, NULL, 28, NULL, 79000.00, 4, 4, 2, '0006/2026', NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-13 15:09:20', '2026-02-13 15:11:29', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(202, 'Oportunidade p/ Proposta: HOSPITAL PORTUGUES', NULL, NULL, 321, NULL, NULL, NULL, 29487.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-13 18:30:55', '2026-02-13 18:30:55', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(204, 'US Kosmos FUNPEC', NULL, NULL, 317, NULL, 29, NULL, 128000.00, 4, 4, 2, '0008/2026', NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-19 16:27:51', '2026-02-19 16:39:41', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(205, 'Oportunidade p/ Proposta: IAPES PESQUISA CLINICA', NULL, NULL, 918, NULL, NULL, NULL, 12569.00, 6, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-19 16:59:39', '2026-03-30 20:52:10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(206, 'Oportunidade p/ Proposta: B R M SERVICOS MEDICOS', NULL, NULL, 949, NULL, NULL, NULL, 14438.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-19 19:26:11', '2026-02-19 19:26:11', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(207, 'MAQUINA ESSENZ', NULL, NULL, 261, NULL, NULL, NULL, 2000000.00, 1, 7, 6, '0009/2026', 'INICIANDO APRESENTAÇÃO COM O DR.RODRIGO TCHAICK', NULL, NULL, NULL, 1, 0.00, '2026-02-20 17:51:16', '2026-02-20 17:51:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(208, 'Oportunidade p/ Proposta: HOSPITAL ALFA', NULL, NULL, 841, NULL, NULL, NULL, 334350.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-24 13:26:53', '2026-02-24 13:26:53', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(209, 'Cardiomax Hospital Alfa', NULL, NULL, 841, NULL, 30, NULL, 423285.00, 5, 4, 2, '0010/2026', NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-24 13:36:11', '2026-02-25 11:48:29', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(210, 'Ergoespirometria RHP', NULL, NULL, 321, NULL, 31, NULL, 218500.00, 1, 4, NULL, NULL, 'Venda de produto da FR ', NULL, NULL, NULL, 1, 0.00, '2026-02-25 18:47:45', '2026-03-24 18:11:10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(211, 'Mapa e Holter', NULL, NULL, 321, NULL, 31, NULL, 121000.00, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-02-25 18:49:59', '2026-03-23 13:43:45', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(212, 'Mapa Real Cardiologia', NULL, NULL, 952, NULL, 32, NULL, 15490.00, 8, 4, 2, '0011/2026', 'Cliente informou q o paciente achou o equipamento. Não será mais necessário a aquisição. ', NULL, NULL, NULL, 1, 0.00, '2026-02-25 18:57:52', '2026-03-17 18:54:59', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(213, 'procape', '43/2026', '23536.003107/2025-23', 275, NULL, NULL, NULL, 131338.00, 21, 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-02 11:58:49', '2026-03-02 11:59:10', NULL, NULL, NULL, NULL, 'Pregão Eletrônico', NULL, NULL, NULL, NULL, NULL),
(217, 'Contrato:  0018/2024', ' 0018/2024', '1723.2024.AC 71.PE.0522.SAD.HAM', 246, NULL, NULL, NULL, 2499612.00, 29, 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-03 10:43:00', '2026-03-03 10:43:00', NULL, NULL, NULL, NULL, 'Pregão Eletrônico', '1.1. A presente Ata de Registro de Preços tem como objeto a aquisição eventual de consumo hospitalar AQUISIÇÃO DE COMPRAS CIRCULAÇÃO EXTRACORPÓREA com cessão em comodato de equipamentos, conforme as especificações técnicas constantes do Termo de Referência (Anexo I do Edital) e da proposta da DETENTORA DA ATA, para atender às demandas dos órgãos participantes indicados no item 2 desta Ata de Registro de Preços.\n1.2. A existência de preços registrados não obriga os órgãos participantes a firmar contratações com a DETENTORA DA ATA ou a contratar a totalidade dos bens registrados, sendo-lhes facultada a realização de licitação específica para a contratação pretendida, assegurada à DETENTORA DA ATA a preferência em igualdades de condições', NULL, 'uploads/contratos/contrato_69a6ec5b160da.pdf', 'ARP', 'Contrato'),
(218, 'Oportunidade p/ Proposta: UNIMED CAMPINA GRANDE', NULL, NULL, 438, NULL, NULL, NULL, 1515.87, 4, 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-03 20:01:10', '2026-03-03 20:01:10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(219, 'Oportunidade p/ Proposta: AUREN ENERGIA S.A', NULL, NULL, 954, NULL, 33, NULL, 58000.00, 5, 8, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-03 20:36:43', '2026-03-03 20:59:16', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(220, 'Contrato: 284/2024', '284/2024', '2869/2024', 275, NULL, NULL, NULL, 1194595.00, 29, 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-03 22:36:12', '2026-03-03 22:36:12', NULL, NULL, NULL, NULL, 'Pregão Eletrônico', 'TESTE', NULL, 'uploads/contratos/contrato_69a7625bd7758.pdf', 'CONTRATO', 'Contrato'),
(221, 'Oportunidade p/ Proposta: ASHOPE', NULL, NULL, 539, NULL, NULL, NULL, 615.00, 5, 8, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-04 18:00:20', '2026-03-04 18:37:02', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(222, 'Oportunidade p/ Proposta: HOSPITAL ESCOLA DA FAP', NULL, NULL, 452, NULL, NULL, NULL, 32513.00, 5, 8, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-04 18:45:34', '2026-03-04 19:12:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(223, 'Oportunidade p/ Proposta: GESTEC', NULL, NULL, 855, NULL, NULL, NULL, 4152.72, 5, 8, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-05 13:41:51', '2026-03-05 13:41:51', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(224, 'Oportunidade p/ Proposta: CLINCORDIS', NULL, NULL, 561, NULL, 34, NULL, 9904.00, 5, 8, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-05 13:59:50', '2026-03-05 13:59:50', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(225, 'Oportunidade p/ Proposta: Dr. Leonardo', NULL, NULL, NULL, NULL, NULL, 290, 637660.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-09 18:43:42', '2026-03-09 18:43:42', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(226, 'Contrato: 755/2025', '755/2025', '23536.003107/2025-23', 347, NULL, NULL, NULL, 246650.45, 29, 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-10 11:30:21', '2026-03-10 11:30:21', NULL, NULL, NULL, NULL, 'Pregão Eletrônico', 'A presente Ata tem por objeto o registro de preços para a eventual aquisição de GRUPO 48 OPME\'S E OUTROS MATERIAIS HOSPITALARES (CARDIOLOGIA), COM EQUIPAMENTOS E\nACESSÓRIOS EM REGIME DE COMODATO E DISPONIBILIZAÇÃO DE PROFISSIONAL PERFUSIONISTA, com o objetivo de atender as necessidades do Hospital das Clínicas de Pernambuco - Filial da EBSERH, especificado(s) no(s) item(ns) 4.1 do termo de referência, anexo do Edital de Pregão nº 90043/2025, que é parte integrante desta Ata, assim como a proposta vencedora, independentemente de transcrição.', NULL, 'uploads/contratos/contrato_69b0026493cdd.pdf', 'CONTRATO-ATA', 'Contrato'),
(227, 'Oportunidade p/ Proposta: FUNDACAO PEDRO AMERICO', NULL, NULL, 726, NULL, NULL, NULL, 29487.00, 8, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-10 13:04:10', '2026-03-23 16:33:29', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(228, 'Oportunidade p/ Proposta: HOSPITAL SANTA JOANA RECIFE', NULL, NULL, 227, NULL, NULL, NULL, 7548.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-10 18:04:40', '2026-03-10 18:42:02', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(229, 'Locação TCA', NULL, NULL, 227, NULL, 21, NULL, 3654.00, 8, 4, NULL, NULL, 'A instituição não vai mais precisar dos monitores de TCA', NULL, NULL, NULL, 1, 0.00, '2026-03-10 18:12:33', '2026-03-24 19:04:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(230, 'Oportunidade p/ Proposta: Dr. Leonardo', NULL, NULL, NULL, NULL, NULL, 290, 691233.60, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-11 19:07:18', '2026-03-11 20:12:12', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(231, 'Oportunidade p/ Proposta: INFUSIONMED', NULL, NULL, 956, NULL, NULL, NULL, 38303.85, 8, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-13 18:25:06', '2026-03-19 20:30:59', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(232, 'Oportunidade p/ Proposta: INFUSIONMED', NULL, NULL, 956, NULL, NULL, NULL, 23732.00, 8, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-13 18:40:55', '2026-03-19 20:31:36', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(233, 'Oportunidade p/ Proposta: WARTSILA BRASIL LTDA.', NULL, NULL, 957, NULL, NULL, NULL, 9604.00, 5, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-16 17:21:20', '2026-03-30 20:46:13', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(234, 'Oportunidade p/ Proposta: DR. EUCLIDES TENORIO ', NULL, NULL, 958, NULL, NULL, NULL, 7537.80, 5, 7, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-16 18:38:34', '2026-03-16 18:43:15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(235, 'Oportunidade p/ Proposta: FERREIRA COSTA & CIA LTDA', NULL, NULL, 959, NULL, NULL, NULL, 9604.00, 8, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-16 20:52:38', '2026-03-19 11:40:22', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(236, 'Oportunidade p/ Proposta: INFUSIONMED', NULL, NULL, 956, NULL, NULL, NULL, 9984.00, 8, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-17 16:23:30', '2026-03-30 20:45:43', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(237, 'Oportunidade p/ Proposta: HOSPITAL PORTUGUES', NULL, NULL, 321, NULL, NULL, NULL, 965301.37, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-18 20:46:02', '2026-03-19 13:24:51', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(238, 'Oportunidade p/ Proposta: IPE', NULL, NULL, 960, NULL, NULL, NULL, 9604.00, 5, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-19 11:39:10', '2026-03-30 20:44:08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(239, 'Oportunidade p/ Proposta: HOSPITAL PORTUGUES', NULL, NULL, 321, NULL, NULL, NULL, 190000.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-19 13:29:58', '2026-03-19 14:28:07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(240, 'Oportunidade p/ Proposta: HOSPITAL PORTUGUES', NULL, NULL, 321, NULL, NULL, NULL, 656889.94, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-19 14:01:46', '2026-03-19 15:11:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(241, 'Oportunidade p/ Proposta: HVU - HOSPITAL VALE DO UNA', NULL, NULL, 777, NULL, NULL, NULL, 26167.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-19 17:34:28', '2026-03-19 17:34:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(242, 'Oportunidade p/ Proposta: INSTITUTO MEDIC', NULL, NULL, 43, NULL, NULL, NULL, 50209.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-19 19:31:08', '2026-04-08 17:58:40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(243, 'Oportunidade p/ Proposta: CLINICA FERNANDO AMARAL - ULTRASSONOGRAFIA DIAGNOSTICA E INTERVENCIONISTA LTDA', NULL, NULL, 962, NULL, NULL, NULL, 13362.00, 5, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-19 20:19:50', '2026-03-20 15:01:17', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(244, 'Oportunidade p/ Proposta: CLINICA FERNANDO AMARAL - ULTRASSONOGRAFIA DIAGNOSTICA E INTERVENCIONISTA LTDA', NULL, NULL, 962, NULL, NULL, NULL, 9694.40, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-20 15:08:02', '2026-03-20 15:08:02', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(245, 'Oportunidade p/ Proposta: MAIS VIDA', NULL, NULL, 336, NULL, NULL, NULL, 66000.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-20 20:00:54', '2026-03-20 20:02:59', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(246, 'Hospital da Criança do Recife', NULL, NULL, 363, NULL, 35, NULL, 50980.00, 4, 1, 1, '0012/2026', NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-24 12:03:12', '2026-03-24 12:11:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(247, 'Oportunidade p/ Proposta: FERNANDA VITORIA FRAGOSO SALES ', NULL, NULL, NULL, NULL, NULL, 291, 500.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-24 14:43:01', '2026-03-24 14:43:01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(248, 'Oportunidade p/ Proposta: REGENERE', NULL, NULL, 964, NULL, NULL, NULL, 16869.85, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-24 19:16:11', '2026-03-24 19:16:11', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(249, 'Oportunidade p/ Proposta: VAL MED', NULL, NULL, 965, NULL, NULL, NULL, 12185.00, 6, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-25 18:13:59', '2026-03-26 15:44:38', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(250, 'Mapas e Holters Santa Casa ', NULL, NULL, 28, NULL, NULL, NULL, 148390.00, 4, 4, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-26 14:00:37', '2026-03-26 14:00:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(251, 'Oportunidade p/ Proposta: POLICLINICA BEM ESTAR', NULL, NULL, 966, NULL, NULL, NULL, 16869.85, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-26 14:23:37', '2026-03-26 15:17:18', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(252, 'Oportunidade p/ Proposta: LAGOA NOVA GABINETE PREFEITO', NULL, NULL, 967, NULL, 37, NULL, 6600.00, 5, 8, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-31 14:22:01', '2026-03-31 14:37:18', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(253, 'AMOR SAUDE', NULL, NULL, 53, NULL, 38, NULL, 49990.00, 6, 8, 2, '0013/2026', NULL, NULL, NULL, NULL, 1, 0.00, '2026-03-31 18:33:34', '2026-03-31 18:41:36', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(255, 'Fechamento de Externo ', NULL, NULL, 156, NULL, NULL, NULL, 0.00, 1, 10, 10, '0014/2026', NULL, NULL, NULL, NULL, 1, 0.00, '2026-04-01 12:24:50', '2026-04-01 12:24:50', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(256, 'HIPEC', NULL, NULL, 805, NULL, NULL, NULL, 0.00, 1, 10, 10, '0015/2026', NULL, NULL, NULL, NULL, 1, 0.00, '2026-04-01 12:27:34', '2026-04-01 12:27:34', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(257, 'Monitorização ', NULL, NULL, 805, NULL, NULL, NULL, 0.00, 1, 10, 10, '0016/2026', NULL, NULL, NULL, NULL, 1, 0.00, '2026-04-01 12:30:00', '2026-04-01 12:30:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(258, 'Monitorização ', NULL, NULL, 797, NULL, NULL, NULL, 0.00, 1, 10, 10, '0017/2026', NULL, NULL, NULL, NULL, 1, 0.00, '2026-04-01 12:34:31', '2026-04-01 12:34:31', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(259, 'Oportunidade p/ Proposta: APABB - ASSOCIACAO DE PAIS, AMIGOS E PESSOAS COM DEFICIENCIA DE FUNCIONARIOS DO BANCO DO BRASIL E DA COMUNIDADE', NULL, NULL, 969, NULL, 39, NULL, 9604.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-04-01 20:05:56', '2026-04-01 20:05:56', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(260, 'Oportunidade p/ Proposta: DR. Igor Costa ', NULL, NULL, NULL, NULL, NULL, 295, 92449.85, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-04-01 20:55:20', '2026-04-01 20:56:53', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(261, 'Sedline Getúlio Vargas ', NULL, NULL, 747, NULL, NULL, NULL, 4500.00, 1, 4, 2, '0018/2026', 'Em comodato, um monitor Root por caixa adiquirida mensalmente ', NULL, NULL, NULL, 1, 0.00, '2026-04-06 18:22:11', '2026-04-06 18:22:11', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(262, 'Oportunidade p/ Proposta: MEDLIFE SAUDE', NULL, NULL, 971, NULL, NULL, NULL, 16570.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-04-06 19:51:07', '2026-04-06 19:51:07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(263, 'Oportunidade p/ Proposta: HOSPITAL DA RESTAURACAO', NULL, NULL, 406, NULL, NULL, NULL, 1386.10, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-04-07 18:49:56', '2026-04-07 18:50:01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(264, 'Oportunidade p/ Proposta: INCOR NATAL', NULL, NULL, 225, NULL, NULL, NULL, 16200.00, 5, 7, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-04-08 16:41:37', '2026-04-08 16:41:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(265, 'Oportunidade p/ Proposta: ESPACO SAUDE CORPORATIVA', NULL, NULL, 972, NULL, 42, NULL, 9604.00, 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00, '2026-04-10 19:56:54', '2026-04-10 19:56:54', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `oportunidade_itens`
--

CREATE TABLE `oportunidade_itens` (
  `id` int(11) NOT NULL,
  `oportunidade_id` int(11) NOT NULL,
  `produto_id` int(11) DEFAULT NULL,
  `descricao` varchar(255) NOT NULL,
  `descricao_detalhada` text DEFAULT NULL,
  `fabricante` varchar(255) DEFAULT NULL,
  `modelo` varchar(255) DEFAULT NULL,
  `imagem_url` varchar(512) DEFAULT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 1,
  `valor_unitario` decimal(20,2) NOT NULL DEFAULT 0.00,
  `status` enum('VENDA','LOCAÇÃO') DEFAULT 'VENDA',
  `unidade_medida` varchar(50) DEFAULT 'Unidade',
  `parametros` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parametros`)),
  `meses_locacao` int(11) DEFAULT 1,
  `lote` varchar(255) DEFAULT NULL,
  `item_num` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `oportunidade_itens`
--

INSERT INTO `oportunidade_itens` (`id`, `oportunidade_id`, `produto_id`, `descricao`, `descricao_detalhada`, `fabricante`, `modelo`, `imagem_url`, `quantidade`, `valor_unitario`, `status`, `unidade_medida`, `parametros`, `meses_locacao`, `lote`, `item_num`) VALUES
(5, 66, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, DEA/PMS\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 1, 23082.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(6, 66, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 8471.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(26, 136, NULL, 'cardiomax', '', '', '', '', 1, 0.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(27, 136, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, PMS, Li-ion 4Ah.\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 1, 23082.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(29, 138, NULL, 'Rad G com temperatura', 'Rad G com temp', 'MASIMO', 'Rad G', 'https://frpe.app.br/crm/uploads/proposal_items/item_696e763a21db1.webp', 60, 9600.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(31, 141, NULL, 'US 2 Ai', 'Tecnologia de IA para Ecocardiografia', 'Brasil Médica', '', '', 1200, 36.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(32, 142, NULL, 'US 2 Ai', 'Tecnologia de IA para ecocardiografia', 'Brasil Médica', '', '', 1200, 36.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(34, 143, NULL, 'US Kosmos', 'Demosntração setor de transplante', 'Brasil Médica', '', 'https://frpe.app.br/crm/uploads/proposal_items/item_696f9e3cba94a.jpeg', 1, 47000.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(35, 144, NULL, 'US Kosmos', 'Demonstração no setor de ecocardiografia', 'Brasil Médica', '', 'https://frpe.app.br/crm/uploads/proposal_items/item_696f9ec8e92b1.jpeg', 4, 47000.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(37, 145, NULL, 'US Kosmos', 'Uso do Kosmos para curso de POCUS', 'Brasil Médica', '', 'https://frpe.app.br/crm/uploads/proposal_items/item_696f9f66c635f.jpeg', 4, 110000.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(38, 146, NULL, 'LÍDICO', 'Sensores Lídico com comodato', 'MASIMO', '', '', 10, 2500.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(54, 156, NULL, 'US Kosmos', 'Aquisição por verba palamentar ', 'Brasil Médica', 'Torso + Bridge', 'https://frpe.app.br/crm/uploads/proposal_items/item_69726f1da4e5e.jpeg', 1, 70000.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(74, 166, 16, 'MONITOR DE PRESSÃO ARTERIAL DE BRAÇO PROFISSIONAL - MPA', 'Destinado a profissionais da saúde.\nDesign de mesa ideal para consultórios. ​\nModo de medição totalmente automático oscilométrico ou auscultatório.​\nFunção Indicador Zero ​\nPode ser usado com 4 pilhas AA ou com adaptador CA (bivolt automático)​', 'MICROMED', 'OMRON', 'https://frpe.app.br/crm/uploads/products/prod_6911dd100a3fb.webp', 1, 1290.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(75, 166, 17, 'OXIMETRO', 'Monitor portátil com SPO2, PR, PI, RRP e módulo de temperatura integrado ', 'MASIMO', 'RAD G COM TEMPERATURA ', 'https://frpe.app.br/crm/uploads/products/prod_6911dd39c9342.png', 1, 8358.90, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(78, 172, 28, 'CARRO DE PARADA ', 'ESTRUTURA INTERNA EM AÇO CARBONO, REVESTIDO EM POLÍMERO DE ALTO IMPACTO ABS COM NANO TECNOLOGIA ANTI-BACTERIANA.   ', 'HEALTH ', 'LT 103', 'https://frpe.app.br/crm/uploads/products/prod_69381c774ddf6.webp', 5, 7265.85, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(79, 172, 17, 'OXIMETRO', 'Monitor portátil com SPO2, PR, PI, RRP e módulo de temperatura integrado ', 'MASIMO', 'RAD G COM TEMPERATURA ', 'https://frpe.app.br/crm/uploads/products/prod_6911dd39c9342.png', 6, 8358.90, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(81, 171, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 14, 6289.98, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(89, 173, 36, 'SISTEMA PARA ERGOMETRIA ERGO PC AIR', 'Eletrocardiógrafo digital sem fio de 3, 12 ou 13 derivações simultâneas para realização de teste de esforço.', 'MICROMED', 'ERGOPC AIR', 'uploads/products/prod_697ba726bed16.jpeg', 1, 29590.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(90, 173, 37, 'ESTERIRA ERGOMETRICA', 'Leve, resistente e moderna, feita em alumínio, ideal para uso médico em testes de esforço e cardiopulmonares. Suporta até 200 kg, com ampla área de caminhada, inclinação de 0 a 26% e velocidade máxima de 18 km/h. Possui saída USB nativa para controle automático digital, sistema de fricção reduzida que dispensa lubrificação e operação em 220V/60Hz. Compatível com Ergo PC, Ergo PC Air e Ergo PC Elite. Garantia de 1 ano para a esteira (já incluída a garantia legal) e 3 meses para acessórios (já incluída a garantia legal). Inclui cabo USB. Recomenda-se uso de Nobreak Onda Senoidal (5 KVA, 220V) e instalação em circuito elétrico isolado e aterrado', 'MICROMED', 'C300', 'uploads/products/prod_697ba85eb0a8e.jpeg', 1, 49990.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(92, 175, NULL, 'VALVULA MERIL', 'JOGO VAlVULA AORTICA', 'MERIL', 'DAFODIL', '', 10, 9500.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(95, 180, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, PMS, Li-ion 4Ah.\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 1, 23082.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(96, 181, 38, 'CARRO DE EMERGÊNCIA COM NANOTECNOLOGIA ANTIBACTERIANA', '- 01 tábua para massagem cardíaca, 02 gavetas em monobloco de polímero com nanotecnologia antibacteriana, 01 gavetas em monobloco de polímero com nanotecnologia antibacteriana - 01 jogo de divisórias em polímero para 1ra. Gaveta, contendo 20 nichos;  01 braço móvel e bandeja em aço inox com movimento de rotação de 90°; 01 bandeja em aço inox com movimento de rotação de 180° para acomodar o desfibrilador, 02 cintas velcro para segurança do desfibrilador / cardioversor; 01 suporte de soro com haste em aço inox regulável em altura com dois ganchos em polímero;  01 suporte em aço inox para tubo de oxigênio; 01 cinta velcro para fixação de cilindro de oxigênio; 01 jogo de divisórias em polímero para compartimento superior tipo colmeia regulável e removível com 12 nichos; 01 dispositivo em acrílico 4mm para armazenar materiais, 01 cesto aramado para colocação de aspirador. Medidas: comprimento 1025 mm, largura: 570 mm, altura 910 mm aproximadamente.', 'HEALTH ', 'CARRO LIFE AID LA3-101 STANDARD', 'uploads/products/prod_697cfbebea61b.png', 1, 15800.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(97, 182, 28, 'CARRO DE PARADA ', 'ESTRUTURA INTERNA EM AÇO CARBONO, REVESTIDO EM POLÍMERO DE ALTO IMPACTO ABS COM NANO TECNOLOGIA ANTI-BACTERIANA.   ', 'HEALTH ', 'LT 103', 'https://frpe.app.br/crm/uploads/products/prod_69381c774ddf6.webp', 1, 7265.85, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(98, 184, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, PMS, Li-ion 4Ah.\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 1, 23082.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(101, 147, NULL, 'Monitorização ', 'Monitorização da Masimo com Lidico para o cliente da CSU ( Paciente: Maria Lúcia Canto )Paciente de Dr . Hernâni Gadelha ) cirurgia dia 30/01', 'Masimo', 'Sediline / Lidico/ O3', '', 1, 0.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(105, 187, 38, 'CARRO DE EMERGÊNCIA COM NANOTECNOLOGIA ANTIBACTERIANA', '- 01 tábua para massagem cardíaca, 02 gavetas em monobloco de polímero com nanotecnologia antibacteriana, 01 gavetas em monobloco de polímero com nanotecnologia antibacteriana - 01 jogo de divisórias em polímero para 1ra. Gaveta, contendo 20 nichos;  01 braço móvel e bandeja em aço inox com movimento de rotação de 90°; 01 bandeja em aço inox com movimento de rotação de 180° para acomodar o desfibrilador, 02 cintas velcro para segurança do desfibrilador / cardioversor; 01 suporte de soro com haste em aço inox regulável em altura com dois ganchos em polímero;  01 suporte em aço inox para tubo de oxigênio; 01 cinta velcro para fixação de cilindro de oxigênio; 01 jogo de divisórias em polímero para compartimento superior tipo colmeia regulável e removível com 12 nichos; 01 dispositivo em acrílico 4mm para armazenar materiais, 01 cesto aramado para colocação de aspirador. Medidas: comprimento 1025 mm, largura: 570 mm, altura 910 mm aproximadamente.', 'HEALTH ', 'CARRO LIFE AID LA3-101 STANDARD', 'uploads/products/prod_697cfbebea61b.png', 1, 15800.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(106, 188, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, PMS, Li-ion 4Ah.\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 4, 23082.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(109, 193, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, PMS, Li-ion 4Ah.\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 1, 23082.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(110, 194, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, PMS, Li-ion 4Ah.\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 1, 23082.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(111, 195, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, PMS, Li-ion 4Ah.\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 1, 23082.00, 'VENDA', 'Unidade', '[{\"nome\":\"Marcapasso \",\"valor\":1}]', 1, NULL, NULL),
(112, 196, NULL, 'Ventilador de Transporte Shangrilá', '', 'Instramed', 'Shangrilá', '', 1, 0.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(113, 196, 39, 'VENTILADOR DE TRANSPORTE', 'Ventilador de Transporte de Emergência Multifuncional, Tela LCD 5\", Atende à norma EN1789, Nível IPX4 à prova d\'água, Alarmes sonoros e visuais.\nNÃO ACOMPANHA CILINDRO DE GÁS.', 'AEONMED', 'SHANGRILAR 510s', 'uploads/products/prod_69823148160d9.png', 3, 28000.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(114, 201, NULL, 'US Kosmos', 'Sonda Lexsa + Bridge ', 'Brasil Médica', 'Lexsa + Bridge', 'uploads/proposal_items/item_698f3e38cdc94.jpeg', 1, 79000.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(115, 203, NULL, 'Bridge+Torso+Lexsa', 'Para abertura de edital da UFRN', 'Brasil Médica', '', 'uploads/proposal_items/item_699739a0849dd.jpeg', 1, 128000.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(116, 204, NULL, 'Bridge+Torso+Lexsa', 'Para abertura de edital da UFRN', 'Brasil Médica', '', 'uploads/proposal_items/item_699739a0849dd.jpeg', 1, 128000.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(118, 207, NULL, 'MAQUINA DE EXTRACORPOREA', '', 'LIVANOVA', 'ESSENZ', '', 1, 2000000.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(119, 209, NULL, 'Cardiomax', 'Cardiomax Lite com Dea, MP, Impressora', 'Instramed', 'Lite', '', 15, 28219.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(121, 211, NULL, 'Mapa e Holter', '5 unidades de mapa e 5 unidades de holter', 'Micromed', '', '', 10, 12100.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(123, 213, NULL, 'CONJUNTO DE EXTRACORNPOREA', '', 'LIVANOVA', 'CEC', '', 1, 131338.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(125, 214, NULL, 'CONJUNTO DE EXTRACORNPOREA', '', 'LIVANOVA', 'CEC', '', 1, 131338.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(126, 215, NULL, 'teste', '', '', '', '', 1, 0.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(128, 216, 0, '(275071-6) - CONJUNTO DE CIRCULACAO EXTRACORPOREA - OXIGENADOR DE MEMBRANA DIFUSA ADULTO COM FILTRO ARTERIAL, RESERVATORIO VENOSO E CARDIOTOMIA MONTADO EM ESTRUTURA VEDADA COM A SUPERFICIE INTERNA TOTALMENTE REVESTIDA DE SUBSTANCIA COM CARACTERISITCAS HID', '', 'LIVANOVA', 'CEC', NULL, 180, 3758.31, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(129, 216, 0, '(275071-6) - CONJUNTO DE CIRCULACAO EXTRACORPOREA - OXIGENADOR DE MEMBRANA DIFUSA ADULTO COM FILTRO ARTERIAL, RESERVATORIO VENOSO E CARDIOTOMIA MONTADO EM ESTRUTURA VEDADA COM A SUPERFICIE INTERNA TOTALMENTE REVESTIDA DE SUBSTANCIA COM CARACTERISITCAS HID', '', 'LIVANOVA', 'CEC', NULL, 180, 3758.31, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(151, 217, 0, '(275071-6) - CONJUNTO DE CIRCULACAO EXTRACORPOREA - OXIGENADOR DE MEMBRANA DIFUSA ADULTO COM FILTRO ARTERIAL, RESERVATORIO VENOSO E CARDIOTOMIA MONTADO EM ESTRUTURA VEDADA COM A SUPERFICIE INTERNA TOTALMENTE REVESTIDA DE SUBSTANCIA COM CARACTERISITCAS HID', '', 'LIVANOVA', 'CEC', NULL, 180, 3758.31, 'VENDA', 'Unidade', '[{\"nome\":\"Lote\",\"valor\":\"COTA PRINCIPAL 1 - LOTE 01\"},{\"nome\":\"Item_Num\",\"valor\":\"01\"}]', 1, NULL, NULL),
(152, 217, 0, '(498569-9) - CONJUNTO DE CIRCULACAO EXTRACORPOREA - ADULTO, PACIENTE ATE 110 KG, COMPOSTO POR OXIGENADOR DE MEMBRANA COM PERMUTADOR DE CALOR EM ACO INOXIDAVEL E FILTRO ARTERIAL EM CASCATA INTEGRADO PRIME 225 ML, FLUXO MAXIMO 7,0 L/MIN, MEMBRANA 1,65 M2, R', '', 'LIVANOVA', 'CEC', NULL, 180, 4211.00, 'VENDA', 'Unidade', '[{\"nome\":\"Lote\",\"valor\":\"COTA PRINCIPAL 1 - LOTE 01\"},{\"nome\":\"Item_Num\",\"valor\":\"02\"}]', 1, NULL, NULL),
(153, 217, 0, '(195846-1) - SISTEMA DE OXIGENADOR MEMBRANA ADULTO - HEMOCONCENTRADOR H-500 PARA CIRCULACAO EXTRACORPOREA, EM POLICARBONATO E FIBRAS DE POLIETERSULFONA, COM DIAMETRO EXTERNO DA FIBRA, AREA EFETIVA DE MEMBRANA COM SUPORTE, CONCENTRA OS ELEMENTOS DO SANGUE', '', 'LIVANOVA', 'CEC', NULL, 180, 2445.74, 'VENDA', 'Unidade', '[{\"nome\":\"Lote\",\"valor\":\"COTA PRINCIPAL 1 - LOTE 01\"},{\"nome\":\"Item_Num\",\"valor\":\"03\"}]', 1, NULL, NULL),
(154, 217, 0, '(275071-6) - CONJUNTO DE CIRCULACAO EXTRACORPOREA - OXIGENADOR DE MEMBRANA DIFUSA ADULTO COM FILTRO ARTERIAL, RESERVATORIO VENOSO E CARDIOTOMIA MONTADO EM ESTRUTURA VEDADA COM A SUPERFICIE INTERNA TOTALMENTE REVESTIDA DE SUBSTANCIA COM CARACTERISITCAS HID', '', 'LIVANOVA', 'CEC', NULL, 60, 3758.31, 'VENDA', 'Unidade', '[{\"nome\":\"Lote\",\"valor\":\"COTA RESERVADA 1 - LOTE 01\"},{\"nome\":\"Item_Num\",\"valor\":\"01\"}]', 1, NULL, NULL),
(155, 217, 0, '(498569-9) - CONJUNTO DE CIRCULACAO EXTRACORPOREA - ADULTO, PACIENTE ATE 110 KG, COMPOSTO POR OXIGENADOR DE MEMBRANA COM PERMUTADOR DE CALOR EM ACO INOXIDAVEL E FILTRO ARTERIAL EM CASCATA INTEGRADO PRIME 225 ML, FLUXO MAXIMO 7,0 L/MIN, MEMBRANA 1,65 M2, R', '', 'LIVANOVA', 'CEC', NULL, 60, 4211.00, 'VENDA', 'Unidade', '[{\"nome\":\"Lote\",\"valor\":\"COTA RESERVADA 1 - LOTE 01\"},{\"nome\":\"Item_Num\",\"valor\":\"02\"}]', 1, NULL, NULL),
(156, 217, 0, '(195846-1) - SISTEMA DE OXIGENADOR MEMBRANA ADULTO - HEMOCONCENTRADOR H-500 PARA CIRCULACAO EXTRACORPOREA, EM POLICARBONATO E FIBRAS DE POLIETERSULFONA, COM DIAMETRO EXTERNO DA FIBRA, AREA EFETIVA DE MEMBRANA COM SUPORTE, CONCENTRA OS ELEMENTOS DO SANGUE', '', 'LIVANOVA', 'CEC', NULL, 60, 2445.74, 'VENDA', 'Unidade', '[{\"nome\":\"Lote\",\"valor\":\"COTA RESERVADA 1 - LOTE 01\"},{\"nome\":\"Item_Num\",\"valor\":\"03\"}]', 1, NULL, NULL),
(157, 220, 0, 'SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO CONJUNTO PARA CIRCULAÇÃO EXTRA CORPÓREA PEDIÁTRICO, COMPOSTO DE: OXIGENADOR MEMBRANA RESERVATÓRIO PARA CARDIOTOMIA, CONJUNTO DE TUBOS COM UMA OU DUAS CAVAS COM ARTERIAL, HEMOCONTRADOR, CONJUNTO P CIRCULAÇÃO ASSIST', '', 'LIVANOVA', 'CEC', NULL, 39, 4677.00, 'VENDA', 'Unidade', '[{\"nome\":\"Lote\",\"valor\":\"LOTE 03\"},{\"nome\":\"Item_Num\",\"valor\":\"03\"}]', 1, NULL, NULL),
(158, 220, 0, '415331-6 SISTEMA DE OXIGENADOR MEMBRANA NEONATAL - COMPOSTO DE: OXIGENADOR MEMBRANA COM CARDIOTOMIA INTEGRADA, CONJUNTO DE TUBOS COM FILTRO ARTERIAL, HEMOCONCENTRADOR EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS.', '', 'LIVANOVA', 'CEC', NULL, 20, 3837.39, 'VENDA', 'Unidade', '[{\"nome\":\"Lote\",\"valor\":\"LOTE 04\"},{\"nome\":\"Item_Num\",\"valor\":\"04\"}]', 1, NULL, NULL),
(159, 220, 0, '311297-7 BOMBA CENTRIFUGA NEONATAL - CONJUNTO P CIRCULAÇÃO ASSISTIDA EMBALAGEM INDIVIDUAL, VALIDADE 3 ANOS', '', 'LIVANOVA', 'CEC', NULL, 20, 913.61, 'VENDA', 'Unidade', '[{\"nome\":\"Lote\",\"valor\":\"LOTE 04 \"},{\"nome\":\"Item_Num\",\"valor\":\"05\"}]', 1, NULL, NULL),
(160, 220, 0, '305035-1 SISTEMA DE OXIGENADOR MEMBRANA ADULTO BAIXO PRIMER CONJUNTO CIRCULAÇÃO EXTRACORPÓREA, COMPOSTO DE: OXIGENADOR MEMBRANA COM RESERVATÓRIO VENOSO ACOPLADO, FILTRO DE LINHA ARTERIAL ACOPLADO. CONJUNTO DE TUBOS PRÉ- MONTADO COM UMA OU DAS CAVAS. HEMOC', '', 'LVANOVA', 'CEC', NULL, 177, 4166.00, 'VENDA', 'Unidade', '[{\"nome\":\"Lote\",\"valor\":\"LOTE 05\"},{\"nome\":\"Item_Num\",\"valor\":\"06\"}]', 1, NULL, NULL),
(161, 220, 0, '416384-2 SISTEMA DE OXIGENADOR MEMBRANA PEDIÁTRICO - COMPOSTO DE: OXIGENADOR DE MEMBRANA COM CARDIOTOMIA INTEGRADA, VOLUME MAXIMO DO PRIMING DE 90 ML, PACIENTE DE 5 KG ATÉ 20 KG. CONJUNTO DE TUBOS COM FILTRO INTEGRADO. KIT CANULA CAVA ÚNICA OU DUPLA. CONJ', '', 'LIVANOVA', 'CEC', NULL, 39, 4610.00, 'VENDA', 'Unidade', '[{\"nome\":\"Lote\",\"valor\":\"LOTE 06\"},{\"nome\":\"Item_Num\",\"valor\":\"07\"}]', 1, NULL, NULL),
(172, 226, 0, 'CÂNULA VENOSA, PARA CIRCULAÇÃO EXTRACORPÓREA, CALIBRE 28/36 FR, ARAMADA, RETA, ADULTO, DUPLO ESTÁGIO, COMPRIMENTO CERCA DE 40 cm, confeccionada EM TUBO PVC reforçado internamente com armação de aço inoxidável, aramado; adaptável a conector de 1/2 polegada', '', 'LIVANOVA', 'CÂNULA VENOSA', NULL, 5, 513.03, 'VENDA', 'Unidade', '[{\"nome\":\"Lote\",\"valor\":\"UNICO\"},{\"nome\":\"Item_Num\",\"valor\":\"33\"}]', 1, NULL, NULL),
(173, 226, 0, 'CÂNULA, material silicone, tipo VENTILAÇÃO, formato estilete maleável, trava dupla, conector, características adicionais ponta arredondada, múltiplos orifícios, DIÂMETRO 20 FRENCH, COMPRIMENTO 36,8 CM, esterilidade uso único, estéril', '', 'LIVANOVA', 'CÂNULA VENTILAÇÃO', NULL, 30, 520.00, 'VENDA', 'Unidade', '[{\"nome\":\"Lote\",\"valor\":\"UNICO\"},{\"nome\":\"Item_Num\",\"valor\":\"40\"}]', 1, NULL, NULL),
(174, 226, 0, 'KIT AUTOTRANSFUSÃO ADULTO para procedimentos de RECUPERAÇÃO SANGUÍNEA INTRAOPERATÓRIA, composto no mínimo por: BOLSA PARA TRANSFERÊNCIA com CAPACIDADE 1.000 ml; BOLSA DE DESCARTE de 10 litros, RESERVATÓRIO PARA COLETA com CAPACIDADE MÍNIMA 3.000 ml com FI', '', 'LIVANOVA', 'XTRA', NULL, 15, 2849.51, 'VENDA', 'Unidade', '[{\"nome\":\"Lote\",\"valor\":\"UNICO\"},{\"nome\":\"Item_Num\",\"valor\":\"60\"}]', 1, NULL, NULL),
(175, 226, 0, 'KIT AUTOTRANSFUSÃO ADULTO para procedimentos de RECUPERAÇÃO SANGUÍNEA INTRAOPERATÓRIA, composto no mínimo por: BOLSA PARA TRANSFERÊNCIA com CAPACIDADE 1.000 ml; BOLSA DE DESCARTE de 10 litros, RESERVATÓRIO PARA COLETA com CAPACIDADE MÍNIMA 3.000 ml com FI', '', 'LIVANOVA', 'XTRA', NULL, 15, 2849.51, 'VENDA', 'Unidade', '[{\"nome\":\"Lote\",\"valor\":\"UNICO\"},{\"nome\":\"Item_Num\",\"valor\":\"61\"}]', 1, NULL, NULL),
(176, 226, 0, 'SENSOR CONTÍNUO de parâmetros hemodinâmicos para monitoramento contínuo da tendência DE DÉBITO CARDÍACO MINIMAMENTE INVASIVO por pressão de pulso, com avaliação de parâmetros hemodinâmicos, material polímero, modelo cateter arterial, contendo extensor com', '', 'MASIMO', 'LIDCO', NULL, 65, 2200.00, 'VENDA', 'Unidade', '[{\"nome\":\"Lote\",\"valor\":\"UNICO\"},{\"nome\":\"Item_Num\",\"valor\":\"70\"}]', 1, NULL, NULL),
(179, 137, NULL, 'Compressor Torácico E6', 'Compressor Torácico Amoul E6', 'Instramed', 'Amoul E6', '', 4, 129230.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(181, 192, NULL, 'Lídico + Sedline ', 'Sensores Lídico + Sedline direto FR', 'MASIMO', '', '', 1, 0.00, 'VENDA', 'Unidade', '[{\"nome\":\"L\\u00cdDICO\",\"valor\":12500},{\"nome\":\"Sedline \",\"valor\":4500}]', 1, NULL, NULL),
(182, 212, NULL, 'Mapa', '', 'Micromed', '', '', 1, 15490.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(184, 246, 83, 'MONITOR BLT P12', 'Parâmetros de Monitorização:\n• ECG \n• SpO2 (Nellcor/Masimo)\n• PNI \n• RESP\n• TEMP\n• Tela e Interfaces: Display colorido (TFT LCD 12’’)\n• Interface: Navegação intuitiva\n• Alarmes: (alto, médio, baixo)\n• Operação: Teclas de atalho para funções rápidas\n• Armazenamento de dados históricos \n• Bateria interna\n• Modos de Paciente: Configurações específicas para Adulto, Pediátrico e Neonatal\n• Certificação da ANVISA', 'BLT', 'P12', 'uploads/products/prod_69c27a55ef1de.png', 1, 30990.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(185, 246, 84, 'MONITOR BLT Q5 12\"', 'Parâmetros de Monitorização:\n• ECG \n• SpO2 (Nellcor)\n• PNI \n• RESP\n• TEMP\n• Tela e Interfaces: Display colorido (TFT LCD 12’’)\n• Interface: Navegação intuitiva\n• Alarmes: (alto, médio, baixo)\n• Operação: Teclas de atalho para funções rápidas\n• Armazenamento de dados históricos \n• Bateria interna\n• Modos de Paciente: Configurações específicas para Adulto, Pediátrico e Neonatal\n• Certificação da ANVISA', 'BLT', 'Q5', 'uploads/products/prod_69c27cf3b4f27.png', 1, 19990.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(186, 229, NULL, 'Monito TCA', 'Locação período 6 meses', 'Fubdação Adib Jatene', 'TCA', '', 1, 609.00, 'LOCAÇÃO', 'Mês', NULL, 6, NULL, NULL),
(187, 250, NULL, 'Mapa e Holter', 'Solicitado proposta para 5 mapas e 5 holters', 'Micromed', '', '', 10, 14839.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(188, 253, 37, 'ESTEIRA ERGOMETRICA', 'Leve, resistente e moderna, feita em alumínio, ideal para uso médico em testes de esforço e cardiopulmonares. Suporta até 200 kg, com ampla área de caminhada, inclinação de 0 a 26% e velocidade máxima de 18 km/h. Possui saída USB nativa para controle automático digital, sistema de fricção reduzida que dispensa lubrificação e operação em 220V/60Hz. Compatível com Ergo PC, Ergo PC Air e Ergo PC Elite. Garantia de 1 ano para a esteira (já incluída a garantia legal) e 3 meses para acessórios (já incluída a garantia legal). Inclui cabo USB. Recomenda-se uso de Nobreak Onda Senoidal (5 KVA, 220V) e instalação em circuito elétrico isolado e aterrado', 'MICROMED', 'C300', 'uploads/products/prod_697ba85eb0a8e.jpeg', 1, 49990.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(189, 254, 70, 'ANALISADOR DE SANGUE ', 'Leve, portátil e fácil de utilizar, o analisador de sangue i-STAT  opera com a tecnologia avançada dos cartuchos de teste i-STAT. Em conjunto, criam o i-STAT System (Sistema i-STAT)  uma plataforma de teste rápido \"point-of-care\" que oferece aos profissionais de cuidados de saúde informações de diagnóstico quando e onde são necessárias.', 'ABBOTT', 'I STAT ', 'uploads/products/prod_69b1b7b221047.jpeg', 1, 25000.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(190, 158, NULL, 'Sensor Sediline/ O3/ Lidico e placas de externo + parafusos ', 'Paciente: André Luís - Petrobras \nDr . Diogo Ferraz, enviado orçamento R$51.005,83.', 'Masimo / Externofix', '', 'https://frpe.app.br/crm/uploads/proposal_items/item_69776c8f2d7de.jpeg', 1, 0.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(191, 154, NULL, 'Monitorização ', 'Paciente: RN de Luiza Amélia Pereira \nDr. Diogo Feraz \nConvênio: Humanas\nCirurgia aconteceu no dia 31/01/26 às 08:00 .', 'Masimo', 'O3 Pediatrico/  Sensor Y R7 Pediatrico ', '', 1, 7462.02, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(192, 150, NULL, 'Monitorização ', 'Paciente: Maria Lúcia de Morais Alves ( Dr Hernani Gadelha- Ordem Judicial) , será no hospital do Coração. Aguardando liberação. Procedimento realizado e faturado ', 'Masimo', 'Sediline Adulto/ Lidico/ O3', '', 1, 0.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(193, 149, NULL, 'Monitorização ', 'Paciente Miguel Guedes Filho ( CAMED) aguardando a data da cirurgia R$3.894,45. Realizado procedimento e faturado semana passada.', 'Masimo', 'Sediline Adulto/ Lidico/O3', '', 1, 0.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(194, 148, NULL, 'Monitorização ', 'Paciente de Dr Hernani Gadelha. Paciente Izaias de Souza Revoredo convênio Unimed. Cirurgia programada para o dia 30/01/26 às 14:00 horas.procedimento realizado e faturado', 'Masimo', 'Sediline adulto/ Lidico/ O3', '', 1, 0.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(195, 255, NULL, 'Solicitado fechamento de externo por Dr . Diogo Ferraz ( Paciente Wellington- Convênio Humanas) aguardando solicitação de orçamento.', '', 'Externofix', 'Placas de fechamento ', '', 1, 0.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(196, 256, NULL, 'Solicitado uma HIPEC + Monitorização para um paciente de De.Elio Barreto ( Unimed) aguardando autorização, pois foi autorizado para outro fornecedor. Porem do Elio realizou a justificativa para o autorizarem o nosso material. Seguimos aguardando ', '', '', '', '', 1, 0.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(197, 257, NULL, 'Aguardando autorização de um paciente para Monitorização da Sulamérica de Dr. Hernani Gadelha ( pela Vital Care) se vai ser particular ou pelo plano', '', '', '', '', 1, 0.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(198, 258, NULL, 'Solicitado monitorização de uma paciente Unimed. Por Dr. Hernani Gadelha, aguardando autorização da Unimed ou se for será particular .', '', '', '', '', 1, 0.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(199, 261, NULL, 'Sensor Sedline Adulto', 'Sedline adulto', 'MASIMO', '', '', 25, 180.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL),
(200, 210, NULL, 'Ergoespirometria', '', 'Micromed', '', '', 1, 218500.00, 'VENDA', 'Unidade', NULL, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `organizacoes`
--

CREATE TABLE `organizacoes` (
  `id` int(11) NOT NULL,
  `nome_fantasia` varchar(255) NOT NULL,
  `razao_social` varchar(255) DEFAULT NULL,
  `cnpj` varchar(20) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `logradouro` varchar(255) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` varchar(2) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `organizacoes`
--

INSERT INTO `organizacoes` (`id`, `nome_fantasia`, `razao_social`, `cnpj`, `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `data_criacao`) VALUES
(9, 'FUNDACAO CHESF DE ASSISTENCIA E SEGURIDADE SOCIAL FACHESF', 'FUNDACAO CHESF DE ASSISTENCIA E SEGURIDADE SOCIAL FACHESF', '42.160.192/0001-43', '50070205', 'RUA DO PAISSANDU', '58', NULL, 'BOA VISTA', 'RECIFE', 'PE', '2025-10-28 00:31:08'),
(10, 'ISAC HOSPITAL DA CIDADE DE MACEIO - HC', 'INSTITUTO SAUDE E CIDADANIA - ISAC', '14.702.257/0032-04', '57052580', 'AVENIDA ARYOSVALDO PEREIRA CINTRA', '152', NULL, 'GRUTA DE LOURDES', 'MACEIO', 'AL', '2025-10-28 11:56:36'),
(11, 'BRAIN4CARE', 'BRAINCARE DESENVOLVIMENTO E INOVACAO TECNOLOGICA S.A.', '19.614.974/0001-93', '13562420', 'AVENIDA BRUNO RUGGIERO FILHO', '971', NULL, 'PARQUE SANTA FELICIA JARDIM', 'SAO CARLOS', 'SP', '2025-10-28 11:57:38'),
(12, 'HOSPITAL MEMORIAL STAR', 'HOSPITAL ESPERANCA SA', '02.284.062/0012-50', '50070205', 'RUA PAISSANDU', '300', NULL, 'BOA VISTA', 'RECIFE', 'PE', '2025-10-28 11:57:48'),
(13, 'MEMORIAL STAR', 'MEMORIAL STAR S/A', '34.956.807/0001-14', '51110000', 'AVENIDA ANTONIO DE GOES', '275', NULL, 'PINA', 'RECIFE', 'PE', '2025-10-28 11:57:59'),
(14, 'SAUDE RESIDENCIA', 'MUNIZ E MUNIZ SERVICOS HOSPITALARES LTDA', '07.880.207/0001-47', '51110-140', 'Rua Santos Leite', '727', NULL, 'Pina', 'Recife', 'PE', '2025-10-28 11:59:17'),
(15, 'SEQUIPE', 'SEQUIPE - SERVICO DE QUIMIOTERAPIA DE PERNAMBUCO LTDA', '12.588.547/0001-39', '52050310', 'RUA DR GERALDO DE ANDRADE', '139', NULL, 'ESPINHEIRO', 'RECIFE', 'PE', '2025-10-28 11:59:47'),
(16, 'UNINEFRON UNIDADE NEFROLOGICA LTDA.', 'UNINEFRON UNIDADE NEFROLOGICA LTDA.', '01.591.093/0001-39', '52010065', 'RUA VISCONDESSA DO LIVRAMENTO', '246', NULL, 'DERBY', 'RECIFE', 'PE', '2025-10-28 12:00:06'),
(17, 'NEOCARDIO', 'NEOCARDIO - CIRURGIA CARDIOVASCULAR PEDIATRICA E ADULTO LTDA', '23.373.498/0001-33', '40110100', 'AVENIDA REITOR MIGUEL CALMON', '1210', NULL, 'CANELA', 'SALVADOR', 'BA', '2025-10-28 12:00:18'),
(18, 'HOSPITAL EDUARDO CAMPOS', 'HOSPITAL TRICENTENARIO', '10.583.920/0011-05', '56906-000', 'Avenida Vicente Inácio de Oliveira', '00', NULL, 'Bom Jesus', 'Serra Talhada', 'PE', '2025-10-28 12:02:02'),
(19, 'HOSPITAL JESUS PEQUENINO', 'INSTITUTO ALCIDES D\' ANDRADE LIMA', '10.072.296/0005-33', '55660000', 'AVENIDA MAJOR APRIGIO DA FONSECA', 'SN', NULL, 'BR.232, KM.103', 'BEZERROS', 'PE', '2025-10-28 12:02:18'),
(20, 'PREFEITURA DE BELO JARDIM', 'MUNICIPIO DE BELO JARDIM', '10.260.222/0001-05', '55150001', 'RUA SIQUEIRA CAMPOS', '108', NULL, 'CENTRO', 'BELO JARDIM', 'PE', '2025-10-28 12:02:27'),
(21, 'HOSPITAL DE BOA VIAGEM', 'CEMUB CENTRO MEDICO DE URGENCIA DE BOA VIAGEM LTDA', '11.120.797/0001-87', '51111040', 'RUA ANA CAMELO DA SILVA', '315', NULL, 'BOA VIAGEM', 'RECIFE', 'PE', '2025-10-28 12:02:34'),
(22, 'HOSPITAL EVANGELICO', 'ASSOCIACAO EVANGELICA BENEFICENTE DE PERNAMBUCO', '10.859.817/0001-73', '51111-040', 'Rua Ana Camelo da Silva', '315', NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:03:32'),
(26, 'HOSPITAL EVANGELICO', 'ASSOCIACAO EVANGELICA BENEFICENTE DE PERNAMBUCO', '10859817000173', '50710030', 'RUA FREI JABOATAO', '301', NULL, 'TORRE', 'RECIFE', 'PE', '2025-10-28 12:04:55'),
(27, 'HOSPITAL JORGE DE MEDEIROS LTDA', 'HOSPITAL JORGE DE MEDEIROS LTDA', '10.781.490/0001-64', '52041080', 'AVENIDA NORTE', '2829', NULL, 'ROSARINHO', 'RECIFE', 'PE', '2025-10-28 12:05:57'),
(28, 'SANTA CASA DE MISERICORDIA DO RECIFE', 'IRMANDADE DA SANTA CASA DE MISERICORDIA DO RECIFE', '10.869.782/0001-53', '50040000', 'AVENIDA CRUZ CABUGA', '1563', NULL, 'SANTO AMARO', 'RECIFE', 'PE', '2025-10-28 12:06:12'),
(29, 'CARDIOMAIS PB', 'CARDIOMAIS PB CLINICA DE CARDIOLOGIA E EXAMES COMPLEMENTARES LTDA', '37.195.723/0001-01', '58400506', 'RUA DUQUE DE CAXIAS', '630', NULL, 'PRATA', 'CAMPINA GRANDE', 'PB', '2025-10-28 12:06:30'),
(30, 'MEDEFE PRODUTOS MEDICO- HOSPITALARES LTDA', 'MEDEFE PRODUTOS MEDICO- HOSPITALARES LTDA', '25.463.374/0001-74', '81460140', 'R GOUBER PINTO DIONISIO', '55', NULL, 'CIDADE INDUSTRIAL', 'CURITIBA', 'PR', '2025-10-28 12:06:51'),
(31, 'NORDESTE MEDICAL, REPRESENTACAO, IMPORTACAO E EXPORTACAO DE ', 'NORDESTE MEDICAL, REPRESENTACAO, IMPORTACAO E EXPORTACAO DE ', '20.782.880/0002-93', '62880-420', 'Rua Otacílio Viana de Lima', '50', NULL, 'Centro', 'Horizonte', 'CE', '2025-10-28 12:07:32'),
(32, 'WENDYMED COMERCIO DE PRODUTOS HOSPITALARES LTDA.', 'WENDYMED COMERCIO DE PRODUTOS HOSPITALARES LTDA.', '07.371.103/0001-07', '01323000', 'RUA MAESTRO CARDIM', '354', NULL, 'LIBERDADE', 'SAO PAULO', 'SP', '2025-10-28 12:07:49'),
(33, 'BRAENGEL HOSPITALAR', 'S. S. COMERCIAL LTDA', '03.220.439/0001-18', '52090260', 'AVENIDA NORTE MIGUEL ARRAES DE ALENCAR', '7498', NULL, 'MACAXEIRA', 'RECIFE', 'PE', '2025-10-28 12:08:00'),
(34, 'LEAL CARDIO', 'LEALCARDIO SERVICOS MEDICOS LTDA', '07.527.026/0001-31', '56509808', 'RUA DR CARLOS RIOS', '50', NULL, 'SUCUPIRA', 'ARCOVERDE', 'PE', '2025-10-28 12:08:12'),
(35, 'SUBCONDOMINIO CAMARA SHOPPING CENTER', 'SUBCONDOMINIO CAMARA SHOPPING CENTER', '32.899.175/0001-79', '54759-475', 'Rua Manoel Honorato da Costa', '555', NULL, 'Vila da Fábrica', 'Camaragibe', 'PE', '2025-10-28 12:09:02'),
(36, 'LINHA MEDICA', 'LINHA MEDICA PRODUTOS MEDICO HOSPITALARES LTDA', '63.240.477/0001-64', '41825906', 'AVENIDA ANTONIO CARLOS MAGALHAES', '001034', NULL, 'ITAIGARA', 'SALVADOR', 'BA', '2025-10-28 12:09:15'),
(37, 'MEDVIDA', 'AGUIAR BITTENCOURT LTDA', '45.785.161/0001-76', '55012630', 'RUA PADRE ANTONIO TOMAZ', '211', NULL, 'MAURICIO DE NASSAU', 'CARUARU', 'PE', '2025-10-28 12:09:40'),
(38, 'GRUPAMENTO DE APOIO DO RECIFE', 'COMANDO DA AERONAUTICA', '00394429019391', '51130180', 'AV Armindo Moura, 500', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:32:11'),
(39, 'MD CARDIO', 'MDA DE MACEDO CARDIO', '50921171000121', '56304190', 'AV Presidente Tancredo Neves, 1019', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:11'),
(40, 'PREVENCOR', 'CENTRO CARDIOLOGICO DE OLINDA LTDA', '05002083000171', '52010030', 'R Pacífico dos Santos, 71', NULL, NULL, 'Paissandu', 'Recife', 'PE', '2025-10-28 12:32:11'),
(41, 'HUB HEALTH DIAGNOSTICOS', 'HUB HEALTH SERVICOS MEDICOS LTDA', '48685748000100', '50610160', 'R Hermógenes de Morais, 317', NULL, NULL, 'Madalena', 'Recife', 'PE', '2025-10-28 12:32:11'),
(42, 'DR. HEYDER ESTEVAO', 'ESTEVAO & MAGALHAES LTDA', '24034238000104', '59300000', 'R JOAQUIM GREGORIO, 130', NULL, NULL, 'PENEDO', 'Caicó', 'RN', '2025-10-28 12:32:11'),
(43, 'INSTITUTO MEDIC', 'INSTITUTO MEDIC LTDA', '51586760000163', '56302170', 'R Manoel Clementino, 1038', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:11'),
(44, 'CLINICA CLINFORT', 'CLINFORT CLINICA MEDICA LTDA', '43305238000138', '58840000', 'R LEANDRO GOMES DE BARROS, 56', NULL, NULL, 'CENTRO', 'Pombal', 'PB', '2025-10-28 12:32:11'),
(45, 'OFTALMO CENTRO DE OFTALMOLOGISTAS ASSOCIADOS DE PE LTDA', 'OFTALMO CENTRO DE OFTALMOLOGISTAS ASSOCIADOS DE PE LTDA', '10896785000186', '50070490', 'RUA RUA FRANCISCO ALVES, 103', NULL, NULL, 'ILHA DO LEITE', 'Recife', 'PE', '2025-10-28 12:32:11'),
(46, 'PROVIDENCIA', 'HOSPITAL DA PROVIDENCIA LIMITADA', '08123408000162', '55297040', 'PCA Tavares Correia, 70', NULL, NULL, 'Heliópolis', 'Garanhuns', 'PE', '2025-10-28 12:32:11'),
(47, 'CEOC - CENTRO DE ONCOLOGIA DE CARUARU LTDA', 'CEOC - CENTRO DE ONCOLOGIA DE CARUARU LTDA', '35668094000237', '55016900', 'AV Portugal, 1357', NULL, NULL, 'Universitário', 'Caruaru', 'PE', '2025-10-28 12:32:11'),
(48, 'HOSPITAL SANTA TERESINHA LTDA', 'HOSPITAL SANTA TERESINHA LTDA', '04938437000121', '66040170', 'AVE AVENIDA GOVERNADOR MAGALHAES BARATA, 277', NULL, NULL, 'NAZARE', 'Belém', 'PA', '2025-10-28 12:32:11'),
(49, 'SAO LUIZ - UNIDADE ITAIM', 'REDE D\'OR SAO LUIZ S.A', '06047087000210', '04544000', 'R Doutor Alceu de Campos Rodrigues, 95', NULL, NULL, 'Vila Nova Conceição', 'São Paulo', 'SP', '2025-10-28 12:32:11'),
(50, 'HOSPITAL DIA DR MOURA', 'HOSPITAL MOURA LTDA', '80618226000190', '84261350', 'AV Chanceler Horácio Laffer, 116', NULL, NULL, 'Centro', 'Telêmaco Borba', 'PR', '2025-10-28 12:32:11'),
(51, 'HOSPITAL ESPECIAL DOMICILIAR', 'HOSPITAL DE ASSISTENCIA DOMICILIAR LTDA', '03595778000189', '52031040', 'R Gonçalves Dias, 131', NULL, NULL, 'Campo Grande', 'Recife', 'PE', '2025-10-28 12:32:11'),
(52, 'ENGEBIO NORDESTE', 'ENGEBIO SERVICOS TECNICOS DE ENGENHARIA LTDA', '06555589000170', '54800000', 'LOC AV DANTAS BARRETO, 2291', NULL, NULL, 'CENTRO', 'Moreno', 'PE', '2025-10-28 12:32:11'),
(53, 'AMOR SAUDE', 'CLINICAS MEDICAS E ODONTOLOGICA NORDESTE LTDA', '32440913000115', '50750360', 'EST dos Remédios, 800', NULL, NULL, 'Afogados', 'Recife', 'PE', '2025-10-28 12:32:11'),
(54, 'CLINICA SANTA TEREZINHA POMBAL LTDA', 'CLINICA SANTA TEREZINHA POMBAL LTDA', '47889763000107', '58840000', 'R BACHAREL FRANCISCO DA SILVA ALMEIDA, 217', NULL, NULL, 'CENTRO', 'Pombal', 'PB', '2025-10-28 12:32:11'),
(55, 'FUNDO MUNICIPAL DE SAUDE SERRA TALHADA PE', 'FUNDO MUNICIPAL DE SAUDE DE SERRA TALHADA', '10685971000176', '56903450', 'R Irnério Inácio de Oliveira, 132', NULL, NULL, 'Nossa Senhora da Penha', 'Serra Talhada', 'PE', '2025-10-28 12:32:11'),
(56, 'CLINICA DE ULTRASSOM', 'CLINICA DE ULTRASSOM LTDA', '51727913000145', '58400056', 'R Índios Cariris, 287', NULL, NULL, 'Centro', 'Campina Grande', 'PB', '2025-10-28 12:32:11'),
(57, '3R POTIGUAR S.A.', '3R POTIGUAR S.A.', '44186763000225', '59598000', 'ROD ROD ROD RN 221 KM 25, S/N', NULL, NULL, 'GUAMRE', 'Guamaré', 'RN', '2025-10-28 12:32:11'),
(58, 'BRASIL MEDICA', 'BRASIL MEDICA TECHNOLOGIES COMERCIO E IMPORTACAO LTDA', '15711101000148', '88306773', 'AV Osvaldo Reis, 3281', NULL, NULL, 'Praia Brava de Itajaí', 'Itajaí', 'SC', '2025-10-28 12:32:11'),
(59, 'SUBCONDOMINIO DO COMPLEXO EMPRESARIAL RM TRADE CENTER', 'SUBCONDOMINIO DO COMPLEXO EMPRESARIAL RM TRADE CENTER', '20755190000164', '51110160', 'AV República do Líbano, 251', NULL, NULL, 'Pina', 'Recife', 'PE', '2025-10-28 12:32:11'),
(60, 'PROCARDIO', 'PROCARDIO - CLINICA MEDICA CARDIOLOGICA LTDA', '08948054000195', '58900000', 'R RUA FRANCISCO DERCIO SARAIVA, 405', NULL, NULL, 'CENTRO', 'Cajazeiras', 'PB', '2025-10-28 12:32:11'),
(61, 'CESED', 'CESED - CENTRO DE ENSINO SUPERIOR E DESENVOLVIMENTO LTDA', '02108023000140', '58411020', 'AV Senador Argemiro de Figueiredo, 1901', NULL, NULL, 'Itararé', 'Campina Grande', 'PB', '2025-10-28 12:32:11'),
(62, 'PLENA CORPORATIVO', 'PLENA SERVICOS CORPORATIVOS LTDA', '11313663000182', '59600165', 'R Melo Franco, 09', NULL, NULL, 'Centro', 'Mossoró', 'RN', '2025-10-28 12:32:11'),
(63, 'IMAGEM DIAGNOSTICOS', 'IMAGEM CENTRO DE DIAGNOSTICO LTDA', '63112361000140', '44900000', 'AVE AVENIDA CARAIBAS, 287', NULL, NULL, 'CENTRO', 'Irecê', 'BA', '2025-10-28 12:32:11'),
(64, 'UMEC UNIDADE DE SERVICOS MEDICOS LTDA', 'UMEC UNIDADE DE SERVICOS MEDICOS LTDA', '08225220000125', '50070540', 'R Capitão José da Luz, 115', NULL, NULL, 'Coelhos', 'Recife', 'PE', '2025-10-28 12:32:11'),
(65, 'UNICLINICAS CAMPINA GRANDE', 'UNICLINICAS SERVICOS MEDICOS LTDA', '29959515000103', '58400550', 'R Rodrigues Alves, 708', NULL, NULL, 'Prata', 'Campina Grande', 'PB', '2025-10-28 12:32:11'),
(66, 'ENDOCARDIO', 'CLEOBENYSSON CRUZ LIMA', '19939845000175', '56460000', 'LOC AV DEP. MILVERNES CRUZ LIMA, 292', NULL, NULL, 'QUADRA 02', 'Petrolândia', 'PE', '2025-10-28 12:32:11'),
(67, 'CENTERPREV', 'CENTERPREV-CENTRODE PREVENCAO E CHECKUP S/C LTDA', '03317271000163', '59020300', 'AV Campos Sales, 782', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:32:11'),
(68, 'CARDIOKID', 'CARDIOKID- SERVICOS MEDICOS LTDA', '10657726000155', '59300000', 'R AUGUSTO MONTEIRO, 1248', NULL, NULL, 'CENTRO', 'Caicó', 'RN', '2025-10-28 12:32:11'),
(69, 'PRONTO CLIN', 'LEONARDO P DOS SANTOS', '28067302000104', '56870000', 'R APRIGIO ASSUNCAO, 331', NULL, NULL, 'ROSARIO', 'Triunfo', 'PE', '2025-10-28 12:32:11'),
(70, 'ICNPB - INSTITUTO DE CARDIOLOGIA E NUTRICAO DA PARAIBA', 'ICNPB - INSTITUTO DE CARDIOLOGIA E NUTRICAO DA PARAIBA', '33577399000127', '58400506', 'R Duque de Caxias, 523', NULL, NULL, 'Prata', 'Campina Grande', 'PB', '2025-10-28 12:32:11'),
(71, 'CENTRO MEDICO DR MANOEL VALDEMAR', 'CLINICA DR MANOEL VALDEMAR LTDA - ME', '18097011000105', '55602020', 'RUA RUA MELO VERCOSA, 544', NULL, NULL, 'MATRIZ', 'Vitória de Santo Antão', 'PE', '2025-10-28 12:32:11'),
(72, 'HOSPITAL SAO FRANCISCO DE ASSIS LTDA', 'HOSPITAL SAO FRANCISCO DE ASSIS LTDA', '01625151000106', '74075250', 'R 9 A, 110', NULL, NULL, 'Setor Aeroporto', 'Goiânia', 'GO', '2025-10-28 12:32:11'),
(73, 'SOS-MAO RECIFE LTDA', 'SOS-MAO RECIFE LTDA', '01291959000196', '50070400', 'R Minas Gerais, 147', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:32:11'),
(74, 'INSTITUTO DOM HELDER CAMARA', 'INSTITUTO DOM HELDER CAMARA', '08799272000105', '50070140', 'R Henrique Dias, 278', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:11'),
(75, 'MENDO SAMPAIO S/A E RECUPERACAO JUDICIAL', 'MENDO SAMPAIO S/A E RECUPERACAO JUDICIAL', '10776540000115', '57030107', 'AV Engenheiro Roberto Duarte Santana, 25', NULL, NULL, 'Pajuçara', 'Maceió', 'AL', '2025-10-28 12:32:11'),
(76, 'UNIDADE DE INVESTIGACAO CARDIOLOGICA S/C LTDA', 'UNIDADE DE INVESTIGACAO CARDIOLOGICA S/C LTDA', '86889623000182', '60150150', 'R Desembargador Leite Albuquerque, 5633', NULL, NULL, 'Aldeota', 'Fortaleza', 'CE', '2025-10-28 12:32:11'),
(77, 'HOSPITAL SAO MARCOS', 'CENTRO HOSPITALAR SAO MARCOS S/A', '00736838000148', '52010010', 'AV Portugal, 52', NULL, NULL, 'Paissandu', 'Recife', 'PE', '2025-10-28 12:32:11'),
(78, 'FUNDACAO ALTINO VENTURA', 'FUNDACAO ALTINO VENTURA', '10667814000138', '50731490', 'AV Maurício de Nassau, 2075', NULL, NULL, 'Iputinga', 'Recife', 'PE', '2025-10-28 12:32:11'),
(79, 'HOSPITAL MILITAR DE AREA DE RECIFE', 'HOSPITAL MILITAR DE AREA DE RECIFE', '09577422000280', '50050050', 'R do Hospício, 563', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:11'),
(80, 'U.T.C', 'U.T.C - UNIDADE DE TRATAMENTO CARDIOLOGICO LTDA', '03932997000106', '50070525', 'PCA Miguel de Cervantes, 60', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:32:11'),
(81, 'HOSPITAL NOSSA SENHORA DE LOURDES', 'FUNDACAO HOSPITALAR NOSSA SENHORA DE LOURDES', '20218442000116', '34000318', 'R Madre Tereza, 20', NULL, NULL, 'Centro', 'Nova Lima', 'MG', '2025-10-28 12:32:11'),
(82, 'HOSPITAL PERPETUO SOCORRO', 'CASA DE SAUDE E MATERNIDADE N S PERPETUO SOCORRO LTDA', '14606321000149', '45200286', 'R Nestor Ribeiro, 343', NULL, NULL, 'Centro', 'Jequié', 'BA', '2025-10-28 12:32:11'),
(83, 'CLINICA FACIL LTDA', 'CLINICA FACIL LTDA', '29405072000109', '59300000', 'R C R CORONEL MANOEL FELIPE, 231', NULL, NULL, 'ACAMPAMENTO', 'Caicó', 'RN', '2025-10-28 12:32:11'),
(84, 'S D DE A FERREIRA &amp  CIA LTDA', 'S D DE A FERREIRA &amp  CIA LTDA', '26889181000142', '55294803', 'R Ivan de Oliveira Gomes Lot André Luiz, S/N', NULL, NULL, 'Dom Hélder Câmara', 'Garanhuns', 'PE', '2025-10-28 12:32:11'),
(85, 'CENTRO DE DIAGNOSTICO MEMORIAL MARIE CURIE', 'CENTRO DE DIAGNOSTICO MEMORIAL MARIE CURIE LTDA', '08360618000174', '58040490', 'AV Rui Barbosa, 202', NULL, NULL, 'Torre', 'João Pessoa', 'PB', '2025-10-28 12:32:11'),
(86, 'CARDIO SERVICE', 'CARDIO SERVICE - SERVICOS MEDICOS LTDA', '24774289000164', '59015120', 'R General Oliveira Galvão, 1059', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:32:11'),
(87, 'IMAGO DIAGNOSTICO POR IMAGEM AVANCADO', 'IMAGO DIAGNOSTICO POR IMAGEM AVANCADO LTDA', '15144201000130', '58400565', 'R Dom Pedro II, 382', NULL, NULL, 'Prata', 'Campina Grande', 'PB', '2025-10-28 12:32:11'),
(88, 'ATLETICOR MEDICINA DO EXERCICIO - DERMACORDIS', 'ATLETICOR MEDICINA E SAUDE LTDA', '12044393000114', '50070525', 'PCA Miguel de Cervantes, 60', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:32:11'),
(89, 'FUSAM UNIDADE MISTA DE CUNARU SABTA TEREZINHA', 'FUNDACAO DE SAUDE AMAURY DE MEDEIROS', '09794975007469', '55655000', 'R SIT CUMARU, 00', NULL, NULL, 'CUMARU', 'Cumaru', 'PE', '2025-10-28 12:32:11'),
(90, 'SOCIEDADE DE RADIOLOGIA E DIAGNOSTICO POR IMAGEM DE PE', 'SOCIEDADE DE RADIOLOGIA E DIAGNOSTICO POR IMAGEM DE PE', '00638240000116', '51110160', 'AV República do Líbano, 251', NULL, NULL, 'Pina', 'Recife', 'PE', '2025-10-28 12:32:11'),
(91, 'PREVENCOR CENTRO DE CARDIOLOGIA DIAGNOSTICA LTDA', 'PREVENCOR CENTRO DE CARDIOLOGIA DIAGNOSTICA LTDA', '35715085000179', '53130410', 'AV Doutor José Augusto Moreira, 647', NULL, NULL, 'Casa Caiada', 'Olinda', 'PE', '2025-10-28 12:32:11'),
(92, 'ESPACO RIZOMA, SAUDE, ARTE E PESQUISA', 'CENTRO DE ATENCAO PSICOSOCIAL CASA FORTE S/S LTDA', '04969246000127', '52061055', 'R Marechal Rondon, 256', NULL, NULL, 'Casa Forte', 'Recife', 'PE', '2025-10-28 12:32:11'),
(93, 'HSOPITAL MEMORIAL CARUARU', 'HOSPITAL DE OLHOS DE CARUARU LTDA', '00972860000197', '55010320', 'R Adelino Fontoura, 734', NULL, NULL, 'Divinópolis', 'Caruaru', 'PE', '2025-10-28 12:32:11'),
(94, 'HGU SAUDE', 'SAO FRANCISCO ASSISTENCIA MEDICA LTDA', '03098226000165', '56304020', 'AV Fernando Menezes de Góes, 1076', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:11'),
(95, 'HOSPITAL E MATERNIDADE SAO SEBASTIAO LTDA', 'HOSPITAL E MATERNIDADE SAO SEBASTIAO LTDA', '76195452000138', '85530000', 'R SAO SEBASTIAO , 483', NULL, NULL, 'SAO SEBASTIAO', 'Clevelândia', 'PR', '2025-10-28 12:32:11'),
(96, 'AMANDA VALERIO GALINDO', 'AMANDA VALERIO GALINDO', '36210043000149', '55270000', 'R MANOEL JOAQUIM DA SILVA, 55', NULL, NULL, 'RIOS DOS BOIS', 'Venturosa', 'PE', '2025-10-28 12:32:11'),
(97, 'CLINICA MEDNOBRE', 'CLINICA MEDNOBRE LTDA', '33145091000102', '55750000', 'R INACIO FERREIRA CABRAL, 42', NULL, NULL, 'TERREO', 'Surubim', 'PE', '2025-10-28 12:32:11'),
(98, 'MARILIA MARTINS DA COSTA', 'CLINICA CUIDAR SAUDE', '36090438000155', '58040240', 'AV Carneiro da Cunha, 97', NULL, NULL, 'Torre', 'João Pessoa', 'PB', '2025-10-28 12:32:11'),
(99, 'SAUDE DE TODOS', 'BEMCUIDAR ESPECIALIDADES LTDA', '47959702000160', '58200000', 'R MANUEL FERREIRA DE BARROS, 294', NULL, NULL, 'NOVO', 'Guarabira', 'PB', '2025-10-28 12:32:11'),
(100, 'FUNDO MUNICIPAL DE SAUDE DE AGRESTINA', 'AGRESTINA FUNDO MUNICIPAL DE SAUDE', '10225695000163', '55495000', 'R SEBASTIÃO FRANCISCO TAVARES, 120', NULL, NULL, 'CENTRO', 'Agrestina', 'PE', '2025-10-28 12:32:11'),
(101, 'INSTITUTO DE SAUDE ALMEIDA', 'ALEKSANDRA ALMEIDA DE OLIVEIRA', '33536267000157', '56304060', 'R Valério Pereira, 72', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:11'),
(102, 'ALERGO IMUNO', 'ALERGOIMUNO W. ANTUNES LTDA', '05283620000107', '50070535', 'R José de Alencar, 725', NULL, NULL, 'Coelhos', 'Recife', 'PE', '2025-10-28 12:32:11'),
(103, 'HOSPITAL JOSE MONTEIRO', 'HOSPITAL JOSE MONTEIRO', '27130145000163', '29450000', 'R JERONIMO MONTEIRO, 49', NULL, NULL, 'CENTRO', 'Apiacá', 'ES', '2025-10-28 12:32:11'),
(104, 'COMSEDER COOPERATIVA DE ASSISTENCIA MEDICA DOS SERVIDORES DA', 'COMSEDER COOPERATIVA DE ASSISTENCIA MEDICA DOS SERVIDORES DA', '70094578000130', '58013470', 'AV Maximiano Figueiredo, 311', NULL, NULL, 'Centro', 'João Pessoa', 'PB', '2025-10-28 12:32:11'),
(105, 'UPA PAULISTA GERALDO PINHO ALVES', 'FUNDACAO MANOEL DA SILVA ALMEIDA', '09767633001095', '53407265', 'AV Prefeito Severino Cunha Primo, 1523', NULL, NULL, 'Jardim Paulista', 'Paulista', 'PE', '2025-10-28 12:32:11'),
(106, 'RECIFE GABINETE DO PREFEITO- SAMU', 'MUNICIPIO DO RECIFE- SAMU', '10565000000192', '50030230', 'R do Apolo, 925', NULL, NULL, 'Recife', 'Recife', 'PE', '2025-10-28 12:32:11'),
(107, 'SEU DOTO', 'SEU DOTO CLINICA MEDICA LTDA', '29391658000153', '58280000', 'R MARQUES HEVAL, 230', NULL, NULL, 'CENTRO', 'Mamanguape', 'PB', '2025-10-28 12:32:11'),
(108, 'SERTAO SAUDE', 'SERTAO SAUDE CENTRO MEDICO INTEGRADO LTDA', '50967309000123', '56304210', 'R Tobias Barreto, 212', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:11'),
(109, 'LP SAUDE CARPINA', 'RACE SERVICOS DE SAUDE LTDA', '48014568000198', '55815000', 'AV Estácio Coimbra, 276', NULL, NULL, 'São José', 'Carpina', 'PE', '2025-10-28 12:32:11'),
(110, 'CLINICA DRA MICHELLY LINS', 'ROGERIO SANDRO MICHELLY LINS', '50625743000125', '55370000', 'R PC JURANDIR MOTA VALENCA, 688', NULL, NULL, 'CENTRO', 'São Bento do Una', 'PE', '2025-10-28 12:32:11'),
(111, 'INSTITUTO DO CORACAO DE PERNAMBUCO', 'INSTITUTO DO CORACAO DE PERNAMBUCO', '12587002000108', '52010040', 'AV Governador Agamenon Magalhães, 4760', NULL, NULL, 'Derby', 'Recife', 'PE', '2025-10-28 12:32:11'),
(112, 'RC DIAGNOSTICOS', 'CLINICA ORTOPEDICA DE LIMOEIRO LTDA', '12230762000163', '55700000', 'R ANTONIO FERNANDES SALSA, 314', NULL, NULL, 'CENTRO', 'Limoeiro', 'PE', '2025-10-28 12:32:11'),
(113, 'PRO CARDIO MACAU', 'CLINICA CARDIOLOGICA DE MACAU LTDA', '08096335000167', '59507000', 'AV ANGELO VARELA, 398', NULL, NULL, 'CENTRO', 'Alto do Rodrigues', 'RN', '2025-10-28 12:32:11'),
(114, 'ESCOLA DE ENFERMAGEM NOVA ESPERANCA', 'ESCOLA DE ENFERMAGEM NOVA ESPERANCA LTDA', '02949141000180', '58013270', 'AV Tabajaras, 761', NULL, NULL, 'Centro', 'João Pessoa', 'PB', '2025-10-28 12:32:11'),
(115, 'CLIN', 'CLIN - CLINICA INTEGRADA LTDA', '49834246000158', '58200000', 'LOC PC MONSENHOR WALDREDO LEAL, 71', NULL, NULL, 'CENTRO', 'Guarabira', 'PB', '2025-10-28 12:32:11'),
(116, 'CLINICA SANTA EDWIRGES', 'CLINICA SANTA EDWIRGES LTDA', '32219907000132', '59700000', 'R RUA BORROMEU DE BRITO GUERRA, 76', NULL, NULL, 'CENTRO', 'Apodi', 'RN', '2025-10-28 12:32:11'),
(117, 'RANNIERI ROCHA E EQUIPE', 'CLINICA MEDICA DE IMAGEM DE PATOS RR LTDA', '36581845000165', '58700085', 'R Bossuet Wanderley, 283', NULL, NULL, 'Centro', 'Patos', 'PB', '2025-10-28 12:32:11'),
(118, 'GAMA IMAGEM', 'GAMA SERVICOS DE DIAGNOSTICOS POR IMAGENS LTDA', '23871427000160', '58401282', 'R João da Silva Pimentel, 391', NULL, NULL, 'Conceição', 'Campina Grande', 'PB', '2025-10-28 12:32:11'),
(119, 'POLISAUDE', 'POLISAUDE SERVIÇOS MEDICOS LTDA', '22445003000171', '58900000', 'AV COMANDANTE VITAL ROLIM, 1425', NULL, NULL, 'SANTA CECILIA', 'Cajazeiras', 'PB', '2025-10-28 12:32:11'),
(120, 'CLINICA DIAGNOSTICOS EXAMES', 'CLINICA DIAGNOSTICOS EXAMES LTDA', '05610235000119', '59259000', 'R SENADOR DINARTE MARIZ, 186', NULL, NULL, 'CENTRO', 'Passagem', 'RN', '2025-10-28 12:32:11'),
(121, 'POLICIA MILITAR DO ESTADO DO RIO GRANDE DO NORTE', 'POLICIA MILITAR DO ESTADO DO RIO GRANDE DO NORTE', '04058766000188', '59020200', 'AV Rodrigues Alves, S/N', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:32:11'),
(122, 'BERNARDES E LISBOA', 'BERNARDES E LISBOA LTDA', '27359607000119', '59148902', 'R Rio Xingu, S/N', NULL, NULL, 'Emaús', 'Parnamirim', 'RN', '2025-10-28 12:32:11'),
(123, 'IKTM VASCONCELOS', 'IKTM VASCONCELOS CARGIOLOGIA E SERVICOS MEDICOS LTDA', '39817997000102', '56302320', 'R CORONEL AMORIM, 217', NULL, NULL, 'CENTRO', 'Petrolina', 'PE', '2025-10-28 12:32:11'),
(124, 'SMART MAIS SAUDE', 'CENTRO EMPRESARIAL FIDELIZE LTDA', '33094666000105', '56304010', 'R Pacífico da Luz, 819', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:11'),
(125, 'CEMEFA CENTRO MEDICO DE ARCOVERDE', 'CEMEFA CENTRO MEDICO DE ARCOVERDE LTDA', '00128932000114', '56510090', 'R Leonardo Pacheco Duque, 137', NULL, NULL, 'São Miguel', 'Arcoverde', 'PE', '2025-10-28 12:32:11'),
(126, 'HOSPITAL MEMORIAL PETROLINA LTDA', 'HOSPITAL MEMORIAL PETROLINA LTDA', '00523053000197', '56304210', 'R Tobias Barreto, 02', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:11'),
(127, 'IRMANDADE DA SANTA CASA DE MISERICORDIAL DO RECIFE', 'IRMANDADE DA SANTA CASA DE MISERICORDIAL DO RECIFE', '10869782000404', '50040000', 'AV Cruz Cabugá, 1563', NULL, NULL, 'Santo Amaro', 'Recife', 'PE', '2025-10-28 12:32:11'),
(128, 'NATIVE - CLINICA MEDICA INTEGRADA', 'NATIVE CLINICA MEDICA INTEGRADA LTDA', '34654605000118', '55270000', 'R JOSE LOPES DE OLIVEIRA, 3', NULL, NULL, 'CAMPO GRANDE', 'Venturosa', 'PE', '2025-10-28 12:32:11'),
(129, 'NEVES DIAGNOSTICA', 'NEVES MEDICINA DIAGNOSTICA LTDA', '40857023000131', '58037070', 'R Professora Severina de Sousa Souto, 207', NULL, NULL, 'Jardim Oceania', 'João Pessoa', 'PB', '2025-10-28 12:32:11'),
(130, 'UNIMED CARUARU', 'UNIMED CARUARU COOPERATIVA DE TRABALHO MEDICO', '24449225000198', '55024740', 'AV Adjar da Silva Casé, 800', NULL, NULL, 'Indianópolis', 'Caruaru', 'PE', '2025-10-28 12:32:11'),
(131, 'CLINICA DO CORACAO DR SALISMAR', 'F S LOPES CORREIA LTDA', '05696531000184', '59900000', 'LOC R PEDRO VELHO, 1146', NULL, NULL, 'CENTRO', 'Pau dos Ferros', 'RN', '2025-10-28 12:32:11'),
(132, 'CENTRO CARDIOLOGICO DE MOSSORO', 'CENTRO CARDIOLOGICO DE MOSSORO LTDA', '09685247000163', '59611010', 'R Pedro Velho, 363', NULL, NULL, 'Santo Antônio', 'Mossoró', 'RN', '2025-10-28 12:32:11'),
(133, 'SCI FIT PERSONAL', 'SCI FIT PERSONAL TRAINER LTDA', '27560883000140', '58030020', 'AV Rio Grande do Sul, 1345', NULL, NULL, 'Estados', 'João Pessoa', 'PB', '2025-10-28 12:32:11'),
(134, 'ANGIO SERVICO DE ANGIOLOGIA E CIRURGIA VASCULAR', 'ANGIO SERVICO DE ANGIOLOGIA E CIRURGIA VASCULAR DO RECIFE LT', '11254026000182', '50070425', 'AV Governador Agamenon Magalhães, 4779', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:32:11'),
(135, 'VITALECER CLINICA', 'ALMEIDA & RODRIGUES SERVICOS DE SAUDE LTDA', '24973173000154', '55296390', 'AV Frei Caneca, 219', NULL, NULL, 'Heliópolis', 'Garanhuns', 'PE', '2025-10-28 12:32:11'),
(136, 'SERVMED', 'JOSE CARLOS AFONSO MARINHO JUNIOR LTDA', '27319088000165', '58340000', 'R PADRE ZEFERINO MARIA, 18', NULL, NULL, 'CENTRO', 'Sapé', 'PB', '2025-10-28 12:32:11'),
(137, 'LP SAUDE CLINICA POPULAR', 'FRANQUEADORA LP SAUDE CLINICA POPULAR LTDA', '45187370000118', '54310310', 'AV Barreto de Menezes, 669A', NULL, NULL, 'Prazeres', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:11'),
(138, 'CL SERVICOS MEDICOS', 'CL SAUDE E SERVICOS LTDA', '29938306000175', '59012320', 'R Manoel Machado, 366', NULL, NULL, 'Petrópolis', 'Natal', 'RN', '2025-10-28 12:32:11'),
(139, 'POLICLINICA VIVA', 'POLICLINICA VIVA DIAGNOSTICOS E SERVICOS MEDICOS LTDA', '32726196000192', '58110020', 'R Engenheiro de Carvalho, 213', NULL, NULL, 'Centro', 'Bayeux', 'PB', '2025-10-28 12:32:11'),
(140, 'PADRAOSEGURANCA', 'PADRAO SEGURANCA E MEDICINA DO TRABALHO LTDA', '27872939000100', '59075818', 'AV AMINTAS BARROS, 3486', NULL, NULL, 'LAGOA NOVA', 'Natal', 'RN', '2025-10-28 12:32:11'),
(141, 'CENTRO DE DIAGNOSTICO OLIVEIRA PEIXOTO', 'JEFFERSON DE OLIVEIRA PEIXOTO DIAGNOSTICO', '21895414000104', '55320000', 'R ANANIAS ALVES COSTA, 434', NULL, NULL, 'CENTRO', 'Lagoa do Ouro', 'PE', '2025-10-28 12:32:11'),
(142, 'PRO-CORACAO', 'PRO-CORACAO SS LTDA', '02768842000113', '56304160', 'AV Monsenhor Ângelo Sampaio, 100', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:11'),
(143, 'BIOLIFE - LABORATORIO DE ANALISES DE PATOLOGIA CLINICA', 'CEMIL - CENTRO DE ESPECIALIDADES MEDICAS ITAMIRIS LIMA LTDA', '39987296000111', '58660000', 'R JOSEFA FERREIRA TAVARES, 53', NULL, NULL, 'CENTRO', 'Juazeirinho', 'PB', '2025-10-28 12:32:11'),
(144, 'CENTROCARDIOS', 'CENTRO DE CARDIOLOGIA DO SERIDO LTDA', '08901991000195', '59380000', 'R CIPRIANO PINHEIRO GALVAO, 38', NULL, NULL, 'MANUEL SALUSTINO', 'Currais Novos', 'RN', '2025-10-28 12:32:11'),
(145, 'CARDIOPREV', 'CENTRO DE CARDIOLOGIA FELIPE GUERRA LTDA', '27288157000110', '59064160', 'R Nelson Geraldo Freire, 800', NULL, NULL, 'Lagoa Nova', 'Natal', 'RN', '2025-10-28 12:32:11'),
(146, 'CLINICA DO DOUTOR ANTONIO MATIAS FERNANDES S/S LTDA', 'CLINICA DO DOUTOR ANTONIO MATIAS FERNANDES S/S LTDA', '70302179000117', '59020050', 'R Otávio Lamartine, 517', NULL, NULL, 'Petrópolis', 'Natal', 'RN', '2025-10-28 12:32:11'),
(147, 'MARCATEC BIOMEDICA EQUIPAMENTOS HOSPITALARES LTDA', 'MARCATEC BIOMEDICA EQUIPAMENTOS HOSPITALARES LTDA', '58757733000155', '06708230', 'AV Denne, 163', NULL, NULL, 'Parque São George', 'Cotia', 'SP', '2025-10-28 12:32:11'),
(148, 'KEEPCLEAR LICENCIAMENTOS E SERVICOS LTDA', 'KEEPCLEAR LICENCIAMENTOS E SERVICOS LTDA', '32138431000105', '04547130', 'AL Vicente Pinzon, 54', NULL, NULL, 'Vila Olímpia', 'São Paulo', 'SP', '2025-10-28 12:32:11'),
(149, 'CLINICA MEDICA DR ANTONIO CARLOS BARBOSA', 'CLINICA MEDICA DR ANTONIO CARLOS BARBOSA LTDA', '19072440000182', '58233000', 'R FRANCISCO FIALHO, 221', NULL, NULL, 'CENTRO', 'Araruna', 'PB', '2025-10-28 12:32:11'),
(150, 'CERPAI- CENTRO E REFERENCIA EM PEDIATRIA A. E IMUNIZAÇÃO', 'CERPAI - CENTRO DE REFERENCIA EM PEDIATRIA ALERGIA E IMUNIZ.', '09336042000172', '58900000', 'AV JULIO MARQUES DO NASCIMENTO, 771', NULL, NULL, 'CRISTO REI', 'Cajazeiras', 'PB', '2025-10-28 12:32:11'),
(151, 'CETRIM IMAGEM', 'CETRIM- CENTRO DE TREINAMENTO EM IMAGENOLOGIA LTDA', '11003856000137', '58013390', 'R Heráclito Cavalcanti, 59', NULL, NULL, 'Centro', 'João Pessoa', 'PB', '2025-10-28 12:32:11'),
(152, 'CIRCULO DO CORAÇÃO DE PERNAMBUCO', 'CIRCULO DO CORAÇÃO DE PERNAMBUCO', '00286731000145', '52031050', 'R Nossa Senhora da Glória, 203', NULL, NULL, 'Campo Grande', 'Recife', 'PE', '2025-10-28 12:32:11'),
(153, 'CITYLAB', 'CITYLAB LABORATORIOS CLINICOS LTDA', '32381640000185', '50781725', 'R Nossa Senhora de Fátima, 187', NULL, NULL, 'Jardim São Paulo', 'Recife', 'PE', '2025-10-28 12:32:11'),
(154, 'CARDIOCENTRO', 'CARDIOCENTRO LTDA', '40986515000127', '59020300', 'AV Campos Sales, 762', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:32:11'),
(155, 'CARDIOLOGIA', 'CARDIOLOGIA LTDA', '03935478000100', '52020180', 'R Buenos Aires, 182', NULL, NULL, 'Espinheiro', 'Recife', 'PE', '2025-10-28 12:32:11'),
(156, 'HOSPITAL DO CORACAO DE NATAL', 'ATHENA HEALTHCARE HOLDING S.A.', '26753292000208', '59075050', 'R CORONEL AURIS COELHO, 235', NULL, NULL, 'LAGOA NOVA', 'Natal', 'RN', '2025-10-28 12:32:11'),
(157, 'HOSPITAL GUILHERME ALVARO', 'SECRETARIA DE ESTADO DA SAUDE', '46374500001670', '11045904', 'R Oswaldo Cruz, 197', NULL, NULL, 'Boqueirão', 'Santos', 'SP', '2025-10-28 12:32:11'),
(158, 'ANALISE LABORATORIO CLINICO', 'ANALISE LABORATORIO CLINICO LTDA', '34376445000192', '58600000', 'PCA ALCINDO LEITE, 35', NULL, NULL, 'CENTRO', 'Santa Luzia', 'PB', '2025-10-28 12:32:11'),
(159, 'NORTE CLINICA', 'AM MEDICAL LTDA', '24241152000144', '59120555', 'AV Doutor João Medeiros Filho, S/N', NULL, NULL, 'Potengi', 'Natal', 'RN', '2025-10-28 12:32:11'),
(160, 'ASSOCIACAO DO CENTRO DE ESTUDOS', 'ASSOCIACAO DO CENTRO DE ESTUDOS DO HOSPITAL AGAMENON MAGALHA', '08911724000107', '52051380', 'EST do Arraial, 2723', NULL, NULL, 'Tamarineira', 'Recife', 'PE', '2025-10-28 12:32:11'),
(161, 'VIVAS SAUDE', 'LAP SERVICOS MEDICOS E ODONTOLOGICOS LTDA', '51772469000180', '53515230', 'AV DUQUE DE CAXIAS, 349', NULL, NULL, 'ALTO DA BELA VISTA', 'Abreu e Lima', 'PE', '2025-10-28 12:32:11'),
(162, 'HOSPITAL DOM TOMAS', 'ASS PETROLINENSE DE AMPARO A MATERNIDADE E A INFANCIA', '10730125000473', '56306290', 'R Visconde de Mauá, 10', NULL, NULL, 'Gercino Coelho', 'Petrolina', 'PE', '2025-10-28 12:32:11'),
(163, 'DIGEST', 'SOCIEDADE DE CIRURGIOES DO APARELHO DIGESTIVO LTDA', '35328475000277', '52010075', 'AV Governador Agamenon Magalhães, 4318', NULL, NULL, 'Paissandu', 'Recife', 'PE', '2025-10-28 12:32:11'),
(164, 'CLINICA DR TEODORO FIGUEIREDO', 'CLINCARDIO CLINICA CARDIOLOGICA LTDA', '13479872000126', '59600157', 'R José Otávio, 213', NULL, NULL, 'Centro', 'Mossoró', 'RN', '2025-10-28 12:32:11'),
(165, 'CLIMED DR RUY SUASSUNA', 'CLIMED DR RUY SUASSUNA LTDA', '48127529000105', '58255000', 'R FELICIANO PEDROSA, S/N', NULL, NULL, 'CENTRO', 'Belém', 'PB', '2025-10-28 12:32:11'),
(166, 'QUALIMETRA MEDICIA OCUPACIONAL', 'BLM MEDICINA E SEGURANCA DO TRABALHO LTDA', '25116158000152', '51011050', 'AV Engenheiro Domingos Ferreira, 850', NULL, NULL, 'Pina', 'Recife', 'PE', '2025-10-28 12:32:11'),
(167, 'S.U.A CLINICA', 'BIOTECH LABORATORIO DE CITOLOGIA E ANALISES CLINICAS LTDA', '09374071000129', '59162000', 'R BARAO DE MIPIBU, 56', NULL, NULL, 'CENTRO', 'São José de Mipibu', 'RN', '2025-10-28 12:32:11'),
(168, 'ECOCARDIO RN', 'ATG ASSISTENCIA MEDICA LTDA', '33172130000160', '59084300', 'R Divinópolis, 2917', NULL, NULL, 'Neópolis', 'Natal', 'RN', '2025-10-28 12:32:11'),
(169, 'CEPCLIN', 'CENTRO DE ESTUDOS E PESQUISAS EM MOLESTIAS INFECCIOSAS LTDA', '03683397000151', '59025050', 'R Doutor Ponciano Barbosa, 282', NULL, NULL, 'Cidade Alta', 'Natal', 'RN', '2025-10-28 12:32:11'),
(170, 'CENTRO MEDICO DR. HELIO LISBOA', 'CENTRO MEDICO DR. HELIO LISBOA E ASSOCIADOS S/S LTDA', '03237085000114', '58032090', 'R Antônio Rabelo Júnior, 170', NULL, NULL, 'Miramar', 'João Pessoa', 'PB', '2025-10-28 12:32:11'),
(171, 'CARDIO E SAUDE', 'CARDIO E SAUDE SERVICOS MEDICOS AMBULATORIAIS LTDA', '20893292000146', '58865000', 'R ANA MARIA RIBEIRO, 436', NULL, NULL, 'CENTRO', 'São Bento', 'PB', '2025-10-28 12:32:11'),
(172, 'CARDIO DIAGNOSTICO', 'CARDIO DIAGNOSTICO LTDA', '20884394000103', '58032090', 'R Antônio Rabelo Júnior, 170', NULL, NULL, 'Miramar', 'João Pessoa', 'PB', '2025-10-28 12:32:11'),
(173, 'CARDIO POPULAR', 'CARDIO POPULAR CLINICA MEDICA CARDIOLOGICA LTDA', '30367705000102', '58400243', 'R Deputado Álvaro Gaudêncio, 420', NULL, NULL, 'Centro', 'Campina Grande', 'PB', '2025-10-28 12:32:11'),
(174, 'CLICK CONSULTA', 'CLICK CONSULTA SERVICOS MEDICO AMBULATORIAL LTDA', '33780026000230', '58200000', 'AV FELICIANO BATISTA DE AMORIM, S/N', NULL, NULL, 'GUARABIRA', 'Guarabira', 'PB', '2025-10-28 12:32:11'),
(175, 'IMMP - INSTITUTO MEDICO MANOEL PEREIRA', 'IMMP - INSTITUTO MEDICO MANOEL PEREIRA LTDA', '38033071000163', '55650000', 'R BOA VISTA, 48', NULL, NULL, 'CENTRO', 'Passira', 'PE', '2025-10-28 12:32:11'),
(176, 'ULTRA-IMAGEM VIEGAS', 'ULTRA-IMAGEM VIEGAS LTDA', '05994023000263', '54510360', 'AV Historiador Pereira da Costa, 520', NULL, NULL, 'Centro', 'Cabo de Santo Agostinho', 'PE', '2025-10-28 12:32:11'),
(177, 'CARDIOMAX- CLINICA CARDIOLOGICA LTDA', 'CARDIOMAX- CLINICA CARDIOLOGICA LTDA', '26774438000110', '50050000', 'R da Aurora, 325', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:11'),
(178, 'CANDELARIA COMERCIO E SERVICO LTDA', 'CANDELARIA COMERCIO E SERVICO LTDA', '29171707000142', '59065240', 'R E R ERNESTO NAZARETH, 1812', NULL, NULL, 'CANDELARIA', 'Natal', 'RN', '2025-10-28 12:32:11'),
(179, 'CAMPIMAGEM-CENTRO DE DIAG. POR IMAGEM DE CAMP.GRANDE LTDA', 'CAMPIMAGEM-CENTRO DE DIAG. POR IMAGEM DE CAMP.GRANDE LTDA', '02503493000108', '58400550', 'R Rodrigues Alves, 603', NULL, NULL, 'Prata', 'Campina Grande', 'PB', '2025-10-28 12:32:11'),
(180, 'HIPERMEDICA UNIDADE II', 'BRITO, RODRIGUES E TELLES LTDA', '29093223000122', '58400068', 'R Coronel José André, 95', NULL, NULL, 'Centro', 'Campina Grande', 'PB', '2025-10-28 12:32:11'),
(181, 'CLINICA VIVER SAUDE', 'CARUARU VIVER SAUDE LTDA', '41426864000157', '55038235', 'R Luís Célio de Souza, S/N', NULL, NULL, 'Boa Vista', 'Caruaru', 'PE', '2025-10-28 12:32:11'),
(182, 'SEGCLIN OCUPACIONAL ABREU E LIMA', 'G B VITOR SEGURANCA E SAUDE OCUPACIONAL', '31020709000182', '53585130', 'R Massaranduba, 121', NULL, NULL, 'Matinha', 'Abreu e Lima', 'PE', '2025-10-28 12:32:11'),
(183, 'GALDINO & CARVALHO OCUPACIONAL LTDA', 'GALDINO & CARVALHO OCUPACIONAL LTDA', '22254048000169', '54315570', 'EST da Batalha, 1744', NULL, NULL, 'Jardim Jordão', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:11'),
(184, 'GEFE', 'GEFE GRUPO DE ESTUDOS E FORMACAO EM ERGOMETRIA LTDA', '28099066000108', '50750090', 'R Padre Euclides Jardim, 81', NULL, NULL, 'Afogados', 'Recife', 'PE', '2025-10-28 12:32:11'),
(185, 'CARDIONUTRI', 'CARDIONUTRI SERVICOS DE SAUDE LTDA', '39730300000161', '59080060', 'R Professora Gipse Montenegro, 2032', NULL, NULL, 'Capim Macio', 'Natal', 'RN', '2025-10-28 12:32:11'),
(186, 'IMIP HOSPITALAR - UPA GARANHUNS', 'FUNDACAO GESTAO HOSPITALAR MARTINIANO FERNANDES - FGH', '09039744001409', '55295130', 'ROD BR-423, 2000', NULL, NULL, 'São José', 'Garanhuns', 'PE', '2025-10-28 12:32:11'),
(187, 'ESCOLA SUPERIOR DE EDUCACAO FISICA DE PERNAMBUCO', 'FUNDACAO UNIVERSIDADE DE PERNAMBUCO', '11022597000949', '50100130', 'R Arnóbio Marques, 310', NULL, NULL, 'Santo Amaro', 'Recife', 'PE', '2025-10-28 12:32:11'),
(188, 'UNIVASF', 'FUNDACAO UNIVERDIDADE FEDERAL DO VALE DO SAO FRANCISCO', '05440725000114', '56304205', 'AV José de Sá Maniçoba, S/N', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:11'),
(189, 'FUNDO MUNICIPAL DE SAUDE CATENDE PE', 'FUNDO MUNICIPAL DE SAUDE', '08247860000136', '55400000', 'PCA COSTA AZEVEDO, S/N', NULL, NULL, 'CENTRO', 'Catende', 'PE', '2025-10-28 12:32:11'),
(190, 'FUNDO MUNICIPAL DE SAUDE DO JABOATAO DOS GUARARAPES', 'FUNDO MUNICIPAL DE SAUDE', '03904395000145', '54330900', 'AV Barreto de Menezes, S/N', NULL, NULL, 'Prazeres', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:11'),
(191, 'FUNDO MUNICIPAL DE SAUDE DE ESPERANCA', 'FUNDO MUNICIPAL DE SAUDE', '12011984000195', '58135000', 'R MANOEL HENRIQUE, 217', NULL, NULL, 'CENTRO', 'Esperança', 'PB', '2025-10-28 12:32:11'),
(192, 'FUNDO MUNICIPAL DE SAUDE DE JURIPIRANGA', 'FUNDO MUNICIPAL DE SAUDE', '11164805000197', '58330000', 'AV BRASIL, 380', NULL, NULL, 'CENTRO', 'Juripiranga', 'PB', '2025-10-28 12:32:11'),
(193, 'CLINCORDIS', 'CLINICA MEDICA CLINCORDIS LTDA', '38095897000157', '59343000', 'R DR.FERNANDES, 479', NULL, NULL, 'CENTRO', 'Jardim do Seridó', 'RN', '2025-10-28 12:32:11'),
(194, 'FONTE CLINICA DE CARDIOLOGIA LTDA', 'FONTENELE CLINICA DE CARDIOLOGIA LTDA', '26665956000104', '55012075', 'R Maria de Lourdes Casé Porto, 51', NULL, NULL, 'Maurício de Nassau', 'Caruaru', 'PE', '2025-10-28 12:32:11'),
(195, 'CLIMED GUARARAPES', 'CLIMED -  CLINICA MEDICA DE SAUDE LTDA', '34141859000132', '54310080', 'AV Ulisses Montarroyos, 2968', NULL, NULL, 'Prazeres', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:11'),
(196, 'CLIMED', 'CLIMED S/S LTDA', '02821837000127', '59063300', 'TRA Jerônimo Câmara, 1543', NULL, NULL, 'Dix-Sept Rosado', 'Natal', 'RN', '2025-10-28 12:32:11'),
(197, 'CLINICA AMIGO DA SAUDE', 'EDINALVA NOBRE SOARES', '30423806000153', '58213970', 'R Prefeito Ferreira de Melo, 7', NULL, NULL, 'Centro', 'Pirpirituba', 'PB', '2025-10-28 12:32:11'),
(198, 'CLINICA CARDIOLOGIA DR MARCOS ANTONIO NASCIMENTO LTDA', 'CLINICA CARDIOLOGIA DR MARCOS ANTONIO NASCIMENTO LTDA', '30020178000165', '59380000', 'AV TEOTONIO FREIRE, 878', NULL, NULL, 'JK', 'Currais Novos', 'RN', '2025-10-28 12:32:11'),
(199, 'LABORATORIO DE ALTA PERFORMANCE E PESQUISA', 'JOSE CARLOS MEDEIROS DA SILVA SOBRINHO CONDICIONAMENTO', '43265515000126', '50070535', 'R José de Alencar, 935', NULL, NULL, 'Coelhos', 'Recife', 'PE', '2025-10-28 12:32:11'),
(200, 'CLINICA DR. MANO', 'JOSE ESDRAS RODRIGUES ALVES & CIA LTDA', '11218987000131', '56200000', 'AV MANOEL IRINEU DE ARAUJO, 1334', NULL, NULL, 'BIGODAO', 'Ouricuri', 'PE', '2025-10-28 12:32:12'),
(201, 'POTIGUAR IMAGEM', 'FRANCISCO F DE OLIVEIRA LTDA', '33875551000158', '59031700', 'R dos Caicós, 1395', NULL, NULL, 'Alecrim', 'Natal', 'RN', '2025-10-28 12:32:12'),
(202, 'TOS- CENTRO DE TRATAMENTO OSTENSIVO E SERVICOS', 'CTOS- CENTRO DE TRATAMENTO OSTENSIVO E SERVICOS LTDA', '07541074000184', '59900000', 'R QUINTINO BOCAIUVA, 568', NULL, NULL, 'CENTRO', 'Pau dos Ferros', 'RN', '2025-10-28 12:32:12'),
(203, 'POLICLINICA LUIZ DINIZ', 'DINIZ SERVICOS MEDICOS E ASSESORIA EMPRESARIAL LTDA', '26159387000117', '58400180', 'AV Marechal Floriano Peixoto, 1036', NULL, NULL, 'Centro', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(204, 'DOUTOR WORK', 'DOUTOR WORK LTDA', '46144092000184', '58042070', 'R Deputado Jáder Medeiros, 00131', NULL, NULL, 'Tambauzinho', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(205, 'DUO MEDICINA INTEGRAL', 'DUO MEDICINA INTEGRAL LTDA', '30610053000195', '59063150', 'R São José, 2186', NULL, NULL, 'Lagoa Nova', 'Natal', 'RN', '2025-10-28 12:32:12'),
(206, 'E I A -CLINICA MEDICA E ANALISES CLINICAS LTDA', 'E I A -CLINICA MEDICA E ANALISES CLINICAS LTDA', '15377894000100', '59650000', 'R J R JOSE DE MACEDO FREIRE, 73', NULL, NULL, 'JANDUIS', 'Açu', 'RN', '2025-10-28 12:32:12'),
(207, 'CENTRO DE SAUDE NOVA ESPERANCA', 'ESCOLA DE ENFERMAGEM NOVA ESPERANCA LTDA', '02949141000695', '58305006', 'AV LIBERDADE, 1596', NULL, NULL, 'SAO BENTO', 'Bayeux', 'PB', '2025-10-28 12:32:12'),
(208, 'ESQUADRAO DE SAUDE DE NATAL - ES-NT', 'COMANDO DA AERONAUTICA', '00394429001859', '59150000', 'EST DO AEROPORTO, S/N', NULL, NULL, 'CAMPO PARNAMIRIM', 'Parnamirim', 'RN', '2025-10-28 12:32:12'),
(209, 'CONCEPT HOSPITAL', 'CONCEPT HOSPITAL S.A.', '45674303000128', '50070390', 'R Esperanto, 467', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:32:12'),
(210, 'CORDIS CLINICA CARDIOLOGICA', 'CORDIS SERVICOS MEDICOS LTDA', '24050566000196', '58700340', 'R Fenelon Bonavides, 00', NULL, NULL, 'Brasília', 'Patos', 'PB', '2025-10-28 12:32:12'),
(211, 'EMPREENDIMENTOS 3L LTDA', 'EMPREENDIMENTOS 3L LTDA', '24526221000166', '59330000', 'R C R CELSO FERNANDES, 45', NULL, NULL, 'SANTA ISABEL', 'Jucurutu', 'RN', '2025-10-28 12:32:12'),
(212, 'HOSPITAL DE ENSINO DR WASHIGTON ANTONIO DE BARROS', 'EMPRESA BRASILEIRA DE SERVICOS HOSPITALARES - EBSERH', '15126437002197', '56304205', 'AV José de Sá Maniçoba, S/N', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(213, 'NITI', 'CLINICA NITI LTDA', '20752634000108', '55813440', 'RUA RUA ROSITA FREIRE, 721', NULL, NULL, 'CAJA', 'Carpina', 'PE', '2025-10-28 12:32:12'),
(214, 'F A G DE OLIVEIRA LTDA', 'F A G DE OLIVEIRA LTDA', '06907719000197', '54400220', 'RUA RUA SILVIA FERREIRA, 1', NULL, NULL, 'PIEDADE', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:12'),
(215, 'IMPEIO SAUDE', 'JS ODONTOLOGIA E MEDICINA INTEGRADA LTDA', '33457818000197', '56304260', 'R Dom Vital, 662', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(216, 'F R FERNANDES COSTA LTDA', 'F R FERNANDES COSTA LTDA', '28322916000187', '59300000', 'R G R GENERINA VALE, 983', NULL, NULL, 'CENTRO', 'Caicó', 'RN', '2025-10-28 12:32:12'),
(217, 'FABRIZIA LAYNE LIMA DE OLIVEIRA', 'FABRIZIA LAYNE LIMA DE OLIVEIRA ME', '36167751000144', '58705072', 'R Tailândia, 110', NULL, NULL, 'Jardim Europa', 'Patos', 'PB', '2025-10-28 12:32:12'),
(218, 'LABORATORIO DE ANAL CLIN DR ARIOSVALDO R DA COSTA LTDA', 'LABORATORIO DE ANAL CLIN DR ARIOSVALDO R DA COSTA LTDA', '08601478000189', '58280000', 'R DR ARIOSVALDO RODRIGUES DA COSTA, 125', NULL, NULL, 'CENTRO', 'Mamanguape', 'PB', '2025-10-28 12:32:12'),
(219, 'IOR', 'INSTITUTO DE OLHOS DO RECIFE LTDA', '10970077000148', '52020140', 'R Vigário Barreto, 50', NULL, NULL, 'Graças', 'Recife', 'PE', '2025-10-28 12:32:12'),
(220, 'FACULDADE DE MEDICINA DE OLINDA - FMO', 'BARROS MELO ENSINO SUPERIOR S.A. (FACULDADE DE MEDICINA DE O', '13671759000148', '53030030', 'R Doutor Manoel de Almeida Belo, 1333', NULL, NULL, 'Bairro Novo', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(221, '13.618.705 ELLYZANDRA KAROLLINE CALAZANS', '13.618.705 ELLYZANDRA KAROLLINE CALAZANS', '13618705000119', '55540000', 'R MANOEL ALVES PEIXOTO, 2', NULL, NULL, 'SAO JOSE', 'Palmares', 'PE', '2025-10-28 12:32:12'),
(222, 'EMCOR EMERGENCIAS DO CORACAO LTDA', 'EMCOR EMERGENCIAS DO CORACAO LTDA', '08871261000199', '50070465', 'R Frei Matias Tévis, 83', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:32:12'),
(223, 'ASSISTMEDICA', 'ASSISTMEDICA COMERCIO E ASSISTENCIA TECNICA MEDICA LTDA', '03761081000130', '58040340', 'AV Camilo de Holanda, 1160', NULL, NULL, 'Torre', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(224, 'HOSPITAL ESPERANCA', 'HOSPITAL ESPERANCA SA', '02284062000106', '50070480', 'R Antônio Gomes de Freitas, 265', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:32:12'),
(225, 'INCOR NATAL', 'INSTITUTO DO CORACAO DE NATAL LTDA (INCOR NATAL)', '01507901000137', '59020100', 'AV Afonso Pena, 754', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:32:12'),
(226, 'HGU - HOSPITAL GERAL E URGENCIAS', 'CENTRO HOSPITALAR SAO FRANCISCO LTDA (HGU)', '11470358000102', '56332175', 'R Peroba, 129', NULL, NULL, 'Jatobá', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(227, 'HOSPITAL SANTA JOANA RECIFE', 'HOSPITAIS ASSOCIADOS DE PERNAMBUCO LTDA (SANTA JOANA RECIFE)', '10839561000132', '52011005', 'R Joaquim Nabuco, 200', NULL, NULL, 'Graças', 'Recife', 'PE', '2025-10-28 12:32:12'),
(228, 'CARVALHO BELTRAO SERVICOS DE SAUDE LTDA', 'CARVALHO BELTRAO SERVICOS DE SAUDE LTDA (CORURIPE)', '35642172000143', '57230000', 'R Euclides Baeta, 00', NULL, NULL, 'JOAO CARVALHO', 'Coruripe', 'AL', '2025-10-28 12:32:12'),
(229, 'HOSPITAL DAS NEVES', 'HOSPITAL NOSSA SENHORA DAS NEVES S/A', '01817749000199', '58040530', 'R Etelvina Macedo de Mendonça, 531', NULL, NULL, 'Torre', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(230, 'HOSPITAL MEMORIAL PETROLINA', 'INSTITUTO MEMORIAL DO VALE (HOSP MEMORIAL PETROLINA)', '27049306000199', '56304210', 'R Tobias Barreto, 02', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(231, 'NATALCOR', 'NATALCOR LTDA', '01407085000190', '59020200', 'AV Rodrigues Alves, 1115', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:32:12'),
(232, 'ROYAL CARDIO', 'ROYAL CARDIO PRONTO ATENDIMENTO EM SAUDE LTDA', '32264635000192', '52010075', 'AV Governador Agamenon Magalhães, 4760', NULL, NULL, 'Paissandu', 'Recife', 'PE', '2025-10-28 12:32:12'),
(233, 'UPA CARUARU DR. HORACIO FLORENCIO', 'FUNDACAO MANOEL DA SILVA ALMEIDA (UPA CARUARU)', '09767633001257', '55026675', 'AV José Marques Fontes, 00', NULL, NULL, 'Indianópolis', 'Caruaru', 'PE', '2025-10-28 12:32:12'),
(234, 'PAULISTA PRAIA HOTEL S/A', 'PAULISTA PRAIA HOTEL S/A', '00338915000292', '55590000', 'LOT LOTEAMENTO FAZENDA MEREPE, 0', NULL, NULL, 'MURO ALTO', 'Ipojuca', 'PE', '2025-10-28 12:32:12'),
(235, 'AC MATERIAIS', 'AC MATERIAIS HOSPITALARES LTDA', '43816652000101', '55940000', 'R MAJ ANTONIO CORREIA, 69', NULL, NULL, 'CENTRO', 'Condado', 'PE', '2025-10-28 12:32:12'),
(236, 'LAFEPE', 'LABORATORIO FARMACEUTICO DO ESTADO DE PERNAMBUCO GOVERNADOR', '10877926000113', '52171010', 'R Dois Irmãos, 1117', NULL, NULL, 'Dois Irmãos', 'Recife', 'PE', '2025-10-28 12:32:12'),
(237, 'HOSPITAL HELP', 'FUNDACAO PEDRO AMERICO', '06101061000636', '58434505', 'R Heronides da Costa Cirne, 250', NULL, NULL, 'Serrotão', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(238, 'FERREIRA COSTA', 'FERREIRA COSTA & CIA LTDA', '10230480000130', '55293000', 'AVE AVENIDA SANTO ANTONIO, 515', NULL, NULL, 'SANTO ANTONIO', 'Garanhuns', 'PE', '2025-10-28 12:32:12'),
(239, 'SUBCONDOMINIO RIOMAR', 'SUBCONDOMINIO RIOMAR RECIFE', '16888022000170', '51110160', 'AV República do Líbano, 251', NULL, NULL, 'Pina', 'Recife', 'PE', '2025-10-28 12:32:12'),
(240, 'HOSPITAL MANDACARU', 'ULTRA SOM SERVICOS MEDICOS S.A. (HOSPITAL MANDACARU)', '12361267017240', '50070160', 'AV GOVERNADOR AGAMENON MAGALHAES, 3621', NULL, NULL, 'TORREAO', 'Recife', 'PE', '2025-10-28 12:32:12'),
(241, 'IRIS OFTALMO', 'CLINICA DE OLHOS CARUARU LTDA (IRIS OFTALMO)', '04482140000102', '55014000', 'AV AGAMENON MAGALHAES, 732', NULL, NULL, 'MAURICIO DE NASSAU', 'Caruaru', 'PE', '2025-10-28 12:32:12'),
(242, 'HOSPITAL NOVA ESPERANCA - HNE', 'FUNDACAO JOSE LEITE DE SOUZA (HOSP NOVA ESPERANÇA)', '40980914000180', '58015170', 'AV Capitão José Pessoa, 919', NULL, NULL, 'Jaguaribe', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(243, 'I2R STUDIO DE BIKE FORTALEZA LTDA - ME', 'I2R STUDIO DE BIKE FORTALEZA LTDA - ME', '52262993000173', '60135270', 'VIC VICENTE LINHARES, 00521', NULL, NULL, 'ALDEOTA', 'Fortaleza', 'CE', '2025-10-28 12:32:12'),
(244, 'HOSPITAL UNIMED CARUARU', 'UNIMED CARUARU COOPERATIVA DE TRABALHO MEDICO (HOSP)', '24449225000279', '55016445', 'R Artur Antônio da Silva, 549', NULL, NULL, 'Universitário', 'Caruaru', 'PE', '2025-10-28 12:32:12'),
(245, 'CORDIAL', 'CORDIAL SOCIEDADE BENEFICENTE DO CORACAO DE ALAGOAS', '08973574000158', '57052760', 'R Comendador Luiz Jardim, 769', NULL, NULL, 'Gruta de Lourdes', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(246, 'HOSPITAL AGAMENON MAGALHAES', 'SECRETARIA DE SAUDE (HOSP AGAMENON MAGALHAES)', '10572048000390', '52051380', 'EST EST DO ARAIAL, 2723', NULL, NULL, 'TAMARINEIRA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(247, 'UNIMED RECIFE II', 'UNIMED RECIFE COOPERATIVA DE TRABALHO MEDICO II', '11214624000985', '50070520', 'PCA  MIGUEL DE CERVANTES., 188', NULL, NULL, 'ILHA DO LEITE', 'Recife', 'PE', '2025-10-28 12:32:12'),
(248, 'UNIMED RECIFE I', 'UNIMED RECIFE COOPERATIVA DE TRABALHO MEDICO I', '11214624000128', '50070225', 'AV Lins Petit, 140', NULL, NULL, 'Paissandu', 'Recife', 'PE', '2025-10-28 12:32:12'),
(249, 'HGMI - HOSPITAL GERAL MATERNO INFANTIL', 'UNIMED RECIFE COOPERATIVA DE TRABALHO MEDICO (HGMI)', '11214624002414', '50070235', 'AV Lins Petit, 161', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(250, 'HOSPITAL DO CORACAO DE ALAGOAS', 'CARDIODINAMICA LTDA', '01454407000151', '57052580', 'AV Aryosvaldo Pereira Cintra, 152', NULL, NULL, 'Gruta de Lourdes', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(251, 'SANTA CASA DE MISERICORDIA DE MACEIO', 'SANTA CASA DE MISERICORDIA DE MACEIO', '12307187000150', '57020360', 'R Barão de Maceió, 346', NULL, NULL, 'Centro', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(252, 'CHAMA', 'CHAMA  -  COMPLEXO HOSPITALAR MANOEL ANDRE LTDA', '04710210000124', '57307610', 'R ROD AL-220, 344', NULL, NULL, 'DEPUTADO NEZINHO', 'Arapiraca', 'AL', '2025-10-28 12:32:12'),
(253, 'HOSPITAL JAYME DA FONTE', 'ORGANIZACAO HOSPITALAR DE PE LTDA (HOSP JAYME DA FONTE)', '11452240000143', '52010010', 'R DAS PERNAMBUCANAS, 103', NULL, NULL, 'GRAÇAS', 'Recife', 'PE', '2025-10-28 12:32:12'),
(254, 'CLINICA DE FRATURAS E REABILITACAO LTDA', 'CLINICA DE FRATURAS E REABILITACAO LTDA', '10797579000119', '50050245', 'R João Fernandes Vieira, 644', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(255, 'HOSPITAL ESPERANCA OLINDA', 'REDE D\'OR SAO LUIZ S.A. (HOSP ESPERANCA OLINDA)', '06047087001291', '53130410', 'AV Doutor José Augusto Moreira, 810', NULL, NULL, 'Casa Caiada', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(256, 'HOSPITAL SAO MARCOS', 'HOSPITAL ESPERANCA SA (HOSP SAO MARCOS)', '02284062000440', '52010030', 'R PACIFICO DOS SANTOS, 100', NULL, NULL, 'PAISSANDU', 'Recife', 'PE', '2025-10-28 12:32:12'),
(257, 'ESHO EMPRESA DE SERVICOS HOSPITALARES', 'ESHO EMPRESA DE SERVICOS HOSPITALARES S.A.', '29435005009851', '59063150', 'R São José, 1979', NULL, NULL, 'Lagoa Nova', 'Natal', 'RN', '2025-10-28 12:32:12'),
(258, 'HOSPITAL DE AVILA', 'HOSPITAL DE AVILA LTDA', '35716166000193', '50610090', 'AV Visconde de Albuquerque, 681', NULL, NULL, 'Madalena', 'Recife', 'PE', '2025-10-28 12:32:12');
INSERT INTO `organizacoes` (`id`, `nome_fantasia`, `razao_social`, `cnpj`, `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `data_criacao`) VALUES
(259, 'IMIP', 'INSTITUTO DE MED. INTEGRAL PROF. FERNANDO FIGUEIRA (IMIP)', '10988301000129', '50070902', 'R R DOS COELHOS, 300', NULL, NULL, 'BOA VISTA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(260, 'HOSPITAL SAO PAULO', 'HOSPITAL SAO PAULO LTDA', '01775217000136', '64049440', 'AV Lindolfo Monteiro, 1551', NULL, NULL, 'JOCKEY CLUB', 'Teresina', 'PI', '2025-10-28 12:32:12'),
(261, 'IMIP HOSPITALAR -DOM HELDER', 'FUNDACAO GESTAO HOSPITALAR MARTINIANO FERNANDES - DOM HELDER', '09039744000860', '54580812', 'R Estr. Usina Bom Jesus, km 28, 00', NULL, NULL, 'CENTRO', 'Cabo de Santo Agostinho', 'PE', '2025-10-28 12:32:12'),
(262, 'FUNDO MUNICIPAL DE SAUDE DE ALAGOA NOVA', 'FUNDO MUNICIPAL DE SAUDE DE ALAGOA NOVA', '11838096000188', '58125000', 'R JOAO PESSOA , 313', NULL, NULL, 'CENTRO', 'Alagoa Nova', 'PB', '2025-10-28 12:32:12'),
(263, 'MEDISERVICE', 'MEDISERVICE OPERADORA DE PLANOS DE SAUDE S.A.', '57746455000178', '06472900', 'AV Alphaville, 779', NULL, NULL, 'Dezoito do Forte Empresarial/Alphaville.', 'Barueri', 'SP', '2025-10-28 12:32:12'),
(264, 'HOSPITAL MACEIO - HAPVIDA', 'HAPVIDA ASSISTENCIA MEDICA S.A. (HAPVIDA MACEIO)', '63554067004690', '57046140', 'AV Presidente Getúlio Vargas, 300', NULL, NULL, 'Serraria', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(265, 'HOSPITAL MANDACARU', 'HAPVIDA ASSISTENCIA MEDICA S.A. (HAPVIDA MANDACARU)', '63554067004770', '50070160', 'AV Governador Agamenon Magalhães, 3621', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(266, 'FUNDO DO EXERCITO', 'COMANDO DO EXERCITO (FUSEX)', '00394452054700', '70052900', 'LOC dos Ministérios Bloco O, 00', NULL, NULL, 'Zona Cívico-Administrativa', 'Brasília', 'DF', '2025-10-28 12:32:12'),
(267, 'BRADESCO AUTO/RE COMPANHIA DE SEGUROS', 'BRADESCO AUTO/RE COMPANHIA DE SEGUROS', '92682038000100', '20931675', 'AV RIO DE JANEIRO, 00555', NULL, NULL, 'CAJU', 'Rio de Janeiro', 'RJ', '2025-10-28 12:32:12'),
(268, 'ASSEFAZ-ALAGOAS', 'FUNDACAO ASSIST. DOS SERV. DO MINIST DA FAZENDA (ALAGOAS)', '00628107002556', '57072000', 'AV Lourival Melo Mota, 47', NULL, NULL, 'Cidade Universitária', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(269, 'ASSEFAZ-PERNAMBUCO', 'FUND. ASSIST. DOS SERV. DO MINIST. DA FAZENDA - PE', '00628107000340', '50030310', 'AV RIO BRANCO, 76', NULL, NULL, 'BAIRRO DO RECIFE', 'Recife', 'PE', '2025-10-28 12:32:12'),
(270, 'HOSPITAL CELINA GUIMARAES VIANA', 'ULTRA SOM SERVICOS MEDICOS S.A.', '12361267015700', '59611320', 'R Raimundo Leão de Moura, 10', NULL, NULL, 'Nova Betânia', 'Mossoró', 'RN', '2025-10-28 12:32:12'),
(271, 'HNSN EPITACIO LTDA', 'HNSN EPITACIO LTDA', '41226432000100', '58030002', 'AV Presidente Epitácio Pessoa, 114', NULL, NULL, 'Estados', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(272, 'HOSPITAL MEMORIAL ARTHUR RAMOS', 'HOSPITAL MEMORIAL ARTHUR RAMOS', '01722424000122', '57052827', 'R Hugo Corrêa Paes, 253', NULL, NULL, 'Gruta de Lourdes', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(273, 'SESAU', 'SECRETARIA DE ESTADO DA SAUDE (SESAU)', '12200259000165', '57036540', 'AV Empresário Carlos da Silva Nogueira, 978', NULL, NULL, 'Jatiúca', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(274, 'OFTALMOCENTER', 'HOSPITAL DE MICROCIRURGIA OCULAR DO RECIFE LTDA -OFTALMOCENT', '04344682000100', '51011030', 'AV Conselheiro Aguiar, 726', NULL, NULL, 'Pina', 'Recife', 'PE', '2025-10-28 12:32:12'),
(275, 'PROCAPE', 'FUNDACAO UNIVERSIDADE DE PERNAMBUCO (PROCAPE)', '11022597001597', '50100060', 'R dos Palmares, 00', NULL, NULL, 'Santo Amaro', 'Recife', 'PE', '2025-10-28 12:32:12'),
(276, 'MEDRADIUS', 'MEDRADIUS CLINICA DE MEDICINA NUCLEAR E RADIOLOGIA DE MACEIO', '03866223000124', '57050730', 'R HUGO CORREA PAES, 104', NULL, NULL, 'GRUTA DE LOURDES', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(277, 'AMIL ASSISTENCIA (MACEIO)', 'AMIL ASSISTENCIA MEDICA INTERNACIONAL S.A. (MACEIO)', '29309127017900', '57051200', 'R Dom Vital, 115', NULL, NULL, 'Farol', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(278, 'FCA SAUDE', 'ASSOCIACAO FCA SAUDE', '33922160000228', '50070255', 'AV Governador Agamenon Magalhães, 4575', NULL, NULL, 'Paissandu', 'Recife', 'PE', '2025-10-28 12:32:12'),
(279, 'CAMED', 'CAIXA DE ASSISTENCIA DOS FUNC DO BANCO DO NORDESTE (CAMED)', '05814777000294', '50060004', 'AV Conde da Boa Vista, 800', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(280, 'HOSPITAL MACEIO', 'ULTRA SOM SERVICOS MEDICOS S.A. (HOSP MACEIO)', '12361267000860', '57057250', 'R Professor José da Silveira Camerino, 815', NULL, NULL, 'Pinheiro', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(281, 'CLINICASSI MACEIO - AL', 'CAIXA DE ASSISTENCIA DOS FUNCIONARIOS DO BANCO DO BRASIL', '33719485001794', '57036000', 'AV Doutor Antônio Gomes de Barros, 625', NULL, NULL, 'Jatiúca', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(282, 'INSTITUTO AGGEU MAGALHAES', 'FUNDACAO OSWALDO CRUZ (INST AGGEU MAGALHAES)', '33781055000720', '50740465', 'AV Professor Moraes Rego, 00', NULL, NULL, 'Cidade Universitária', 'Recife', 'PE', '2025-10-28 12:32:12'),
(283, 'FISCO SAUDE-PE', 'CAIXA DE ASSISTENCIA A SAUDE DO SIND DOS FUNCI -FISC SAUD PE', '11996146000155', '50040090', 'R R DA AURORA, 1443', NULL, NULL, 'SANTO AMARO', 'Recife', 'PE', '2025-10-28 12:32:12'),
(284, 'STS SOLUCOES HOSPITALARES LTDA', 'STS SOLUCOES TECNOLOGICAS - COMERCIO, REPRESENTACAO E PRESTA', '33111482000106', '51021310', 'R R RIBEIRO DE BRITO, 901', NULL, NULL, 'BOA VIAGEM', 'Recife', 'PE', '2025-10-28 12:32:12'),
(285, 'CLINICASSI BOA VIAGEM - PE', 'CAIXA DE ASSISTENCIA DOS FUNCI DO BANC DO BR(CLINICASSI BV', '33719485006168', '51021310', 'R R RIBEIRO DE BRITO, 618', NULL, NULL, 'BOA VIAGEM', 'Recife', 'PE', '2025-10-28 12:32:12'),
(286, 'ASTECH', 'ASTECH REPRESENTACOES ASSISTENCIA E COMERCIO DE PRODUTOS HOS', '05011743000180', '50100160', 'R TREZE DE MAIO, 776', NULL, NULL, 'SANTO AMARO', 'Recife', 'PE', '2025-10-28 12:32:12'),
(287, 'UMBUZEIRO GABINETE PREFEITO', 'PREFEITURA MUNICIPAL DE UMBUZEIRO', '08869489000144', '58497000', 'AV CARLOS PESSOA, 92', NULL, NULL, 'centro', 'Umbuzeiro', 'PB', '2025-10-28 12:32:12'),
(288, 'NEWMED', 'NEWMED COMERCIO E SERVICOS DE EQUIPAMENTOS HOSPITALARES LTDA', '10859287000163', '53030030', 'R R DR MANOEL DE ALMEIDA BELO, 700', NULL, NULL, 'BAIRRO NOVO', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(289, 'NEUROX', 'NEUROX LOCACAO E COMERCIO ATACADISTA DE EQUIPAMENTOS MEDICOS', '29112611000103', '58041000', 'AV Júlia Freire, 1200', NULL, NULL, 'Expedicionários', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(290, 'WR SAUDE', 'WR SERVICOS EM SAUDE LTDA', '41372321000102', '53370110', 'R R ESQUILO, 04', NULL, NULL, 'OURO PRETO', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(291, 'OBSTARE RECIFE', 'CLINICA OBSTARE RECIFE S/S LTDA', '24822302000103', '51110160', 'AV República do Líbano, 251', NULL, NULL, 'Pina', 'Recife', 'PE', '2025-10-28 12:32:12'),
(292, 'GERENCIA REGIONAL DE PERNAMBUCO -CONAB', 'COMPANHIA NACIONAL DE ABASTECIMENTO CONAB', '26461699003791', '50690000', 'EST do Barbalho, 960', NULL, NULL, 'Iputinga', 'Recife', 'PE', '2025-10-28 12:32:12'),
(293, 'MEDFOR', 'MEDFOR PRODUTOS HOSPITALARES LTDA', '46111072000107', '02731020', 'R Diogo Domingues, 102', NULL, NULL, 'Vila Albertina', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(294, 'BANCO BRADESCO', 'BANCO BRADESCO FINANCIAMENTOS S.A.', '07207996000150', '06029900', 'LOC NUC CIDADE DE DEUS, 00', NULL, NULL, 'VILA YARA', 'Osasco', 'SP', '2025-10-28 12:32:12'),
(295, 'BRADESCO SAUDE S/A', 'BRADESCO SAUDE S/A', '92693118000160', '20931675', 'AV RIO DE JANEIRO, 00555', NULL, NULL, 'CAJU', 'Rio de Janeiro', 'RJ', '2025-10-28 12:32:12'),
(296, 'CECOM', 'CENTRO CARDIOLOGICO OVIDIO MONTENEGRO LTDA.', '24107905000123', '52010075', 'AV Governador Agamenon Magalhães, 4318', NULL, NULL, 'Paissandu', 'Recife', 'PE', '2025-10-28 12:32:12'),
(297, 'ECGNOW MEDICINA DIAGNOSTICA LTDA', 'ECGNOW MEDICINA DIAGNOSTICA LTDA', '23154712000160', '01239030', 'R Coronel José Eusébio, 95', NULL, NULL, 'Higienópolis', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(298, 'INSTRAMED INDUSTRIA MEDICO HOSPITALAR LTDA', 'INSTRAMED INDUSTRIA MEDICO HOSPITALAR LTDA', '90909631000110', '91140310', 'BC José Paris, 339', NULL, NULL, 'Sarandi', 'Porto Alegre', 'RS', '2025-10-28 12:32:12'),
(299, 'CLINICA PROCARDIACO DE NATAL LTDA', 'CLINICA PROCARDIACO DE NATAL LTDA', '08231904000130', '59020120', 'R Jundiaí, 648', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:32:12'),
(300, 'HOSPITAL SAO FRANCISCO LTDA', 'HOSPITAL SAO FRANCISCO LTDA', '08606337000159', '58700450', 'R Peregrino Filho, 199', NULL, NULL, 'Centro', 'Patos', 'PB', '2025-10-28 12:32:12'),
(301, 'HOSPITAL JOAO XXIII', 'SISTEMA DE ASSISTENCIA SOCIAL E DE SAUDE -HOSPITAL JOAO XXII', '07678950000208', '58020540', 'R Monsenhor Walfredo Leal, 46', NULL, NULL, 'Tambiá', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(302, 'HOSPITAL NOSSA SENHORA DO O PAULISTA', 'CENTRO DE EDUCACAO E SAUDE COMUNITARIO CESAC', '02748506000290', '53439000', 'AV Doutor Cláudio José Gueiros Leite, 1229', NULL, NULL, 'Janga', 'Paulista', 'PE', '2025-10-28 12:32:12'),
(303, 'SOS OTORRINO', 'MEIRA & PONTES MEDICOS ASSOCIADOS LTDA', '10574074000195', '58039111', 'R Nossa Senhora dos Navegantes, 500', NULL, NULL, 'Tambaú', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(304, 'HEALTH INDUSTRIA E COMERCIO DE MOVEIS LTDA', 'HEALTH INDUSTRIA E COMERCIO DE MOVEIS LTDA', '04044280000190', '18606292', 'R Regente Feijó, 783', NULL, NULL, 'Vila Real', 'Botucatu', 'SP', '2025-10-28 12:32:12'),
(305, 'TECSAUDE ENGENHARIA HOSPITALAR', 'SL ENGENHARIA HOSPITALAR LTDA', '03480539000183', '54400220', 'R Sílvia Ferreira, 01', NULL, NULL, 'Piedade', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:12'),
(306, 'FERREIRA COSTA', 'FERREIRA COSTA & CIA LTDA', '10230480001960', '51150003', 'AVE AVENIDA MARECHAL MASCARENHAS DE MORAIS, 2967', NULL, NULL, 'IMBIRIBEIRA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(307, 'BATERIAS MOURA', 'ACUMULADORES MOURA S.A.', '09811654000170', '55150615', 'RUA RUA DIARIO DE PERNAMBUCO, 195', NULL, NULL, 'EDSON MORORO MOURA', 'Belo Jardim', 'PE', '2025-10-28 12:32:12'),
(308, 'HOSPITAL REGIONAL DE PALMARES DR SILVIO MAGALHAES', 'FUNCAO MANOEL DA SILVA ALMEIDA', '09767633000447', '55540000', 'LOC QUILOMBO DOS PALMARES, 00', NULL, NULL, 'CENTRO', 'Palmares', 'PE', '2025-10-28 12:32:12'),
(309, 'SERVMED COMERCIO E SERVICO DE LOCACAO DE EQUIPAMENTOS HOSPIT', 'SERVMED COMERCIO E SERVICO DE LOCACAO DE EQUIPAMENTOS HOSPIT', '11758108000164', '53110120', 'RUA RUA PROFESSOR JOAO FERNANDES SOARES, 332', NULL, NULL, 'SALGADINHO', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(310, 'CARDIOAGRESTE LTDA - ME', 'CARDIOAGRESTE LTDA - ME', '17772845000106', '55680000', 'R RUA DR. JOSE ROQUE, 0', NULL, NULL, 'CENTRO', 'Bonito', 'PE', '2025-10-28 12:32:12'),
(311, 'HOSPITAL E MATERNIDADE NOSSA SENHORA DO', 'CENTRO DE EDUCAÇAO E SAUDE COMUNITARIA CESAC', '02748506000370', '50751130', 'R Carlos Gomes, 1020', NULL, NULL, 'Bongi', 'Recife', 'PE', '2025-10-28 12:32:12'),
(312, 'HOSPITAL SAO FRANCISCO', 'HOSPITAL FRANCISCO ANSELMO LTDA', '41095563000198', '56912110', 'R Vereador Silvino Cordeiro de Siqueira, 384', NULL, NULL, 'Várzea', 'Serra Talhada', 'PE', '2025-10-28 12:32:12'),
(313, 'MICROMED', 'MICROMED BIOTECNOLOGIA S.A.', '38048013000103', '71070503', 'R R 03, LOTE 15 E 17, 0', NULL, NULL, 'GUARA II', 'Brasília', 'DF', '2025-10-28 12:32:12'),
(314, 'FF CIRURGIA, GESTAO E EDUCACAO', 'FF CIRURGIA, GESTAO E EDUCACAO LTDA', '49800168000170', '50070465', 'R Frei Matias Tévis, 285', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:32:12'),
(315, 'CLINIC+', 'CLINIC+ SERVICOS MEDICOS E DIAGNOSTICO EM SAUDE EIRELI', '32504927000155', '52011050', 'R Amélia, 430', NULL, NULL, 'Graças', 'Recife', 'PE', '2025-10-28 12:32:12'),
(316, 'CLINICA OITAVA ROSADO', 'CLINICA OITAVA ROSADO LTDA', '40996860000141', '59600155', 'R Juvenal Lamartine, 119', NULL, NULL, 'Centro', 'Mossoró', 'RN', '2025-10-28 12:32:12'),
(317, 'FUNPEC', 'FUNDACAO NORTE RIO GRANDENSE DE PESQUISA E CULTURA', '08469280000193', '59078970', 'R SENADOR SALGADO FILHO, 3000', NULL, NULL, 'LAGOA NOVA', 'Natal', 'RN', '2025-10-28 12:32:12'),
(318, 'SEOPE - SERVICO OFTALMOLOGICO DE PERNAMB', 'SEOPE - SERVICO OFTALMOLOGICO DE PERNAMBUCO LTDA', '35470574000108', '50070080', 'R R ANTONIO GOMES DE FREITAS, 191', NULL, NULL, 'ILHA DO LEITE', 'Recife', 'PE', '2025-10-28 12:32:12'),
(319, 'UNIMED JOAO PESSOA COOPERATIVA DE TRABALHO MEDICO', 'UNIMED JOAO PESSOA COOPERATIVA DE TRABALHO MEDICO', '08680639000681', '58073020', 'R Estevão Gerson Carneiro da Cunha, 145', NULL, NULL, 'Água Fria', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(320, 'HOSPITAL CENTRAL NOSSA SENHORA APARECIDA', 'SOCIEDADE BENEFICENTE SANTA TEREZINHA (HOSP NOSSA SENH APAR)', '09032632000101', '53403740', 'AV Rodolfo Aureliano, 976', NULL, NULL, 'Vila Torres Galvão', 'Paulista', 'PE', '2025-10-28 12:32:12'),
(321, 'HOSPITAL PORTUGUES', 'REAL HOSPITAL PORTUGUES DE BENEFICENCIA EM PERNAMBUCO', '10892164000124', '52010902', 'AV Governador Agamenon Magalhães, 4760', NULL, NULL, 'PAISSANDU', 'Recife', 'PE', '2025-10-28 12:32:12'),
(322, 'HOSPITAL DO TRICENTENARIO-MESTRE VITALINO', 'HOSPITAL DO TRICENTENARIO (MESTRE VITALINO)', '10583920000800', '55015901', 'R ROD BR 104, 756', NULL, NULL, 'LUIZ GONZAGA', 'Caruaru', 'PE', '2025-10-28 12:32:12'),
(323, 'HAPVIDA CONVENIO', 'HAPVIDA ASSISTENCIA MEDICA S.A. (CONVENIO)', '63554067000198', '60140061', 'AV Heraclito Graça, 406', NULL, NULL, 'Centro', 'Fortaleza', 'CE', '2025-10-28 12:32:12'),
(324, 'UNIMED MACEIO', 'UNIMED MACEIO COOPERATIVA DE TRABALHO MEDICO', '12442737000143', '57057450', 'AV Fernandes Lima, 3113', NULL, NULL, 'Pinheiro', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(325, 'GEAP SAUDE PB', 'GEAP AUTOGESTAO EM SAUDE (PB)', '03658432001316', '58020500', 'R Deputado Odon Bezerra, 184', NULL, NULL, 'Tambiá', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(326, 'GEAP SAUDE AL', 'GEAP AUTOGESTAO EM SAUDE (AL)', '03658432000263', '57022187', 'R Doutor Antônio Pedro de Mendonça, 307', NULL, NULL, 'Pajucara', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(327, 'GEAP SAUDE PE', 'GEAP AUTOGESTAO EM SAUDE (PE)', '03658432001588', '50060004', 'AV Conde da Boa Vista, 1410', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(328, 'UNIMED RECIFE III', 'UNIMED RECIFE COOPERATIVA DE TRABALHO MEDICO III', '11214624001957', '50070475', 'R José de Alencar, 770', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:32:12'),
(329, 'AMIL', 'AMIL ASSISTENCIA MEDICA INTERNACIONAL S.A.', '29309127016768', '53130240', 'AV MINISTRO MARCOS FREIRE, 1416', NULL, NULL, 'BAIRRO NOVO', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(330, 'CASSI RECIFE', 'CAIXA DE ASSISTENCIA DOS FUNC DO BANC DO BR (CASSI)', '33719485000801', '52050020', 'AV Conselheiro Rosa e Silva, 1460', NULL, NULL, 'Tamarineira', 'Recife', 'PE', '2025-10-28 12:32:12'),
(331, 'HOSPITAL VEREDAS', 'FUNDACAO HOSPITAL DA AGRO INDUSTRIA DO ACUCAR E DO ALCOOL DE', '12291290000159', '57055000', 'AV Fernandes Lima, 0', NULL, NULL, 'Farol', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(332, 'ABBOTT LABORAT. DO BRASIL LTDA', 'ABBOTT LABORAT. DO BRASIL LTDA', '56998701000116', '04566905', 'R Michigan, 735', NULL, NULL, 'Cidade Monções', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(333, 'CHS - JOAO PAULO II', 'ASSOCIAÇAO BENEFICENTE JOAO PAULO II', '22564221000125', '55560000', 'ROD ROD PE 60  KM 72.5, 0', NULL, NULL, 'CENTRO', 'Barreiros', 'PE', '2025-10-28 12:32:12'),
(334, 'CONFIARE SAUDE ASSISTENCIA DOMICILIAR LT', 'CONFIARE SAUDE ASSISTENCIA DOMICILIAR LTDA', '09625647000264', '52051380', 'EST do Arraial, 3107', NULL, NULL, 'Tamarineira', 'Recife', 'PE', '2025-10-28 12:32:12'),
(335, 'INSTITUTO ONCOLOGICO DE PERNAMBUCO LTDA', 'INSTITUTO ONCOLOGICO DE PERNAMBUCO LTDA', '09217269000107', '50070480', 'R Antônio Gomes de Freitas, 0', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:32:12'),
(336, 'MAIS VIDA', 'MAIS VIDA SERVICOS DE SAUDE LTDA', '13097538000108', '52011040', 'AV Rui Barbosa, 829', NULL, NULL, 'Graças', 'Recife', 'PE', '2025-10-28 12:32:12'),
(337, 'MICROMEDICAL', 'MICROMEDICAL', '07326871000220', '01331010', 'R Sílvia, 110', NULL, NULL, 'Bela Vista', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(338, 'NEOH MEMORIAL NUCLEO ESPECIALIZADO EM ONCOLOGIA E HEMATOLO', 'NEOH MEMORIAL NUCLEO ESPECIALIZADO EM ONCOLOGIA E HEMATOLO', '08921588000128', '50070170', 'R das Fronteiras, 175', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(339, 'SECRETARIA DE SAUDE DE CARUARU', 'FUNDO MUNICIPAL DE SAUDE', '11371082000105', '55000000', 'R RUA MARTIN AFONSO., 654', NULL, NULL, 'SAO FRANCISCO', NULL, NULL, '2025-10-28 12:32:12'),
(340, 'ST.JUDE MEDICAL', 'ST.JUDE MEDICAL BRASIL LTDA', '00986846000142', '01332000', 'R Itapeva, 538', NULL, NULL, 'Bela Vista', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(341, 'SR', 'SR PRODUTOS MEDICOS LTDA', '10757876000130', '58040090', 'AV General Bento da Gama, 580', NULL, NULL, 'Torre', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(342, 'TECSAUDE', 'TECSAUDE HOSPITALAR LTDA.', '10783305000170', '54400220', 'R Sílvia Ferreira, 0', NULL, NULL, 'Piedade', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:12'),
(343, 'OPMEMED', 'OPMEMED COMERCIO DE MATERIAL HOSPITALAR LTDA', '20098683000179', '59020200', 'AV Rodrigues Alves, 930', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:32:12'),
(344, 'HOSPITAL DOS SERVIDORES PERNAMBUCO', 'INSTITUTO DE RECURSOS HUMANOS DE PERNAMBUCO - IRH-PE', '11944899000117', '50070140', 'R Henrique Dias, SN', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(345, 'HOSPITAL DO CANCER DE PERNAMBUCO', 'SOCIEDADE PERNAMBUCANA DE COMBRATE AO CANCER', '10894988000133', '50040000', 'AV CRUZ CABUGA, 1597', NULL, NULL, 'SANTO AMARO', 'Recife', 'PE', '2025-10-28 12:32:12'),
(346, 'HOSPITAL UNIVERSITARIO OSWALDO CRUZ', 'FUNDACAO UNIVERSITARIA DE PERNAMBUCO', '11022597001325', '50100130', 'R ARNOBIO MARQUES, 310', NULL, NULL, 'SANTO AMARO', 'Recife', 'PE', '2025-10-28 12:32:12'),
(347, 'HOSPITAL DAS CLINICAS DA UFPE', 'EMPRESA BRASILEIRA DE SERVICOS HOSPITALARES - EBSERH', '15126437001620', '50740465', 'AV PROFESSOR MORAES REGO, 00', NULL, NULL, 'CIDADE UNIVERSITARIA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(348, 'PE SEC GABINETE DO SECRETARIO', 'SECRETARIA DE SAUDE', '10572048000128', '50050000', 'R DA AURORA, 00', NULL, NULL, 'BOA VISTA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(349, 'HOSPITAL UNIVERSITARIO ALCIDES CARNEIRO/UFCG', 'UNIVERSIDADE FEDERAL DE CAMPINA GRANDE', '05055128000257', '58107670', 'R CARLOS CHAGAS, 00', NULL, NULL, 'SAO JOSE', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(350, 'COMPESAPREV', 'FUNDACAO COMPESA DE PREVIDENCIA E ASSISTENCIA', '12585261000108', '52030180', 'R R AUGUSTO RODRIGUES, 60', NULL, NULL, 'TORREAO', 'Recife', 'PE', '2025-10-28 12:32:12'),
(351, 'COQUEIRAL PARK', 'COQUEIRAL EMPREENDIMENTOS RURAIS LTDA', '05316276000105', '53370355', 'R R LIGIA GOMES, 1600', NULL, NULL, 'OURO PRETO', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(352, 'HOSPITAL ANTONIO TARGINO', 'HOSPITAL ANTONIO TARGINO LTDA', '08834137000153', '58428016', 'R Delmiro Gouveia, 442', NULL, NULL, 'Centenário', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(353, 'HOSPITAL MEMORIAL JABOATAO', 'INSTITUTO ALCIDES D ANDRADE LIMA - HOSP. MEMORIAL JABOATAO', '10072296000371', '54160000', 'AV General Manoel Rabelo, 126', NULL, NULL, 'Engenho Velho', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:12'),
(354, 'VITALCOR', 'VITALCOR COMERCIO E REPRESENTACOES EIRELI', '04480088000147', '50070070', 'R Dom Bosco, 0', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(355, 'LAPRAZMAIS DIAGNOSTICOS', 'LAPRAZMAIS DIAGNOSTICOS E ANALISES CLINICAS LTDA', '11181344000160', '54335160', 'R Doutor Luíz Regueira, 0', NULL, NULL, 'Prazeres', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:12'),
(356, 'UNICORDS', 'UNICORDS - UNIDADE CARDIOLOGICA DO SERIDO SOCIEDADE SIMPLES', '70338884000174', '59300000', 'AV AV CORONEL MARTINIANO, 0', NULL, NULL, 'CENTRO', 'Caicó', 'RN', '2025-10-28 12:32:12'),
(357, 'CLINICAL CENTER IMAGEM 2', 'CENTER CLINICAL IMAGEM PNZ II LTDA', '42379384000145', '56330095', 'AV São Francisco, 220', NULL, NULL, 'Areia Branca', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(358, 'MP COMERCIO DE PRODUTOS MEDICOS LTDA', 'MP COMERCIO DE PRODUTOS MEDICOS LTDA', '65831943000101', '01401000', 'AV Brigadeiro Luís Antônio, 0', NULL, NULL, 'Jardim Paulista', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(359, 'GIGAVIDA TECNOLOGIA E SERVICO HOSPITALAR LTDA', 'GIGAVIDA TECNOLOGIA E SERVICO HOSPITALAR LTDA', '15558946000145', '50830220', 'R SANTA EDWIRGES', '182', NULL, 'Bongi', 'Recife', 'PE', '2025-10-28 12:32:12'),
(360, 'SUL AMERICA', 'SUL AMERICA COMPANHIA DE SEGURO SAUDE', '01685053000822', '51020280', 'R Padre Carapuceiro, 733', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:32:12'),
(361, 'CENTRAL NACIONANL UNIMED', 'UNIMED NACIONAL - COOPERATIVA CENTRAL', '02812468000106', '01307003', 'R Frei Caneca, 1355', NULL, NULL, 'Consolação', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(362, 'SMILE', 'ESMALE ASSISTENCIA INTERNACIONAL DE SAUDE LTDA (SMILE)', '37135365000133', '57025100', 'R Doutor José Milton Correia, 110', NULL, NULL, 'Poço', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(363, 'FGH', 'FUNDACAO GESTAO HOSPITALAR MARTINIANO FERNANDES - FGH', '09039744000194', '50070615', 'R dos Coelhos, 450', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(364, 'HOSPITAL ALBERTO URQUIZA WANDERLEY', 'UNIMED JOAO PESSOA COOPER DE TRAB MED (ALERTO URQUIZA)', '08680639000339', '58040300', 'AV Ministro José Américo de Almeida, 1450', NULL, NULL, 'Torre', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(365, 'UNIMED-RIO', 'UNIMED-RIO COOPERATIVA DE TRABALHO MEDICO DO RIO DE JANEIRO', '42163881000101', '22775003', 'AV Ayrton Senna, 2500', NULL, NULL, 'Barra da Tijuca', 'Rio de Janeiro', 'RJ', '2025-10-28 12:32:12'),
(366, 'HOSPITAL DE OLHOS SANTA LUZIA', 'HOSPITAL DE OLHOS SANTA LUZIA LTDA', '41044009000181', '52070000', 'EST do Encanamento, 873', NULL, NULL, 'Casa Forte', 'Recife', 'PE', '2025-10-28 12:32:12'),
(367, 'HOSPITAL MEMORIAL SAO JOSE', 'REDE D\'OR SAO LUIZ S.A. (HOSP MEMORIAL SAO JOSE)', '06047087009276', '50050290', 'AV Governador Agamenon Magalhães, 2291', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(368, 'RECIPREV SAUDE RECIFE', 'AUTARQUIA MUNICIPAL DE PREVIDENCIA E ASSISTENCIA A SAUDE DOS', '05244336000113', '50070000', 'AV Manoel Borba, 488', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(369, 'BANCO SANTANDER (BRASIL) S.A.', 'BANCO SANTANDER (BRASIL) S.A.', '90400888000142', '52011040', 'AV Rui Barbosa, 0', NULL, NULL, 'Graças', 'Recife', 'PE', '2025-10-28 12:32:12'),
(370, 'MIXRE', 'MIX REAL ESTATE LTDA', '35993548000164', '52061512', 'R Dona Rita de Souza, 0', NULL, NULL, 'Casa Forte', 'Recife', 'PE', '2025-10-28 12:32:12'),
(371, 'UNIMED', 'UNIMED JOAO PESSOA COOPERATIVA DE TRABALHO MEDICO', '08680639000177', '58040140', 'AV Marechal Deodoro da Fonseca, 420', NULL, NULL, 'Torre', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(372, 'HOSPITAL PORTUGUES', 'REAL HOSPITAL PORTUGUES DE BENEFICENCIA EM PERNAMBUCO', '10892164000205', '51020020', 'AV Conselheiro Aguiar, 0', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:32:12'),
(373, 'HOSPITAL E MATERNIDADE SANTA MARIA', 'INSTITUTO SOCIAL DAS MEDIANEIRAS DA PAZ', '10739225000118', '56280000', 'R R VEREADOR JOSE BARRETO DE ALENCAR, 450', NULL, NULL, 'CENTRO', 'Araripina', 'PE', '2025-10-28 12:32:12'),
(374, 'CLINICA CLINICAL CENTER IPUBI LTDA', 'CLINICA CLINICAL CENTER IPUBI LTDA', '27764714000122', '56260000', 'R PRINCESA IZABEL, 10', NULL, NULL, 'CENTRO', 'Ipubi', 'PE', '2025-10-28 12:32:12'),
(375, 'DIRETORIA DE APOIO ADMINISTRATIVO AO SISTEMA DE SAUDE', 'DIRETORIA  DE APOIO ADMINISTRATIVO AO SISTEMA DE SAUDE-DASIS', '11339827000140', '52010140', 'PCA do Derby, 00', NULL, NULL, 'Derby', 'Recife', 'PE', '2025-10-28 12:32:12'),
(376, 'UNIMED PALMEIRA DOS INDIOS', 'UNIMED PALMEIRA DOS INDIOS COOPERATIVA DE TRABALHO MEDICO', '41191677000131', '57601100', 'AV Vieira de Brito, 80 A', NULL, NULL, 'São Cristóvão', 'Palmeira dos Índios', 'AL', '2025-10-28 12:32:12'),
(377, 'SASSEPE SIST DE ASSIST A SAUDE DOS SERVIDORES DE PE', 'INSTITUTO DE RECURSOS HUMANOS DE PERNAMBUCO - IRH-PE', '11944899000206', '50070140', 'R Henrique Dias, 00', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(378, 'HOSPITAL RIO GRANDE', 'NATAL HOSPITAL CENTER S.A.', '02109397000180', '59020100', 'AV AFONSO PENA, 754', NULL, NULL, 'TIROL', 'Natal', 'RN', '2025-10-28 12:32:12'),
(379, 'SAUDE', 'SECRETARIA DE ESTADO DA SAUDE - SES', '08778268000160', '58040440', 'AV Dom Pedro II, 1826', NULL, NULL, 'Torre', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(380, 'HOSPITAL UNIVERSITARIO ONOFRE LOPES', 'EMPRESA BRASILEIRA DE SERVICOS HOSPITALARES - EBSERH', '15126437000739', '59012300', 'AV  AV NILO PECANHA, 620', NULL, NULL, 'PETROPOLIS', 'Natal', 'RN', '2025-10-28 12:32:12'),
(381, 'UPE - CAMPUS GARANHUNS', 'FUNDACAO UNIVERSIDADE DE PERNAMBUCO', '11022597000787', '55295110', 'R Capitão Pedro Rodrigues, 105', NULL, NULL, 'São José', 'Garanhuns', 'PE', '2025-10-28 12:32:12'),
(382, 'HOSP WALFREDO GUEDES', 'INSTITUTO WALFREDO GUEDES PEREIRA', '09124165000140', '58013522', 'AV João Machado, 1234', NULL, NULL, 'Centro', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(383, 'HOSPITAL ILHA DO LEITE', 'ULTRA SOM SERVICOS MEDICOS S.A', '12361267000940', '50070435', 'R Doutor João Asfora, 35', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:32:12'),
(384, 'HOSPITAL MEMORIAL GUARARAPES', 'INSTITUTO ALCIDES D\' ANDRADE LIMA - HOSP. MEMORIAL GUARARAPE', '10072296000452', '54335160', 'R Doutor Luíz Regueira, 774', NULL, NULL, 'Prazeres', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:12'),
(385, 'ALMIR BARBOSA DOS SANTOS', 'ALMIR BARBOSA DOS SANTOS', '24900545000112', '55014330', 'R Saldanha Marinho, 945', NULL, NULL, 'Maurício de Nassau', 'Caruaru', 'PE', '2025-10-28 12:32:12'),
(386, 'SANTA CRUZ DIAGNOSTICO POR IMAGEM LTDA', 'SANTA CRUZ DIAGNOSTICO POR IMAGEM LTDA', '23428487000103', '55194321', 'R Maestro Alexandre, 117', NULL, NULL, 'Nova Santa Cruz', 'Santa Cruz do Capibaribe', 'PE', '2025-10-28 12:32:12'),
(387, 'FUNDACAO PARAIBANA DE GESTAO EM SAUDE - PB  SAUDE', 'FUNDACAO PARAIBANA DE GESTAO EM SAUDE - PB  SAUDE', '38111778000140', '58030040', 'AV São Paulo, 104', NULL, NULL, 'Estados', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(388, 'TECME DO BRASIL COMERCIO E IMPORTACAO LTDA.', 'TECME DO BRASIL COMERCIO E IMPORTACAO LTDA.', '31829598000150', '01451000', 'AVE AVENIDA BRIG FARIA LIMA, 2954', NULL, NULL, 'JARDIM PAULISTANO', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(389, 'GRUPAMENTO DE ATENDIMENTO PRE-HOSPITALAR - GBAPH/CBMPE', 'CORPO DE BOMBEIROS MILITAR DE PERNAMBUCO', '00358773000730', '53010120', 'AV Presidente Kennedy, 145', NULL, NULL, 'Santa Tereza', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(390, 'CAMED', 'CAMED CONSULTORIA EM SAUDE LTDA', '07966459000193', '60150160', 'AV Santos Dumont, 782', NULL, NULL, 'Centro', 'Fortaleza', 'CE', '2025-10-28 12:32:12'),
(391, 'PRODIGIO ACADEMIA', 'PRODIGIO ACADEMIA ESTACAO DO ESPORTE LTDA', '00753912000215', '58039111', 'R Nossa Senhora dos Navegantes, 1060', NULL, NULL, 'Tambaú', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(392, 'HOSPITAL DO VALE', 'INSTITUTO VALE DO CAPIBARIBE DE INOVACOES EM EDUCACAO E SAUD', '19289494000102', '55700000', 'R SEVERINO VASCONCELOS ARAGAO, 117', NULL, NULL, 'JOSE FERNANDES SALSA', 'Limoeiro', 'PE', '2025-10-28 12:32:12'),
(393, 'INTERNE HOME CARE', 'INTERNE - HOME CARE LTDA.', '01909745000130', '50070335', 'R Marques Amorim, 356', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(394, 'CLIONCOL', 'CLINICO ONCOLOGICO DRA DALVA ARNAUD S/S LT', '00508745000166', '58040170', 'R Clemente Rosas, 360', NULL, NULL, 'Torre', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(395, 'REMA PRODUTOS PARA SAUDE', 'B.P.D SERVICOS E COMERCIO DE MATERIAL MEDICO, HOSPITALAR E L', '33872786000196', '58410340', 'R Vigário Calixto, 150', NULL, NULL, 'Catolé', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(396, 'HOSPITAL DE ENSINO DR WASHINGTON ANTONIO DE BARROS', 'FUNDACAO UNIVERSIDADE FEDERAL DO VALE DO SAO FRANCISCO', '05440725000203', '56304205', 'AV José de Sá Maniçoba, 00', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(397, 'HOSPITAL UNIMED', 'UNIMED CHAPECO-COOPERATIVA DE TRAB MED DA REGIAO OESTE CATA', '85283299000272', '89802130', 'AV Porto Alegre - D, 132D', NULL, NULL, 'Centro', 'Chapecó', 'SC', '2025-10-28 12:32:12'),
(398, 'PROCARDIO CLINICA CARDIOLOGICA LTDA', 'PROCARDIO CLINICA CARDIOLOGICA LTDA', '12643375000159', '59054180', 'AV Nascimento de Castro, 1930', NULL, NULL, 'Dix-Sept Rosado', 'Natal', 'RN', '2025-10-28 12:32:12'),
(399, 'UNIMED METROPOLITANA DO AGRESTE', 'UNIMED METROPOLITANA DO AGRESTE COOPERATIVA DE TRABALHO MEDI', '35642768000143', '57305610', 'R Miguel Tertuliano da Silva, 579', NULL, NULL, 'Zélia Barbosa Rocha', 'Arapiraca', 'AL', '2025-10-28 12:32:12'),
(400, 'CASA DE SAUDE SANTA EFIGENIA', 'CASA DE SAUDE SANTA EFIGENIA LTDA', '11403094000166', '55014020', 'R Gonçalo Coelho, 40', NULL, NULL, 'Maurício de Nassau', 'Caruaru', 'PE', '2025-10-28 12:32:12'),
(401, 'UNIMED RECIFE COOPERATIVA DE TRABALHO MEDICO', 'UNIMED RECIFE COOPERATIVA DE TRABALHO MEDICO', '11214624000470', '50070230', 'AVE AVENIDA LINS PETIT, 35', NULL, NULL, 'BOA VISTA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(402, 'KOLPLAST C I S.A.', 'KOLPLAST C I S.A.', '59231530000193', '13299364', 'EST Municipal Benedito de Souza, 418', NULL, NULL, 'Mina', 'Itupeva', 'SP', '2025-10-28 12:32:12'),
(403, 'ANGIOCENTER', 'INST. RONDONIENSE DE CARDIOLOGIA E  NEUROLOGIA  INT. E CIRUR', '09608791000101', '76804024', 'R Rafael Vaz e Silva, 1852', NULL, NULL, 'São Cristóvão', 'Porto Velho', 'RO', '2025-10-28 12:32:12'),
(404, 'BANCO SAFRA S A', 'BANCO SAFRA S A', '58160789000128', '01310930', 'AV Paulista, 2100', NULL, NULL, 'Bela Vista', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(405, 'PRO-FE', 'PRO-FE EMPREENDIMENTOS AGROPASTORIL SA', '04706576000120', '58297000', 'FAZ MANIBU II SN, 00', NULL, NULL, 'ZONA RURAL', 'Rio Tinto', 'PB', '2025-10-28 12:32:12'),
(406, 'HOSPITAL DA RESTAURACAO', 'SECRETARIA DE SAUDE (HOSP. DA RESTAURACAO)', '10572048000209', '52010040', 'AV Governador Agamenon Magalhães, s/n', NULL, NULL, 'Derby', 'Recife', 'PE', '2025-10-28 12:32:12'),
(407, 'SAINT GOBAIN', 'SAINT-GOBAIN DO BRASIL PRODUTOS INDUSTRIAIS E PARA CONSTRUCA', '61064838000567', '50740080', 'AVE AVENIDA BARAO DE BONITO, 1190', NULL, NULL, 'VARZEA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(408, 'BRF S.A.', 'BRF S.A.', '01838723034617', '55613900', 'ROD PE-050, 0', NULL, NULL, 'Distrito Industrial (Prefeito José Augusto Ferrer de Morais)', 'Vitória de Santo Antão', 'PE', '2025-10-28 12:32:12'),
(409, 'CENTRO INTEGRADO DE CARDIOLOGIA - CINC', 'CENTRO INTEGRADO DE CARDIOLOGIA - CINC LTDA', '28573361000146', '58032090', 'R Antônio Rabelo Júnior, 161', NULL, NULL, 'Miramar', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(410, 'RM SANTA EFIGENIA', 'IMAX DIAGNOSTICO LTDA (RM SANTA EFIGENIA)', '02737471000102', '55014000', 'AV Agamenon Magalhães, 1233', NULL, NULL, 'Maurício de Nassau', 'Caruaru', 'PE', '2025-10-28 12:32:12'),
(411, 'LINET DO BRASIL COMERCIO, IMPORTACAO E EXPORTACAO DE PRODUTO', 'LINET DO BRASIL COMERCIO, IMPORTACAO E EXPORTACAO DE PRODUTO', '16861009000127', '01419001', 'AL Santos, 787', NULL, NULL, 'Cerqueira César', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(412, 'CLINICA DO CORACAO', 'CLINICA DO CORACAO DE GARANHUNS LTDA', '14405213000108', '55293000', 'AV Santo Antônio, 217', NULL, NULL, 'Santo Antônio', 'Garanhuns', 'PE', '2025-10-28 12:32:12'),
(413, 'FERREIRA COSTA', 'FERREIRA COSTA CIA LTDA', '10230480000483', '52051020', 'RUA RUA CONEGO BARATA, 275', NULL, NULL, 'TAMARINEIRA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(414, 'SAO LOURENCO DA MATA GABINETE DO PREFEITO', 'MUNICIPIO DE SAO LOURENCO DA MATA', '11251832000105', '54735565', 'PCA Araújo Sobrinho, 00', NULL, NULL, 'Centro', 'São Lourenço da Mata', 'PE', '2025-10-28 12:32:12'),
(415, 'FRANCISJANE SOUZA DE MELO', 'FRANCISJANE SOUZA DE MELO', '32110906000155', '50050050', 'R do Hospício, 380', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(416, 'NATALCOR LTDA', 'NATALCOR LTDA', '01407085000270', '59140340', 'AV Professor Clementino Câmara, 226', NULL, NULL, 'Boa Esperança', 'Parnamirim', 'RN', '2025-10-28 12:32:12'),
(417, 'BLUEMEDICAL SOLUCOES', 'E C DE ALMEIDA GUEDES SOBRINHO COMERCIO DE PRODUTOS MEDICOS', '06176477000109', '66063425', 'AV José Bonifácio, 1650', NULL, NULL, 'Guamá', 'Belém', 'PA', '2025-10-28 12:32:12'),
(418, 'CENTRO MEDICO AMPLA', 'CENTRO MEDICO AMPLA LTDA', '36109542000144', '59152025', 'R Jabuticabeira, 159', NULL, NULL, 'Nova Parnamirim', 'Parnamirim', 'RN', '2025-10-28 12:32:12'),
(419, 'STBIO ENGENHARIA', 'STBIO SOLUCOES TECNOLOGICAS BIOMEDICAS LTDA', '13565037000109', '42700170', 'AV Santos Dumont, 3092', NULL, NULL, 'Recreio Ipitanga', 'Lauro de Freitas', 'BA', '2025-10-28 12:32:12'),
(420, 'FUNCITERN', 'FUNDACAO PARA O DESENVOLVIMENTO DA CIENCIA TECNOLOGIA E INOV', '21212556000111', '59610030', 'R Machado de Assis, 394', NULL, NULL, 'Centro', 'Mossoró', 'RN', '2025-10-28 12:32:12'),
(421, 'SAUDE PARA TODOS', 'SAUDE PARA TODOS LTDA', '47542609000156', '51350670', 'AV Recife, 2879', NULL, NULL, 'Ipsep', 'Recife', 'PE', '2025-10-28 12:32:12'),
(422, 'TOPIMAGEM', 'TOPIMAGEM - DIAGNOSTICO POR IMAGEM LTDA', '41090192000232', '50070000', 'AV Manoel Borba, 961', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(423, 'CLINICA JAQUES', 'PHARMED LABORATORIO DE ANALISES CLINICAS LTDA', '13145166000148', '56480000', 'R CON FREDERICO, 274', NULL, NULL, 'CENTRO', 'Tacaratu', 'PE', '2025-10-28 12:32:12'),
(424, 'CLINICAL CENTER IMAGEM', 'CENTER CLINICAL IMAGEM LTDA', '42532244000165', '56310180', 'R José Clemente Amorim, 27', NULL, NULL, 'COHAB Massangano', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(425, 'CARDIOVASF- INSTITUTO DO CORACAO DO VALE DO SAO FRANCISCO LT', 'CARDIOVASF- INSTITUTO DO CORACAO DO VALE DO SAO FRANCISCO LT', '09569536000105', '56304010', 'R Pacífico da Luz, 850', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(426, 'XP INVESTIMENTOS CCTVM S/A', 'XP INVESTIMENTOS CORRETORA DE CAMBIO, TITULOS E VALORES MOBI', '02332886000104', '22440032', 'AV Ataulfo de Paiva, 153', NULL, NULL, 'Leblon', 'Rio de Janeiro', 'RJ', '2025-10-28 12:32:12'),
(427, 'SAVEPET LTDA', 'SERVICO DE ATENDIMENTO VETERINARIO ESPECIALIZADO LTDA', '44347460000166', '57048381', 'R Em Projeto C, 258', NULL, NULL, 'Antares', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(428, 'BIODINAMICA', 'BIODINAMICA CENTRO DE SAUDE E QUALIDADE DE VIDA LTDA', '41073594000148', '50070000', 'AV Manoel Borba, 711', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(429, 'ISOMED', 'INSTITUTO DE SAUDE OCUPACIONAL E MEDICINA', '28185950000157', '58013360', 'AV  CAMILO DE HOLANDA, 478', NULL, NULL, 'CENTRO', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(430, 'TRIBUNAL DE CONTAS DO ESTADO DE PERNAMBUCO', 'TRIBUNAL DE CONTAS DO ESTADO DE PERNAMBUCO', '11435633000149', '50050000', 'R da Aurora, 885', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(431, 'HOSPITAL DE AERONAUTICA DE RECIFE', 'COMANDO DA AERONAUTICA', '00394429006494', '54400010', 'AV BEIRA MAR, 606', NULL, NULL, 'PIEDADE', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:12'),
(432, 'HOSPITAL MARIA LUCINDA', 'FUNDACAO MANOEL DA SILVA ALMEIDA', '09767633000102', '52060000', 'AV Parnamirim, 95', NULL, NULL, 'Parnamirim', 'Recife', 'PE', '2025-10-28 12:32:12'),
(433, 'HOSPITAL GERAL DE RECIFE', 'COMAMDO DO EXERCITO', '00394452038763', '50050000', 'R do riachuelo 159 , 259', NULL, NULL, 'recife', 'Recife', 'PE', '2025-10-28 12:32:12'),
(434, 'HOSPITAL BARAO DE LUCENA', 'BARAOZINHO - ASSOC AMIGOS DA CRIANCA E DO ADOLE HOSP BARAO', '05515616000119', '50670000', 'AV Caxangá, 3860', NULL, NULL, 'Iputinga', 'Recife', 'PE', '2025-10-28 12:32:12'),
(435, 'CARDIO GROUP', 'R S DOS SANTOS COMERCIO LTDA', '06204103000150', '50070160', 'AVE AVENIDA GOVERNADOR AGAMENON MAGALHAES, 4779', NULL, NULL, 'ILHA DO LEITE', 'Recife', 'PE', '2025-10-28 12:32:12'),
(436, 'CASA DOS POBRES SAO FRANCISCO DE ASSIS', 'SOCIEDADE DE ASSISTENCIA AOS MENDIGOS DE CARUARU', '10076420000105', '55030903', 'AV LOURIVAL JOSE DA SILVA, 483', NULL, NULL, 'PETROPOLIS', 'Caruaru', 'PE', '2025-10-28 12:32:12'),
(437, 'NORDESTE CORDIS LTDA', 'NORDESTE CORDIS LTDA', '04657412000150', '60135080', 'R J R JOAO BRIGIDO, 01391', NULL, NULL, 'JOAQUIM TAVORA', 'Fortaleza', 'CE', '2025-10-28 12:32:12'),
(438, 'UNIMED CAMPINA GRANDE', 'UNIMED CAMPINA GRANDE COOPERATIVA DE TRABALHO MEDICO LTDA', '08707473000135', '58401393', 'R Clayton Ismael, 40', NULL, NULL, 'Lauritzen', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(439, 'HOSPITAL DA VISAO DE CAMPINA GRANDE', 'HOSPITAL DE OFTALMOLOGIA DE CAMPINA GRANDE LTDA', '13857429000303', '58408027', 'R José Bernardino, 97', NULL, NULL, 'Vila Cabral', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(440, 'CLINICA DR. JOAB DE SOUSA SALES', 'CLINICA MEDICA DR. JOAB DE SOUSA SALES LTDA', '34861838000191', '58900000', 'R BARAO DO RIO BRANCO, SN', NULL, NULL, 'CENTRO', 'Cajazeiras', 'PB', '2025-10-28 12:32:12'),
(441, 'HOSPITAL SAO VICENTE', 'CASA DE SAUDE E MATERNIDADE SAO VICENTE LTDA', '10280543000163', '56912225', 'R Manoel Antônio dos Santos, 603', NULL, NULL, 'Várzea', 'Serra Talhada', 'PE', '2025-10-28 12:32:12'),
(442, 'HOSPITAL SANTA MARTA LTDA', 'HOSPITAL SANTA MARTA LTDA', '35334895000185', '56903490', 'RUA RUA MANOEL PEREIRA DA SILVA, 980', NULL, NULL, 'NOSSA SENHORA DA PENHA', 'Serra Talhada', 'PE', '2025-10-28 12:32:12'),
(443, 'FR REPRESENTACOES E COMERCIO DE PRODUTOS MEDICOS LTDA', 'FR REPRESENTACOES E COMERCIO DE PRODUTOS MEDICOS LTDA', '09005588000140', '50070280', 'RUA RUA JOAQUIM DE BRITO, 240', NULL, NULL, 'BOA VISTA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(444, 'FERREIRA COSTA &  CIA LTDA', 'FERREIRA COSTA &  CIA LTDA', '10230480002427', '58036500', 'RUA RUA EDSON FALCONI DE MELO, 555', NULL, NULL, 'AEROCLUBE', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(445, 'DR. JUNIOR CARRIGAS RESTAURACAO CAPILAR', 'ALIOMAR JOSE CARRIGAS DE OLIVEIRA JUNIOR', '44509188000173', '57020000', 'R do Comércio, S/N', NULL, NULL, 'Centro', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(446, 'WOLF ACADEMIA', 'WOLF ACADEMIA LTDA', '18777808000145', '58085000', 'AV Cruz das Armas, 3042', NULL, NULL, 'Cruz das Armas', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(447, 'ESCOLA AMERICANA DO RECIFE', 'ESCOLA AMERICANA DO RECIFE', '10833408000106', '51030065', 'R Sá e Souza, 408', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:32:12'),
(448, 'FELICITE CHECK UP', 'FELICITE CHECK UP LTDA', '44964588000179', '51021040', 'AV Engenheiro Domingos Ferreira, 3937', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:32:12'),
(449, 'DISTRITO ESTADUAL DE FERNANDO DE NORONHA', 'AUTARQUIA TERRITORIAL DISTRITO ESTADUAL DE FERNANDO DE NORON', '40817926000199', '53990000', 'VL DOS REMEDIOS, SN', NULL, NULL, 'PALACIO SAO MIGUEL', 'Fernando de Noronha', 'PE', '2025-10-28 12:32:12'),
(450, 'SECRETARIA DE SAUDE', 'FUNDO MUNICIPAL DE SAUDE', '09494245000197', '58497000', 'AV CARLOS PESSOA, SN', NULL, NULL, 'CENTRO', 'Umbuzeiro', 'PB', '2025-10-28 12:32:12'),
(451, 'SOCICAM', 'SOCICAM ADMINISTRACAO PROJETOS E REPRESENTACOES LTDA', '43217280005166', '50950030', 'AV Prefeito Antônio Pereira, 705', NULL, NULL, 'Várzea', 'Recife', 'PE', '2025-10-28 12:32:12'),
(452, 'HOSPITAL ESCOLA DA FAP', 'FUNDACAO ASSISTENCIAL DA PARAIBA- FAP', '08841421000157', '58429350', 'R Doutor Francisco Pinto de Oliveira, 0', NULL, NULL, 'Universitário', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(453, 'MAURILIO BELTRAO D ALBUQUERQUE', 'MAURILIO BELTRAO D ALBUQUERQUE CAVALCANTI 03951722410', '26576646000105', '58406020', 'R Arruda Câmara, 641', NULL, NULL, 'Santo Antônio', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(454, 'CLINICA EDGAR VICTOR LTDA', 'CLINICA EDGAR VICTOR LTDA', '02832882000187', '52010010', 'AV Portugal, 163', NULL, NULL, 'Paissandu', 'Recife', 'PE', '2025-10-28 12:32:12'),
(455, 'INSTITUTO DE DIAGNOSTICO JOSE ROCHA DE SA LTDA', 'INSTITUTO DE DIAGNOSTICO JOSE ROCHA DE SA LTDA', '11933822000141', '52010120', 'R Amauri de Medeiros, 53', NULL, NULL, 'DERBY', 'Recife', 'PE', '2025-10-28 12:32:12'),
(456, 'HOSPITAL NOSSA SENHORA DAS GRAÇAS', 'FUNDACAO GESTAO HOSPITALAR MARTINIANO FERNANDES-FGH', '10988301000803', '51030020', 'R Visconde de Jequitinhonha, 1144', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:32:12'),
(457, 'CLINICA MICHELON', 'CLINICA MICHELON LTDA', '51534020000183', '58046090', 'R Poeta Targino Teixeira, 251', NULL, NULL, 'Altiplano Cabo Branco', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(459, 'CENTRO HOSPITALAR ALBERT SABIN S/A', 'CENTRO HOSPITALAR ALBERT SABIN S/A', '09866294000103', '50070460', 'RUA RUA SENADOR JOSE HENRIQUE, 141', NULL, NULL, 'ILHA DO LEITE', 'Recife', 'PE', '2025-10-28 12:32:12'),
(460, 'HAPCLINICA ALECRIM', 'HAPVIDA ASSISTENCIA MEDICA S.A.', '63554067017082', '59022150', 'R Presidente Quaresma, 967', NULL, NULL, 'Lagoa Seca', 'Natal', 'RN', '2025-10-28 12:32:12'),
(461, 'CONDOMINIO VILA DOS CORAIS', 'CONDOMINIO VILA DOS CORAIS', '17666480000127', '54522125', 'R dos Sapotis, S/N', NULL, NULL, 'Paiva', 'Cabo de Santo Agostinho', 'PE', '2025-10-28 12:32:12'),
(462, 'FUNDO MUNICIPAL DE SAUDE CAICO RN', 'FUNDO MUNICIPAL DE SAUDE DE CAICO - RN', '12433830000191', '59300000', 'R  HOMERO ALVES, 0', NULL, NULL, 'VILA DO PRINCIPE', 'Caicó', 'RN', '2025-10-28 12:32:12'),
(463, 'TEREZA E ESDRAS LTDA', 'TEREZA E ESDRAS LTDA', '23148445000119', '56000000', 'AV AGAMENON MAGALHAES, 692', NULL, NULL, 'SANTO ANTONIO', 'Salgueiro', 'PE', '2025-10-28 12:32:12'),
(464, 'CENTRO DE SAUDE NOVA ESPERANCA', 'ESCOLA DE ENFERMAGEM NOVA ESPERANCA LTDA', '02949141001071', '58067695', 'AV Frei Galvão, 12', NULL, NULL, 'Gramame', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(465, 'HOSPITAL MEMORIAL ARCOVERDE LTDA', 'HOSPITAL MEMORIAL ARCOVERDE LTDA', '70237227000130', '56512000', 'AVE AVENIDA JOSE BONIFACIO, 1121', NULL, NULL, 'SAO CRISTOVAO', 'Arcoverde', 'PE', '2025-10-28 12:32:12'),
(466, 'REDE EVA EM SAUDE', 'REDE EVA EM SAUDE LTDA', '42890684000194', '54789000', 'EST de Aldeia, 10204', NULL, NULL, 'Aldeia dos Camarás', 'Camaragibe', 'PE', '2025-10-28 12:32:12'),
(467, 'CLINAP', 'CLINAP CLINICA DE ATENDIMENTO POPULAR LTDA', '21988481000165', '56304340', 'R Castro Alves, 20', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(468, 'HOSPITAL DE ORTOPEDIA E FRATURAS LTDA', 'HOSPITAL DE ORTOPEDIA E FRATURAS LTDA', '09432196000168', '52050000', 'AVE AVENIDA RUI BARBOSA, 1541', NULL, NULL, 'GRACAS', 'Recife', 'PE', '2025-10-28 12:32:12'),
(469, 'CENTRO HOSPITALAR MENINO JESUS (CHMJ)', 'CENTRO HOSPITALAR MENINO JESUS (CHMJ)', '10623536000117', '55540000', 'R DR COSTA LIMA, 146', NULL, NULL, 'CENTRO', 'Palmares', 'PE', '2025-10-28 12:32:12'),
(470, 'ACHE LABORATORIOS FARMACEUTICOS SA', 'ACHE LABORATORIOS FARMACEUTICOS SA', '60659463003026', '54590000', 'ROD RODOVIA PE-009, 5601', NULL, NULL, 'ZONA INDUSTRIAL DE SUAPE', 'Cabo de Santo Agostinho', 'PE', '2025-10-28 12:32:12'),
(471, 'IMA - INSTITUTO MEDICO AMENO LTDA', 'IMA - INSTITUTO MEDICO AMENO LTDA', '35993454000195', '59300000', 'R TEREZINHA LEITE , 1183', NULL, NULL, 'PENEDO', 'Caicó', 'RN', '2025-10-28 12:32:12'),
(472, 'POLICLINICA MED SAUDE', 'DR MENDONCA SERVICOS MEDICOS LTDA', '37010056000137', '58040440', 'AV Dom Pedro II, 1270', NULL, NULL, 'Torre', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(473, 'OTORRINOS RECIFE LTDA', 'OTORRINOS RECIFE LTDA', '01343804000156', '50070410', 'R Jornalista Trajano Chacon, 305', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:32:12'),
(474, 'MILLENIUM LICITACOES', 'MILLENIUM LICITACOES LTDA', '41467016000196', '51240040', 'RUA RUA RIO XINGU, 305', NULL, NULL, 'IBURA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(475, 'CLINICA NEFROLOGICA', 'CLINICA NEFROLOGICA DE ARCOVERDE LTDA', '04291667000141', '56503625', 'R Zélia Barbosa de Siqueira, 90', NULL, NULL, 'São Cristóvão', 'Arcoverde', 'PE', '2025-10-28 12:32:12'),
(476, 'HOSPITAL DO TRICENTENARIO (Olinda)', 'HOSPITAL DO TRICENTENARIO', '10583920000133', '53120420', 'R Farias Neves Sobrinho, 232', NULL, NULL, 'Bairro Novo', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(477, 'HOSPITAL DECOS', 'DECOS HOSPITAL LTDA', '30131145000192', '49035100', 'AV Mario Jorge Menezes Vieira, 2477', NULL, NULL, 'Coroa do Meio', 'Aracaju', 'SE', '2025-10-28 12:32:12'),
(478, 'UPAE CARPINA', 'FUNDACAO GESTAO HOSPITALAR MARTINIANO FERNANDES - FGH', '09039744002480', '55819317', 'ROD BR-408, 00', NULL, NULL, 'Bairro Novo', 'Carpina', 'PE', '2025-10-28 12:32:12'),
(479, 'CONDOMINIO DO EDIF. JARDINS DA ILHA', 'CONDOMINIO DO EDIFICIO JARDINS DA ILHA - TORRE JOAO BATISTA', '35170264000178', '50750510', 'AV Prefeito Lima Castro, 300', NULL, NULL, 'Ilha do Retiro', 'Recife', 'PE', '2025-10-28 12:32:12'),
(480, 'SAM MED', 'SAM MED SERVICO DE AMBULANCIA MOVEL LTDA', '33504154000170', '51021330', 'R Ernesto de Paula Santos, 960', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:32:12'),
(481, 'CEHOPE', 'CEHOPE - CENTRO DE HEMATOLOGIA E ONCOLOGIA PEDIATRICO LTDA', '00460833000135', '52010075', 'AV Governador Agamenon Magalhães, 4760', NULL, NULL, 'Paissandu', 'Recife', 'PE', '2025-10-28 12:32:12'),
(482, 'HOSPITAL DA UNIMED EM PETROLINA', 'UNIMED VALE DO SAO FRANCISCO COORP DE TRAB MEDICO', '40853020000987', '56328010', 'AV da Integração Airton Sena, 00', NULL, NULL, 'Vila Eduardo', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(483, 'LRM COMERCIO E SERVICO DE CALIBRACAO LTDA', 'LRM COMERCIO E SERVICO DE CALIBRACAO LTDA', '31590814000157', '03361000', 'AVE AVENIDA JOAO XXIII, 526', NULL, NULL, 'VILA FORMOSA', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(484, 'DISCOMED COMERCIO DE PRODUTOS HOSPITALARES LTDA', 'DISCOMED COMERCIO DE PRODUTOS HOSPITALARES LTDA', '00417145000192', '90620170', 'R São Luís, 1064', NULL, NULL, 'Santana', 'Porto Alegre', 'RS', '2025-10-28 12:32:12'),
(485, 'SECRETARIA MUNICIPAL DE SAUDE', 'SECRETARIA MUNICIPAL DE SAUDE', '00204125000133', '57020250', 'R Dias Cabral, 569', NULL, NULL, 'Centro', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(486, 'INFUSOMED', 'ELFMEDICAL COMERCIO E LOCAÇÃO DE EQUIPAMENTOS MEDICOS E SERV', '12146722000138', '05042001', 'R Clélia, 2145', NULL, NULL, 'Água Branca', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(487, 'SUPRI VALE', 'SUPRI VALE PRODUTOS MEDICOS E ORTOPEDICOS LTDA', '07914775000111', '56304320', 'AV Januário Alves, 23', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(488, 'SANTA CASA DE MISERICORDIA DE SÃO MIGUEL DOS CAMPOS', 'SANTA CASA DE MISERICORDIA DE SÃO MIGUEL DOS CAMPOS', '12737680000100', '57241234', 'R José Inácio, 43', NULL, NULL, 'Lourdes', 'São Miguel dos Campos', 'AL', '2025-10-28 12:32:12'),
(489, 'CLINICA VIDA E SAUDE', 'CLINICA VIDA E SAUDE LTDA', '21823379000100', '55813620', 'R José Azevedo Guerra, 79', NULL, NULL, 'Cajá', 'Carpina', 'PE', '2025-10-28 12:32:12'),
(490, 'G+ ACADEMIA', 'G MAIS ACADEMIAS LTDA', '26354158000153', '58027140', 'R Sérgio Meira, 353', NULL, NULL, 'Mandacaru', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(491, 'ACHÉ LABORATÓRIOS FARMACÊUTICOS S/A', 'ACHÉ LABORATÓRIOS FARMACÊUTICOS S/A', '60659463000191', '07034010', 'ROD RODOVIA PRESIDENTE DUTRA, 00000', NULL, NULL, 'PORTO DA IGREJA', 'Guarulhos', 'SP', '2025-10-28 12:32:12'),
(492, 'V S COSTA &  CIA LTDA', 'V S COSTA &  CIA LTDA', '05286960000183', '86707040', 'RUA RUA FRANCELHO, 69', NULL, NULL, 'VILA NOVA', 'Arapongas', 'PR', '2025-10-28 12:32:12'),
(493, 'CARDIOCLINICA- CLINICA DE CARDIOLOGIA COMPLEMENTAR NAO INVAS', 'CARDIOCLINICA- CLINICA DE CARDIOLOGIA COMPLEMENTAR NAO INVAS', '82439746000160', '80030001', 'AV João Gualberto, 1946', NULL, NULL, 'Juvevê', 'Curitiba', 'PR', '2025-10-28 12:32:12'),
(494, 'FUNDO MUNICIPAL DE SAUDE - REMIGIO - PB', 'FUNDO MUNICIPAL DE SAUDE - REMIGIO - PB', '11376311000176', '58398000', 'R JOSE LAUREANO, 24', NULL, NULL, 'CENTRO', 'Remígio', 'PB', '2025-10-28 12:32:12'),
(495, 'FUNDO MUNICIPAL DE SAUDE TRIUNFO PE', 'FUNDO MUNICIPAL DE SAUDE', '10334957000128', '56870000', 'PCA MINISTRO MARCOS DE BARROS FREIRE, 0000', NULL, NULL, 'CENTRO', 'Triunfo', 'PE', '2025-10-28 12:32:12'),
(496, 'CONDOMINIO DO SHOPPING CENTER GUARARAPES', 'CONDOMINIO DO SHOPPING CENTER GUARARAPES', '41090689000170', '54410100', 'AV Barreto de Menezes, 800', NULL, NULL, 'Piedade', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:12'),
(497, 'MEDSPORT', 'MEDSPORT CENTRO AVANCADO DE DIAGNOSTICO POR IMAGEM LTDA', '20147380000107', '58042040', 'R José Florentino Júnior, 69', NULL, NULL, 'Tambauzinho', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(498, 'DIAGNOSTICO ENDOSCOPICO EXAMES E CONSULTAS LTDA', 'DIAGNOSTICO ENDOSCOPICO EXAMES E CONSULTAS LTDA', '06076097000100', '50070525', 'PCA Miguel de Cervantes, 188', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:32:12'),
(499, 'SECRETARIA MUNICIPAL DE SAUDE', 'SECRETARIA MUNICIPAL DE SAUDE DE PATOS - PB', '08509212000100', '58700259', 'R JOAO SOARES, 167', NULL, NULL, 'JARDIM CALIFORNIA', 'Patos', 'PB', '2025-10-28 12:32:12'),
(500, 'COORDENADORIA GERAL DE ADMINISTRACAO', 'SECRETARIA DE ESTADO DA SAUDE', '46374500025260', '05403000', 'AV Doutor Enéas Carvalho de Aguiar, 188', NULL, NULL, 'Cerqueira César', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(501, 'CASSI CAIXA DE ASSISTENCIA DOS FUNCIONARIOS DO BANCO DO BRAS', 'CASSI CAIXA DE ASSISTENCIA DOS FUNCIONARIOS DO BANCO DO BRAS', '33719485000127', '70610910', 'SIG SIG QD 4 575, 575', NULL, NULL, 'SUDOESTE', 'Brasília', 'DF', '2025-10-28 12:32:12'),
(502, 'ASSOCIACAO DE PROT E ASSIST A MAT E A INFANCIA', 'ASSOCIACAO DE PROT E ASSIST A MAT E A INFANCIA', '07609365000167', '63300000', 'ROD RODOVIA BR 230, s/n', NULL, NULL, 'VIRGILIO DE AGUIAR GURGEL', 'Lavras da Mangabeira', 'CE', '2025-10-28 12:32:12');
INSERT INTO `organizacoes` (`id`, `nome_fantasia`, `razao_social`, `cnpj`, `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `data_criacao`) VALUES
(503, 'HOSPITAL NAPOLEAO LAUREANO', 'FUNDACAO NAPOLEAO LAUREANO', '09112236000194', '58015170', 'AV Capitão José Pessoa, 1140', NULL, NULL, 'Jaguaribe', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(504, 'CLINAP', 'CLINAP CLINICA DE ATENDIMENTO POPULAR LTDA', '21988481000246', '56304020', 'AV Fernando Menezes de Góes, 550', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(505, 'HOSPITAL VIDA', 'HOSPITAL VIDA LTDA', '02476391000140', '57035240', 'R Deputado Eliseu Teixeira, 488', NULL, NULL, 'Ponta Verde', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(506, 'BNB', 'BANCO DO NORDESTE DO BRASIL SA', '07237373000120', '60743902', 'AV Doutor Silas Munguba, 5700', NULL, NULL, 'Passaré', 'Fortaleza', 'CE', '2025-10-28 12:32:12'),
(507, 'HOSPITAL SANTA TERESINHA', 'HOSPITAL SANTA TERESINHA LTDA', '09192486000181', '50670903', 'AV CAXANGA, 4360', NULL, NULL, 'IPUTINGA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(508, 'MEDICOR', 'MEDICOR-CLINICA DE MEDICINA INTERNA E CONDICIONAMENTO FISICO', '24318149000181', '57022183', 'R Epaminondas Gracindo, 124', NULL, NULL, 'Jaraguá', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(509, 'ACADEMIA SMARTFIT ESCOLA DE GINASTICA E DANCA S.A', 'ACADEMIA SMARTFIT ESCOLA DE GINASTICA E DANCA S.A', '07594978049428', '50720252', 'R HEITOR MAIA FILHO, SN', NULL, NULL, 'MADALENA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(510, 'ACADEMIA RBF - REDE BRASIL FIT SERVICOS DE ACADEMIA LTDA', 'ACADEMIA RBF - REDE BRASIL FIT SERVICOS DE ACADEMIA LTDA', '31560245000105', '56328010', 'AV da Integração Airton Sena, 550', NULL, NULL, 'Vila Eduardo', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(511, 'ACADEMIA SMARTFIT ESCOLA DE GINASTICA E DANCA S.A', 'ACADEMIA SMARTFIT ESCOLA DE GINASTICA E DANCA S.A', '07594978044035', '50060001', 'AV Conde da Boa Vista, 770', NULL, NULL, 'Soledade', 'Recife', 'PE', '2025-10-28 12:32:12'),
(512, 'INSTITUTO NEUROCOR', 'INC AGRESTE E SERVICOS MEDICOS LTDA', '48555881000133', '55012600', 'R Nossa Senhora de Fátima, 351', NULL, NULL, 'Maurício de Nassau', 'Caruaru', 'PE', '2025-10-28 12:32:12'),
(513, 'SAFETY MED', 'SAFETYMED ASSESSORIA MEDICA LTDA', '07901782000260', '52071035', 'AV Norte Miguel Arraes de Alencar, 2577', NULL, NULL, 'Alto do Mandu', 'Recife', 'PE', '2025-10-28 12:32:12'),
(514, 'H CASTRO SERVICOS MEDICOS LTDA', 'H CASTRO SERVICOS MEDICOS LTDA', '49787883000110', '62800000', 'R CEL POMPEU, 548', NULL, NULL, 'CENTRO', 'Aracati', 'CE', '2025-10-28 12:32:12'),
(515, 'FUNDACAO ZERBINI (INCOR SÃO PAULO)', 'FUNDACAO ZERBINI(INCOR SÃO PAULO)', '50644053000113', '05403000', 'RUA RUA DR. ENEAS DE CARVALHO AGUIAR, 44', NULL, NULL, 'CERQUEIRA CESAR', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(516, 'CLINAP CLINICA DE ATENDIMENTO POPULAR LTDA', 'CLINAP CLINICA DE ATENDIMENTO POPULAR LTDA', '21988481000327', '56304020', 'AV Fernando Menezes de Góes, 574', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(517, 'CLINICA SAUDE DO VALE', 'CLINICA SAUDE DO VALE LTDA', '53257848000167', '56320590', 'R BOA ESPERANCA, 245', NULL, NULL, 'JOSE E MARIA', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(518, 'HOSPITAL SANTA TEREZINHA', 'SOCIEDADE HOSPITALAR GADELHA DE OLIVEIRA LTDA', '09297961000184', '58805250', 'R José Honório, 000', NULL, NULL, 'Jardim Sorrilândia II', 'Sousa', 'PB', '2025-10-28 12:32:12'),
(519, 'STELLANTIS SAUDE PE/PB', 'ASSOCIACAO FCA SAUDE', '33922160000147', '32669900', 'AV Contorno, 3455', NULL, NULL, 'Distrito Industrial Paulo Camilo Sul', 'Betim', 'MG', '2025-10-28 12:32:12'),
(520, 'EXCIMER TECNOLOGIA COM E ASSIST DE EQUIP MEDICOS E HOSP LTDA', 'EXCIMER TECNOLOGIA COM E ASSIST DE EQUIP MEDICOS E HOSP LTDA', '10293515000180', '71956180', 'QS  QS 5 RUA 800 B LOTES 04/05 LOJA 02 S/N, 02', NULL, NULL, 'AGUAS CLARAS', 'Brasília', 'DF', '2025-10-28 12:32:12'),
(521, 'MC IMAGEM E VIDA', 'MC SERVICOS DE ATENDIMENTO HOSPITALARES LTDA', '18293424000157', '53030010', 'AV Presidente Getúlio Vargas, 1605', NULL, NULL, 'Bairro Novo', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(522, 'ESHO EMPRESA DE SERVICOS HOSPITALARES S.A.', 'ESHO EMPRESA DE SERVICOS HOSPITALARES S.A.', '29435005000129', '20220460', 'AV Barão de Tefé, 34', NULL, NULL, 'Saúde', 'Rio de Janeiro', 'RJ', '2025-10-28 12:32:12'),
(523, 'M4 PARTICIPACOES LTDA', 'M4 PARTICIPACOES LTDA', '50035462000112', '53030010', 'AV Presidente Getúlio Vargas, 1009', NULL, NULL, 'Bairro Novo', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(524, 'REDEVISAO', 'REDEVISAO SERVICOS OFTALMOLOGICOS LTDA', '01746482000196', '50040000', 'AV Cruz Cabugá, 1563', NULL, NULL, 'Santo Amaro', 'Recife', 'PE', '2025-10-28 12:32:12'),
(525, 'ACADEMIA MATCH FIT', 'CENTRO DE ACADEMIA SOLUCAO LTDA', '37137260000113', '51021350', 'R Carlos Pereira Falcão, 464', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:32:12'),
(526, 'ACADEMIA MATCH FIT', 'CENTRO DE ACADEMIA EXPLOSAO LTDA', '37145066000180', '51021350', 'R Carlos Pereira Falcão, 464', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:32:12'),
(527, 'ACADEMIA MATCH FIT', 'CENTRO DE ATIVIDADES E CONDICIONAMENTO FISICO VALOR LTDA', '33416060000149', '55815135', 'R Dom Lustosa, 65', NULL, NULL, 'São José', 'Carpina', 'PE', '2025-10-28 12:32:12'),
(528, 'ACADEMIA MATCH FIT', 'CENTRO DE CONDICIONAMENTO FISICO FORTE LTDA', '43913376000108', '55813451', 'R Martinho Francisco, 00', NULL, NULL, 'Cajá', 'Carpina', 'PE', '2025-10-28 12:32:12'),
(529, 'ACADEMIA MATCH FIT', 'CENTRO CONDICIONAMENTO FISICO DESAFIO LTDA', '21362957000310', '52041430', 'AV Beberibe, 530', NULL, NULL, 'Encruzilhada', 'Recife', 'PE', '2025-10-28 12:32:12'),
(530, 'ACADEMIA MATCH FIT', 'CENTRO DE ATIVIDADES E CONDICIONAMENTO FISICO DINAMICO LTDA', '33374804000100', '52011050', 'R Amélia, 673', NULL, NULL, 'Graças', 'Recife', 'PE', '2025-10-28 12:32:12'),
(531, 'MATCH GREEN ROSARINHO', 'CENTRO DE ACADEMIA ROSARINHO LTDA', '45329841000185', '52041080', 'AV Norte Miguel Arraes de Alencar, 2981', NULL, NULL, 'Encruzilhada', 'Recife', 'PE', '2025-10-28 12:32:12'),
(532, 'STBIO ENGENHARIA', 'STBIO SOLUCOES TECNOLOGICAS BIOMEDICAS LTDA', '13565037000290', '56302110', 'AV CARDOSO DE SA, 860', NULL, NULL, 'CIDADE UNIVERSITARIA', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(533, 'JACO E MARIA SPOLIUM', 'JACQUES E FILHOS LTDA', '61077289000131', '57038760', 'R Coronel Mário Saraiva, 44', NULL, NULL, 'Guaxuma', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(534, 'SAO LUIZ - UNIDADE BOTAFOGO', 'REDE D\'OR SAO LUIZ S.A.', '06047087001100', '22270010', 'R Voluntários da Pátria, 138', NULL, NULL, 'Botafogo', 'Rio de Janeiro', 'RJ', '2025-10-28 12:32:12'),
(535, 'CIME', 'ADRIANO MARQUES DE CARVALHO FILHO LTDA', '35930723000174', '56360000', 'R AFRANIO DE M FRANCO, 70', NULL, NULL, 'CENTRO', 'Afrânio', 'PE', '2025-10-28 12:32:12'),
(536, 'ADYEN LATIN AMERICA', 'ADYEN DO BRASIL INSTITUICAO DE PAGAMENTO LTDA.', '14796606000190', '04794000', 'AV das Nações Unidas, 14261', NULL, NULL, 'Vila Gertrudes', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(537, 'BANCO DO BRASIL SA', 'BANCO DO BRASIL SA', '00000000000191', '70040912', 'QD Quadra 5 Lote B Torres I, 1', NULL, NULL, 'Asa Norte', 'Brasília', 'DF', '2025-10-28 12:32:12'),
(538, 'UDI UNIDADE DE DIAGNOSTICO POR IMAGEM', 'UDI PATOS SERVICOS E PRODUTOS MEDICOS LTDA', '09442754000176', '58700410', 'R Bossuet Wanderley, 411', NULL, NULL, 'Brasília', 'Patos', 'PB', '2025-10-28 12:32:12'),
(539, 'ASHOPE', 'ASHOPE - ASSOCIACAO DE SERVICOS HOSPITALARES', '31510376000170', '50610070', 'R Dom João de Souza', '239', NULL, 'Madalena', 'Recife', 'PE', '2025-10-28 12:32:12'),
(540, 'INSTITUTO DE OLHOS DO RECIFE LTDA', 'INSTITUTO DE OLHOS DO RECIFE LTDA', '10970077000490', '52020375', 'R Dom Miguel de Lima Valverde, 80', NULL, NULL, 'Graças', 'Recife', 'PE', '2025-10-28 12:32:12'),
(541, 'RETRO F.C. BRASIL', 'RETRO FUTEBOL CLUBE BRASIL', '27171523000157', '54789471', 'R Claúdio dos Santos, 0000', NULL, NULL, 'Borralho', 'Camaragibe', 'PE', '2025-10-28 12:32:12'),
(542, 'CARDIOPREVENT', 'VASCONCELOS LIMA SERVICOS MEDICOS LTDA', '13636652000169', '50610120', 'R Demócrito de Souza Filho, 335', NULL, NULL, 'Madalena', 'Recife', 'PE', '2025-10-28 12:32:12'),
(543, 'BRUMAR CONTABIL', 'G G B ASSESSORIA CONTABIL, FISCAL E TRABALHISTA LTDA', '10297741000130', '50740080', 'AV Barão de Bonito, 224', NULL, NULL, 'Várzea', 'Recife', 'PE', '2025-10-28 12:32:12'),
(544, 'LIVANOVA BRASIL COMERCIO E DISTRIBUICAO DE EQUIPAMENTOS MEDI', 'LIVANOVA BRASIL COMERCIO E DISTRIBUICAO DE EQUIPAMENTOS MEDI', '45489614000117', '04298070', 'R Liege, 54', NULL, NULL, 'Vila Vermelha', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(545, 'EPICORDIS SERVICOS MEDICOS LTDA', 'EPICORDIS SERVICOS MEDICOS LTDA', '41597556000194', '56304160', 'AV Monsenhor Ângelo Sampaio, 100', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(546, 'CENTRO HOSPITALAR DR JOSE EVOIDE DE MOURA', 'J. MOURA SOARES LTDA', '11469145000152', '56800000', 'R APARICIO VERAS, 411', NULL, NULL, 'CENTRO', 'Afogados da Ingazeira', 'PE', '2025-10-28 12:32:12'),
(547, 'MED MAIS SOLUCOES EM SERVICOS ESPECIAIS LTDA', 'MED MAIS SOLUCOES EM SERVICOS ESPECIAIS LTDA', '09557452000143', '50000000', 'QNA QNA 2 LT 3 SL 301, 301', NULL, NULL, 'TAGUATINGA NORTE', 'Brasília', 'DF', '2025-10-28 12:32:12'),
(548, 'SECRETARIA DE ADMINISTRACAO DO GOVERNO DO ESTADO DE PE', 'SECRETARIA DE ADMINISTRACAO', '10572022000180', '51010000', 'AV Antônio de Góes, 194', NULL, NULL, 'Pina', 'Recife', 'PE', '2025-10-28 12:32:12'),
(549, 'J. CUNHA MATERIAIS DE CONSTRUÇÃO EIRELI', 'J. CUNHA MATERIAIS DE CONSTRUÇÃO EIRELI', '36771690000120', '64207470', 'LOT LOT RESIDENCE - QUADRA, 6', NULL, NULL, 'RAUL BACELAR', 'Parnaíba', 'PI', '2025-10-28 12:32:12'),
(550, 'OLINDA MEDICAL CENTER LTDA', 'OLINDA MEDICAL CENTER LTDA', '05048054000140', '53030010', 'AV Presidente Getúlio Vargas, 1375', NULL, NULL, 'Bairro Novo', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(551, 'SAO JOAO DO RIO DO PEIXE GABINETE PREFEITO', 'MUNICIPIO DE SAO JOAO DO RIO DO PEIXE', '08924029000171', '58910000', 'R JOSE NOGUEIRA PINHEIRO, 0000', NULL, NULL, 'CENTRO', 'São João do Rio do Peixe', 'PB', '2025-10-28 12:32:12'),
(552, 'PERNAMBUCO DISTRIBUIDORA ATACADISTA - EPI', 'PERNAMBUCO DISTRIBUIDORA ATACADISTA - EPI', '02155469000125', '50771600', 'AV Doutor José Rufino, 98', NULL, NULL, 'Jiquiá', 'Recife', 'PE', '2025-10-28 12:32:12'),
(553, 'BIOCATH COMÉRCIO DE PRODUTOS HOSPITALARES LTDA', 'BIOCATH COMÉRCIO DE PRODUTOS HOSPITALARES LTDA', '05964709000120', '04126001', 'RUA RUA JORGE TIBIRICA, 888', NULL, NULL, 'VILA MARIANA', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(554, 'HOSPITAL MEMORIAL ARTHUR RAMOS', 'HOSPITAL ESPERANCA SA (ARTHUR RAMOS)', '02284062002222', '57052827', 'R Hugo Corrêa Paes, 253', NULL, NULL, 'Gruta de Lourdes', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(555, 'AECISA', 'ASSOCIACAO EDUCACIONAL DE CIENCIAS DA SAUDE - AECISA', '05834842000162', '51150000', 'AV Marechal Mascarenhas de Moraes, 4861', NULL, NULL, 'Imbiribeira', 'Recife', 'PE', '2025-10-28 12:32:12'),
(556, 'LORRANE ALVES PEIXOTO 01446127478', 'LORRANE ALVES PEIXOTO 01446127478', '28372351000142', '58041010', 'AV EXPEDICIONARIOS, 922', NULL, NULL, 'EXPEDICIONARIOS', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(557, 'ENOTEL PORTO DE GALINHAS RESORT & SPA', 'ENOTEL HOTELS E RESORTS S/A', '03787288000184', '55590000', 'ROD RODOVIA PE-009, 000', NULL, NULL, 'GRANJA SAO PAULO', 'Ipojuca', 'PE', '2025-10-28 12:32:12'),
(558, 'ANA CAROLINA DE CAMPOS BARROS 35235925858', 'ANA CAROLINA DE CAMPOS BARROS 35235925858', '30433522000148', '03618080', 'R Joaquim Vaz, 106', NULL, NULL, 'Vila Marieta', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(559, 'INSTITUTO DE ENSINO E PESQUISA ALBERTO SANTOS DUMONT', 'INSTITUTO DE ENSINO E PESQUISA ALBERTO SANTOS DUMONT', '19176461000229', '59288899', 'AV  AV ALBERTO SANTOS DUMONT, 1560', NULL, NULL, 'AREA RURAL DE MACAIBA', 'Macaíba', 'RN', '2025-10-28 12:32:12'),
(560, 'G L ROCHA REBOUCAS LTDA', 'G L ROCHA REBOUCAS LTDA', '25310474000160', '59625400', 'AV Jorge Coelho de Andrade, 13', NULL, NULL, 'Presidente Costa e Silva', 'Mossoró', 'RN', '2025-10-28 12:32:12'),
(561, 'CLINCORDIS', 'COSTA E NOVAIS CLINICA E LABORATORIO LTDA', '44981740000121', '59378000', 'R JOAQUIM LOLO, 211', NULL, NULL, 'CENTRO', 'São José do Seridó', 'RN', '2025-10-28 12:32:12'),
(562, 'CIRURGICA FONTELLES', 'CIRURGICA FONTELLES COMERCIO E REPRESENTACOES LTDA', '02363464000198', '65076821', 'AV 02, 3000', NULL, NULL, 'Jaracaty', 'São Luís', 'MA', '2025-10-28 12:32:12'),
(563, 'FERNANDO D DA SILVA', 'FERNANDO D DA SILVA', '08723551000195', '59300000', 'R MONSENHOR  SERVERINO , 143', NULL, NULL, 'CENTRO', 'Caicó', 'RN', '2025-10-28 12:32:12'),
(564, 'FISIOCARE', 'FISIOTERAPIA CARDIORRESPIRATORIA LTDA', '07727123000178', '58013025', 'PCA da Independência, 18', NULL, NULL, 'Centro', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(565, 'ESPACO VIDA E SERVICOS MEDICOS E DIAGNOSTICOS LTDA', 'ESPACO VIDA E SERVICOS MEDICOS E DIAGNOSTICOS LTDA', '21558601000194', '58800820', 'R Princesa Isabel, 42', NULL, NULL, 'Bancários', 'Sousa', 'PB', '2025-10-28 12:32:12'),
(566, 'CLINICA FERNANDO AMARAL', 'CLINICA FERNANDO AMARAL - ULTRASSONOGRAFIA DIAGNOSTICA E INT', '18217688000121', '50070525', 'PCA MIGUEL DE CERVANTES, 60', NULL, NULL, 'ILHA DO LEITE', 'Recife', 'PE', '2025-10-28 12:32:12'),
(567, 'FUNDO MUNICIPAL DE SAUDE DA CIDADE DO RECIFE', 'FUNDO MUNICIPAL DE SAUDE', '41090291000133', '50030220', 'R do Apolo, 925', NULL, NULL, 'Recife', 'Recife', 'PE', '2025-10-28 12:32:12'),
(568, 'FERREIRA COSTA & CIA CARUARU', 'FERREIRA COSTA & CIA LTDA', '10230480003075', '55014545', 'AV dos Estados, 00129', NULL, NULL, 'Nova Caruaru', 'Caruaru', 'PE', '2025-10-28 12:32:12'),
(569, 'WILKLEF RAKSPWARE CELESTINO DA SILVA', 'WILKLEF RAKSPWARE CELESTINO DA SILVA', '31738242000100', '59142250', 'R Honório Martiniano da Silva, 462', NULL, NULL, 'Santa Tereza', 'Parnamirim', 'RN', '2025-10-28 12:32:12'),
(570, 'CLINICA MAYA', 'CLINICA MAYA LTDA', '31138916000136', '59570000', 'R ENGENHEIRO MARCELO EUSTAQUIO DE BARROS, 688', NULL, NULL, 'PASSA E FICA', 'Ceará-Mirim', 'RN', '2025-10-28 12:32:12'),
(571, 'VIEIRA PRODUTOS HOSPITALARES', 'VIEIRA PRODUTOS HOSPITALARES LTDA', '35304138000169', '59600155', 'R Juvenal Lamartine, 582', NULL, NULL, 'Centro', 'Mossoró', 'RN', '2025-10-28 12:32:12'),
(572, 'UNIDADE DE DIAGNOSTICO CARDIOLOGICO', 'UNIDADE DE DIAGNOSTICO CARDIOLOGICO LTDA', '11920672000131', '52020015', 'R da Hora, 906', NULL, NULL, 'Espinheiro', 'Recife', 'PE', '2025-10-28 12:32:12'),
(573, 'C. CLIN. VIA DIRETA', 'UNIMED NATAL SOCIEDADE COORPERATIVA DE TRABALHO MEDICO', '08380701001349', '59078000', 'AV Senador Salgado Filho, 2233', NULL, NULL, 'Capim Macio', 'Natal', 'RN', '2025-10-28 12:32:12'),
(574, 'UNICAP', 'UNIVERSIDADE CATOLICA DE PERNAMBUCO', '10847721000195', '50050410', 'R DO PRINCIPE, 526', NULL, NULL, 'BOA VISTA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(575, 'CLINICA DO CORACAO DR.BRASILIO', 'CLINICA DO CORACAO DR BRASILIO SERRANO LTDA', '22326579000209', '58428735', 'R Coronel João da Costa e Silva, 280', NULL, NULL, 'Bela Vista', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(576, 'CLINICA ELETROPACE', 'CLINICA MEDICA CARDIACA LTDA', '20973671000146', '59020010', 'R Seridó, 356', NULL, NULL, 'Petrópolis', 'Natal', 'RN', '2025-10-28 12:32:12'),
(577, 'CLINLAB CLINICA E LABORATORIO', 'CLINLAB CLINICA E LABORATORIO LTDA', '00641302000220', '59700000', 'R BORROMEU DE BRITO GUERRA, 76', NULL, NULL, 'CENTRO', 'Apodi', 'RN', '2025-10-28 12:32:12'),
(578, 'CENTRO MEDICO SAUDE DA FAMILIA', 'CMSF PETROPOLIS LTDA', '29183496000168', '59056200', 'AV Prudente de Morais, 3413', NULL, NULL, 'Lagoa Nova', 'Natal', 'RN', '2025-10-28 12:32:12'),
(579, 'CLINICA DO SHOPPING', 'CLINICA DO SHOPPING SERVIÇOS DE SAUDE DO BRASIL LTDA', '32045573000128', '59015900', 'AV Nevaldo Rocha, 3775', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:32:12'),
(580, 'HOSPITAL DIA UNIVIDA', 'CLINICA GERAL E PEDIATRIA LTDA', '12780939000103', '58028230', 'R Melvin Jones, 109', NULL, NULL, 'Ipês', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(581, 'CLINICA GINECAM - HOSPITAL CIRURGICO DR. ORLANDO DAMASC', 'CENTRO MEDICO SD LTDA', '09609579000169', '65790000', 'R 15 DE NOVEMBRO, 57', NULL, NULL, 'CENTRO', 'São Domingos do Maranhão', 'MA', '2025-10-28 12:32:12'),
(582, 'CLINICOR', 'CLINICOR CLINICA DE P E TRATAMENTO DAS D DO C LTDA', '10723880000188', '59020200', 'AV Rodrigues Alves, 571', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:32:12'),
(583, 'CLINICA SANTA ELIZA', 'CLINICA SANTA ELIZA LTDA', '08252595000184', '59030500', 'R Jaguarari, 1208', NULL, NULL, 'Barro Vermelho', 'Natal', 'RN', '2025-10-28 12:32:12'),
(584, 'CARDIOL', 'CLINICA MEDICA DE CARDIOLOGIA DRA. SUZANA FORTE LTDA', '28580179000112', '58030020', 'AV Rio Grande do Sul, 1345', NULL, NULL, 'Estados', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(585, 'CENTRO DE DIAGNOSTICO BORIS BERENSTEIN', 'CENTRO DE DIAGNOSTICO BORIS BERENSTEIN LTDA', '12857736000160', '52010250', 'R da Baixa Verde, 409', NULL, NULL, 'Derby', 'Recife', 'PE', '2025-10-28 12:32:12'),
(586, 'CARDIOCLIN', 'CARLOS VANDEILSON DE SOUSA E SILVA', '26191559000130', '56780000', 'AV CORONEL ZUZA BARROS, 2587', NULL, NULL, 'CENTRO', 'Tabira', 'PE', '2025-10-28 12:32:12'),
(587, 'LABORATORIO SANTA CECILIA', 'LABORATORIO DE ANALISES CLINICA SANTA CECILIA LTDA', '11224103000151', '58840000', 'R CEL. JOAO CARNEIRO, 368', NULL, NULL, 'CENTRO', 'Pombal', 'PB', '2025-10-28 12:32:12'),
(588, 'LABORATORIO DE ANALISES CLINICAS DE TRINDADE LTDA', 'LABORATORIO DE ANALISES CLINICAS DE TRINDADE LTDA', '12765186000159', '56250000', 'R AGAMENON MAGALHAES, 358', NULL, NULL, 'CENTRO', 'Trindade', 'PE', '2025-10-28 12:32:12'),
(589, 'LOTUS CONSULTORIOS', 'LOTUS CONSULTORIOS LTDA', '46817562000123', '51021040', 'AV Engenheiro Domingos Ferreira, 4023', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:32:12'),
(590, 'SINGULAR SAUDE', 'GRUPO SINGULAR SAUDE LTDA', '11647215000115', '54510480', 'R Armando Jorge Sales, 118', NULL, NULL, 'Centro', 'Cabo de Santo Agostinho', 'PE', '2025-10-28 12:32:12'),
(591, 'HC CARDIO', 'HC CARDIO LTDA', '24528770000170', '59075050', 'R Coronel Auris Coelho, 178', NULL, NULL, 'Lagoa Nova', 'Natal', 'RN', '2025-10-28 12:32:12'),
(592, 'CARDIOMETRICS - CARDIOLOGIA DE PRECISAO', 'HEART GEOMETRICS - MEDICINA DE PRECISAO LTDA', '42258118000164', '59020300', 'AV Campos Sales, 901', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:32:12'),
(593, 'SERV SAUDE', 'SERV SAUDE CLINICA E SERVICOS MEDICOS LTDA', '42708237000171', '58900000', 'R BARAO DO RIO BRANCO, 1164', NULL, NULL, 'CENTRO', 'Cajazeiras', 'PB', '2025-10-28 12:32:12'),
(594, 'ONCOMAMA', 'SERVICO MEDICO DE MASTOLOGIA E ULTRASSONOGRAFIA DE CAMPINA', '13806635000122', '58400506', 'R Duque de Caxias, 523', NULL, NULL, 'Prata', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(595, 'CLINICA DR BARTOLOMEU COSTA', 'SERVICO MEDICO DE PETROLINA LTDA', '04109643000129', '56304220', 'R Crispim de Amorim Coelho, 68', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(596, 'SOCIEDADE REGIONAL DE ENSINO E SAUDE LTDA', 'SOCIEDADE REGIONAL DE ENSINO E SAUDE LTDA', '04600555001440', '56512670', 'AV Osvaldo Cruz, 10017', NULL, NULL, 'São Cristóvão', 'Arcoverde', 'PE', '2025-10-28 12:32:12'),
(597, 'DRA TAWANNA XAVIER', 'TAWANNA XAVIER SERVICOS MEDICOS LTDA', '40500384000126', '56580000', 'R SANTA IZABEL, 240', NULL, NULL, 'CENTRO', 'Ibimirim', 'PE', '2025-10-28 12:32:12'),
(598, 'CLINICA TOP/HOSPITAL DIA INFANTO JUVENIL', 'CENTRO PARAIBANO DE CIENCIAS ORTOPEDICAS HOSPITAL DIA TOP LT', '09356784000160', '58031130', 'R Professor Joaquim Francisco Veloso Galvão, 1810', NULL, NULL, 'Pedro Gondim', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(599, 'PONTO CARDIO', 'UCT - UNIDADE DE CARDIOLOGIA E CIRURGIA CARDIOVASCULAR', '03937394000105', '58041020', 'R Silvio Almeida, 725', NULL, NULL, 'Expedicionários', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(600, 'HTRI - REGIONAL ARCOVERDE', 'HOSPITAL DO TRICENTENARIO', '10583920000990', '56510080', 'AV Doutor Agamenon Magalhães, 01', NULL, NULL, 'São Miguel', 'Arcoverde', 'PE', '2025-10-28 12:32:12'),
(601, 'HOSPITAL UNIVERSIDADE ALCIDES CARNEIRO', 'EMPRESA BRASILEIRA DE SERVICOS HOSPITALARES - EBSERH', '15126437003240', '58400398', 'R Carlos Chagas, S/N', NULL, NULL, 'São José', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(602, 'UNIVERSIDADE FEDERAL DA PARAIBA', 'UNIVERSIDADE FEDERAL DA PARAIBA', '24098477000705', '58051900', 'LOC CAMPUS I JOAO PESSOA, 00', NULL, NULL, 'Castelo Branco', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(603, 'HUB SERVICOS MEDICOS INTEGRADOS LTDA', 'HUB SERVICOS MEDICOS INTEGRADOS LTDA', '42880429000160', '58175000', 'R PRESIDENTE GETULIO DORNELES VARGAS , 95', NULL, NULL, 'CUITE', 'Cuité', 'PB', '2025-10-28 12:32:12'),
(604, 'HYALE NASCIMENTO CUNHA CARVALHO', 'HYALE NASCIMENTO CUNHA CARVALHO', '12922652000162', '58340000', 'AV COMENDADOR RENATO RIBEIRO COUTINHO , 1198', NULL, NULL, 'CENTRO', 'Sapé', 'PB', '2025-10-28 12:32:12'),
(605, 'ICA - INSTITUTO DE CARDIOLOGIA DO AGESTE LTDA', 'ICA - INSTITUTO DE CARDIOLOGIA DO AGESTE LTDA', '18738495000116', '55014020', 'R Gonçalo Coelho, 94', NULL, NULL, 'Maurício de Nassau', 'Caruaru', 'PE', '2025-10-28 12:32:12'),
(606, 'INACIO VILAR SERVICOS MEDICOS DO VALE', 'INACIO VILAR SERVICOS MEDICOS DO VALE LTDA', '26927031000186', '56308000', 'AV Coronel Antônio Honorato Viana, 97', NULL, NULL, 'Gercino Coelho', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(607, 'INSTITUTO ATENA DE PESQUISA CLINICA LTDA', 'INSTITUTO ATENA DE PESQUISA CLINICA LTDA', '39580637000130', '59020500', 'AV Marechal Floriano Peixoto, 385', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:32:12'),
(608, 'ICI', 'INSTITUTO CLINICO LTDA', '30659659000115', '59280190', 'R Nossa Senhora da Conceição, 92', NULL, NULL, 'Centro', 'Macaíba', 'RN', '2025-10-28 12:32:12'),
(609, 'HOSPITAL DA UNIMED EM JUAZEIRO', 'UNIMED VALE DO SAO FRANCISCO COOPERATIVA DE TRABALHO MEDICO', '40853020000472', '48903050', 'R DO PARAISO, 409', NULL, NULL, 'SANTO ANTONIO', 'Juazeiro', 'BA', '2025-10-28 12:32:12'),
(610, 'MEGATECH', 'OSMAN LOPES DA SILVA', '34689895000135', '55816311', 'TRA TRAVESSA PADRE MELO, 249', NULL, NULL, 'SANTO ANTONIO', 'Carpina', 'PE', '2025-10-28 12:32:12'),
(611, 'CASA DE SAUDE E MATERN N SENHORA DO P SOCORRO', 'CASA DE SAUDE E MATERN N SENHORA DO P SOCORRO LTDA', '10248599000130', '55296250', 'AV Simoa Gomes, 33', NULL, NULL, 'Heliópolis', 'Garanhuns', 'PE', '2025-10-28 12:32:12'),
(612, 'CEM', 'CEM - CLINICA DE ESPECIALIDADES MEDICAS LTDA', '09237303000105', '51011051', 'AV Engenheiro Domingos Ferreira, 1229', NULL, NULL, 'Pina', 'Recife', 'PE', '2025-10-28 12:32:12'),
(613, 'CLIMEJA', 'CLINICA MEDICA DO JARDIM ATLANTICO LTDA', '23066094000105', '53140080', 'AV Fagundes Varela, 942', NULL, NULL, 'Jardim Atlântico', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(614, 'CLINICA CENTRAL', 'CLINICA CENTRAL DE CAMPO GRANDE LTDA', '10435425000187', '52040000', 'EST de Belém, 847', NULL, NULL, 'Campo Grande', 'Recife', 'PE', '2025-10-28 12:32:12'),
(615, 'J MED CLINICA MEDICA LTDA', 'J MED CLINICA MEDICA LTDA', '47766747000119', '59300000', 'R JOAQUIM GREGORIO, 130', NULL, NULL, 'PENEDO', 'Caicó', 'RN', '2025-10-28 12:32:12'),
(616, 'MORAMED TECNOLOGIA HOSPITALAR', 'MORAMED MANUTENCAO E VENDA DE ACESSORIOS MEDICO HOSPITALAR L', '26603680000121', '54325251', '4A  4A TRAVESSA DOUTOR FABIO MARANHAO, 82', NULL, NULL, 'GUARARAPES', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:12'),
(617, 'CLINICA SAO CAMILO', 'HELMITON VIEIRA DE MOURA ME', '28588396000159', '55014330', 'RUA RUA SALDANHA MARINHO, 261', NULL, NULL, 'MAURICIO DE NASSAU', 'Caruaru', 'PE', '2025-10-28 12:32:12'),
(618, 'CONSULTORIA DR. HEVERSON ALEX ALVES', 'HEVERSON ALEX H. ALVES', '23178089000186', '56332720', 'R Lucas Roberto de Araújo, 290', NULL, NULL, 'Cidade Universitária', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(619, 'HOSPITAL INFANTIL PALMIRA SALES', 'HOSPITAL INFANTIL PALMIRA SALES', '10241503000102', '55293310', 'R Cabo Cobrinha, S/N', NULL, NULL, 'Santo Antônio', 'Garanhuns', 'PE', '2025-10-28 12:32:12'),
(620, 'SISTEMA DE ASSISTENCIA SOCIAL E DE SAUDE - SAS', 'SISTEMA DE ASSISTENCIA SOCIAL E DE SAUDE - SAS', '07678950000119', '58108620', 'R NILO PECANHA, 83', NULL, NULL, 'PRATA', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(621, 'SANDRA MARIA CORREIA CUNHA ESTEVES', 'SANDRA MARIA CORREIA CUNHA ESTEVES', '01163323000169', '58042040', 'R José Florentino Júnior, 582', NULL, NULL, 'Tambauzinho', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(622, 'HCC SERVICOS DE SAUDE LTDA', 'HCC SERVICOS DE SAUDE LTDA', '46655598000158', '59650000', 'AV SENADOR JOAO CAMARA, 441', NULL, NULL, 'CENTRO', 'Açu', 'RN', '2025-10-28 12:32:12'),
(623, 'MUNICIPIO DE BAYEUX', 'MUNICIPIO DE BAYEUX', '08924581000402', '58110320', 'R Flávio Maroja, 21', NULL, NULL, 'Jardim São Severino', 'Bayeux', 'PB', '2025-10-28 12:32:12'),
(624, 'CLINICAL CENTER IMAGEM PETROLINA LTDA', 'CLINICAL CENTER IMAGEM PETROLINA LTDA', '13405198000216', '56330055', 'R Tomé Cavalcante, 221', NULL, NULL, 'Areia Branca', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(625, 'J. ARIMATEA', 'J ARIMATEA BARBOSA DA SILVA & CIA LTDA', '02122468000184', '58400506', 'R Duque de Caxias, 603', NULL, NULL, 'Prata', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(626, 'ULTRAMED', 'ULTRAMED LTDA', '22868821000187', '58233000', 'PCA JOAO PESSOA, 78', NULL, NULL, 'CENTRO', 'Araruna', 'PB', '2025-10-28 12:32:12'),
(627, 'ULTRAMED RECIFE', 'ULTRAMED RECIFE CONSULTORIO MEDICO LTDA', '33623327000179', '52030090', 'R Antônio Rangel, 236', NULL, NULL, 'Encruzilhada', 'Recife', 'PE', '2025-10-28 12:32:12'),
(628, 'UNE SAUDE', 'UNE SAUDE LTDA', '13543187000111', '55870000', 'PCA JADER DE ANDRADE, 90', NULL, NULL, 'CENTRO', 'Timbaúba', 'PE', '2025-10-28 12:32:12'),
(629, 'HOSPITAL ARMINDO MOURA', 'UNIAO BENEFICENTE DOS TRABALHADOES DO MORENO', '11683042000190', '54800000', 'AV CLETO CAMPELO, 00', NULL, NULL, 'ALTO DA MATERNIDADE', 'Moreno', 'PE', '2025-10-28 12:32:12'),
(630, 'SALU CLIN SAUDE INTEGRADA LTDA', 'SALUS CLIN SAUDE E TREINAMENTO LTDA', '44628528000185', '56180000', 'AV SAO FRANCISCO, 484', NULL, NULL, 'CENTRO', 'Cabrobó', 'PE', '2025-10-28 12:32:12'),
(631, 'VIDA EXPERIENCIA DIAGNOSTICA', 'LOUREIRO SERVICO DE DIAGNOSTICO POR IMAGEM LTDA', '21460868000144', '58013280', 'AV Duarte da Silveira, 597', NULL, NULL, 'Centro', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(632, 'IAUPE', 'INSTITUTO DE APOIO A DUNDAÇÃO UNIVERSIDADE DE PERNAMBUCO', '03507661000104', '52050035', 'AV Santos Dumont, 300', NULL, NULL, 'Aflitos', 'Recife', 'PE', '2025-10-28 12:32:12'),
(633, 'INSTITUTO DE CIRURGIA CARDIO VASCULAR DA PARAIBA LTDA', 'INSTITUTO DE CIRURGIA CARDIO VASCULAR DA PARAIBA LTDA', '08526527000166', '58400062', 'R Dom Pedro II, 359', NULL, NULL, 'Centro', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(634, 'INSTITUTO DE MAMA E MEDICINA NUCLEAR AVACADA LTDA', 'INSTITUTO DE MAMA E MEDICINA NUCLEAR AVACADA LTDA', '23108922000112', '59600155', 'R Juvenal Lamartine, 582', NULL, NULL, 'Centro', 'Mossoró', 'RN', '2025-10-28 12:32:12'),
(635, 'IMA', 'INSTITUTO DE MEDICINA AVANCADA DO RN S/S', '11354583000175', '59020300', 'AV Campos Sales, 901', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:32:12'),
(636, 'IMIP - UPAE PETROLINA', 'INSTITUTO DE MEDICINA INTEGRAL PROFESSOR FERNANDO FIGUEIRA', '10988301000714', '56308000', 'AV Coronel Antônio Honorato Viana, 00', NULL, NULL, 'Gercino Coelho', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(637, 'INCOR - GG', 'INSTITUTO NEURO CARDIOVASCULAR DE CAMPINA GRANDE LTDA', '14497909000101', '58428016', 'R Delmiro Gouveia, 442', NULL, NULL, 'Centenário', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(638, 'POLICLINICA SAUDE TOTAL', 'INVICTA SERVICOS ESPECIALIZADOS EM SAUDE LTDA', '45762404000150', '58087000', 'AV Cruz das Armas, 2970', NULL, NULL, 'Oitizeiro', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(639, 'CLINICA DE OLHOS HILTON PIMENTEL JR', 'CLINICA DE OLHOS HILTON PIMENTEL JR LTDA', '11291583000173', '55644190', 'AV Joaquim Didier, 245', NULL, NULL, 'Cruzeiro', 'Gravatá', 'PE', '2025-10-28 12:32:12'),
(640, 'SELECT', 'SELECT OPERADORA DE PLANO DE SAUDE LTDA', '37035441000139', '74075250', 'R 9 A, 304', NULL, NULL, 'Setor Aeroporto', 'Goiânia', 'GO', '2025-10-28 12:32:12'),
(641, 'LABORATORIO BIOANALISES', 'MARIA DANUBIA ANDRADE DO NASCIMENTO', '13897347000120', '55420000', 'R JOSE CORDEIRO DE MIRANDA, 313', NULL, NULL, 'CENTRO', 'Canhotinho', 'PE', '2025-10-28 12:32:12'),
(642, 'CLINICA BEM ESTAR', 'MARIA YASMIM NUNES DOS REIS', '27437089000104', '59140370', 'R Odilon Braga, 178', NULL, NULL, 'Boa Esperança', 'Parnamirim', 'RN', '2025-10-28 12:32:12'),
(643, 'MAX DAY HOSPITAL', 'MAX DAY HOSPITAL LTDA', '02434658000137', '51110160', 'AV República do Líbano, 251', NULL, NULL, 'Pina', 'Recife', 'PE', '2025-10-28 12:32:12'),
(644, 'CLINICA DO CORACAO', 'CLINICA DO CORACAO LTDA', '15808133000166', '59611030', 'R Ferreira Itajubá, 301', NULL, NULL, 'Santo Antônio', 'Mossoró', 'RN', '2025-10-28 12:32:12'),
(645, 'MEDFAMILIA', 'MEDFAMILIA CLINICA MEDICA DIAGNOSTICA LTDA', '26600750000198', '59031150', 'R Presidente Quaresma, 439B', NULL, NULL, 'Alecrim', 'Natal', 'RN', '2025-10-28 12:32:12'),
(646, 'MENDES ROSSI SERVICOS MEDICOS', 'MENDES, MENDES, ROSSI & ROSSI SERVICOS MEDICOS LTDA', '36692262000101', '01529000', 'R Pires da Mota, 964', NULL, NULL, 'Aclimação', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(647, 'VITA SAUDE', 'ML CLINICA MEDICA LTDA', '31563027000116', '51030020', 'R Visconde de Jequitinhonha, 1144', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:32:12'),
(648, 'CLINICA DA FAMILIA', 'CLINICA MEDICA DA FAMILIA LTDA', '22376938000143', '50610090', 'AV Visconde de Albuquerque, 776', NULL, NULL, 'Madalena', 'Recife', 'PE', '2025-10-28 12:32:12'),
(649, 'CLINICA NOSSA SENHORA DO O', 'CLINICA L M LTDA', '07459940000192', '55592000', 'R MANOEL GOMES DA SILVA, 26', NULL, NULL, 'Nossa Senhora do O', 'Ipojuca', 'PE', '2025-10-28 12:32:12'),
(650, 'CLINICA MARIO BENTO', 'CLINICA MARIO BENTO LTDA', '04631709000146', '55540000', 'R CAPITAO PEDRO IVO, 608', NULL, NULL, 'CENTRO', 'Palmares', 'PE', '2025-10-28 12:32:12'),
(651, 'CLINICOR', 'CLINICOR CLINICA DO CORACAO LTDA', '02516494000197', '55813530', 'R Josefa Bione, 556', NULL, NULL, 'Cajá', 'Carpina', 'PE', '2025-10-28 12:32:12'),
(652, 'CLINICAL SENTER', 'CLINICAL SENTER SERVICOS MEDICOS LTDA', '28730485000198', '56316590', 'AV João Barbosa da Cunha, 302', NULL, NULL, 'João de Deus', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(653, 'CARDIOPED - CARDIOLOGIA PEDIATRICA RECIFE', 'CLINICA MEDICA MOSER LTDA', '37318119000117', '52010075', 'AV Governador Agamenon Magalhães, 4760', NULL, NULL, 'Paissandu', 'Recife', 'PE', '2025-10-28 12:32:12'),
(654, 'CLINICA DIOCLECIO COUTINHO', 'CLINICA RADIODIAGNOSTICO E ULTRASSONOGRAFIA DO CARPINA LTDA', '12599312000142', '55819320', 'CAM BR 408, S/N', NULL, NULL, 'BAIRRO NOVO', 'Carpina', 'PE', '2025-10-28 12:32:12'),
(655, 'CLINICA MEDICA MAIS SAUDE', 'CLINICA MEDICA MAIS SAUDE SERVICOS DE DIAGNOSTICO LTDA', '31557274000100', '55750000', 'R MARIA BARBOSA, 419', NULL, NULL, 'CENTRO', 'Surubim', 'PE', '2025-10-28 12:32:12'),
(656, 'COLEGIO MILITAR DO RECIFE', 'COLEGIO MILITAR DO RECIFE', '09586596000128', '50730120', 'AV VISCONDE DE SAO LEOPOLDO, 198', NULL, NULL, 'ENGENHO DO MEIO', 'Recife', 'PE', '2025-10-28 12:32:12'),
(657, 'UNIVERSIDADE FEDERAL DA PARAIBA UFPB', 'UNIVERSIDADE FEDERAL DA PARAIBA', '24098477000110', '58051900', 'LOC Universitário, 00', NULL, NULL, 'Castelo Branco', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(658, 'CENTRO DE CIENCIAS MEDICAS DA UFPE - CCM', 'UNIVERSIDADE FEDERAL DE PERNAMBUCO', '24134488003557', '50740570', 'AV Reitor Joaquim Amazonas, 00', NULL, NULL, 'Cidade Universitária', 'Recife', 'PE', '2025-10-28 12:32:12'),
(659, 'UFRN', 'UNIVERSIDADE FEDERAL DO RIO GRANDE DO NORTE', '24365710000183', '59078900', 'AV Senador Salgado Filho, 3000', NULL, NULL, 'Lagoa Nova', 'Natal', 'RN', '2025-10-28 12:32:12'),
(660, 'GESTEC', 'GESTEC GESTAO E TECNOLOGIA PARA SAUDE LTDA', '26583095000107', '59020310', 'R Doutor João Chaves, 981', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:32:12'),
(661, 'GASTRO IMAGEM ENDOSCOPIA DIGESTIVA E SERVICOS DE SAUDE', 'GASTRO IMAGEM ENDOSCOPIA DIGESTIVA E SERVICOS DE SAUDE', '01062931000187', '50100015', 'AV João de Barros, 100', NULL, NULL, 'Santo Amaro', 'Recife', 'PE', '2025-10-28 12:32:12'),
(662, 'GASTRO.PE', 'GASTRO.PE ENDOSCOPIA E COLONOSCOPIA LTDA', '01050827000253', '50050180', 'AV João de Barros, 791', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(663, 'PROENDO ENDOSCOPIA DIAGNOSTICA E TERAPEUTICA LTDA', 'PROENDO ENDOSCOPIA DIAGNOSTICA E TERAPEUTICA LTDA', '10850191000134', '50070460', 'R Senador José Henrique, 141', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:32:12'),
(664, 'MULTCLINICA JUCURUTU', 'MULTCLINICA JUCURUTU SERVICOS DE SAUDE LTDA', '35204160000137', '59330000', 'R JOAO MEDEIROS, 85', NULL, NULL, 'SANTA IZABEL', 'Jucurutu', 'RN', '2025-10-28 12:32:12'),
(665, 'OURICURI GABINETE PREFEITO', 'MUNICIPIO DE OURICURI', '11040904000167', '56200000', 'PCA PE FRANCISCO PEDRO SILV, 00', NULL, NULL, 'CENTRO', 'Ouricuri', 'PE', '2025-10-28 12:32:12'),
(666, 'NEFROVIDA', 'NEFROVIDA SERVICO DE NEFROLOGIA LTDA', '31207195000179', '53402105', 'AV Joaquim Nabuco, 1150', NULL, NULL, 'Fragoso', 'Paulista', 'PE', '2025-10-28 12:32:12'),
(667, 'NEURO IMAGEM', 'NEURO IMAGEM E SERVICOS MEDICOS OCUPACIONAIS LTDA', '07221418000178', '56505480', 'R Capitão Arlindo Pacheco de Albuquerque, 115', NULL, NULL, 'Centro', 'Arcoverde', 'PE', '2025-10-28 12:32:12'),
(668, 'NOSSA CLINICA MEDICA LTDA', 'NOSSA CLINICA MEDICA LTDA', '12827593000143', '59612012', 'R Doutor João Marcelino, 1901', NULL, NULL, 'Nova Betânia', 'Mossoró', 'RN', '2025-10-28 12:32:12'),
(669, 'O DOUTOR', 'O DOUTOR LTDA', '25016115000103', '59022385', 'AV Nevaldo Rocha, 3545', NULL, NULL, 'Lagoa Seca', 'Natal', 'RN', '2025-10-28 12:32:12'),
(670, 'CLICENTER', 'CLINCENTER CLINICAS LTDA', '36310595000129', '56308065', 'R Vitoria Maria Torres, 28', NULL, NULL, 'Atrás da Banca', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(671, 'MED ALDEIA', 'MEDICAL CENTER ALDEIA LTDA', '36560655000161', '54786013', 'EST de Aldeia, 9012', NULL, NULL, 'Vera Cruz', 'Camaragibe', 'PE', '2025-10-28 12:32:12'),
(672, 'VETOR SAUDE', 'VETOR SAUDE - MEDICINA E SEGURANCA DO TRABALHO LTDA', '48626280000174', '58051000', 'R Empresário João Rodrigues Alves, 264', NULL, NULL, 'Jardim São Paulo', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(673, 'GASTROCLINICA CARLOS GANTOIS', 'GASTROCLINICA CARLOS GANTOIS CARLOS EUGENIO G LTDA', '24132748000106', '50070460', 'R Senador José Henrique, 65', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:32:12'),
(674, 'CARLOS EUGENIO GANTOIS', 'CARLOS EUGENIO GANTOIS LTDA', '24132748000297', '54400000', 'AV Bernardo Vieira de Melo, 209', NULL, NULL, 'Piedade', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:12'),
(675, 'ENDOGASTRO', 'ENDOGASTRO LTDA', '08262487000192', '52011005', 'R Joaquim Nabuco, 200', NULL, NULL, 'Graças', 'Recife', 'PE', '2025-10-28 12:32:12'),
(676, 'ENDOGASTRO LTDA', 'ENDOGASTRO LTDA', '08262487000273', '50070070', 'R Dom Bosco, 961', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(677, 'PRO-ENDO ENDOSCOPIA DIAGNOSTICA E TERAPEUTICA LTDA', 'PRO-ENDO ENDOSCOPIA DIAGNOSTICA E TERAPEUTICA LTDA', '10850191000215', '52010240', 'R Feliciano Gomes, 162', NULL, NULL, 'Derby', 'Recife', 'PE', '2025-10-28 12:32:12'),
(678, 'DIAGNOSTICA ENDOSCOPIA RAPIOLOGIA', 'DIAGNOSTICA ENDOSCOPIA RAPIOLOGIA LTDA', '70179577000198', '50610090', 'AV Visconde de Albuquerque,  802', NULL, NULL, 'Madalena', 'Recife', 'PE', '2025-10-28 12:32:12'),
(679, 'DIAGNOSTICA ENDOSCOPIA RAPIOLOGIA', 'DIAGNOSTICA ENDOSCOPIA RAPIOLOGIA LTDA', '70179577000430', '50610000', 'R Real da Torre, 637', NULL, NULL, 'Madalena', 'Recife', 'PE', '2025-10-28 12:32:12'),
(680, 'INVESTIGACAO E TERAPEUTICA EM CARDIOLOGIA LTDA', 'INVESTIGACAO E TERAPEUTICA EM CARDIOLOGIA LTDA', '01051191000183', '52011010', 'R das Pernambucanas, 207', NULL, NULL, 'Graças', 'Recife', 'PE', '2025-10-28 12:32:12'),
(681, 'VENTOS DE SANTA BRIGIDA VII ENERGIAS RENOVAVEIS S.A', 'VENTOS DE SANTA BRIGIDA VII ENERGIAS RENOVAVEIS S.A', '17875270000149', '55355000', 'SIT TIMOTEO, 01', NULL, NULL, 'ZONA RURAL', 'Paranatama', 'PE', '2025-10-28 12:32:12'),
(682, 'LIEM', 'LIMOEIRO ESPECIALIDADES MEDICAS LTDA', '13180473000160', '55700000', 'R ANTONIO FERNANDES SALSA, 294', NULL, NULL, 'JOSE FERNANDES SALSA', 'Limoeiro', 'PE', '2025-10-28 12:32:12'),
(683, 'HOSPITAL E MATERNIDADE CELSO PIERRO', 'SOCIEDADE CAMPINEIRA DE EDUCACAO E INSTRUCAO', '46020301000269', '13060803', 'AV John Boyd Dunlop, 00', NULL, NULL, 'Jardim Ipaussurama', 'Campinas', 'SP', '2025-10-28 12:32:12'),
(684, 'OLIVEIRAS - SERVICOS MEDICOS LTDA', 'OLIVEIRAS - SERVICOS MEDICOS LTDA', '33476529000135', '41820790', 'AL. SALVADOR, 1057', NULL, NULL, 'CAMINHO DAS ARVORES', 'Salvador', 'BA', '2025-10-28 12:32:12'),
(685, 'CLIMAGEM', 'P. G. PEREIRA DA SILVA LTDA', '22665075000205', '55700000', 'R CORONEL MENOEL DE AQUINO, 144', NULL, NULL, 'JOSE FERNANDES SALSA', 'Limoeiro', 'PE', '2025-10-28 12:32:12'),
(686, 'PLF SERVICOS MEDICOS AMBULATORIAIS, CONSULTAS E LABORATORIOS', 'PLF SERVICOS MEDICOS AMBULATORIAIS, CONSULTAS E LABORATORIOS', '40016635000100', '58038262', 'R Universitário Walder Belo Rabelo Pessoa da Costa, 181', NULL, NULL, 'Manaíra', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(687, 'CLINIC ALLURE', 'POLICLINICA ALLURE LTDA', '33510055000109', '58042320', 'R Manoel Cândido Leite, 41', NULL, NULL, 'Tambauzinho', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(688, 'POLICLINICA DAS PRAIAS', 'POLICLINICA NOSSA SENHORA DA CONCECAO LTDA', '27231660000130', '58039181', 'AV Senador Ruy Carneiro, 166', NULL, NULL, 'Tambaú', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(689, 'MEDMAIS', 'POLICLINICA POPULAR PATOENSE LTDA', '29533180000159', '58700235', 'R Presidente Floriano Peixoto, 75', NULL, NULL, 'Centro', 'Patos', 'PB', '2025-10-28 12:32:12'),
(690, 'UNIMED TERESINA', 'UNIMED TERESINA COOPERATIVA DE TRABALHO MEDICO', '07241136000132', '64001360', 'R SAO JOAO, 1262', NULL, NULL, 'CENTRO', 'Teresina', 'PI', '2025-10-28 12:32:12'),
(691, 'HOSPITAL REGIONAL DE PALMARES', 'HOSPITAL REGIONAL DE PALMARES', '10572048002848', '55540000', 'R CEL PEDRO PARANHOS, 270', NULL, NULL, 'CENTRO', 'Palmares', 'PE', '2025-10-28 12:32:12'),
(692, 'VIDA', 'FUNDACAO VIDA', '30091618000175', '55296670', 'AV THOMPSON, 114', NULL, NULL, 'HELIOPOLIS', 'Garanhuns', 'PE', '2025-10-28 12:32:12'),
(693, 'SMARTFIT', 'SMARTFIT ESCOLA DE GINASTICA E DANCA S.A', '07594978031219', '52070230', 'EST do Arraial, 3600', NULL, NULL, 'Casa Amarela', 'Recife', 'PE', '2025-10-28 12:32:12'),
(694, 'SMARTFIT', 'SMARTFIT ESCOLA DE GINASTICA E DANCA S.A', '07594978055150', '52011050', 'R Amélia, 114', NULL, NULL, 'Graças', 'Recife', 'PE', '2025-10-28 12:32:12'),
(695, 'SMARTFIT', 'SMARTFIT ESCOLA DE GINASTICA E DANCA S.A', '07594978043730', '52050146', 'AV Conselheiro Rosa e Silva, 1834', NULL, NULL, 'Tamarineira', 'Recife', 'PE', '2025-10-28 12:32:12'),
(696, 'SMARTFIT', 'SMARTFIT ESCOLA DE GINASTICA E DANCA S.A', '07594978001220', '50710001', 'R José Bonifácio, 1315', NULL, NULL, 'Torre', 'Recife', 'PE', '2025-10-28 12:32:12'),
(697, 'SMARTFIT', 'SMARTFIT ESCOLA DE GINASTICA E DANCA S.A', '07594978055827', '51020280', 'R Padre Carapuceiro, 777', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:32:12'),
(698, 'SMARTFIT', 'SMARTFIT ESCOLA DE GINASTICA E DANCA S.A', '07594978036440', '54410902', 'AV Barreto de Menezes, 800', NULL, NULL, 'Piedade', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:12'),
(699, 'SMARTFIT', 'SMARTFIT ESCOLA DE GINASTICA E DANCA S.A', '21822363000182', '51021330', 'R Ernesto de Paula Santos, 187', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:32:12'),
(700, 'UB FITNESS', 'UB ACADEMIA DE MUSCULACAO LTDA', '29720973000187', '50050230', 'R Padre Inglês, 356', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(701, 'AFRAFEP', 'ASSOCIACAO DOS AUDITORES FISCAIS DO ESTADO DA PARAIBA', '09306242000182', '58013260', 'R Corálio Soares de Oliveira, 497', NULL, NULL, 'Centro', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(702, 'POLICLIN', 'VICAN ATIVIDADES MEDICAS LTDA', '35799309000178', '48903485', 'TRA Benjamin Constant, 1', NULL, NULL, 'Centro', 'Juazeiro', 'BA', '2025-10-28 12:32:12'),
(703, 'CLIM COMERCIO VAREJISTA DE ARTIGOS MEDICOS E ORTOPEDICOS LTD', 'CLIM COMERCIO VAREJISTA DE ARTIGOS MEDICOS E ORTOPEDICOS LTD', '51127326000115', '58075427', 'RUA RUA DOUTOR MANOEL LOPES DE CARVALHO, 714', NULL, NULL, 'ERNESTO GEISEL', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(704, 'UNIMED SEGUROS SAUDE S/A', 'UNIMED SEGUROS SAUDE S/A', '04487255000181', '01410901', 'AL Ministro Rocha Azevedo, 346', NULL, NULL, 'Cerqueira César', 'São Paulo', 'SP', '2025-10-28 12:32:12'),
(705, 'POULP SERVICOS MEDICOS HOSPITALARES E COMERCIO LTDA', 'POULP SERVICOS MEDICOS HOSPITALARES E COMERCIO LTDA', '45010427000109', '53010450', 'RUA RUA DOUTOR ARNULFO LINS E SILVA, 108', NULL, NULL, 'SANTA TEREZA', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(706, 'HOSPITAL NOSSA SENHORA DAS GRACAS', 'FUNDACAO GESTAO HOSPITALAR MARTINIANO FERNANDES - FGH', '09039744002308', '51030020', 'R Visconde de Jequitinhonha, 1144', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:32:12'),
(707, 'APAMI', 'ASS PETROLINENSE DE AMPARO A MATERNIDADE E A INFANCIA', '10730125000120', '56306290', 'R Visconde de Mauá, 10', NULL, NULL, 'Gercino Coelho', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(708, 'POTIGUAR DISTRIBUIDORA DE FRIOS  LTDA', 'POTIGUAR DISTRIBUIDORA DE FRIOS  LTDA', '11672481000106', '59062480', 'R J R JOSE RIBEIRO DANTAS, 2704', NULL, NULL, 'LAGOA NOVA', 'Natal', 'RN', '2025-10-28 12:32:12'),
(709, 'MACAU GABINETE PREFEITO', 'MUNICIPIO DE MACAU', '08184434000109', '59500000', 'R BARAO DO RIO BRANCO, 17', NULL, NULL, 'CENTRO', 'Macau', 'RN', '2025-10-28 12:32:12'),
(710, 'MUNICIPIO DE TIMBAUBA', 'MUNICIPIO DE TIMBAUBA', '11361904000169', '55870000', 'R DOUTOR ALCEBIADES, 276', NULL, NULL, 'CENTRO', 'Timbaúba', 'PE', '2025-10-28 12:32:12'),
(711, 'PROCARDIO', 'PROCARDIO CLINICA - CARDIOLOGIA DE PETROLINA LTDA', '07690287000178', '56304000', 'AV Souza Filho, 852', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(712, 'HOSPITAL MEMORIAL SAO FRANCISCO', 'PROCADIO INSTITUTO DE CARDIOLOGIA DA PARAIBA LTDA', '08973539000139', '58040490', 'AV Rui Barbosa, 198', NULL, NULL, 'Torre', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(713, 'QUEIROGA PAI E FILHO', 'QUEIROGA E FILHO ASSISTENCIA MEDICA LTDA', '25461873000122', '52061030', 'R Silveira Lobo, 32', NULL, NULL, 'Poço', 'Recife', 'PE', '2025-10-28 12:32:12'),
(714, 'PROVER SOLUCOES EMPRESARIAIS', 'JD SERVICOS DE ATENDIMENTO HOSPITALAR LTDA', '11152217000133', '50720000', 'AV CAXANGA, 265', NULL, NULL, 'MADALENA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(715, 'LIGA NORTE RIOGRANDENSE CONTRA O CANCER', 'LIGA NORTE RIOGRANDENSE CONTRA O CANCER', '08428765000139', '59062000', 'AV Miguel Castro, 1355', NULL, NULL, 'Nossa Senhora de Nazaré', 'Natal', 'RN', '2025-10-28 12:32:12'),
(716, 'PAULO JOSE MAIA ESMERALDO SOBREIRA - ME', 'PAULO JOSE MAIA ESMERALDO SOBREIRA - ME', '09210219000190', '58900000', 'AV  SEVERINO CORDEIRO , 402', NULL, NULL, 'JARDIM OASIS', 'Cajazeiras', 'PB', '2025-10-28 12:32:12'),
(717, 'BIOMED DISTRIBUIDORA HOSPITALAR E LABORATORIAL NOSSA SENHORA', 'BIOMED DISTRIBUIDORA HOSPITALAR E LABORATORIAL NOSSA SENHORA', '07936090000176', '58900000', 'AVE AVENIDA PEDRO MORENO GONDIM, 320', NULL, NULL, 'REMEDIOS', 'Cajazeiras', 'PB', '2025-10-28 12:32:12'),
(718, 'TECSAUDE LOCACAO E MANUTENCAO', 'IA MANUTENCAO HOSPITALAR LTDA', '08611742000165', '54400220', 'R Sílvia Ferreira, 1', NULL, NULL, 'Piedade', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:12'),
(719, 'DIRETORIA DE ECONOMIA E FINANCAS DA AERONAUTICA - DIREF', 'COMANDO DA AERONAUTICA', '00394429000100', '70045900', 'ETR dos Ministérios Bloco M, 00000', NULL, NULL, 'Zona Cívico-Administrativa', 'Brasília', 'DF', '2025-10-28 12:32:12'),
(720, 'AFA - ACADEMIA DA FORCA AEREA', 'COMANDO DA AERONAUTICA', '00394429000291', '13631301', 'R Capitão Octaviano José Corrêa, 00000', NULL, NULL, 'Vila Industrial', 'Pirassununga', 'SP', '2025-10-28 12:32:12'),
(721, 'RAIMUNDA ARRUDA DE LIMA 87246910204', 'RAIMUNDA ARRUDA DE LIMA 87246910204', '41924542000138', '68515000', 'RUA RUA 26 DE JUNHO, S/N', NULL, NULL, 'PALMARES II', 'Parauapebas', 'PA', '2025-10-28 12:32:12'),
(722, 'ODIVANE EVENTOS ESPORTIVOS', 'O. MARIA VEIGA REGO', '27667154000198', '53415130', 'R Araripina, 26', NULL, NULL, 'Artur Lundgren I', 'Paulista', 'PE', '2025-10-28 12:32:12'),
(723, 'PET SHOP HOTEL LTDA - EPP', 'PET SHOP HOTEL LTDA - EPP', '17960405000174', '50850000', 'RUA RUA SAO MIGUEL, 1324', NULL, NULL, 'AFOGADOS', 'Recife', 'PE', '2025-10-28 12:32:12'),
(724, 'PAULISTA PRAIA HOTEL S/A', 'PAULISTA PRAIA HOTEL S/A', '00338915000101', '51030300', 'R Barão de Souza Leão, 451', NULL, NULL, 'Boa Viagem', 'Recife', 'PE', '2025-10-28 12:32:12'),
(725, 'CLINICA DOS FEIRANTES VIDA E SAUDE', 'CONSULTORIOS MEDICOS VIDA E SAUDE LTDA', '08721280000139', '54330212', 'R Rua do Colégio, 35', NULL, NULL, 'Cajueiro Seco', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:12'),
(726, 'FUNDACAO PEDRO AMERICO', 'FUNDACAO PEDRO AMERICO', '06101061000121', '58410410', 'RUA RUA LUIZA BEZERRA MOTTA, 200', NULL, NULL, 'CATOLE', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(727, 'FUNDO MUNICIPAL DE SAUDE DE SANTA RITA', 'FUNDO MUNICIPAL DE SAUDE DE SANTA RITA', '08694222000163', '58300140', 'AV João Pessoa, 000', NULL, NULL, 'Centro', 'Santa Rita', 'PB', '2025-10-28 12:32:12'),
(728, 'SB FIT ACADEMIA 017 LTDA', 'SB FIT ACADEMIA TAMBAU LTDA', '31667671000134', '58045120', 'AV Monsenhor Odilon Coutinho, 128', NULL, NULL, 'Cabo Branco', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(729, 'REPRESENTA MATERIAIS CIRURGICOS MEDICOS E HOSPITALARES LTDA', 'REPRESENTA MATERIAIS CIRURGICOS MEDICOS E HOSPITALARES LTDA', '12891935000194', '50070460', 'RUA RUA SENADOR JOSE HENRIQUE, 224', NULL, NULL, 'ILHA DO LEITE', 'Recife', 'PE', '2025-10-28 12:32:12'),
(730, 'OTO CARDIO', 'CLINICA CARDIOLOGICA ROBERTA MACIEL LTDA', '23798922000191', '55014100', 'R Raul Paranhas, 102', NULL, NULL, 'Maurício de Nassau', 'Caruaru', 'PE', '2025-10-28 12:32:12'),
(731, 'SBC / AL', 'SOCIEDADE BRASILEIRA DE CARDIOLOGIA / ESTADUAL ALAGOAS', '00124682000144', '57035000', 'AV Engenheiro Mário de Gusmão, 18', NULL, NULL, 'Ponta Verde', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(732, 'HOSPITAL PROMATER', 'AMIGO SAUDE LTDA', '51722957017409', '59031630', 'R São José, 1979', NULL, NULL, 'Lagoa Nova', 'Natal', 'RN', '2025-10-28 12:32:12'),
(733, 'AGRESTE FARMA', 'AGRESTE FARMA LTDA', '47866974000116', '55293970', 'AV DR JOAO CALADO BORBA, 01', NULL, NULL, 'SANTO ANTONIO', 'Garanhuns', 'PE', '2025-10-28 12:32:12'),
(734, 'EMPRESA BRASILEIRA DE SERVICOS HOSPITALARES - EBSERH', 'EMPRESA BRASILEIRA DE SERVICOS HOSPITALARES - EBSERH', '15126437000143', '70308200', 'QUA QUADRA SCS QUADRA 9 LOTE C EDIFICIO PARQUE CIDADE CORPOR', NULL, NULL, 'ASA SUL', 'Brasília', 'DF', '2025-10-28 12:32:12'),
(735, 'UNIVERSIDADE FEDERAL DE PERNAMBUCO', 'UNIVERSIDADE FEDERAL DE PERNAMBUCO', '24134488000108', '50670420', 'AV Professor Moraes Rego, 1235', NULL, NULL, 'Várzea', 'Recife', 'PE', '2025-10-28 12:32:12'),
(736, 'MENDES E ROSAS DIAGNOSTICO POR IMAGEM LTDA', 'MENDES E ROSAS DIAGNOSTICO POR IMAGEM LTDA', '11149864000196', '58400560', 'R Capitão João Alves de Lira, 742', NULL, NULL, 'Prata', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(737, 'FUNDACAO GOVERNADOR FLAVIO RIBEIRO COUTINHO', 'FUNDACAO GOVERNADOR FLAVIO RIBEIRO COUTINHO', '09433715000102', '58302515', 'R Sá Andrade, 202', NULL, NULL, 'Municípios', 'Santa Rita', 'PB', '2025-10-28 12:32:12'),
(738, 'FMS - FUNDO MUNICIPAL DE SAUDE JPA', 'FUNDO MUNICIPAL DE SAUDE JOÃO PESSOA', '08715618000140', '58040000', 'AV Presidente Epitácio Pessoa, 0000', NULL, NULL, 'Torre', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(739, 'PATOS PREF GABINE E DO PREFEITO', 'MUNICIPIO DE PATOS', '09084815000170', '58700020', 'R Presidente Epitácio Pessoa, 0000', NULL, NULL, 'Centro', 'Patos', 'PB', '2025-10-28 12:32:12'),
(740, 'GHJ SERVICOS MEDICOS', 'GHJ SERVICOS MEDICOS LTDA', '54785699000171', '52050340', 'R da Angustura, 126', NULL, NULL, 'Aflitos', 'Recife', 'PE', '2025-10-28 12:32:12'),
(741, 'CLINICA DO RIM DE VITORIA DE SANTO ANTAO LTDA', 'CLINICA DO RIM DE VITORIA DE SANTO ANTAO LTDA', '70077797000100', '55604070', 'AV Doutor Agamenon Magalhães, 000', NULL, NULL, 'São Vicente de Paulo', 'Vitória de Santo Antão', 'PE', '2025-10-28 12:32:12'),
(742, 'CEAD', 'INSTITUTO DO FIGADO E TRANSPLANTE DE PERNAMBUCO - IFP', '07421280000150', '50100130', 'R Arnóbio Marques, 282', NULL, NULL, 'Santo Amaro', 'Recife', 'PE', '2025-10-28 12:32:12'),
(743, 'MJ GABINETE DO MINISTRO', 'MINISTERIO DA JUSTICA E SEGURANCA PUBLICA', '00394494000136', '70064900', 'ETR dos Ministérios Bloco T, 0000', NULL, NULL, 'Zona Cívico-Administrativa', 'Brasília', 'DF', '2025-10-28 12:32:12'),
(744, 'SAO MAMEDE PREF GABINETE DO PREFEITO', 'MUNICIPIO DE SAO MAMEDE', '08922718000147', '58625000', 'R JANUNCIO NOBREGA, 1', NULL, NULL, 'CENTRO', 'São Mamede', 'PB', '2025-10-28 12:32:12'),
(745, 'BUCAR ENGENHARIA', 'BK ENGENHARIA E METROLOGIA LTDA', '14349591000464', '58040450', 'AV Santa Júlia, 159', NULL, NULL, 'Torre', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(746, 'BAHIA SEC GABINETE DO SECRETARIO', 'SECRETARIA DA EDUCACAO-SEC', '13937065000100', '41630350', 'AV Travessa Luiz Viana Filho, 0000', NULL, NULL, 'Itapuã', 'Salvador', 'BA', '2025-10-28 12:32:12'),
(747, 'HOSPITAL GETULIO VARGAS', 'PIAUI SECRETARIA DE SAUDE', '06553564010443', '64001020', 'AV Frei Serafim, 2352', NULL, NULL, 'Centro', 'Teresina', 'PI', '2025-10-28 12:32:12'),
(748, 'SA RODRIGUES CLINICA MEDICA', 'SARAH SA RODRIGUES SILVESTRE', '26995532000108', '58046090', 'R POETA TARGINO TEIXEIRA, 251', NULL, NULL, 'ALTIPLANO CABO BRANCO', 'João Pessoa', 'PB', '2025-10-28 12:32:12');
INSERT INTO `organizacoes` (`id`, `nome_fantasia`, `razao_social`, `cnpj`, `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `data_criacao`) VALUES
(749, 'CLINCA ORTOPEDICA DE NATAL LTDA', 'CLINICA ORTOPEDICA DE NATAL LTDA', '35654631000109', '59056500', 'AV ANTONIO BASILIO, 3117', NULL, NULL, 'LAGOA NOVA', 'Natal', 'RN', '2025-10-28 12:32:12'),
(750, 'REAL HEPATOLOGICA CLINICA LTDA', 'REAL HEPATOLOGICA CLINICA LTDA', '18018370000111', '52010902', 'AV Governador Agamenon Magalhães, 4760', NULL, NULL, 'Paissandu', 'Recife', 'PE', '2025-10-28 12:32:12'),
(751, 'IPEG', 'IPEG-INSTITUTO PERNAMBUCO DE ENDOSCOPIA GASTROINTESTINAL', '24428954000168', '52061030', 'R Silveira Lobo, 4760', NULL, NULL, 'Poço', 'Recife', 'PE', '2025-10-28 12:32:12'),
(752, 'CENTRO CLINICO OKAZAKI', 'CENTRO CLINICO OKAZAKI i LTDA', '12770780000138', '52010040', 'AV Governador Agamenon Magalhães, 4318', NULL, NULL, 'Derby', 'Recife', 'PE', '2025-10-28 12:32:12'),
(753, 'ENDOMULHER RECIFE', 'ENDOGINE-ENDOSCOPIA GINECOLOGICA LTDA', '73886491000193', '50610190', 'R Bartolomeu de Gusmão, 230', NULL, NULL, 'Madalena', 'Recife', 'PE', '2025-10-28 12:32:12'),
(754, 'MULTIGASTRO', 'UNIGASTRO UNIDADE DE ENDOSCOPIA DO MEMORIAL SAO JOSE LTDA', '70209192000126', '50070170', 'R das Fronteiras, 175', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(755, 'ENDOSABIN-ENDOSCOPIA SABIN LTDA', 'ENDOSABIN-ENDOSCOPIA SABIN LTDA', '08959991000146', '50070480', 'R Antônio Gomes de Freitas, 128', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:32:12'),
(756, 'CAPESESP', 'CAIXA DE PREV. E ASSIST. DOS SERVIDORES DA FUNDACAO-CAPESESP', '30036685000197', '20020080', 'AV Marechal Câmara, 160', NULL, NULL, 'Centro', 'Rio de Janeiro', 'RJ', '2025-10-28 12:32:12'),
(757, 'BRF S.A.', 'BRF S.A.', '01838723016201', '55613900', 'ROD PE 050 KM 2 SL 3 PREDIO 2, S/N', NULL, NULL, 'DISTRITO INDUSTRIAL', 'Vitória de Santo Antão', 'PE', '2025-10-28 12:32:12'),
(758, 'UNIBRA CAMPUS III', 'IBGM - INSTITUTO BRASILEIRO DE GESTAO & MARKETING LTDA', '07397220000573', '50050230', 'R Padre Inglês, 356', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(759, 'LOCAMEDI LOCACAO DE EQUIPAMENTOS E ASSISTENCIA MEDICA LTDA', 'LOCAMEDI LOCACAO DE EQUIPAMENTOS E ASSISTENCIA MEDICA LTDA', '09003066000100', '14030000', 'AVE AVENIDA CARAMURU, 612', NULL, NULL, 'REPUBLICA', 'Ribeirão Preto', 'SP', '2025-10-28 12:32:12'),
(760, 'CLINICA RADIOLOGICA DR. WANDERLEY LTDA', 'CLINICA RADIOLOGICA DR. WANDERLEY LTDA', '08716557000305', '58400506', 'R Duque de Caxias, 630', NULL, NULL, 'Prata', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(761, '14. BATALHAO LOGISTICO', '14. BATALHAO LOGISTICO', '09593838000100', '50850000', 'R São Miguel, 898', NULL, NULL, 'Afogados', 'Recife', 'PE', '2025-10-28 12:32:12'),
(762, 'IRMANDADE DA SANTA CASA DA MISERICORDIA DE SANTOS', 'IRMANDADE DA SANTA CASA DA MISERICORDIA DE SANTOS', '58198524000119', '11075900', 'AVE AVENIDA DR CLAUDIO LUIZ DA COSTA, 50', NULL, NULL, 'JABAQUARA', 'Santos', 'SP', '2025-10-28 12:32:12'),
(763, '31 BATALHAO DE INFANTARIA MOTORIZADO', '31 BATALHAO DE INFANTARIA MOTORIZADO', '09649390000280', '58102300', 'R XV DE NOVEMBRO, 100', NULL, NULL, 'CONCEICAO', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(764, 'A.G. COLLIER', 'CLINICA DE REPRODUCAO HUMANA LIMITADA', '20763206000180', '50070460', 'R Senador José Henrique, 231', NULL, NULL, 'Ilha do Leite', 'Recife', 'PE', '2025-10-28 12:32:12'),
(765, 'FUNDO MUNICIPAL DE SAUDE - CONGO - PARAIBA', 'FUNDO MUNICIPAL DE SAUDE - CONGO - PARAIBA', '11436548000103', '58535000', 'R MINISTRO JOSE AMERICO, 000', NULL, NULL, 'CENTRO', 'Congo', 'PB', '2025-10-28 12:32:12'),
(766, 'ESPACO SAUDE VIDA', 'RENATA GIR SAUDE VIDA LTDA', '22685395000146', '54400220', 'R Sílvia Ferreira, 568', NULL, NULL, 'Piedade', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:12'),
(767, 'SERGIO MEDEIROS DA SILVA JUNIOR 00230439705', 'SERGIO MEDEIROS DA SILVA JUNIOR 00230439705', '22958766000116', '22776070', 'AV Flamboyants da Península, 960', NULL, NULL, 'Barra da Tijuca', 'Rio de Janeiro', 'RJ', '2025-10-28 12:32:12'),
(768, 'R J P DINIZ LTDA', 'R J P DINIZ LTDA', '48883788000158', '59611270', 'R Dalton Cunha, 1003', NULL, NULL, 'Abolição', 'Mossoró', 'RN', '2025-10-28 12:32:12'),
(769, 'QUINTAL DAS PATINHAS', 'QUINTAL DAS PATINHAS LTDA', '48789202000190', '50781130', 'AV Estância, 342', NULL, NULL, 'Areias', 'Recife', 'PE', '2025-10-28 12:32:12'),
(770, 'SERVIÇO DE SAUDE DE SAO VICENTE', 'SERVIÇO DE SAUDE DE SAO VICENTE', '49955719000175', '11310040', 'RUA RUA PADRE ANCHIETA, 462', NULL, NULL, 'CENTRO', 'São Vicente', 'SP', '2025-10-28 12:32:12'),
(771, 'VITALE COMERCIO S.A.', 'VITALE COMERCIO S.A.', '07160019000144', '50800010', 'RUA RUA PROFESSOR JOAQUIM CAVALCANTI, 208', NULL, NULL, 'IPUTINGA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(772, 'EMILIO RIBAS MEDICINA DIAGNOSTICA LTDA.', 'EMILIO RIBAS MEDICINA DIAGNOSTICA LTDA.', '09472754001603', '60811341', 'AV Washington Soares, 85', NULL, NULL, 'Edson Queiroz', 'Fortaleza', 'CE', '2025-10-28 12:32:12'),
(773, 'CLINICAL CENTER IMAGEM', 'CLINICAL CENTER IMAGEM PETROLINA LTDA', '13405198000135', '56320370', 'R JOSE CLEMENTE DE AMORIM, 27-A', NULL, NULL, 'COHAB MASSANGANO', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(774, 'MEMORIAL HOSPITAL DE GOIANA', 'MEMORIAL HOSPITAL DE GOIANA LTDA', '12903605000171', '55900000', 'ROD PE 75 KM 2,2, S/N', NULL, NULL, 'CENTRO', 'Goiana', 'PE', '2025-10-28 12:32:12'),
(775, 'COOP MAIS SAÚDE', 'VANDERLUCIA LACERDA DOS SANTOS', '38296479000128', '53220130', 'AV Antônio da Costa Azevedo, 456', NULL, NULL, 'Peixinhos', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(776, 'BOA VISTA MEDICAL CENTER', 'ALBA CHAVES DOS SANTOS LTDA', '13962050000100', '50070065', 'R GONCALVES MAIA, 186', NULL, NULL, 'SOLEDADE', 'Recife', 'PE', '2025-10-28 12:32:12'),
(777, 'HVU - HOSPITAL VALE DO UNA', 'INSTITUTO DE ASSISTENCIA VALE DO UNA', '13296018000124', '56540000', 'AV AV JOSE AMERICO DE MIRANDA, 00', NULL, NULL, 'SANTA ROSA', 'Tupanatinga', 'PE', '2025-10-28 12:32:12'),
(778, 'SOBER HOUSE CLINIC', 'SBC SAUDE MENTAL LTDA', '39471605000104', '54745230', 'R HORTENCIO, 53', NULL, NULL, 'CHA DA TABUA', 'São Lourenço da Mata', 'PE', '2025-10-28 12:32:12'),
(779, 'LINKMED- SOLUCAO EM EQUIPAMENTO MEDICO HOSPITALAR LTDA EPP', 'LINKMED- SOLUCAO EM EQUIPAMENTO MEDICO HOSPITALAR LTDA EPP', '06025185000175', '50070420', 'RUA RUA ESTADO DE ISRAEL, 334', NULL, NULL, 'ILHA DO LEITE', 'Recife', 'PE', '2025-10-28 12:32:12'),
(780, 'UNIMED DE PIRACICABA SOCIEDADE COOPERATIVA DE SERVICOS MEDIC', 'UNIMED DE PIRACICABA SOCIEDADE COOPERATIVA DE SERVICOS MEDIC', '44803922000102', '13420640', 'AV ANTONIA PAZINATO STURION, 1201', NULL, NULL, 'MORUMBI', 'Piracicaba', 'SP', '2025-10-28 12:32:12'),
(781, 'REAL SAUDE', 'REAL SAUDE MEDICA AMBULATORIAL LTDA', '41124528000150', '56310220', 'R AMANCIO ARAUJO, 66', NULL, NULL, 'COHAB MASSANGANO', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(782, 'CENTRO DE DIAGNOSTICOS E TRATAMENTO DO VALE DO SAO FRANCISCO', 'CENTRO DE DIAGNOSTICOS E TRATAMENTO DO VALE DO SAO FRANCISCO', '03893722000100', '56304210', 'R Tobias Barreto, 08', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(783, 'ESPACO MED POPULAR', 'ESPACO MED POPULAR LTDA', '51104468000167', '53030010', 'AV Presidente Getúlio Vargas, 999', NULL, NULL, 'Bairro Novo', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(784, 'VICTOR RAMIRES REYNAUX BORBA DR.', 'VRRB PRESTACOES DE SERVICOS MEDICOS LTDA', '27179663000171', '53140080', 'AV FAGUNDES VARELA, 110', NULL, NULL, 'JARDIM ATLANTICO', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(785, 'MULTIHEMO SERVICOS MEDICOS S/A', 'MULTIHEMO SERVICOS MEDICOS S/A', '03559174000187', '50070460', 'R SENADOR JOSE HENRIQUE, 231', NULL, NULL, 'ILHA DO LEITE', 'Recife', 'PE', '2025-10-28 12:32:12'),
(786, 'HOSPITAL REGIONAL FERNANDO BEZERRA', 'INSTITUTO SOCIAL DAS MEDIANEIRAS DA PAZ', '10739225001866', '56200000', 'R TEOBALDO GOMES TORRES, 510', NULL, NULL, 'CENTRO', 'Ouricuri', 'PE', '2025-10-28 12:32:12'),
(787, 'CONDOMINIO MALAWI MURO ALTO BEACH HOUSES', 'CONDOMINIO MALAWI MURO ALTO BEACH HOUSES', '21398750000133', '55590000', 'SIT SITIO FAZENDA MEREPE SN L2 AREA C, S/N', NULL, NULL, 'S/B', 'Ipojuca', 'PE', '2025-10-28 12:32:12'),
(788, 'EGIMED HOSPITALAR', 'EGIGLAUSON SOUSA DE LIMA', '21437194000167', '60520315', 'R MELO OLIVEIRA, 1171', NULL, NULL, 'JOQUEI CLUBE', 'Fortaleza', 'CE', '2025-10-28 12:32:12'),
(789, 'ART CIRURGICA COMERCIO DE PRODUTOS HOSPITALARES LTDA', 'ART CIRURGICA COMERCIO DE PRODUTOS HOSPITALARES LTDA', '24436602000154', '50610090', 'AVE AVENIDA VISCONDE DE ALBUQUERQUE, 926', NULL, NULL, 'MADALENA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(790, 'FGH - HOSPITAL METROPOLITANO OESTE PELOPIDAS SILVEIRA', 'FUNDACAO GESTAO HOSPITALAR MARTINIANO FERNANDES - FGH', '09039744002723', '50070615', 'R dos Coelhos, 450', NULL, NULL, 'Boa Vista', 'Recife', 'PE', '2025-10-28 12:32:12'),
(791, 'SUPERINTENDENCIA REG. DA POL. RODOV. FEDERAL EM ALAGOAS', 'MINISTERIO DA JUSTICA E SEGURANCA PUBLICA', '00394494012495', '57081285', 'AV DURVAL DE GOES MONTEIRO, 2882', NULL, NULL, 'TABULEIRO DO MARTINS', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(792, 'UNIDADE DE PRONTO ATENDIMENTO - UPA CURADO', 'HOSPITAL DO TRICENTENARIO', '10583920000303', '54220000', 'AV LEONARDO DA VINCI, 68', NULL, NULL, 'CURADO II', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:12'),
(793, 'SAUDE LIVRE CLINICA DE VACINACAO', 'COMPLETA SOLUCOES INJETAVEIS LTDA.', '53400733000180', '52050050', 'AV SANTOS DUMONT, 76', NULL, NULL, 'GRACAS', 'Recife', 'PE', '2025-10-28 12:32:12'),
(794, 'AMAVALE AGRICOLA', 'AMAVALE AGRICOLA LTDA', '07310834000223', '56314000', 'ROD BR 407 KM 115 - FAZENDA PORTEIRINHA, S/N', NULL, NULL, 'ZONA RURAL', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(795, 'SEB', 'SEB SISTEMA EDUCACIONAL BRASILEIRO S.A.', '56012628002105', '57035250', 'R SENADDOR RUI PALMEIRA, 1200', NULL, NULL, 'PONTA VERDE', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(796, 'MULTIANGIO', 'MULTIANGIO LTDA', '03019475000118', '52011005', 'R JOAQUIM NABUCO, 200', NULL, NULL, 'GRACAS', 'Recife', 'PE', '2025-10-28 12:32:12'),
(797, 'UNIMED DE NATAL', 'UNIMED NATAL SOC COOP DE TRABALHO MEDICO', '08380701000105', '59020250', 'R Mipibu, 511', NULL, NULL, 'Petrópolis', 'Natal', 'RN', '2025-10-28 12:32:12'),
(798, 'PEPSICO DO BRASIL INDUSTRIA E COMERCIO DE ALIMENTOS LTDA.', 'PEPSICO DO BRASIL INDUSTRIA E COMERCIO DE ALIMENTOS LTDA.', '02957518001468', '5459000', 'ETR EST QUARTO ACESSO DA PE 60, 776', NULL, NULL, 'DISTRITO INDUSTRIAL DE SUAPE', 'Arraial do Cabo', 'RJ', '2025-10-28 12:32:12'),
(799, 'CLINICA TERAPEUTICA MEL', 'CLINICA TERAPEUTICA ESPECIALIZADA MEL LTDA', '42908184000132', '55825000', 'R DAS ANTENAS, 00', NULL, NULL, 'CHA DE CRUZ', 'Paudalho', 'PE', '2025-10-28 12:32:12'),
(800, 'HOSPITAL ALVORADA DE BRASILIA', 'ESHO EMPRESA DE SERVICOS HOSPITALARES LTDA', '29435005004620', '70390108', 'SEP SEP/SUL EQ 710/910 CONJ B BLOCO I E II, 910', NULL, NULL, 'ASA SUL', 'Brasília', 'DF', '2025-10-28 12:32:12'),
(801, 'PROGRAMA DE ASSISTENCIA A SAUDE DO TRT DA 19 REGIAO', 'PROGRAMA DE ASSISTENCIA A SAUDE DO TRT DA 19 REGIAO', '07175139000115', '57020440', 'AV da Paz, 2076', NULL, NULL, 'Centro', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(802, 'ODONTOGALERIE', 'CLINICA SAO RAFAEL LTDA', '12532609000190', '58038320', 'AV Monteiro da Franca, 424', NULL, NULL, 'Manaíra', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(803, 'ABIOCON COMERCIAL LTDA', 'ABIOCON COMERCIAL LTDA', '10734999000156', '41741350', 'TRA TRAVESSA FRANCISCO PEREIRA COUTINHO, 000082', NULL, NULL, 'PITUACU', 'Salvador', 'BA', '2025-10-28 12:32:12'),
(804, 'AMAVALE AGRICOLA', 'AMAVALE AGRICOLA LTDA', '07310834000142', '56314000', 'NUC NÚCLEO 04 LOTES 1699 PA III E CS03 PERIM IRRIGACAO S. NI', NULL, NULL, 'ZONAL RURAL', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(805, 'CASA DE SAUDE SAO LUCAS S/A', 'CASA DE SAUDE SAO LUCAS S/A', '08319329000121', '59020160', 'R Maxaranguape, 614', NULL, NULL, 'Tirol', 'Natal', 'RN', '2025-10-28 12:32:12'),
(806, 'MACEIOTEC', 'MACEIOTEC COMERCIO E SERVICOS DE EQUIPAMENTOS MEDICO - HOSPI', '14873198000122', '57052230', 'R DOUTOR ALFREDO OITICICA, 88', NULL, NULL, 'PITANGUINHA', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(807, 'MACEDO & MACEDO LTDA.', 'MACEDO & MACEDO LTDA.', '01376753000169', '59215000', 'R DR. MARIO NEGOCIO, 13', NULL, NULL, 'SAO SEBASTIAO', 'Nova Cruz', 'RN', '2025-10-28 12:32:12'),
(808, 'UPA OLINDA', 'INSTITUTO SOCIAL DAS MEDIANEIRAS DA PAZ', '10739225002161', '53350015', 'ROD PE 15, 00', NULL, NULL, 'TABAJARA - 1', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(809, 'IMIP HOSPITALAR - UPA SAO LOURENCO DA MATA', 'FUNDACAO GESTAO HOSPITALAR MARTINIANO FERNANDES - FGH', '09039744000607', '54725000', 'AV Doutor Francisco Correia, 2009', NULL, NULL, 'Pixete', 'São Lourenço da Mata', 'PE', '2025-10-28 12:32:12'),
(810, 'ICONE', 'ICONE INSTITUTO DE CIRURGIA OCULAR DO NORDESTE LTDA', '73696817000110', '51030300', 'R BARAO DE SOUZA LEAO, 425', NULL, NULL, 'BOA VIAGEM', 'Recife', 'PE', '2025-10-28 12:32:12'),
(811, 'ULTRA IMAGEM SERVICOS', 'ULTRA IMAGEM SERVICOS LTDA', '33667644000197', '62800000', 'R CORONEL ALEXANDRINO, 122', NULL, NULL, 'CENTRO', 'Aracati', 'CE', '2025-10-28 12:32:12'),
(812, 'ALEXANDRE CESAR GUIMARAES DE CARVALHO', 'ALEXANDRE CESAR GUIMARAES DE CARVALHO', '40606498000155', '53150130', 'R Maria da Conceição Tavares, 11', NULL, NULL, 'Rio Doce', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(813, 'AP SAUDE CLINICA MEDICA AMBULATORIAL LTDA', 'AP SAUDE CLINICA MEDICA AMBULATORIAL LTDA', '52091003000181', '56304020', 'AV FERNANDO MENEZES DE GOES, 676', NULL, NULL, 'CENTRO', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(814, 'SANLIFE', 'COOPERATIVA DE TRABALHO DE PRESTADORES DE SERVIÇOS EM SAUDE', '02126579000169', '50720100', 'R João Ivo da Silva, 279', NULL, NULL, 'Madalena', 'Recife', 'PE', '2025-10-28 12:32:12'),
(815, 'CEMEC', 'CEMEC CENTRO MEDICO DE CARPINA LTDA', '56120945000100', '55811000', 'AV Congresso Eucarístico Internacional, 148', NULL, NULL, 'Santa Cruz', 'Carpina', 'PE', '2025-10-28 12:32:12'),
(816, 'UNIMED DE SOUSA COOPERATIVA DE TRABALHO MEDICO', 'UNIMED DE SOUSA COOPERATIVA DE TRABALHO MEDICO', '24294787000100', '58802000', 'R Manoel Gadelha Filho, 37', NULL, NULL, 'Gato Preto', 'Sousa', 'PB', '2025-10-28 12:32:12'),
(817, 'MONTEBELLO PRODUTOS PARA SAUDE', 'FONTE E OLIVEIRA LTDA', '48024689000110', '50720655', 'AV Caxangá, 871', NULL, NULL, 'Zumbi', 'Recife', 'PE', '2025-10-28 12:32:12'),
(818, 'NOVAVITAL', 'NOVAVITAL COMERCIO E REPRESENTACOES DE MATERIAIS MEDICOS HOS', '45569269000121', '50070565', 'R FRANCISCO ALVES, 75', NULL, NULL, 'COELHOS', 'Recife', 'PE', '2025-10-28 12:32:12'),
(819, 'HOSPITAL ESPINHEIRO', 'HAPVIDA ASSISTENCIA MEDICA S.A.', '63554067006129', '52020025', 'R DO ESPINHEIRO, 222', NULL, NULL, 'ESPINHEIRO', 'Recife', 'PE', '2025-10-28 12:32:12'),
(820, 'HOSPITAL MEMORIAL SAO FRANCISCO', 'CLINICA ORTOPEDICA E TRAUMATOLOGICA DE NATAL LTDA', '10867687000110', '59022020', 'AV GOVERNADOR JUVENAL LAMARTINE, 979', NULL, NULL, 'TIROL', 'Natal', 'RN', '2025-10-28 12:32:12'),
(821, 'ULTRAMEGA DISTRIBUIDORA HOSPITALAR LTDA', 'ULTRAMEGA DISTRIBUIDORA HOSPITALAR LTDA', '21596736000144', '54792340', 'RUA RUA AUGUSTO LIMA, 390', NULL, NULL, 'ALDEIAS DDOS CAMARAS', 'Camaragibe', 'PE', '2025-10-28 12:32:12'),
(823, 'UPA NOVA DESCOBERTA SOLANO TRINDADE', 'FUNDACAO MANOEL DA SILVA ALMEIDA', '09767633000528', '52191000', 'AV VEREADOR OTACILIO AZEVEDO, S/N', NULL, NULL, 'NOVA DESCOBERTA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(824, 'IMIP HOSPITALAR - UPA PAULISTA', 'FUNDACAO GESTAO HOSPITALAR MARTINIANO FERNANDES - FGH', '09039744000518', '53421035', 'AV MINISTRO MARCOS DE BARROS FREIRE, S/N', NULL, NULL, 'JARDIM PAULISTA', 'Paulista', 'PB', '2025-10-28 12:32:12'),
(825, 'UPA CAXANGÁ', 'FUNDACAO MANOEL DA SILVA ALMEIDA', '09767633000609', '50980427', 'AV Joaquim Ribeiro, 1', NULL, NULL, 'Caxangá', 'Recife', 'PE', '2025-10-28 12:32:12'),
(826, 'BASTOS SERVICOS', 'BASTOS SERVICOS MEDICOS ESPECIALIZADOS LTDA', '35455498000161', '55016700', 'AV Limeira Tejó, 248', NULL, NULL, 'Universitário', 'Caruaru', 'PE', '2025-10-28 12:32:12'),
(827, 'CEMEC - CENTRO DE MEDICINA ESPECIALIZADA', 'CENTRO DE MEDICINA ESPECIALIZADA DE CARUARU LTDA', '03785246000104', '55014000', 'AV AGAMENON MAGALHAES, 940', NULL, NULL, 'MAURICIO DE NASSAU', 'Caruaru', 'PE', '2025-10-28 12:32:12'),
(828, 'UPA SOTAVE', 'ASSOCIACAO DE PROTECAO A MATERNIDADE E INFANCIA UBAIRA', '14284483000450', '54340100', 'R MARACANA, 31', NULL, NULL, 'PRAZERES', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:12'),
(829, 'OLINDA GABINETE DO PREFEITO ( UPA RIO DOCE )', 'MUNICIPIO DE OLINDA', '10404184000109', '53020080', 'R SAO BENTO, 123', NULL, NULL, 'VARADOURO', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(830, 'UPAE ARCOVERDE', 'SOCIEDADE PERNAMBUCANA DE COMBATE AO CANCER', '10894988000214', '56517100', 'AV CONSELHEIRO JOAO ALFREDO, 491', NULL, NULL, 'SANTA LUZIA', 'Arcoverde', 'PE', '2025-10-28 12:32:12'),
(831, 'UPAE BELO JARDIM', 'SOCIEDADE PERNAMBUCANA DE COMBATE AO CANCER', '10894988000303', '55150790', 'ROD BR-232, S/N', NULL, NULL, 'EDSON MORORO MOURA', 'Belo Jardim', 'PE', '2025-10-28 12:32:12'),
(832, 'UPAE ARRUDA', 'SOCIEDADE PERNAMBUCANA DE COMBATE AO CANCER', '10894988000567', '52120100', 'AV PROFESSOR JOSE DOS ANJOS, S/N', NULL, NULL, 'ARRUDA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(833, 'HOSPITAL DA MULHER DO RECIFE', 'SOCIEDADE PERNAMBUCANA DE COMBATE AO CANCER', '10894988000486', '50780627', 'ROD BR CENTO E UM, 485', NULL, NULL, 'CURADO', 'Recife', 'PE', '2025-10-28 12:32:12'),
(834, 'UPAE - CARUARU', 'SOCIEDADE PERNAMBUCANA DE COMBATE AO CANCER', '10894988000729', '55026675', 'AV JOSE MARQUES FONTES, S/N', NULL, NULL, 'INDIANOPOLIS', 'Caruaru', 'PE', '2025-10-28 12:32:12'),
(835, 'HOSPITAL SAO SEBASTIAO ( CARUARU )', 'SOCIEDADE PERNAMBUCANA DE COMBATE AO CANCER', '10894988000648', '55012640', 'AV DOUTOR PEDRO JORDAO, 260', NULL, NULL, 'MAURICIO DE NASSAU', 'Caruaru', 'PE', '2025-10-28 12:32:12'),
(836, 'UNIDADE PRONTO ATENDIMENTO HONORATA DE QUEIROZ GALVAO', 'SECRETARIA DE SAUDE', '10572048001280', '53640000', 'ROD BR 101 NORTE, KM 47, S/N', NULL, NULL, 'CENTRO', 'Igarassu', 'PE', '2025-10-28 12:32:12'),
(837, 'SUPPORTCARE TECNOLOGIA HOSPITALAR LTDA', 'SUPPORTCARE TECNOLOGIA HOSPITALAR LTDA', '10734681000175', '50610380', 'RUA RUA DOUTOR SABINO PINHO, 136', NULL, NULL, 'MADALENA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(838, 'NOA', 'NOA - NUCLEO DE ONCOLOGIA DO AGRESTE LTDA', '18000662000127', '55014330', 'R SALDANHA MARINHO, 979', NULL, NULL, 'MAURICIO DE NASSAU', 'Caruaru', 'PE', '2025-10-28 12:32:12'),
(839, 'CLINICA SANTISSIMA TRINDADE', 'CLINICA MEDICA AMBROZIO & LUCENA LTDA', '55210101000189', '55024740', 'AV ADJAR DA SILVA CASE, 800', NULL, NULL, 'INDIANOPOLIS', 'Caruaru', 'PE', '2025-10-28 12:32:12'),
(840, 'UPAE PALMARES', 'SOCIEDADE PERNAMBUCANA DE COMBATE AO CANCER', '10894988001024', '55540000', 'AV JOSE PRETESTATO DE SANTANA, S/N', NULL, NULL, 'QUILOMBO DOS PALMARES', 'Palmares', 'PE', '2025-10-28 12:32:12'),
(841, 'HOSPITAL ALFA', 'HOSPITAL ALFA S/A - EM RECUPERACAO JUDICIAL', '03337575000192', '51030020', 'R VISCONDE DE JEQUITINHONHA, 1144', NULL, NULL, 'BOA VIAGEM', 'Recife', 'PE', '2025-10-28 12:32:12'),
(842, 'CREMEPE', 'CONSELHO REGIONAL DE MEDICINA DO ESTADO DE PERNAMBUCO', '09790999000194', '52020035', 'R CONSELHEIRO PORTELA, 203', NULL, NULL, 'ESPINHEIRO', 'Recife', 'PE', '2025-10-28 12:32:12'),
(843, 'IMIP - HPS', 'INSTITUTO DE MEDICINA INTEGRAL PROFESSOR FERNANDO FIGUEIRA -', '10988301000633', '50730680', 'ROD BR 232, S/N', NULL, NULL, 'CURADO', 'Recife', 'PE', '2025-10-28 12:32:12'),
(844, 'HOSPITAL MIGUEL ARRAES DE ALENCAR', 'SECRETARIA DE SAUDE', '10572048000985', '53401000', 'ETR FAZENDINHA, S/N', NULL, NULL, 'JAGUARIBE', 'Paulista', 'PB', '2025-10-28 12:32:12'),
(845, 'IMIP HOSPITALAR - UPAE SALGUEIRO', 'FUNDACAO GESTAO HOSPITALAR MARTINIANO FERNANDES - FGH', '09039744001590', '56000000', 'AV JOAO VERAS DE SIQUEIRA, S/N', NULL, NULL, 'JARDIM PRIMAVERA', 'Salgueiro', 'PE', '2025-10-28 12:32:12'),
(846, 'HOSPITAL SEVERINO TAVORA', 'CIRCULO OPERARIO DE OROBO', '10605798000159', '55745000', 'R DEZ DE JANEIRO, 17', NULL, NULL, 'CENTRO', 'Orobó', 'PE', '2025-10-28 12:32:12'),
(847, 'UNIMED DE PIRACICABA SOCIEDADE COOPERATIVA DE SERVICOS MEDIC', 'UNIMED DE PIRACICABA SOCIEDADE COOPERATIVA DE SERVICOS MEDIC', '44803922000293', '13420640', 'AV AVENIDA ANTONIA PAZZINATO STURION, 1221', NULL, NULL, 'JARDIM PETROPOLIS', 'Piracicaba', 'SP', '2025-10-28 12:32:12'),
(848, 'ADVICEHEALTH', 'GESTAO OPME LTDA', '13757898000199', '88050000', 'ROD JOSÉ CARLOS DAUX, 8600', NULL, NULL, 'Santo Antônio de Lisboa', 'Florianópolis', 'SC', '2025-10-28 12:32:12'),
(849, 'QUANTUM COMERCIO LTDA', 'QUANTUM COMERCIO LTDA', '19671790000165', '58038341', 'R João Câncio, 931', NULL, NULL, 'Manaíra', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(850, 'DORGIVAL HENRIQUES', 'DORGIVAL HENRIQUES N F ODONTOLOGIA LTDA', '22457383000164', '50050290', 'AV GOVERNADOR AGAMENON MAGALHAES, 2615', NULL, NULL, 'BOA VISTA', 'Recife', 'PE', '2025-10-28 12:32:12'),
(851, 'EDUARDO CABRAL', '43.971.162 EDUARDO CABRAL DE SOUZA', '43971162000180', '53090500', 'R Setenta, 35', NULL, NULL, 'Rio Doce', 'Olinda', 'PE', '2025-10-28 12:32:12'),
(852, 'SESI SAUDE', 'SERVICO SOCIAL DA INDUSTRIA', '03910210002582', '50040200', 'AV Norte Miguel Arraes de Alencar, 539', NULL, NULL, 'Santo Amaro', 'Recife', 'PE', '2025-10-28 12:32:12'),
(853, 'FMS', 'FUNDO MUNICIPAL DE SAUDE DO BREJO DA MADRE DE DEUS', '09159378000107', '55170000', 'PR PRAÇA VEREADOR ABEL DE FREITAS, 00', NULL, NULL, 'CENTRO', 'Brejo da Madre de Deus', 'PE', '2025-10-28 12:32:12'),
(854, 'HOSPITAL MEMORIAL AGAPE', 'HOSPITAL MEMORIAL AGAPE S/A', '36308155000137', '57315745', 'ROD AL-220, 2550', NULL, NULL, 'SENADOR ARNON DE MELO', 'Arapiraca', 'AL', '2025-10-28 12:32:12'),
(855, 'GESTEC', 'GESTEC GESTAO E TECNOLOGIA PARA SAUDE LTDA PE', '26583095000530', '52011010', 'R DAS PERNAMBUCANAS, 112', NULL, NULL, 'GRACAS', 'Recife', 'PE', '2025-10-28 12:32:12'),
(856, 'LAB + DIAGNOSTICO', 'M E CARD DIAGNOSTICOS LTDA', '41063763000169', '55730000', 'R ISRAEL FONSECA, 59', NULL, NULL, 'CENTRO', 'Bom Jardim', 'PE', '2025-10-28 12:32:12'),
(857, 'TAG COM E ASSIST TECNICA EM MATERIAL HOSPITALAR', 'CONSTAG - CONSTRUCOES E SERVICOS LTDA', '41005786000117', '59146200', 'R SUB OFICIAL FARIAS, 526', NULL, NULL, 'MONTE CASTELO', 'Parnamirim', 'RN', '2025-10-28 12:32:12'),
(858, 'SECRETARIA DE SAUDE', 'FUNDO MUNICIPAL DE SAUDE DE CAMPINA GRANDE', '24513574000121', '58105421', 'AV ASSIS CHATEAUBRIAND, 1376', NULL, NULL, 'LIBERDADE', 'Campina Grande', 'PB', '2025-10-28 12:32:12'),
(859, 'HOSPITAL REGIONAL PROFESSOR AGAMENON MAGALHAES', 'SECRETARIA DE SAUDE', '10572048004387', '56903490', 'R Manoel Pereira da Silva, 955', NULL, NULL, 'Nossa Senhora da Penha', 'Serra Talhada', 'PE', '2025-10-28 12:32:12'),
(860, 'FES-PE', 'FUNDO ESTADUAL DE SAUDE DE PERNAMBUCO', '11430018000140', '50751530', 'R DONA MARIA AUGUSTA NOGUEIRA, 519', NULL, NULL, 'BONGI', 'Recife', 'PE', '2025-10-28 12:32:12'),
(861, 'SECRETARIA MUNICIPAL DE SAUDE DE BEZERROS', 'FUNDO MUNICIPAL DE SAUDE DE BEZERROS', '13486604000131', '55660000', 'R  VITORIANO PEREIRA DE LIMA, 84', NULL, NULL, 'CENTRO', 'Bezerros', 'PE', '2025-10-28 12:32:12'),
(862, 'FUNDO MUNICIPAL DE SAUDE SÃO JOÃO PE', 'FUNDO MUNICIPAL DE SAUDE', '03061099000120', '55435000', 'R JOAO DE ASSIS MORENO, 01', NULL, NULL, 'CENTRO', 'São João', 'PE', '2025-10-28 12:32:12'),
(863, 'FUNDO ESTADUAL DE SEGURANCA E DEFESA SOCIAL DA PB', 'FUNDO DA SEGURANCA E DA DEFESA SOCIAL DO ESTADO DA PARAIBA -', '36814674000177', '58055018', 'AV Hilton Souto Maior, 01', NULL, NULL, 'Mangabeira', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(864, 'INSTRAMED', 'INSTRAMED INDUSTRIA MEDICO HOSPITALAR LTDA', '90909631000200', '88137290', 'R do Albatroz, 237', NULL, NULL, 'Pedra Branca', 'Palhoça', 'SC', '2025-10-28 12:32:12'),
(865, 'NANOMEDICA', 'NANOMEDICA TECNOLOGIA COMERCIO E IMPORTACAO LTDA', '32024141000130', '88306773', 'AV Osvaldo Reis, 3281', NULL, NULL, 'Praia Brava de Itajaí', 'Itajaí', 'SC', '2025-10-28 12:32:12'),
(866, 'MEDSFERA', 'MEDSFERA IMPORTADORA E EXPORTADORA LTDA', '58902403000106', '12216530', 'R SIRIA, 71', NULL, NULL, 'JARDIM OSWALDO CRUZ', 'São José dos Campos', 'SP', '2025-10-28 12:32:12'),
(867, 'HSGER', 'HOSPITAL DO SERVIDOR GENERAL EDSON RAMALHO', '10848190000155', '58020388', 'R Tereza Alves da Silva Barbosa, SN', NULL, NULL, 'Roger', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(868, 'POLICLINICA', 'LIGA NORTE RIOGRANDENSE CONTRA O CANCER', '08428765000210', '59040150', 'R SILVIO PELICO, 181', NULL, NULL, 'ALECRIM', 'Natal', 'RN', '2025-10-28 12:32:12'),
(869, 'UNIMED TEIXEIRA DE FREITAS', 'UNIMED EXTREMO SUL COOPERATIVA DE TRABALHO MEDICO', '42043067000587', '45987088', 'AV PRESIDENTE GETULIO VARGAS, 2442', NULL, NULL, 'RECANTO DO LAGO', 'Teixeira de Freitas', 'BA', '2025-10-28 12:32:12'),
(870, 'HOME DOCTOR', 'RECIFE HOME CARE ASSISTENCIA MEDICA DOMICILIAR LTDA', '12082912000139', '52011050', 'R Amélia, 400', NULL, NULL, 'Graças', 'Recife', 'PE', '2025-10-28 12:32:12'),
(871, 'UNIMED SJ RIO PRETO COOP TRABALHO MEDICO', 'UNIMED SJ RIO PRETO COOP TRABALHO MEDICO', '45100138000109', '15015700', 'AVE AVENIDA BADY BASSITT, 3877', NULL, NULL, 'V IMPERIAL', 'São José do Rio Preto', 'SP', '2025-10-28 12:32:12'),
(872, 'FUNDO MUNICIPAL DE SAUDE DE SAO LOURENCO DA MATA', 'FUNDO MUNICIPAL DE SAUDE - SLM', '12257765000190', '54735565', 'R PC DR Araújo Sobrinho, 00', NULL, NULL, 'Centro', 'São Lourenço da Mata', 'PE', '2025-10-28 12:32:12'),
(873, 'INSTITUTO SAUDE EXPRESS', 'INSTITUTO SAUDE EXPRESS', '58694763000160', '54400170', 'R Coronel Waldemar Basgal, 158', NULL, NULL, 'Piedade', 'Jaboatão dos Guararapes', 'PE', '2025-10-28 12:32:12'),
(874, 'NOVA DIAGNOSTICO POR IMAGEM LTDA', 'NOVA DIAGNOSTICO POR IMAGEM LTDA', '04489715000100', '58030000', 'AV Presidente Epitácio Pessoa, 557', NULL, NULL, 'Estados', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(875, 'EDJDSON WOLGRAN DE ARAUJO LYRA', 'EDJDSON WOLGRAN DE ARAUJO LYRA LTDA', '12012274000180', '55295470', 'R Pedro Rocha, S/N', NULL, NULL, 'Heliópolis', 'Garanhuns', 'PE', '2025-10-28 12:32:12'),
(876, 'CARDIOLOGIA & DIAGNOSTICOS', 'TENCOR SERVICOS MEDICOS ESPECIALIZADOS LTDA', '20352426000111', '56912440', 'R INOCENCIO GOMES DE ANDRADE, 696', NULL, NULL, 'NOSSA SENHORA DA PENHA', 'Serra Talhada', 'PE', '2025-10-28 12:32:12'),
(877, 'SOARES SORRISO E SAUDE', 'SOARES E SANTOS CENTRO MULTIDISCIPLINAR LTDA', '59658697000135', '55800000', 'R DOM RICARDO VILELA, 1145', NULL, NULL, 'CENTRO', 'Nazaré da Mata', 'PE', '2025-10-28 12:32:12'),
(878, 'F M S- SAMU PALAMRES', 'FUNDO MUNICIPAL DE SAUDE', '00562279000105', '55540000', 'AV MARIA VERONICA DE MELO, S/N', NULL, NULL, 'SAO SEBASTIAO', 'Palmares', 'PE', '2025-10-28 12:32:12'),
(879, 'NEUROCARDIO', 'CENTRO DE NEUROLOGIA E CARDIOLOGIA DO SAO FRANCISCO LTDA', '11473378000129', '56304210', 'R Tobias Barreto, 08', NULL, NULL, 'Centro', 'Petrolina', 'PE', '2025-10-28 12:32:12'),
(880, 'ESCOLA DOUTORES', 'ESCOLA DOUTORES EDUCACAO EM SAUDE LTDA', '16432711000175', '50050345', 'R JOAQUIM FELIPE, 73', NULL, NULL, 'SOLEDADE', 'Recife', 'PE', '2025-10-28 12:32:12'),
(881, 'GABINETE DO PREFEITO', 'MUNICIPIO DE JERICO', '08931495000184', '58830000', 'PCA PC FREI DAMIAO, 01', NULL, NULL, 'CENTRO', 'Jericó', 'PB', '2025-10-28 12:32:12'),
(882, 'CLINICA NOSSA BOA SAUDE', 'CLINICA NOSSA BOA SAUDE RADIOLOGICA LTDA', '17672073000122', '45653230', 'R Dom Valfredo Tepe, 26', NULL, NULL, 'Centro', 'Ilhéus', 'BA', '2025-10-28 12:32:12'),
(883, 'BRADESCO SAUDE - OPERADORA DE PLANOS S/A', 'BRADESCO SAUDE - OPERADORA DE PLANOS S/A', '15011651000154', '06472900', 'AV Alphaville, 779', NULL, NULL, 'Dezoito do Forte Empresarial/Alphaville.', 'Barueri', 'SP', '2025-10-28 12:32:12'),
(884, 'SAO JOSE DE ESPINHARAS PREF GABINETE DO PREFEITO', 'MUNICIPIO DE SAO JOSE DE ESPINHARAS', '08882730000175', '58723000', 'R PC BOSSUET WANDERLEY, 01', NULL, NULL, 'CENTRO', 'São José de Espinharas', 'PB', '2025-10-28 12:32:12'),
(885, 'HDIA', 'HDIA CENTRO DE ATENDIMENTO MEDICO HOSPITALAR LTDA', '51475060000100', '58030261', 'AV Maranhão, 255', NULL, NULL, 'Estados', 'João Pessoa', 'PB', '2025-10-28 12:32:12'),
(886, 'NOVA IMAGEM', 'NOVA IMAGEM DIAGNOSTICO POR IMAGEM LTDA', '05064187000100', '57020010', 'R AUGUSTA, 285', NULL, NULL, 'CENTRO', 'Maceió', 'AL', '2025-10-28 12:32:12'),
(887, 'MM SERVICOS DE ANESTESIOLOGIA E TERAPIA INTENSIVA LTDA', 'MM SERVICOS DE ANESTESIOLOGIA E TERAPIA INTENSIVA LTDA', '43955714000166', '59020010', 'R Seridó, 486', NULL, NULL, 'Petrópolis', 'Natal', 'RN', '2025-10-28 12:32:12'),
(888, 'JBS MOTORS', '3S MOTORS LTDA', '46392165000157', '51110131', 'AV Herculano Bandeira, 927', NULL, NULL, 'Pina', 'Recife', 'PE', '2025-10-28 12:32:12'),
(889, 'HOPE', 'HOSPITAL DE OLHOS DO RECIFE LTDA', '40881302000130', '50070485', 'R FRANCISCO ALVES, 887', NULL, NULL, 'ILHA DO LEITE', 'Recife', 'PE', '2025-10-28 12:32:12'),
(890, 'VITALCARE SOLUTIONS', 'VITALCARE SOLUTIONS LTDA', '53477366000112', '59012330', 'R Coronel Joaquim Manoel, 615', NULL, NULL, 'Petrópolis', 'Natal', 'RN', '2025-10-28 12:32:12'),
(892, 'HOSPITAL UNIMED RECIFE III', 'UNIMED RECIFE COOPERATIVA DE TRABALHO MEDICO', '11.214.624/0019-57', '50070475', 'R JOSE DE ALENCAR', '770', NULL, 'ILHA DO LEITE', 'RECIFE', 'PE', '2025-10-30 12:20:00'),
(893, 'HC CARDIO', 'HC CARDIO LTDA', '24.528.770/0001-70', '59075050', 'RUA CORONEL AURIS COELHO', '178', NULL, 'LAGOA NOVA', 'NATAL', 'RN', '2025-10-30 13:47:10'),
(894, 'UNIDADE DE DIAGNOSTICO CARDIOLOGICO LTDA', 'UNIDADE DE DIAGNOSTICO CARDIOLOGICO LTDA', '11.920.672/0001-31', '52030225', 'RUA DOM JOAO COSTA', '174', NULL, 'TORREAO', 'RECIFE', 'PE', '2025-11-04 14:26:16'),
(897, 'NEWMED COMERCIO E SERVICOS DE EQUIPAMENTOS HOSPITALARES LTDA', 'NEWMED COMERCIO E SERVICOS DE EQUIPAMENTOS HOSPITALARES LTDA', '10.859.287/0001-63', '53030030', 'RUA DR MANOEL DE ALMEIDA BELO', '700', NULL, 'BAIRRO NOVO', 'OLINDA', 'PE', '2025-11-06 12:21:36'),
(898, 'MARINA PORTO DO MAR', 'MARINA PORTO DO MAR LTDA', '024332610001-20', '53427450', 'RUA AFONSO PENA', '100', NULL, 'MARIA FARINHA', 'PAULISTA', 'PE', '2025-11-06 20:44:47'),
(899, 'HOSPITAL MEMORIAL GUARARAPES', 'INSTITUTO ALCIDES D\' ANDRADE LIMA', '10.072.296/0004-52', '54335160', 'R DOUTOR LUIS RIGUEIRA', '774', NULL, 'PRAZERES', 'JABOATAO DOS GUARARAPES', 'PE', '2025-11-07 14:11:02'),
(908, 'GRUPO CABRAL', '43.971.162 EDUARDO CABRAL DE SOUZA', '43.971.162/0001-80', '53090500', 'RUA SETENTA (5A ETAPA)', '35', NULL, 'RIO DOCE', 'OLINDA', 'PE', '2025-11-10 12:26:49'),
(915, 'GRUPO TUBRAN LTDA', 'GRUPO TUBRAN LTDA', '21.739.879/0001-68', '62880162', 'AVENIDA JUVENAL DE CASTRO', '316', NULL, 'CENTRO', 'HORIZONTE', 'CE', '2025-11-14 18:52:53'),
(916, 'CENTRO UNIVERSITARIO TIRADENTES DE PERNAMBUCO', 'SOCIEDADE DE EDUCACAO TIRADENTES S.A', '13013263006118', '51150003', 'AVENIDA MARECHAL MASCARENHAS DE MORAES', '3905', NULL, 'IMBIRIBEIRA', 'RECIFE', 'PE', '2025-11-24 12:12:36'),
(917, 'RECONCILIAR SPA TERAPEUTICO', 'REMH CLINICA TERAPEUTICA LTDA', '46.849.119/0001-34', '54789835', 'R GREGORIO BEZERRA', '147', NULL, 'ALDEIA DOS CAMARAS', 'CAMARAGIBE', 'PE', '2025-11-25 17:18:37'),
(918, 'IAPES PESQUISA CLINICA', 'IAPES PESQUISA CLINICA LTDA', '55.478.308/0001-39', '53140080', 'AVENIDA FAGUNDES VARELA', '110', NULL, 'JARDIM ATLANTICO', 'OLINDA', 'PE', '2025-12-03 12:13:47'),
(923, 'CASA DE SAUDE E MATERNIDADE DE CORURIPE', 'INSTITUTO HOSPITAL CARVALHO BELTRAO', '35.642.172/0001-43', '57230000', 'RUA RUA EUCLIDES BAETA', 'SN', NULL, 'JOAO CARVALHO', 'CORURIPE', 'AL', '2025-12-04 19:13:27'),
(929, 'PRODEV EDUCACIONAL', 'PRODEV EDUCACIONAL LTDA', '37.167.209/0001-54', '50070120', 'RUA LUIZ BARBALHO', '149', NULL, 'BOA VISTA', 'RECIFE', 'PE', '2025-12-11 19:12:10'),
(935, 'AMAURI PURCINO DA LUZ', '35.823.463 AMAURI PURCINO DA LUZ', '35823463000138', '51160330', 'AVENIDA ANTONIO TORRES GALVAO', '221', NULL, 'IMBIRIBEIRA', 'RECIFE', 'PE', '2025-12-18 19:50:25'),
(936, 'CUPER', 'CENTRO UROLOGICO PERNAMBUCO LTDA', '01443009000130', '52060000', 'AVENIDA PARNAMIRIM', '95', NULL, 'PARNAMIRIM', 'RECIFE', 'PE', '2025-12-23 15:00:06'),
(937, 'EQUIPASAUDE', 'EQUIPASAUDE PRODUTOS PARA SAUDE LTDA.', '34.836.183/0001-00', '58200000', 'AVENIDA FELICIANO BATISTA DE AMORIM', '1116', NULL, 'JUA', 'GUARABIRA', 'PB', '2026-01-09 18:47:14'),
(938, 'SAMU Recife', 'SAMU Metropolitano do Recife', '10.565.000/0001-92', '50060-140', 'Av Manoel Borba ', '951', NULL, 'Boa Vista', 'Recife', 'PE', '2026-01-19 18:10:31'),
(939, 'FUNDO MUNICIPAL DE SAUDE DE CARUARU', 'FUNDO MUNICIPAL DE SAUDE ', '11.371.082/0001-05', '55.008-000', 'Avenida Vera Cruz', '654', '3 ANDAR', 'São Francisco', 'Caruaru', 'PE', '2026-01-23 20:55:40'),
(940, 'UERJ', 'UNIVERSIDADE ESTADUAL DO RIO DE JANEIRO', '33.540.014/0001-57', '20.550-013', 'Rua São Francisco Xavier', '524', NULL, 'Maracanã', 'Rio de Janeiro', 'RJ', '2026-01-30 18:53:19'),
(941, 'UNIMED C. GRANDE', 'UNIMED C. GRANDE COOPERATIVA DE TRABALHO MEDICO LTDA', ' 08.707.473/0005-69', '58.410-743', 'Rua Denise Alves de Medeiros', '410', NULL, 'Sandra Cavalcante', 'Campina Grande', 'PB', '2026-02-02 17:53:59'),
(942, 'HOSPITAL ERMIRIO COUTINHO', 'FUNDACAO MANOEL DA SILVA ALMEIDA', '09.767.633/0003-66', '55800000', 'TV BANCARIO LEOPOLDINO VIEIRA DE MELO', 'SN', NULL, 'CENTRO', 'Nazaré da Mata', 'PE', '2026-02-02 20:06:45'),
(945, 'EBEM - EMPRESA BRASILEIRA DE ENGENHARIA MEDICA', 'F A G DE OLIVEIRA LTDA', '06.907.719/0001-97', '54400260', 'RUA DONA MARIA DE SOUZA', '681', NULL, 'PIEDADE', 'JABOATAO DOS GUARARAPES', 'PE', '2026-02-09 17:45:52'),
(946, 'HOSPITAL UNIMED RECIFE', 'UNIMED RECIFE COOPERATIVA DE TRABALHO MEDICO', '11.214.624/0004-70', '50070235', 'AVENIDA LINS PETIT', '35', NULL, 'BOA VISTA', 'RECIFE', 'PE', '2026-02-10 16:14:33'),
(947, 'CONDOMINIO RESIDENCIAL QUINTAS DA PRAIA', 'CONDOMINIO RESIDENCIAL QUINTAS DA PRAIA', '52.329.127/0001-52', '54522005', 'AV A', 'S/N', NULL, 'PAIVA', 'CABO DE SANTO AGOSTINHO', 'PE', '2026-02-13 14:29:58'),
(948, 'FUNPEC', 'FUNPEC-Fundação Norte Rio Grandense de Pesquisa e Cultura ', '08.469.280/0001-93', '59078-900', 'Avenida Senador Salgado Filho', '3000', NULL, 'Capim Macio', 'Natal', 'RN', '2026-02-13 14:39:44'),
(949, 'B R M SERVICOS MEDICOS', 'B R M SERVICOS MEDICOS LTDA', '18480903000182', '57035000', 'RUA ENGENHEIRO MARIO DE GUSMAO', '90', NULL, 'PONTA VERDE', 'MACEIO', 'AL', '2026-02-19 17:47:26'),
(950, 'SESAU MACEIO', 'Secretaria de Estado da Saúde de Alagoas', '12.200.259/0001-65.', '57022-050.', 'Av. da Paz', '978', NULL, 'Jaraguá', 'Maceió ', 'AL', '2026-02-23 10:48:41'),
(951, 'HOSPITAL ALFA S/A - EM RECUPERACAO JUDICIAL', 'HOSPITAL ALFA S/A - EM RECUPERACAO JUDICIAL', '03.337.575/0001-92', '51030020', 'RUA VISCONDE DE JEQUITINHONHA', '1144', NULL, 'BOA VIAGEM', 'RECIFE', 'PE', '2026-02-24 13:16:37'),
(952, 'Real Cardiologia ', 'IC AVANCADA REAL CARDIOLOGIA LTDA', '426543540001/08', '52010075', 'AVENIDA GOVERNADOR AGAMENON MAGALHAES', '4760', NULL, 'PAISSANDU', 'RECIFE', 'PE', '2026-02-25 18:54:25'),
(953, 'CRAVMED INSTRUMENTOS CIRURGICOS', 'CRAVMED COMERCIO, IMPORTACAO E EXPORTACAO DE INSTRUMENTOS E PRODUTOS CIRURGICOS LTDA', '33089949000169', '14140000', 'RUA XV DE NOVEMBRO', '151 B', NULL, 'CENTRO', 'CRAVINHOS', 'SP', '2026-03-03 19:45:53'),
(954, 'AUREN ENERGIA S.A', 'AUREN ENERGIA', '28.594.234/0001-23', '62690-000', 'Fazenda Timbaúba  S/N  Rod. CE 163,KM 42', 'S/N', NULL, 'ZONA RURAL', 'TRAIRI', 'CE', '2026-03-03 19:57:35'),
(955, 'UNIMED C. GRANDE', 'UNIMED C. GRANDE COOPERATIVA DE TRABALHO MEDICO LTDA', '08.707.473/0001-35', '58401393', 'R CLAYTON ISMAEL', '40', NULL, 'LAURITZEN', 'CAMPINA GRANDE', 'PB', '2026-03-03 19:58:18'),
(956, 'INFUSIONMED', 'INFUSIONMED CENTRO MEDICO LTDA', '64154515000129', '58038100', 'AVENIDA GENERAL EDSON RAMALHO', '75', NULL, 'MANAÍRA', 'JOAO PESSOA', 'PB', '2026-03-13 17:45:17'),
(957, 'WARTSILA BRASIL LTDA.', 'WARTSILA BRASIL LTDA.', '36.176.600/0006-67', '54503900', 'RODOVIA BR 101 SUL, KM 96,4', '5225', NULL, 'DISTRITO INDUSTRIAL DIPER', 'CABO DE SANTO AGOSTINHO', 'PE', '2026-03-16 17:20:01'),
(958, 'DR. EUCLIDES TENORIO ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-16 18:38:02'),
(959, 'FERREIRA COSTA & CIA LTDA', 'FERREIRA COSTA & CIA LTDA', '10.230.480/0015-36', '51150003', 'AV MARECHAL MASCARENHAS DE MORAES', '2629', NULL, 'IMBIRIBEIRA', 'RECIFE', 'PE', '2026-03-16 20:50:56'),
(960, 'IPE', 'IPE EDUCACIONAL LTDA', '08.679.557/0001-02', '58053002', 'ROD BR-230', '1957', NULL, 'AGUA FRIA', 'JOAO PESSOA', 'PB', '2026-03-18 17:58:48'),
(961, 'HVU - HOSPITAL VALE DO UNA', 'INSTITUTO DE ASSISTENCIA VALE DO UNA', '13.296.018/0001-24', '55540000', 'AVENIDA JOSE AMERICO DE MIRANDA', 'S/N', NULL, 'SANTA ROSA', 'PALMARES', 'PE', '2026-03-19 17:30:52'),
(962, 'CLINICA FERNANDO AMARAL - ULTRASSONOGRAFIA DIAGNOSTICA E INTERVENCIONISTA LTDA', 'CLINICA FERNANDO AMARAL - ULTRASSONOGRAFIA DIAGNOSTICA E INTERVENCIONISTA LTDA', '18.217.688/0001-21', '50070525', 'PC MIGUEL DE CERVANTES', '60', NULL, 'ILHA DO LEITE', 'RECIFE', 'PE', '2026-03-19 17:56:51'),
(963, 'FGH', 'FUNDACAO GESTAO HOSPITALAR MARTINIANO FERNANDES - FGH', '09.039.744/0001-94', '50070615', 'RUA DOS COELHOS', '450', NULL, 'BOA VISTA', 'RECIFE', 'PE', '2026-03-24 11:35:01'),
(964, 'REGENERE', 'CLINICA DE FERIDAS E MEDICINA HIPERBARICA LTDA', '34.698.058.0001-72', '52011300', 'PRACA DO ENTRONCAMENTO', '104', NULL, 'GRACAS', 'RECIFE', 'PE', '2026-03-24 18:59:02'),
(965, 'VAL MED', 'VAL MED PRODUTOS E EQUIPAMENTOS MEDICOS HOSPITALAR LTDA', '05980425000128', '57301130', 'RUA DOM JONAS BATINGA', '414', NULL, 'OURO PRETO', 'ARAPIRACA', 'AL', '2026-03-25 18:11:51'),
(966, 'POLICLINICA BEM ESTAR', 'BEM ESTAR SERVICOS MEDICOS ESPECIALIZADOS E ODONTOLOGICOS LTDA', '26.616.936/0001-35', '58100222', 'R PASTOR JOSE ALVES DE OLIVEIRA', '430', NULL, 'CENTRO', 'CABEDELO', 'PB', '2026-03-26 13:59:00'),
(967, 'LAGOA NOVA GABINETE PREFEITO', 'MUNICIPIO DE ALAGOA NOVA', '08.700.684/0001-46', '58125000', 'PC SANTA ANA', 'SN', NULL, 'CENTRO', 'ALAGOA NOVA', 'PB', '2026-03-31 14:04:09'),
(968, 'AMORSAUDE', 'CLINICA AMOR SAUDE JOAO PESSOA SUL LTDA', '30320494000152', '58057470', 'R ANA CAVALCANTI DE ALBUQUERQUE TEIXEIRA LIMA', '420', NULL, 'MANGABEIRA', 'JOAO PESSOA', 'PB', '2026-03-31 18:29:45'),
(969, 'APABB - ASSOCIACAO DE PAIS, AMIGOS E PESSOAS COM DEFICIENCIA DE FUNCIONARIOS DO BANCO DO BRASIL E DA COMUNIDADE', 'APABB - ASSOCIACAO DE PAIS, AMIGOS E PESSOAS COM DEFICIENCIA DE FUNCIONARIOS DO BANCO DO BRASIL E DA COMUNIDADE', '58.106.519/0007-24', '50030310', 'AVENIDA RIO BRANCO', '240', NULL, 'CENTRO', 'RECIFE', 'PE', '2026-04-01 20:03:08'),
(970, 'Hospital Getúlio Vargas', 'Hospital Getúlio Vargas', '10.572.048/0005-51', '50630-060', 'Av General San Martin, ', 's/n', NULL, 'Cordeiro', 'Recife', 'Pe', '2026-04-06 18:18:16'),
(971, 'MEDLIFE SAUDE', 'MEDLIFE LOCACAO DE MAQUINAS E EQUIPAMENTOS LTDA', '29932922/0001-19', '52021195', 'AVENIDA NORTE MIGUEL ARRAES DE ALENCAR', '2338', NULL, 'ENCRUZILHADA', 'RECIFE', 'PE', '2026-04-06 19:47:07'),
(972, 'ESPACO SAUDE CORPORATIVA', 'M JULIANA SILVA DO NASCIMENTO', '29.143.975/0001-50', '59150370', 'RUA CRUZ E SOUZA', '155', NULL, 'NOVA PARNAMIRIM', 'PARNAMIRIM', 'RN', '2026-04-10 19:54:15');

-- --------------------------------------------------------

--
-- Estrutura para tabela `produtos`
--

CREATE TABLE `produtos` (
  `id` int(11) NOT NULL,
  `nome_produto` varchar(255) NOT NULL,
  `fabricante` varchar(255) DEFAULT NULL,
  `modelo` varchar(255) DEFAULT NULL,
  `descricao_detalhada` text DEFAULT NULL,
  `valor_unitario` decimal(20,2) NOT NULL DEFAULT 0.00,
  `unidade_medida` varchar(50) DEFAULT 'Unidade',
  `imagem_url` varchar(512) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `produtos`
--

INSERT INTO `produtos` (`id`, `nome_produto`, `fabricante`, `modelo`, `descricao_detalhada`, `valor_unitario`, `unidade_medida`, `imagem_url`, `data_criacao`) VALUES
(7, 'CARDIOVERSOR ', 'INSTRAMED', 'CARDIOMAX LITE ', 'Configuração ECG, Resp, Desf, ASC, PMS, Li-ion 4Ah.\n', 26167.00, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', '2025-10-30 12:27:49'),
(11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'INSTRAMED', 'I.ON LED', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 9604.00, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', '2025-10-30 12:43:05'),
(12, 'DESFIBRILADOR ', 'INSTRAMED', 'APOLUS ', 'Principais funções concentradas em apenas um botão seletor. \nRápida inicialização carregamento de 360 J em menos de 6 segundos', 14438.00, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_690a099525520.webp', '2025-11-04 14:11:35'),
(13, 'GABINETE DEA', 'INSTRAMED', 'DEA', 'Gabinete metálico para desfibrilador externo automático (DEA), equipado com alarme sonoro.\n\n', 3022.00, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_690de965c8b36.webp', '2025-11-07 12:46:21'),
(14, 'VENTILADOR ', 'TECME', 'BRINA', 'Tela sensível ao toque de 18,5 com interface intuitiva, projetada para agilizar a configuração em situações críticas.\nSeu design versátil permite a utilização em múltiplos ambientes hospitalares da UTI adulta à neonatologia com uma única unidade, otimizando recursos e garantindo continuidade no cuidado ao paciente.', 69000.00, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_690df701cb457.png', '2025-11-07 14:07:35'),
(15, 'Traqueia pediátrica 1200MM X 15MM com 1 conector reto 15mm', 'GLOBALTEC', 'Traqueia pediátrica 1200MM X 15MM  c/1 conector reto.', 'Circuito para ventilação pediátrico.', 350.00, 'Unidade', NULL, '2025-11-07 14:57:47'),
(16, 'MONITOR DE PRESSÃO ARTERIAL DE BRAÇO PROFISSIONAL - MPA', 'MICROMED', 'OMRON', 'Destinado a profissionais da saúde.\nDesign de mesa ideal para consultórios. ​\nModo de medição totalmente automático oscilométrico ou auscultatório.​\nFunção Indicador Zero ​\nPode ser usado com 4 pilhas AA ou com adaptador CA (bivolt automático)​', 1290.00, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_6911dd100a3fb.webp', '2025-11-10 12:39:55'),
(17, 'OXIMETRO', 'MASIMO', 'RAD G COM TEMPERATURA  E SENSOR 4325', 'Monitor portátil com SPO2, PR, PI, RRP e módulo de temperatura integrado ', 9834.00, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_6911dd39c9342.png', '2025-11-10 12:41:08'),
(18, 'OXÍMETRO DE PULSO DE CABECEIRA', 'MASIMO', 'Rad-97 COM PNI', 'Rad-97 com pressão arterial não invasiva (PANI) integrada oferece diversas tecnologias avançadas de monitoramento do paciente — incluindo oximetria de pulso Masimo SET® — em um dispositivo independente compacto, portátil e altamente configurável.', 20059.49, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_6911df74c6064.png', '2025-11-10 12:50:53'),
(19, 'OXIMETRO ', 'MASIMO ', 'RAD G SEM TEMPERATURA  E SENSOR 4325', 'Monitor portátil com SPO2, PR, PI, RRP', 8331.00, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_6911e01074fe3.png', '2025-11-10 12:59:45'),
(20, 'PÁ ADESIVA INFANTIL DESCARTAVEL DEA/CARDIOMAX', 'INSTRAMED', 'INFANTIL', 'PÁ ADESIVA INFANTIL DESCARTAVEL - DEA/CARDIOMAX', 615.00, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_69124901583c3.png', '2025-11-10 20:22:19'),
(21, 'PÁ ADESIVA ADULTO DESCARTAVEL DEA / CARDIOMAX', 'INSTRAMED', 'ADULTO', 'PÁ ADESIVA ADULTO DESCARTÁVEL', 615.00, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_691249bfe6282.png', '2025-11-10 20:23:56'),
(22, 'MODULO DE BATERIA (LI-ON)  ', 'INSTRAMED', 'CARDIOMAX', 'Modulo de bateria recarregável para carDiomax li-on 14,4V 4AH 57,6WH', 5323.63, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_692f33e61ffc4.jpg', '2025-12-02 18:49:41'),
(23, 'SUPORTE DE PAREDE EM ACRÍLICO ', 'INSTRAMED', 'I ON ', 'Suporte de parede em acrílico para DEA', 960.00, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_69302adc0a423.webp', '2025-12-03 12:21:54'),
(24, 'PLACA ESPAÇO CARDIOPROTEGIDO', 'FR - GRAFICA RECIFE', NULL, NULL, 80.00, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_69302bd5e098a.png', '2025-12-03 12:24:46'),
(25, 'PLACA PASSO A PASSO ', 'FR - GRAFICA RECIFE', NULL, NULL, 120.00, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_69302dcc1a1e9.png', '2025-12-03 12:32:27'),
(26, 'VENTILADOR BEIRA LEITO ', 'INSTRAMED', 'VG70', 'Ventilação invasiva e não invasiva \nBateria interna com autonomia de aproximadamente 4 horas \nNebulizador integrado \n', 62900.00, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_6931ddcc8f088.webp', '2025-12-04 19:16:30'),
(27, 'MONITOR BLT', 'INSTRAMED', 'M10', 'Configuração ECG, SPO2, PNI', 10180.00, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_6931df2fb1be3.webp', '2025-12-04 19:22:07'),
(28, 'CARRO DE PARADA ', 'HEALTH ', 'LT 103', 'ESTRUTURA INTERNA EM AÇO CARBONO, REVESTIDO EM POLÍMERO DE ALTO IMPACTO ABS COM NANO TECNOLOGIA ANTI-BACTERIANA.   ', 7265.85, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_69381c774ddf6.webp', '2025-12-09 13:01:52'),
(29, 'SENSOR DE FLUXO ', 'AEONMED', NULL, 'Sensor de fluxo para utilização no ventilador pulmonar Shangrila 510S\n', 229.10, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_69383041db97a.webp', '2025-12-09 14:23:41'),
(30, 'VÁLVULA DE CONTROLE EXALATÓRIO ', 'AEONMED', NULL, 'Válvula de controle do fluxo exalatório compatível com o ventilador Shangrila 510S', 1157.00, 'Unidade', 'uploads/products/prod_69d551432b478.png', '2025-12-09 14:42:53'),
(31, 'CILINDRO DE O2', 'GASWIDE', 'GWA15', 'Capacidade hidráulica 2.8L\nPressão  de serviço 139bar\nAltura 412.8mm\nDiâmetro 111.1mm\nRosca de entrada 3/4 \nPeso 2.3kg \nCILINDRO VAZIO', 3668.00, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_694ace6e98b05.webp', '2025-12-23 17:21:50'),
(32, 'MÓDULO DE BATERIA (NiMH) ', 'INSTRAMED', 'CARDIOMAX ', 'Modulo de bateria recarregável para Cardiomax (NiMH)', 4152.72, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_695ff7e024858.jpg', '2026-01-08 18:38:32'),
(33, 'Eletrocardiógrafo de 12 canais', 'EDAN', 'SE 1200 EXPRESS', 'AQUISIÇÃO E IMPRESÃO EM 12 CANAIS SIMUTÂNEOS, INTERPRETATIVO, IMPRESSÃO EM PAPEL TÉRMICO A4, Display Colorido 8”- Teclado QWERTY- Memória 800 exames- Exporta exames em PDF.', 12876.00, 'Unidade', 'https://frpe.app.br/crm/uploads/products/prod_696a54b7a29fa.png', '2026-01-16 15:09:56'),
(34, 'SENSOR LÍDICO', 'MASIMO ', 'RD Raimbow set2 4026', 'SENSOR LIDICO (Em comodato acompanha; Monitor multiparamétrico compacto Root® com Modulo Cabo).', 2500.00, 'Unidade', 'uploads/products/prod_6983954dc302b.png', '2026-01-21 13:53:33'),
(35, 'MONITOR ', 'INSTRAMED', 'InMax 12', 'Configuração ECG, Resp, PMS, ST, SPO2, PNI Z, 2 Temp, Bateria', 15747.00, 'Unidade', 'uploads/products/prod_69810e0520771.webp', '2026-01-26 19:10:47'),
(36, 'SISTEMA PARA ERGOMETRIA ERGO PC AIR', 'MICROMED', 'ERGOPC AIR', 'Eletrocardiógrafo digital sem fio de 3, 12 ou 13 derivações simultâneas para realização de teste de esforço.', 29990.00, 'Unidade', 'uploads/products/prod_697ba726bed16.jpeg', '2026-01-29 18:32:22'),
(37, 'ESTEIRA ERGOMETRICA', 'MICROMED', 'C300', 'Leve, resistente e moderna, feita em alumínio, ideal para uso médico em testes de esforço e cardiopulmonares. Suporta até 200 kg, com ampla área de caminhada, inclinação de 0 a 26% e velocidade máxima de 18 km/h. Possui saída USB nativa para controle automático digital, sistema de fricção reduzida que dispensa lubrificação e operação em 220V/60Hz. Compatível com Ergo PC, Ergo PC Air e Ergo PC Elite. Garantia de 1 ano para a esteira (já incluída a garantia legal) e 3 meses para acessórios (já incluída a garantia legal). Inclui cabo USB. Recomenda-se uso de Nobreak Onda Senoidal (5 KVA, 220V) e instalação em circuito elétrico isolado e aterrado', 49990.00, 'Unidade', 'uploads/products/prod_697ba85eb0a8e.jpeg', '2026-01-29 18:35:12'),
(38, 'CARRO DE EMERGÊNCIA COM NANOTECNOLOGIA ANTIBACTERIANA', 'HEALTH ', 'CARRO LIFE AID LA3-101 STANDARD', '- 01 tábua para massagem cardíaca, 02 gavetas em monobloco de polímero com nanotecnologia antibacteriana, 01 gavetas em monobloco de polímero com nanotecnologia antibacteriana - 01 jogo de divisórias em polímero para 1ra. Gaveta, contendo 20 nichos;  01 braço móvel e bandeja em aço inox com movimento de rotação de 90°; 01 bandeja em aço inox com movimento de rotação de 180° para acomodar o desfibrilador, 02 cintas velcro para segurança do desfibrilador / cardioversor; 01 suporte de soro com haste em aço inox regulável em altura com dois ganchos em polímero;  01 suporte em aço inox para tubo de oxigênio; 01 cinta velcro para fixação de cilindro de oxigênio; 01 jogo de divisórias em polímero para compartimento superior tipo colmeia regulável e removível com 12 nichos; 01 dispositivo em acrílico 4mm para armazenar materiais, 01 cesto aramado para colocação de aspirador. Medidas: comprimento 1025 mm, largura: 570 mm, altura 910 mm aproximadamente.', 15800.00, 'Unidade', 'uploads/products/prod_697cfbebea61b.png', '2026-01-30 18:48:28'),
(39, 'VENTILADOR DE TRANSPORTE', 'AEONMED', 'SHANGRILAR 510s', 'Ventilador de Transporte de Emergência Multifuncional, Tela LCD 5\", Atende à norma EN1789, Nível IPX4 à prova d\'água, Alarmes sonoros e visuais.\nNÃO ACOMPANHA CILINDRO DE GÁS.', 46059.00, 'Unidade', 'uploads/products/prod_69823148160d9.png', '2026-02-03 17:40:57'),
(42, 'VÁLVULA EXPIRATÓRIA ', 'TECME ', 'VÁLVULA EXPIRATÓRIA GRAPHNET ', NULL, 1506.10, 'Unidade', 'uploads/products/prod_698a1cc4e47bf.png', '2026-02-09 17:44:05'),
(43, 'CARDIOVERSOR', 'INSTRAMED', 'CARDIOMAX', 'ECG, Resp, Desf, ASC, DEA/PMS \n', 32513.00, 'Unidade', 'uploads/products/prod_698f6c73d66ff.png', '2026-02-13 18:27:12'),
(44, 'PROTESE VALVAR BIOLOGIA AORTICA ', 'MERIL', 'DAFODIL', 'A bioprótese pericárdica Dafodil é uma válvula de engenharia biomecânica tripla composta.\nEla combina os mais recentes avanços da engenharia com os benefícios do tecido pericárdico bovino.\nTamanhos disponiveis:\n19mm, 21mm, 23mm, 25mm, 27mm.', 18000.00, 'Unidade', 'uploads/products/prod_699c3e054b507.jpeg', '2026-02-23 10:38:13'),
(45, 'MÁQUINA DE ANESTESIA ', 'AEONMED', 'Aeon8600A', 'Equipamento compatível com pacientes pediátricos e adultos, com módulos opcionais para monitoramento de CO₂ e gases anestésicos. Possui sistema móvel com três gavetas, proteção contra mistura hipóxica, alarmes de diferentes prioridades e testes automáticos de vazamento e conformidade.', 224138.00, 'Unidade', 'uploads/products/prod_69a5a3135ea4c.webp', '2026-03-02 14:53:07'),
(46, 'PORTA AGULHA RYDER 18CM COM WIDEA CABO AZUL', 'CRAVMED', 'RYDER 18CM', NULL, 578.33, 'Unidade', '', '2026-03-03 19:47:58'),
(47, 'TESOURA BOYD 18CM', 'CRAVMED', 'BOYD 18CM', NULL, 189.20, 'Unidade', NULL, '2026-03-03 19:48:31'),
(48, 'TESOURA POTTS SMITT ANGULADO 25° DIREITA 16CM', 'CRAVMED', 'POTTS SMITT ANGULADO 25° DIREITA', NULL, 332.15, 'Unidade', NULL, '2026-03-03 19:49:10'),
(49, 'TESOURA POTTS SMITT ANGULADO 125° DIREITA 18CM', 'CRAVMED', 'POTTS SMITT ANGULADO 125°', NULL, 332.15, 'Unidade', NULL, '2026-03-03 19:50:10'),
(50, 'TESOURA METZEMBAUM CURVA 18CM', 'CRAVMED', 'METZEMBAUM CURVA', NULL, 84.04, 'Unidade', NULL, '2026-03-03 19:50:38'),
(51, 'OXIGENADOR MEMB. ADULTO BRIZIO', 'NIPRO MEDICAL LTDA - BRASIL', NULL, NULL, 1450.00, 'Unidade', NULL, '2026-03-03 21:42:57'),
(52, 'OXIGENADOR MEMB. ADULTO BAIXO PESO 6F', 'LIVANOVA', NULL, NULL, 2010.00, 'Unidade', NULL, '2026-03-03 21:44:00'),
(53, 'OXIGENADOR MEMB. ADULTO 8F', 'LIVANOVA', NULL, NULL, 2010.00, 'Unidade', NULL, '2026-03-03 21:44:17'),
(54, 'CONJUNTO DE TUBOS ADULTO S/FA CAVA DUPLA E BLISTER', 'LIVANOVA', NULL, NULL, 630.00, 'Unidade', NULL, '2026-03-03 21:45:35'),
(56, 'HEMOCONCENTRADOR ADULTO', 'LIVANOVA', NULL, NULL, 418.00, 'Unidade', NULL, '2026-03-03 21:50:46'),
(57, 'HEMOCONCENTRADOR ADULTO ALTO FLUXO', 'NIPRO ', NULL, NULL, 400.00, 'Unidade', NULL, '2026-03-03 21:51:12'),
(59, 'SISTEMA DE CARDIOPLEGIA CRISTALOIDE', 'NIPRO ', NULL, NULL, 310.00, 'Unidade', NULL, '2026-03-03 21:56:09'),
(60, 'Conjunto pá externa - CardioMax / Apolus (engate rápido)', 'Instramed', 'Cardiomax / Apolus', NULL, 2952.00, 'Unidade', 'uploads/products/prod_69a87571a8ee4.png', '2026-03-04 18:18:32'),
(61, 'Conjunto Pá interna, punho e eletrodos, adulto/pediátrico compatível com os equipamentos CardioMax/Apolus .   ', 'Instramed', 'Cardiomax / Apolus', 'Conjunto Pá interna, punho e eletrodos, adulto/pediátrico compatível com os equipamentos CardioMax/Apolus . 79013', 3625.50, 'Unidade', 'uploads/products/prod_69a8793522b3a.png', '2026-03-04 18:28:55'),
(62, 'Eletrodo interno ADU (Ø 77,20 mm)', 'Instramed', 'Cardiomax / DualMax /Apolus', 'Eletrodo interno adulto (Ø 77,20 mm). Compatível com os equipamentos CardioMax/DualMax/Apolus (Código 72532).\n  ', 261.82, 'Unidade', 'uploads/products/prod_69a87a2a3af80.png', '2026-03-04 18:32:58'),
(63, 'MÁQUINA DE ANESTESIA ', 'AEONMED', 'Aeon8800A', 'O equipamento oferece múltiplos modos de ventilação (VCV, PCV, SIMV, PS/CPAP, BIVENT e APRV), realiza monitoramento contínuo de parâmetros vitais como pressão das vias aéreas, possui bateria interna com autonomia de até 120 minutos em caso de falha de energia e suporta O₂, N₂O e ar medicinal, com fluxômetros eletrônicos para controle preciso da mistura de gases.', 255938.00, 'Unidade', 'uploads/products/prod_69af0b25d62d1.webp', '2026-03-09 18:05:36'),
(64, 'KIT EQUIPO CRISTAL ', NULL, NULL, 'Pacote contem 200 unidades ', 1390.00, 'Unidade', NULL, '2026-03-09 18:22:02'),
(65, 'KIT SERINGA 20 ML', NULL, NULL, 'Pacote contem 30 unidades ', 3590.00, 'Unidade', 'uploads/products/prod_69af1002dd1a7.webp', '2026-03-09 18:23:05'),
(66, 'BOMBA DE SERINGA ', 'HAWKMED ', 'HK 400', 'Bomba de seringa. \nImagem ilustrativa', 3990.00, 'Unidade', 'uploads/products/prod_69af10d625029.png', '2026-03-09 18:28:51'),
(67, 'BOMBA DE INFUSÃO ', 'HAWKMED ', 'HK 100', 'Bomba de infusão. \nImagem ilustrativa ', 4090.00, 'Unidade', 'uploads/products/prod_69af11aca6f3c.png', '2026-03-09 18:30:15'),
(68, 'KIT AUTOTRANSFUSÃO ADULTO', 'LIVANOVA', 'XTRA', 'CONJUNTO COLETA COMPONENTES SANGUE - RECIPIENTE DE CENTRIFUGAÇÃO de 225 ml e 125 ml', 2849.51, 'Unidade', 'uploads/products/prod_69b00f0216f76.png', '2026-03-10 12:31:00'),
(69, 'Monitor de Coagulação Ativada', 'ADIB JATENE', 'MCA PLUS', 'Equipamento portátil para medir o TCA (Tempo de Coagulação Ativada) à beira do leito, utilizando 1 mL de sangue com ativador Celite. Ideal para monitorar heparina em cirurgias cardíacas, hemodiálise e hemodinâmica, oferece resultados rápidos, precisos, alarmes sonoros/visuais e funciona em 110-220V ou bateria.', 19877.40, 'Unidade', 'uploads/products/prod_69b05c82e4886.jpg', '2026-03-10 18:03:15'),
(70, 'ANALISADOR DE SANGUE ', 'ABBOTT', 'I STAT ', 'Leve, portátil e fácil de utilizar, o analisador de sangue i-STAT  opera com a tecnologia avançada dos cartuchos de teste i-STAT. Em conjunto, criam o i-STAT System (Sistema i-STAT)  uma plataforma de teste rápido \"point-of-care\" que oferece aos profissionais de cuidados de saúde informações de diagnóstico quando e onde são necessárias.', 25000.00, 'Unidade', 'uploads/products/prod_69b1b7b221047.jpeg', '2026-03-11 18:44:38'),
(71, 'CARRO DE PARADA PEDIÁTRICO ', 'HEALTH ', 'LT 105', 'Carro de parada pediátrico ', 9964.00, 'Unidade', 'uploads/products/prod_69b1ba536ab93.png', '2026-03-11 18:54:46'),
(72, 'MINI MAPA', 'MICROMED', 'MINI MAPA', 'Menor modelo do mercado, com hardware compacto, leve e altamente resistente a quedas, ideal para a rotina clínica e para o conforto do paciente.\n', 15490.00, 'Unidade', 'uploads/products/prod_69bb065589abf.webp', '2026-03-18 20:09:35'),
(73, 'GRAVADOR HOLTER NOMAD ', 'MICROMED', 'GRAVADOR HOLTER NOMAD ', 'Uma solução completa para monitoramento contínuo da atividade elétrica do coração, amplamente utilizado em clínicas e hospitais para exames de 24 e 48 horas.', 8790.00, 'Unidade', 'uploads/products/prod_69bb06bd6081b.webp', '2026-03-18 20:11:23'),
(74, 'METALYZER® 3B Analisador de gás', 'CORTEX', 'METALYZER® 3B Analisador de gás', 'É um analisador de gases respiratórios usado para teste de esforço cardiopulmonar e para medições de trocas de gases pulmonares durante exercícios em esteira ou cicloergômetro. Com tecnologia Breath-by-Breath, permite uma análise a cada ciclo respiratório, ou seja, o diagnóstico é obtido com base em registros feitos em tempo real, possibilitando maior precisão no resultado do exame.', 259000.00, 'Unidade', NULL, '2026-03-18 20:14:45'),
(75, 'KIT DE CALIBRAÇÃO PROFISSIONAL', 'CORTEX', 'KIT DE CALIBRAÇÃO PROFISSIONAL', 'Kit de Calibração Profissional - Sem Estojo de Transporte', 21990.00, 'Unidade', 'uploads/products/prod_69bb08b8ad52e.webp', '2026-03-18 20:19:08'),
(76, 'ERGOPC ELITE AIR', 'MICROMED', 'ERGOPC ELITE AIR', 'É um eletrocardiógrafo digital desenvolvido para a realização de teste ergométrico e teste cardiopulmonar, permitindo monitorização precisa da atividade elétrica do coração durante exames de esforço.', 37590.00, 'Unidade', 'uploads/products/prod_69bb09a59c2e4.webp', '2026-03-18 20:23:03'),
(77, 'KOSMOS', 'BRASILMÉDICA', 'KOSMOS', 'Ultrassom híbrido ultra portátil potente o suficiente para fornecer Doppler Contínuo e Pulsado PW/CW. Com poderosas ferramentas de IA que fornecem cálculos da função sistólica automatizadas. \nTORSO ONE, LEXSA E BRIDGE', 120000.00, 'Unidade', 'uploads/products/prod_69bb0aaf300cf.png', '2026-03-18 20:27:32'),
(78, 'CARDIOVERSOR ', 'INSTRAMED', 'DUALMAX', 'Básico (ECG, Resp, Desf, ASC, DEA/PMS, 2 Li-ion, Touchscreen, Pás smart)\n', 39353.00, 'Unidade', 'uploads/products/prod_69bb0bfd14171.webp', '2026-03-18 20:33:05'),
(79, 'LICENÇA DE USO RHYTMOS STATION ', 'MICROMED', 'LICENÇA DE USO RHYTMOS STATION ', 'O Analisador de Holter Nomad é um software de análise projetado para emitir laudos com mais precisão e rapidez. Possui exclusivo índice de qualidade do sinal, mapeamento 3D, rápida detecção visual de apneia do sono e inversão de canal para análise.', 26990.00, 'Unidade', 'uploads/products/prod_69bbfba18d1e3.webp', '2026-03-19 13:36:18'),
(80, 'Sensor O2 para METALYZER® 3B / METALYZER® II', 'MICROMED', 'Sensor O2 para METALYZER® 3B / METALYZER® II', 'Sensor O2 para METALYZER® 3B / METALYZER® II - Celula de Oxigênio', 6990.00, 'Unidade', 'uploads/products/prod_69bc1191d6035.webp', '2026-03-19 15:09:43'),
(81, 'DESFIBRILADOR EXTERNO AUTOMÁTICO ', 'INSTRAMED', 'I ON PRO ', 'Operação simplificada por botão único\nInteligência artificial para diagnóstico preciso e uso seguro\nChoque bifásico de alta eficiência\nVersão PRO com ajuste de carga até 360 J', 13362.00, 'Unidade', 'uploads/products/prod_69bc58e86cf0f.webp', '2026-03-19 20:18:15'),
(82, 'BOMBA DE INFUSÃO ', 'CONTEC', 'SP750', 'Bomba de infusão ', 4400.00, 'Unidade', 'uploads/products/prod_69bda6b2c256b.webp', '2026-03-20 19:58:09'),
(83, 'MONITOR BLT P12', 'BLT', 'P12', 'Parâmetros de Monitorização:\n• ECG \n• SpO2 (Nellcor/Masimo)\n• PNI \n• RESP\n• TEMP\n• Tela e Interfaces: Display colorido (TFT LCD 12’’)\n• Interface: Navegação intuitiva\n• Alarmes: (alto, médio, baixo)\n• Operação: Teclas de atalho para funções rápidas\n• Armazenamento de dados históricos \n• Bateria interna\n• Modos de Paciente: Configurações específicas para Adulto, Pediátrico e Neonatal\n• Certificação da ANVISA', 30990.00, 'Unidade', 'uploads/products/prod_69c27a55ef1de.png', '2026-03-24 11:58:53'),
(84, 'MONITOR BLT Q5 12\"', 'BLT', 'Q5', 'Parâmetros de Monitorização:\n• ECG \n• SpO2 (Nellcor)\n• PNI \n• RESP\n• TEMP\n• Tela e Interfaces: Display colorido (TFT LCD 12’’)\n• Interface: Navegação intuitiva\n• Alarmes: (alto, médio, baixo)\n• Operação: Teclas de atalho para funções rápidas\n• Armazenamento de dados históricos \n• Bateria interna\n• Modos de Paciente: Configurações específicas para Adulto, Pediátrico e Neonatal\n• Certificação da ANVISA', 19990.00, 'Unidade', 'uploads/products/prod_69c27cf3b4f27.png', '2026-03-24 12:01:20'),
(85, 'DESFIBRILADOR EXTERNO AUTOMÁTICO ', 'INSTRAMED', 'I ON LCD', 'Operação simplificada com botão único, inteligência artificial para diagnóstico preciso e prevenção de uso acidental, choque bifásico e display LCD.\nBATERIA RECARREGÁVEL. ', 12185.00, 'Unidade', 'uploads/products/prod_69c4218b9498e.webp', '2026-03-25 18:10:33'),
(86, 'ERGOPC USB ', 'MICROMED', 'ERGOPC USB ', 'ErgoPc é um sistema de eletrocardiografia de esforço desenvolvido para a realização de testes ergométricos com alta precisão e confiabilidade. O equipamento capta os sinais elétricos provenientes do coração, amplifica esses sinais e os converte em dados digitais, que são enviados para um computador por meio de conexão USB.', 25590.00, 'Unidade', 'uploads/products/prod_69cc147f7b2a8.webp', '2026-03-31 18:38:36'),
(87, 'SENSOR SEDLINE', 'MASIMO', 'SENSOR SEDLINE ADULTO', NULL, 1244.07, 'Unidade', 'uploads/products/prod_69d400c32b04a.png', '2026-04-06 18:51:49');

-- --------------------------------------------------------

--
-- Estrutura para tabela `propostas`
--

CREATE TABLE `propostas` (
  `id` int(11) NOT NULL,
  `numero_proposta` varchar(20) DEFAULT NULL,
  `oportunidade_id` int(11) DEFAULT NULL,
  `cliente_pf_id` int(11) DEFAULT NULL,
  `organizacao_id` int(11) DEFAULT NULL,
  `contato_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `valor_total` decimal(20,2) NOT NULL DEFAULT 0.00,
  `status` varchar(50) NOT NULL DEFAULT 'Rascunho',
  `frete_tipo` enum('CIF','FOB') DEFAULT 'CIF',
  `frete_valor` decimal(10,2) DEFAULT 0.00,
  `motivo_status` text DEFAULT NULL,
  `data_validade` date DEFAULT NULL,
  `faturamento` text DEFAULT NULL,
  `treinamento` text DEFAULT NULL,
  `condicoes_pagamento` text DEFAULT NULL,
  `prazo_entrega` text DEFAULT NULL,
  `garantia_equipamentos` text DEFAULT NULL,
  `garantia_acessorios` text DEFAULT NULL,
  `instalacao` text DEFAULT NULL,
  `assistencia_tecnica` text DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `assinatura_url` varchar(512) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_por_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `propostas`
--

INSERT INTO `propostas` (`id`, `numero_proposta`, `oportunidade_id`, `cliente_pf_id`, `organizacao_id`, `contato_id`, `usuario_id`, `valor_total`, `status`, `frete_tipo`, `frete_valor`, `motivo_status`, `data_validade`, `faturamento`, `treinamento`, `condicoes_pagamento`, `prazo_entrega`, `garantia_equipamentos`, `garantia_acessorios`, `instalacao`, `assistencia_tecnica`, `observacoes`, `assinatura_url`, `data_criacao`, `atualizado_por_id`) VALUES
(60, '001/2025', 61, NULL, 892, NULL, 2, 23082.00, 'Recusada', 'CIF', 0.00, 'Preço alto', '2025-11-10', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 45 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível de forma contínua, com suporte especializado para manutenção e eventuais ajustes.', 'Nenhuma\n\nNão aprovou orçamento.', NULL, '2025-10-30 12:32:59', 1),
(62, '002/2025', 65, NULL, 894, NULL, 2, 12569.00, 'Enviada', 'CIF', 0.00, NULL, '2025-11-11', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 45 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível de forma contínua, com suporte especializado para manutenção e eventuais ajustes.', 'Nenhuma', NULL, '2025-11-04 15:11:04', NULL),
(65, '003/2025', 69, NULL, 897, NULL, 2, 102646.44, 'Enviada', 'CIF', 0.00, NULL, '2025-11-16', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '30 dias ', 'Até 45 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível de forma contínua, com suporte especializado para manutenção e eventuais ajustes.', 'Nenhuma', NULL, '2025-11-06 12:26:18', NULL),
(66, '004/2025', 70, NULL, 898, NULL, 2, 10208.40, 'Recusada', 'CIF', 0.00, '', '2025-11-16', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível de forma contínua, com suporte especializado para manutenção e eventuais ajustes.', 'Nenhuma', NULL, '2025-11-06 20:49:30', 8),
(67, '005/2025', 71, NULL, 384, NULL, 2, 69000.00, 'Recusada', 'CIF', 0.00, 'Preço alto', '2025-11-17', 'Realizado diretamente pela FR Produtos Médicos.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '10 x no boleto', 'Até 10 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma\n\nDesistiu', NULL, '2025-11-07 14:32:57', 1),
(68, '006/2025', 72, NULL, 336, NULL, 2, 28000.00, 'Rascunho', 'CIF', 0.00, NULL, '2025-11-17', 'Realizado diretamente pela FR Produtos Médicos.', '', 'A vista', 'Até 15 dias após a confirmação do pedido de compra.', '', '30dd, conforme especificações do fabricante.', '', '', '', NULL, '2025-11-07 15:01:42', NULL),
(69, '007/2025', 73, NULL, 850, NULL, 2, 36308.39, 'Enviada', 'CIF', 0.00, NULL, '2025-11-20', 'Realizado diretamente pela FR Produtos Médicos.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2025-11-10 13:09:13', NULL),
(70, '008/2025', 74, NULL, 897, NULL, 2, 1230.00, 'Enviada', 'CIF', 0.00, NULL, '2025-11-20', 'Realizado diretamente pela fábrica', '', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '', '6 meses, conforme especificações do fabricante.', '.', '', 'Nenhuma', NULL, '2025-11-10 20:31:38', NULL),
(71, '009/2025', 75, NULL, 915, 7, 1, 50196.00, 'Enviada', 'CIF', 0.00, NULL, '2025-11-28', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'INCLUSO CONJUNTO DE PAS (ADULTO/PEDIÁTRICO)', NULL, '2025-11-14 19:32:19', NULL),
(72, '010/2025', 76, NULL, 591, 8, 2, 7990.00, 'Aprovada', 'CIF', 0.00, '', '2025-11-26', 'Realizado diretamente pela  FR Produtos Médicos', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '3 vezes no boleto', '10 dias úteis', '12 meses a partir da data de emissão da nota Fiscal.', 'Tipo: Dióxido de Lítio Manganês (LiMnO2) 18 V, 2800\nmAh.\nDuração da bateria em carga plena (100%) 15 horas\nde monitorização contínua, mais de 300 choques de\n200 J ou mais de 160 choques de 360 J. conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2025-11-17 17:45:58', 1),
(73, '011/2025', 77, NULL, 591, 8, 2, 11652.80, 'Aprovada', 'CIF', 0.00, '', '2025-11-26', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', 'Tipo: Li-Ion, 14,4 VDC 4,0 Ah.\nDuração da bateria em carga plena (100%) 18 horas\nde monitorização contínua, mais de 400 choques de\n200 J ou mais de 230 choques de 360J.\nVida útil: 2 anos em stand by. Conforme informações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2025-11-17 17:47:12', 1),
(74, '012/2025', 78, NULL, 916, 9, 8, 7990.00, 'Aprovada', 'CIF', 0.00, '', '2025-12-16', 'Realizado diretamente pela FR', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '20/01/2026', 'Até 21/01/26 após a confirmação de pagamento.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Emitir a NF dia 05/01/2026.', NULL, '2025-11-24 12:29:04', 1),
(75, '013/2025', 79, 31, NULL, NULL, 2, 7990.00, 'Aprovada', 'CIF', 0.00, '', '2025-11-24', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '10 vezes no boleto ', 'Até 10 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2025-11-24 20:26:58', 1),
(77, '015/2025', 81, NULL, 917, NULL, 2, 23082.00, 'Recusada', 'CIF', 0.00, 'Preço alto', '2025-12-06', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'À Vista ', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2025-11-26 14:18:32', 1),
(78, '016/2025', 82, NULL, 336, NULL, 2, 116528.00, 'Enviada', 'CIF', 0.00, NULL, '2025-11-28', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 45 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2025-11-26 20:16:45', NULL),
(79, '017/2025', 83, NULL, 448, 10, 8, 8471.00, 'Aprovada', 'CIF', 0.00, '', '2025-12-11', 'Realizado diretamente pela FR ', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 10 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2025-12-01 21:00:29', 1),
(80, '018/2025', 84, NULL, 448, 10, 8, 72000.00, 'Recusada', 'CIF', 0.00, 'Preço alto', '2025-12-11', 'Realizado diretamente pela FR Produtos Médico', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'Pagamento mensal. \nPrazo de locação 12 meses', 'Até 5 dias após a confirmação do contrato de locação.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'As pás adesivas seguem junto com equipamento, não está incluso no contrato de locação.\nEm caso de uso deverá será faturada.\n\nEfetuou compra de um equipamento', NULL, '2025-12-01 21:11:15', 1),
(81, '019/2025', 85, NULL, 917, 11, 8, 8471.00, 'Enviada', 'CIF', 0.00, NULL, '2025-12-12', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2025-12-02 18:28:57', NULL),
(87, '020/2025', 91, NULL, 345, 12, 8, 6840.00, 'Aprovada', 'CIF', 0.00, '', '2025-12-11', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '3 meses a partir da data de emissão da nota Fiscal.', '3 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2025-12-02 19:20:05', 8),
(88, '021/2025', 92, NULL, 918, NULL, 2, 9106.00, 'Enviada', 'CIF', 0.00, NULL, '2025-12-13', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '10 vezes ', 'Imediato ', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', ' A placa será enviada gratuitamente como brinde', NULL, '2025-12-03 12:25:59', NULL),
(89, '022/2025', 93, NULL, 918, NULL, 2, 23082.00, 'Enviada', 'CIF', 0.00, '', '2025-12-13', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '40% de entrada + 5 parcelas ', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2025-12-03 17:06:46', 2),
(90, '023/2025', 94, NULL, 923, NULL, 2, 168000.00, 'Rascunho', 'CIF', 0.00, NULL, '2025-12-14', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 45 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2025-12-04 19:24:32', NULL),
(91, '024/2025', 95, NULL, 923, NULL, 2, 2118600.00, 'Rascunho', 'CIF', 0.00, '', '2025-12-14', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 45 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2025-12-04 19:26:33', 2),
(92, '025/2025', 96, 273, NULL, NULL, 2, 16765.85, 'Rascunho', 'CIF', 0.00, NULL, '2025-12-19', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 15 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2025-12-09 13:06:15', NULL),
(93, '026/2025', 97, NULL, 336, NULL, 2, 930.00, 'Aprovada', 'CIF', 0.00, '', '2026-01-23', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2025-12-09 14:46:31', 1),
(94, '027/2025', 98, NULL, 513, 20, 2, 10326.00, 'Aprovada', 'CIF', 0.00, '', '2025-12-19', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Imediato.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2025-12-09 20:40:47', 1),
(95, '028/2025', 99, NULL, 929, NULL, 2, 9500.00, 'Recusada', 'CIF', 0.00, 'Preço alto', '2025-12-22', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Imediato', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma\n\nSolicitou orçamento para compra pq havia comprado um Apolo e estava demorando, mas apos a chegada, não tem mais interesse.', NULL, '2025-12-11 19:13:44', 1),
(96, '029/2025', 100, NULL, 318, NULL, 2, 10055.20, 'Aprovada', 'CIF', 0.00, '', '2025-12-22', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '45/60 dias ', 'Até 45 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Trade in 20% de desconto', NULL, '2025-12-11 20:47:31', 1),
(97, '030/2025', 101, NULL, 916, 9, 2, 2372.40, 'Aprovada', 'CIF', 0.00, '', '2025-12-30', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '30 Dias ', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2025-12-12 13:04:23', 1),
(98, '031/2025', 102, NULL, 28, 36, 1, 23082.00, 'Enviada', 'CIF', 0.00, '', '2025-12-27', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 45 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2025-12-16 23:25:00', 8),
(108, '033/2025', 112, NULL, 393, NULL, 2, 18182.00, 'Recusada', 'CIF', 0.00, 'Preço alto', '2025-12-27', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma\n\nOptou por locação.', NULL, '2025-12-17 14:53:20', 1),
(109, '034/2025', 113, NULL, 238, NULL, 2, 615.00, 'Aprovada', 'CIF', 0.00, '', '2025-12-27', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 20 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2025-12-17 20:10:40', 2),
(110, '035/2025', 114, NULL, 935, NULL, 2, 9500.00, 'Recusada', 'CIF', 0.00, 'Preço alto', '2025-12-28', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Imediato', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'em busca de equipamento usado.', NULL, '2025-12-18 19:54:06', 1),
(111, '036/2025', 115, NULL, 936, NULL, 2, 19625.85, 'Enviada', 'CIF', 0.00, NULL, '2026-01-03', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2025-12-23 17:28:36', NULL),
(114, '002/2026', 120, NULL, 359, 14, 2, 21320.00, 'Enviada', 'CIF', 0.00, NULL, '2026-01-20', 'Realizado diretamente pela fr', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-01-09 12:48:45', NULL),
(116, '003/2026', 124, 280, NULL, NULL, 2, 33207.85, 'Enviada', 'CIF', 0.00, NULL, '2026-01-23', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Frete: FOB', NULL, '2026-01-13 12:33:28', NULL),
(117, '004/2026', 125, NULL, 937, 15, 2, 16942.00, 'Recusada', 'CIF', 0.00, 'Preço alto', '2026-01-23', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'FRETE FOB\n\nCliente optou por menor preço.\n', NULL, '2026-01-13 16:33:34', 1),
(120, '005/2026', 128, 280, NULL, NULL, 8, 10749.00, 'Enviada', 'CIF', 0.00, NULL, '2026-01-21', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-01-14 18:40:32', NULL),
(122, '006/2026', 131, NULL, 495, 16, 8, 12876.00, 'Recusada', 'CIF', 0.00, 'Preço alto', '2026-01-26', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 10 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-01-16 16:18:18', 1),
(129, '011/2026', 155, NULL, 271, 17, 2, 25000.00, 'Enviada', 'CIF', 0.00, NULL, '2026-01-30', 'Realizado diretamente pela FR', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '30 dias', 'Até 05 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', 'Conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-01-21 14:17:23', NULL),
(131, '013/2026', 159, NULL, 939, 18, 8, 115410.00, 'Enviada', 'CIF', 0.00, '', '2026-01-30', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '30dd', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-01-26 18:45:51', 8),
(132, '014/2026', 160, NULL, 923, NULL, 8, 2349420.00, 'Recusada', 'CIF', 0.00, '', '2026-01-30', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-01-26 18:59:01', 8),
(133, '015/2026', 167, NULL, 359, 14, 4, 5800.00, 'Aprovada', 'CIF', 0.00, '', '2026-02-27', 'Realizado diretamente pela FR', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '30/60/90', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-01-27 13:43:52', 4),
(135, '016/2026', 168, NULL, 227, 21, 4, 7049.08, 'Recusada', 'CIF', 0.00, '', '2026-02-27', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '30 dias', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-01-27 13:51:48', 2),
(136, '017/2026', 169, NULL, 227, 21, 4, 6698.18, 'Aprovada', 'CIF', 0.00, '', '2026-02-27', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '30 dias', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-01-27 15:06:50', NULL),
(137, '018/2026', 170, 281, NULL, NULL, 4, 49000.00, 'Aprovada', 'CIF', 0.00, '', '2026-02-27', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'Cartão de crédito', 'Até 30 dias após a confirmação do pedido de compra.', '60 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-01-27 15:57:12', 8),
(138, '019/2026', 173, NULL, 617, 22, 7, 48000.00, 'Aprovada', 'CIF', 0.00, '', '2026-02-10', 'Realizado diretamente pela FR PRODUTOS MÉDICOS', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '10x', 'JÁ ENTREGUE', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'EQUIPAMENTO SEMI NOVO', NULL, '2026-01-29 18:43:23', 7),
(141, '021/2026', 176, NULL, 942, 25, 8, 155284.00, 'Rascunho', 'CIF', 0.00, '', '2026-02-19', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 45 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-02-02 20:47:58', 2),
(142, '022/2026', 177, NULL, 941, NULL, 8, 84000.00, 'Recusada', 'CIF', 0.00, 'PROJETO CANCELADO', '2026-02-16', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 45 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Frete FOB', NULL, '2026-02-03 17:42:49', 8),
(143, '023/2026', 178, NULL, 336, NULL, 2, 671850.00, 'Aprovada', 'CIF', 0.00, 'Forma de pagamento autorizada por Denis ', '2026-03-27', 'Realizado diretamente pela Instramed.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'Entrada no ato do pedido, seguida de 9 parcelas mensais.', 'Até 45 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Frete FOB R$ 13.744,74', NULL, '2026-02-05 13:57:34', 2),
(144, '024/2026', 179, NULL, 438, NULL, 2, 185700.00, 'Recusada', 'CIF', 0.00, 'Projeto CANCELADO', '2026-02-16', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia..', 'Frete FOB', NULL, '2026-02-06 16:23:08', 8),
(150, '025/2026', 186, NULL, 942, NULL, 2, 89000.00, 'Enviada', 'CIF', 0.00, '', '2026-02-19', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Equipamento seminovo. ', NULL, '2026-02-09 13:22:46', NULL),
(151, '026/2026', 189, NULL, 945, NULL, 2, 6074.40, 'Enviada', 'FOB', 50.00, '', '2026-02-19', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-02-09 17:47:57', NULL),
(152, '027/2026', 190, NULL, 946, NULL, 2, 23732.00, 'Enviada', 'CIF', 0.00, '', '2026-03-10', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 45 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-02-10 16:31:00', 2),
(153, '028/2026', 191, NULL, 249, NULL, 4, 23732.00, 'Negociando', 'CIF', 0.00, '', '2026-03-10', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '30 dias', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-02-10 17:28:34', 1),
(154, '029/2026', 194, NULL, 947, NULL, 2, 24510.00, 'Recusada', 'CIF', 0.00, 'Cliente não está atendendo e não responde mensagens. ', '2026-02-23', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 10 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-02-13 14:35:09', 2),
(155, '030/2026', 198, NULL, 336, NULL, 7, 1000.00, 'Negociando', 'CIF', 0.00, '', '2026-02-15', 'POULP ', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '30 DIAS BOLETO', 'IMEDIATO', '', '', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', '', NULL, '2026-02-12 17:23:30', NULL),
(156, '031/2026', 199, 283, NULL, NULL, 2, 10837.40, 'Enviada', 'CIF', 0.00, '', '2026-02-22', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '30 Dias ', 'Até 10 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-02-12 20:54:35', NULL),
(158, '033/2026', 201, NULL, 317, 28, 4, 79000.00, 'Enviada', 'CIF', 0.00, '', '2026-02-23', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-02-13 15:11:29', NULL),
(159, '034/2026', 202, NULL, 321, NULL, 2, 29487.00, 'Enviada', 'CIF', 0.00, '', '2026-02-28', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 45 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-02-13 18:30:55', NULL),
(160, '035/2026', 204, NULL, 317, 29, 4, 128000.00, 'Enviada', 'CIF', 0.00, '', '2026-03-02', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Para abertura de edital da UFRN', NULL, '2026-02-19 16:39:41', NULL),
(161, '036/2026', 205, NULL, 918, NULL, 2, 12569.00, 'Aprovada', 'CIF', 0.00, '', '2026-03-02', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '10x no boleto', 'Até 45 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-02-19 16:59:39', 2),
(162, '037/2026', 206, NULL, 949, NULL, 2, 14438.00, 'Enviada', 'CIF', 0.00, '', '2026-03-02', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 45 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-02-19 19:26:11', NULL),
(163, '038/2026', 175, NULL, 950, NULL, 7, 191000.00, 'Negociando', 'CIF', 0.00, '', '2026-03-13', 'Direto da FR Produtos Médicos', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista.', 'Até 10 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Enviaremos 02 jogos de medidores MERIL ', NULL, '2026-02-23 10:44:09', 7),
(165, '040/2026', 209, NULL, 841, 30, 4, 334350.00, 'Negociando', 'CIF', 0.00, '', '2026-03-05', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 45 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-02-25 11:48:29', NULL),
(167, '042/2026', 218, NULL, 438, NULL, 1, 1515.87, 'Enviada', 'CIF', 0.00, '', '2026-03-16', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-03 20:01:10', NULL),
(168, '043/2026', 219, NULL, 954, 33, 8, 77632.00, 'Negociando', 'FOB', 2500.00, '', '2026-03-13', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Os gabinetes são opcionais.', NULL, '2026-03-03 20:36:43', 8),
(169, '044/2026', 221, NULL, 539, NULL, 8, 361.82, 'Negociando', 'CIF', 0.00, '', '2026-03-13', 'Realizado diretamente pela fábrica FR', '', 'A vista', 'Até 45 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', '', 'Disponível com suporte especializado para manutenção e pós garantia.', '', NULL, '2026-03-04 18:00:20', 8),
(170, '045/2026', 222, NULL, 452, NULL, 8, 32513.00, 'Negociando', 'FOB', 0.00, '', '2026-03-13', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '30/60', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-04 18:45:34', 8),
(171, '046/2026', 223, NULL, 855, NULL, 8, 4152.72, 'Negociando', 'CIF', 0.00, '', '2026-03-13', 'Realizado diretamente pela FR', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-05 13:41:51', NULL),
(172, '047/2026', 224, NULL, 561, 34, 8, 9904.00, 'Negociando', 'FOB', 300.00, '', '2026-03-13', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-05 13:59:50', NULL),
(173, '048/2026', 225, 290, NULL, NULL, 2, 637660.00, 'Enviada', 'CIF', 0.00, '', '2026-03-19', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 45 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-09 18:43:42', NULL),
(174, '049/2026', 227, NULL, 726, NULL, 2, 23589.60, 'Recusada', 'CIF', 0.00, 'Orçamento não foi aprovado, cliente decidiu concertar o equipamento velho. ', '2026-03-20', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'Parcelado em até 6 vezes', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Desconto mediante ao trade in (troca de equipamento) ', NULL, '2026-03-10 13:04:10', 2),
(175, '050/2026', 228, NULL, 227, NULL, 2, 3654.00, 'Enviada', 'CIF', 0.00, '', '2026-03-20', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'Mensal ', 'Até 10 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-10 18:04:40', 2),
(176, '051/2026', 230, 290, NULL, NULL, 2, 721459.20, 'Enviada', 'CIF', 0.00, '', '2026-03-31', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'Mensal ', 'Até 60 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Incluso equipos, seringa e bomba', NULL, '2026-03-11 19:07:18', 1),
(177, '052/2026', 231, NULL, 956, NULL, 2, 38303.85, 'Recusada', 'CIF', 0.00, 'Cliente está interessada somente no DEA', '2026-03-23', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-13 18:25:06', 2),
(178, '053/2026', 232, NULL, 956, NULL, 2, 23732.00, 'Recusada', 'CIF', 0.00, 'Cliente está interessada somente no DEA', '2026-03-23', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-13 18:40:55', 2),
(179, '054/2026', 233, NULL, 957, NULL, 2, 7987.20, 'Negociando', 'CIF', 0.00, 'Aguardando ordem de compra ', '2026-03-26', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '6x no boleto ', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', '20% de desconto - trade in ', NULL, '2026-03-16 17:21:20', 2),
(180, '055/2026', 234, NULL, 958, NULL, 7, 7537.80, 'Negociando', 'CIF', 0.00, '', '2026-03-23', 'Realizado diretamente pela FR PRODUTOS MÉDICOS', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'IMEDIATO - após a confirmação do pedido de compra.', '06 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'EQUIPAMENTO SEMI-NOVO', NULL, '2026-03-16 18:38:34', 7),
(181, '056/2026', 235, NULL, 959, NULL, 2, 6968.00, 'Recusada', 'CIF', 0.00, 'Cliente optou por não realizar a compra agora ', '2026-03-26', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '6x no boleto ', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-16 20:52:38', 2),
(182, '057/2026', 236, NULL, 956, NULL, 2, 9984.00, 'Recusada', 'CIF', 0.00, 'Cliente não está atendendo e não responde mensagens. ', '2026-03-27', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '6x no boleto', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-17 16:23:30', 2),
(183, '058/2026', 237, NULL, 321, NULL, 2, 965301.37, 'Enviada', 'CIF', 0.00, '', '2026-03-31', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', '5 ANOS DE GARANTIA KOSMOS ', NULL, '2026-03-18 20:46:02', 2),
(184, '059/2026', 238, NULL, 960, NULL, 2, 11009.00, 'Negociando', 'CIF', 0.00, '', '2026-03-29', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-19 11:39:10', 2);
INSERT INTO `propostas` (`id`, `numero_proposta`, `oportunidade_id`, `cliente_pf_id`, `organizacao_id`, `contato_id`, `usuario_id`, `valor_total`, `status`, `frete_tipo`, `frete_valor`, `motivo_status`, `data_validade`, `faturamento`, `treinamento`, `condicoes_pagamento`, `prazo_entrega`, `garantia_equipamentos`, `garantia_acessorios`, `instalacao`, `assistencia_tecnica`, `observacoes`, `assinatura_url`, `data_criacao`, `atualizado_por_id`) VALUES
(185, '060/2026', 239, NULL, 321, NULL, 2, 190000.00, 'Enviada', 'CIF', 0.00, '', '2026-03-31', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-19 13:29:58', 2),
(186, '061/2026', 240, NULL, 321, NULL, 2, 982459.94, 'Enviada', 'CIF', 0.00, '', '2026-03-31', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-19 14:01:46', 2),
(187, '062/2026', 241, NULL, 777, NULL, 2, 26167.00, 'Enviada', 'CIF', 0.00, '', '2026-03-29', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'Parcelamento em 4x', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-19 17:34:28', NULL),
(188, '063/2026', 242, NULL, 43, 41, 2, 20557.85, 'Enviada', 'CIF', 0.00, '', '2026-03-29', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-19 19:31:08', 2),
(189, '064/2026', 243, NULL, 962, NULL, 2, 10689.60, 'Negociando', 'CIF', 0.00, '', '2026-03-29', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '6x no boleto', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Trade in ', NULL, '2026-03-19 20:19:50', 2),
(190, '065/2026', 244, NULL, 962, NULL, 2, 9694.40, 'Enviada', 'CIF', 0.00, '', '2026-03-20', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '6x no boleto ', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Condição especial de Trade In + desconto válido até o dia 20/03.', NULL, '2026-03-20 15:08:02', NULL),
(191, '066/2026', 245, NULL, 336, NULL, 2, 66000.00, 'Enviada', 'CIF', 0.00, '', '2026-03-31', 'Realizado diretamente pela Instramed. ', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'Parcelamento em 6x', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-20 20:00:54', 2),
(192, '067/2026', 246, NULL, 363, 35, 1, 662740.00, 'Enviada', 'CIF', 0.00, '', '2026-03-31', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-24 12:04:06', 1),
(193, '068/2026', 247, 291, NULL, NULL, 2, 500.00, 'Enviada', 'CIF', 0.00, '', '2026-04-04', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Imediato ', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Acompanha uma pá adesiva. Caso seja utilizada, será cobrado o valor de R$ 650,90.', NULL, '2026-03-24 14:43:01', NULL),
(194, '069/2026', 248, NULL, 964, NULL, 2, 16869.85, 'Enviada', 'CIF', 0.00, '', '2026-04-04', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-24 19:16:11', NULL),
(195, '070/2026', 249, NULL, 965, NULL, 2, 9818.00, 'Aprovada', 'CIF', 0.00, '', '2026-04-05', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-25 18:13:59', 2),
(196, '071/2026', 251, NULL, 966, NULL, 2, 17169.85, 'Enviada', 'FOB', 300.00, '', '2026-04-06', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 15 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-26 14:23:37', 2),
(197, '072/2026', 252, NULL, 967, 37, 8, 18165.00, 'Negociando', 'CIF', 0.00, '', '2026-04-10', 'Realizado diretamente pela FR', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 10 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-31 14:22:01', 8),
(198, '073/2026', 253, NULL, 53, 38, 8, 75800.00, 'Aprovada', 'FOB', 3900.00, '', '2026-03-31', 'Realizado diretamente pela Micromed.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '12x no cartão', 'Até 60 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-03-31 18:41:36', NULL),
(199, '074/2026', 259, NULL, 969, 39, 2, 9604.00, 'Enviada', 'CIF', 0.00, '', '2026-04-11', 'Realizado diretamente pela FR.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-04-01 20:05:56', NULL),
(201, '076/2026', 262, NULL, 971, NULL, 2, 16570.00, 'Enviada', 'CIF', 0.00, '', '2026-04-16', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', ' entrada de 40%, com o saldo dividido em duas parcelas', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-04-06 19:51:07', NULL),
(202, '077/2026', 263, NULL, 406, NULL, 2, 1386.10, 'Enviada', 'CIF', 0.00, '', '2026-04-17', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', 'A vista', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-04-07 18:49:56', 2),
(203, '078/2026', 264, NULL, 225, NULL, 7, 16200.00, 'Negociando', 'CIF', 0.00, '', '2026-04-30', 'Realizado diretamente pela FR PRODUTOS MÉDICOS', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '30 DIAS', 'Até 30 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'VALOR PARA INCOR COMPRAR R$ 13.900,00', NULL, '2026-04-08 16:41:37', NULL),
(204, '079/2026', 265, NULL, 972, 42, 2, 9604.00, 'Enviada', 'CIF', 0.00, '', '2026-04-20', 'Realizado diretamente pela fábrica.', 'Capacitação técnica por especialistas da FR Produtos Médicos.', '40% de entrada + 5 parcelas ', 'Até 45 dias após a confirmação do pedido de compra.', '12 meses a partir da data de emissão da nota Fiscal.', '6 meses, conforme especificações do fabricante.', 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.', 'Disponível com suporte especializado para manutenção e pós garantia.', 'Nenhuma', NULL, '2026-04-10 19:56:54', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `proposta_itens`
--

CREATE TABLE `proposta_itens` (
  `id` int(11) NOT NULL,
  `proposta_id` int(11) NOT NULL,
  `produto_id` int(11) DEFAULT NULL,
  `descricao` varchar(255) NOT NULL COMMENT 'Descrição personalizada no momento da proposta',
  `descricao_detalhada` text DEFAULT NULL,
  `fabricante` varchar(255) DEFAULT NULL,
  `modelo` varchar(255) DEFAULT NULL,
  `imagem_url` varchar(512) DEFAULT NULL,
  `quantidade` int(11) NOT NULL,
  `valor_unitario` decimal(20,2) NOT NULL COMMENT 'Valor personalizado no momento da proposta',
  `status` enum('VENDA','LOCAÇÃO') DEFAULT 'VENDA',
  `unidade_medida` varchar(50) DEFAULT NULL,
  `parametros` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Armazena os parâmetros do produto no momento da criação da proposta' CHECK (json_valid(`parametros`)),
  `meses_locacao` int(11) DEFAULT 1,
  `meses` int(11) DEFAULT 1,
  `desconto_percent` decimal(5,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `proposta_itens`
--

INSERT INTO `proposta_itens` (`id`, `proposta_id`, `produto_id`, `descricao`, `descricao_detalhada`, `fabricante`, `modelo`, `imagem_url`, `quantidade`, `valor_unitario`, `status`, `unidade_medida`, `parametros`, `meses_locacao`, `meses`, `desconto_percent`) VALUES
(189, 65, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 18, 5702.58, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(190, 62, 12, 'DESFIBRILADOR ', 'Principais funções concentradas em apenas um botão seletor. \nRápida inicialização carregamento de 360 J em menos de 6 segundos', 'INSTRAMED', 'APOLUS ', 'https://frpe.app.br/crm/uploads/products/prod_690a099525520.webp', 1, 12569.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(199, 68, 15, 'Traqueia pediátrica 1200MM X 15MM com 1 conector reto 15mm', 'Circuito para ventilação pediátrico.', 'GLOBALTEC', 'Traqueia pediátrica 1200MM X 15MM  c/1 conector reto.', '', 80, 350.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(204, 69, 19, 'OXIMETRO ', 'Monitor portátil com SPO2, PR, PI, RRP', 'MASIMO ', 'RAD G SEM TEMPERATURA ', 'https://frpe.app.br/crm/uploads/products/prod_6911e01074fe3.png', 1, 6600.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(205, 69, 17, 'OXIMETRO', 'Monitor portátil com SPO2, PR, PI, RRP e módulo de temperatura integrado ', 'MASIMO', 'RAD G COM TEMPERATURA ', 'https://frpe.app.br/crm/uploads/products/prod_6911dd39c9342.png', 1, 8358.90, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(206, 69, 16, 'MONITOR DE PRESSÃO ARTERIAL DE BRAÇO PROFISSIONAL - MPA', 'Destinado a profissionais da saúde.\nDesign de mesa ideal para consultórios. ​\nModo de medição totalmente automático oscilométrico ou auscultatório.​\nFunção Indicador Zero ​\nPode ser usado com 4 pilhas AA ou com adaptador CA (bivolt automático)​', 'MICROMED', 'OMRON', 'https://frpe.app.br/crm/uploads/products/prod_6911dd100a3fb.webp', 1, 1290.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(207, 69, 18, 'OXÍMETRO DE PULSO DE CABECEIRA', 'Rad-97 com pressão arterial não invasiva (PANI) integrada oferece diversas tecnologias avançadas de monitoramento do paciente — incluindo oximetria de pulso Masimo SET® — em um dispositivo independente compacto, portátil e altamente configurável.', 'MASIMO', 'Rad-97 COM PNI', 'https://frpe.app.br/crm/uploads/products/prod_6911df74c6064.png', 1, 20059.49, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(208, 70, 21, 'PÁ ADESIVA ADULTO DESCARTAVEL DEA / CARDIOMAX', 'PÁ ADESIVA ADULTO DESCARTÁVEL', 'INSTRAMED', 'ADULTO', 'https://frpe.app.br/crm/uploads/products/prod_691249bfe6282.png', 1, 615.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(209, 70, 20, 'PÁ ADESIVA INFANTIL DESCARTAVEL DEA/CARDIOMAX', 'PÁ ADESIVA INFANTIL DESCARTAVEL - DEA/CARDIOMAX', 'INSTRAMED', 'INFANTIL', 'https://frpe.app.br/crm/uploads/products/prod_69124901583c3.png', 1, 615.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(212, 71, 7, 'CARDIOVERSOR ', 'Configuração Básica (ECG, Resp, Desf, ASC, PMS, Li-ion 4 Ah)', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 2, 25098.00, 'VENDA', 'Unidade', '[{\"nome\":\"IMP (Impressora)\",\"valor\":4152},{\"nome\":\"MP (Marcapasso) \",\"valor\":2758},{\"nome\":\"DEA (Desfibrilador Externo Autom\\u00e1tico) \",\"valor\":1602}]', NULL, 1, 0.00),
(245, 78, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 10, 7283.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(246, 78, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 10, 4369.80, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(255, 81, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 8471.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(268, 88, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 8471.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(269, 88, 23, 'SUPORTE DE PAREDE EM ACRÍLICO ', 'Suporte de parede em acrílico para DEA', 'INSTRAMED', 'I ON ', 'https://frpe.app.br/crm/uploads/products/prod_69302adc0a423.webp', 1, 635.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(270, 88, 24, 'PLACA ESPAÇO CARDIOPROTEGIDO', '', '', '', 'https://frpe.app.br/crm/uploads/products/prod_69302bd5e098a.png', 1, 0.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(271, 88, 25, 'PLACA PASSO A PASSO ', '', '', '', 'https://frpe.app.br/crm/uploads/products/prod_69302dcc1a1e9.png', 1, 0.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(278, 92, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 9500.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(279, 92, 28, 'CARRO DE PARADA ', 'Estrutura interna em aço carbono, revestido em polímero de alto impacto ABS com nano tecnologia anti-bacteriana.   ', 'HEALTH ', 'LT 103', 'https://frpe.app.br/crm/uploads/products/prod_69381c774ddf6.webp', 1, 7265.85, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(321, 111, 28, 'CARRO DE PARADA ', 'ESTRUTURA INTERNA EM AÇO CARBONO, REVESTIDO EM POLÍMERO DE ALTO IMPACTO ABS COM NANO TECNOLOGIA ANTI-BACTERIANA.   ', 'HEALTH ', 'LT 103', 'https://frpe.app.br/crm/uploads/products/prod_69381c774ddf6.webp', 1, 7265.85, 'VENDA', 'Unidade', NULL, 1, 1, 0.00),
(322, 111, 31, 'CILINDRO DE O2', 'Capacidade hidráulica 2.8L\nPressão  de serviço 139bar\nAltura 412.8mm\nDiâmetro 111.1mm\nRosca de entrada 3/4 \nPeso 2.3kg ', '', 'GWA15', 'https://frpe.app.br/crm/uploads/products/prod_694ace6e98b05.webp', 1, 2860.00, 'VENDA', 'Unidade', NULL, 1, 1, 0.00),
(323, 111, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 9500.00, 'VENDA', 'Unidade', NULL, 1, 1, 0.00),
(337, 114, 32, 'Módulo de bateria (NiMH) - CardioMax', 'Modulo de bateria recarregável para Cardiomax (NiMH)', 'INSTRAMED', 'CARDIOMAX ', 'https://frpe.app.br/crm/uploads/products/prod_695ff7e024858.jpg', 6, 2900.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(338, 114, 22, 'MODULO DE BATERIA CARDIOMAX LI-ON 14,4V 4AH 57,6WH', 'Modulo de bateria recarregável para carDiomax li-on 14,4V 4AH 57,6WH', 'INSTRAMED', 'CARDIOMAX', 'https://frpe.app.br/crm/uploads/products/prod_692f33e61ffc4.jpg', 1, 3920.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(350, 116, 28, 'CARRO DE PARADA ', 'ESTRUTURA INTERNA EM AÇO CARBONO, REVESTIDO EM POLÍMERO DE ALTO IMPACTO ABS COM NANO TECNOLOGIA ANTI-BACTERIANA.   ', 'HEALTH ', 'LT 103', 'https://frpe.app.br/crm/uploads/products/prod_69381c774ddf6.webp', 1, 7265.85, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(351, 116, 31, 'CILINDRO DE O2 (vazio)', 'Capacidade hidráulica 2.8L\nPressão  de serviço 139bar\nAltura 412.8mm\nDiâmetro 111.1mm\nRosca de entrada 3/4 \nPeso 2.3kg ', '', 'GWA15', 'https://frpe.app.br/crm/uploads/products/prod_694ace6e98b05.webp', 1, 2860.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(352, 116, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, PMS. \n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 1, 23082.00, 'VENDA', 'Unidade', '[{\"nome\":\"IMPRESSORA\",\"valor\":4152},{\"nome\":\"MARCAPASSO\",\"valor\":2758},{\"nome\":\"DEA\",\"valor\":1602}]', NULL, 1, 0.00),
(353, 90, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, PMS \nParâmetros adicionais: MP + DEA + IMP', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 10, 16800.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(364, 120, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA  RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LCD', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 10749.00, 'VENDA', 'Unidade', '[{\"nome\":\"Fun\\u00e7\\u00e3o 3V Monitora\\u00e7\\u00e3o atraves cabo ECG 3vias\",\"valor\":1253},{\"nome\":\"Conector para RCP (somente conector)\",\"valor\":752}]', NULL, 1, 0.00),
(399, 129, 34, 'SENSOR LÍDICO', 'SENSOR LIDICO (Em comodato acompanha; Monitor multiparamétrico compacto Root® com Modulo Cabo).', 'MASIMO ', 'RD Raimbow set2 4026', 'https://frpe.app.br/crm/uploads/products/prod_6970da50f1c05.png', 10, 2500.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(424, 122, 33, 'Eletrocardiógrafo de 12 canais', 'AQUISIÇÃO E IMPRESÃO EM 12 CANAIS SIMUTÂNEOS, INTERPRETATIVO, IMPRESSÃO EM PAPEL TÉRMICO A4, Display Colorido 8”- Teclado QWERTY- Memória 800 exames- Exporta exames em PDF.', 'EDAN', 'SE 1200 EXPRESS', 'https://frpe.app.br/crm/uploads/products/prod_696a54b7a29fa.png', 1, 12876.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(425, 97, 23, 'SUPORTE DE PAREDE EM ACRÍLICO ', 'Suporte de parede em acrílico para DEA', 'INSTRAMED', 'I ON ', 'https://frpe.app.br/crm/uploads/products/prod_69302adc0a423.webp', 1, 635.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(426, 97, 13, 'GABINETE DEA', 'Gabinete metálico para desfibrilador externo automático (DEA), equipado com alarme sonoro.\n\n', 'INSTRAMED', 'DEA', 'https://frpe.app.br/crm/uploads/products/prod_690de965c8b36.webp', 1, 1737.40, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(427, 117, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 2, 8471.00, 'VENDA', 'Unidade', '[{\"nome\":\"FUN\\u00c7\\u00c3O 3V (MONITORIZA\\u00c7\\u00c3O ATRAVES DE CABO DE ECG 3VIAS)\",\"valor\":1253},{\"nome\":\"CONECTOR PARA RCP (SOMENTE CONECTOR)\",\"valor\":1253},{\"nome\":\"RCP MAESTRO (COM DISPLAY)\",\"valor\":4174},{\"nome\":\"GRAVADOR DE SOM AMBIENTE (MICROFONE) \",\"valor\":317}]', NULL, 1, 0.00),
(428, 110, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 9500.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(429, 108, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 9711.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(430, 108, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 8471.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(431, 95, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 9500.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(432, 96, 12, 'DESFIBRILADOR ', 'Principais funções concentradas em apenas um botão seletor. \nRápida inicialização carregamento de 360 J em menos de 6 segundos', 'INSTRAMED', 'APOLUS ', 'https://frpe.app.br/crm/uploads/products/prod_690a099525520.webp', 1, 10055.20, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(433, 94, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 9711.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(434, 94, 20, 'PÁ ADESIVA INFANTIL DESCARTAVEL DEA/CARDIOMAX', 'PÁ ADESIVA INFANTIL DESCARTAVEL - DEA/CARDIOMAX', 'INSTRAMED', 'INFANTIL', 'https://frpe.app.br/crm/uploads/products/prod_69124901583c3.png', 1, 615.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(435, 93, 29, 'SENSOR DE FLUXO ', 'Sensor de fluxo para utilização no ventilador pulmonar Shangrila 510S\n', 'AEONMED', '', 'https://frpe.app.br/crm/uploads/products/prod_69383041db97a.webp', 6, 155.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(436, 80, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 12, 500.00, 'LOCAÇÃO', 'mensal', NULL, 12, 1, 0.00),
(437, 79, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 8471.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(438, 77, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, DEA/PMS\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 1, 23082.00, 'VENDA', 'Unidade', '[{\"nome\":\"IMP \",\"valor\":4152},{\"nome\":\"DEA\",\"valor\":1602}]', NULL, 1, 0.00),
(439, 75, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 7990.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(440, 74, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 7990.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(441, 73, NULL, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/proposal_items/item_691b672009fc1.png', 1, 7283.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(442, 73, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 4369.80, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(443, 72, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 7990.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(444, 67, 14, 'VENTILADOR ', 'Tela sensível ao toque de 18,5 com interface intuitiva, projetada para agilizar a configuração em situações críticas.\nSeu design versátil permite a utilização em múltiplos ambientes hospitalares da UTI adulta à neonatologia com uma única unidade, otimizando recursos e garantindo continuidade no cuidado ao paciente.', 'TECME', 'BRINA', 'https://frpe.app.br/crm/uploads/products/prod_690df701cb457.png', 1, 69000.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(445, 60, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, PMS, Li-ion 4Ah.\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 1, 23082.00, 'VENDA', 'Unidade', '[{\"nome\":\"Marcapasso\",\"valor\":2758},{\"nome\":\"Impressora\",\"valor\":4152}]', NULL, 1, 0.00),
(452, 133, NULL, 'Bateria Cardiomax', '', 'Instramed', 'Níquel', '', 2, 2900.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(453, 133, 32, 'Módulo de bateria (NiMH) - CardioMax', 'Modulo de bateria recarregável para Cardiomax (NiMH)', 'INSTRAMED', 'CARDIOMAX ', 'https://frpe.app.br/crm/uploads/products/prod_695ff7e024858.jpg', 0, 0.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(454, 136, NULL, 'Bateria Cardiomax', '', 'Instramed', 'Níquel', '', 2, 3349.09, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(456, 131, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, PMS, Li-ion 4Ah.\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 5, 23082.00, 'VENDA', 'Unidade', '[{\"nome\":\"marcapasso\",\"valor\":2758},{\"nome\":\"Impressora\",\"valor\":4152}]', NULL, 1, 0.00),
(470, 137, NULL, 'US Kosmos', '', 'Brasil Médica', 'Torso One', 'uploads/proposal_items/item_6978e021d55d9.jpeg', 1, 49000.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(471, 91, 26, 'VENTILADOR BEIRA LEITO ', 'Ventilação invasiva e não invasiva \nBateria interna com autonomia de aproximadamente 4 horas \nNebulizador integrado \n', 'INSTRAMED', 'VG70', 'https://frpe.app.br/crm/uploads/products/prod_6931ddcc8f088.webp', 30, 62900.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(472, 91, 27, 'MONITOR BLT', 'Configuração ECG, SPO2, PNI', 'INSTRAMED', 'M10', 'https://frpe.app.br/crm/uploads/products/prod_6931df2fb1be3.webp', 30, 7720.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(497, 89, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, PMS, Li-ion 4Ah.\nParâmetros adicionais: MP, IMP E DEA\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 1, 23082.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(507, 141, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, PMS, Li-ion 4Ah.\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 1, 23082.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(508, 141, 14, 'VENTILADOR ', 'Tela sensível ao toque de 18,5 com interface intuitiva, projetada para agilizar a configuração em situações críticas.\nSeu design versátil permite a utilização em múltiplos ambientes hospitalares da UTI adulta à neonatologia com uma única unidade, otimizando recursos e garantindo continuidade no cuidado ao paciente.', 'TECME', 'BRINA', 'https://frpe.app.br/crm/uploads/products/prod_690df701cb457.png', 1, 118312.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(509, 141, 35, 'MONITOR ', 'Configuração ECG, Resp, PMS, ST, SPO2, PNI Z, 2 Temp, Bateria', 'INSTRAMED', 'InMax 12', 'uploads/products/prod_69810e0520771.webp', 1, 13890.00, 'VENDA', 'Unidade', '[{\"nome\":\"EtCO2 (capnografia Microstream)\",\"valor\":11922}]', NULL, 1, 0.00),
(510, 150, 14, 'VENTILADOR ', 'Tela sensível ao toque de 18,5 com interface intuitiva, projetada para agilizar a configuração em situações críticas.\nSeu design versátil permite a utilização em múltiplos ambientes hospitalares da UTI adulta à neonatologia com uma única unidade, otimizando recursos e garantindo continuidade no cuidado ao paciente.', 'TECME', 'BRINA', 'https://frpe.app.br/crm/uploads/products/prod_690df701cb457.png', 1, 89000.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(511, 151, 42, 'VÁLVULA EXPIRATÓRIA ', '', 'TECME ', 'VÁLVULA EXPIRATÓRIA GRAPHNET ', 'uploads/products/prod_698a1cc4e47bf.png', 4, 1506.10, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(512, 66, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 8471.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(513, 66, 13, 'GABINETE DEA', 'Gabinete metálico para desfibrilador externo automático (DEA), equipado com alarme sonoro.\n\n', 'INSTRAMED', 'DEA', 'https://frpe.app.br/crm/uploads/products/prod_690de965c8b36.webp', 1, 1737.40, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(515, 152, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, PMS, Li-ion 4Ah.\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 1, 23732.00, 'VENDA', 'Unidade', '[{\"nome\":\"Marcapasso\",\"valor\":2836}]', NULL, 1, 0.00),
(517, 153, NULL, 'Cardiomax', 'Com Marca Passo', 'Instramed', 'Lite', '', 1, 23732.00, 'VENDA', 'Unidade', '[{\"nome\":\"Marca Passo\",\"valor\":2836}]', NULL, 1, 0.00),
(520, 155, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 2, 500.00, 'LOCAÇÃO', 'Unidade', NULL, 1, 1, 0.00),
(521, 156, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 9100.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(522, 156, 13, 'GABINETE DEA', 'Gabinete metálico para desfibrilador externo automático (DEA), equipado com alarme sonoro.\n\n', 'INSTRAMED', 'DEA', 'https://frpe.app.br/crm/uploads/products/prod_690de965c8b36.webp', 1, 1737.40, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(523, 156, 24, 'PLACA ESPAÇO CARDIOPROTEGIDO', '', 'FR - GRAFICA RECIFE', '', 'https://frpe.app.br/crm/uploads/products/prod_69302bd5e098a.png', 1, 0.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(524, 156, 25, 'PLACA PASSO A PASSO ', '', 'FR - GRAFICA RECIFE', '', 'https://frpe.app.br/crm/uploads/products/prod_69302dcc1a1e9.png', 1, 0.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(526, 158, NULL, 'US Kosmos', 'Sonda Lexsa + Bridge ', 'Brasil Médica', 'Lexsa + Bridge', 'uploads/proposal_items/item_698f3e38cdc94.jpeg', 1, 79000.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(527, 159, 43, 'CARDIOVERSOR', 'ECG, Resp, Desf, ASC, DEA/PMS \n', 'INSTRAMED', 'CARDIOMAX', 'uploads/products/prod_698f6c73d66ff.png', 1, 29487.00, 'VENDA', 'Unidade', '[{\"nome\":\"SPO2\",\"valor\":4988},{\"nome\":\"MP\",\"valor\":2836}]', NULL, 1, 0.00),
(528, 160, NULL, 'Bridge+Torso+Lexsa', '', 'Brasil Médica', '', 'uploads/proposal_items/item_699739a0849dd.jpeg', 1, 128000.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(530, 162, 12, 'DESFIBRILADOR ', 'Principais funções concentradas em apenas um botão seletor. \nRápida inicialização carregamento de 360 J em menos de 6 segundos', 'INSTRAMED', 'APOLUS ', 'https://frpe.app.br/crm/uploads/products/prod_690a099525520.webp', 1, 14438.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(533, 163, 44, 'PROTESE VALVAR BIOLOGIA AORTICA ', 'A bioprótese pericárdica Dafodil é uma válvula de engenharia biomecânica tripla composta.\nEla combina os mais recentes avanços da engenharia com os benefícios do tecido pericárdico bovino.\nTamanhos disponiveis:\n19mm, 21mm, 23mm, 25mm, 27mm.', 'MERIL', 'DAFODIL', 'uploads/products/prod_699c2d08a5edc.jpeg', 20, 9550.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(537, 165, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, PMS, Li-ion 4Ah.\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 15, 20242.00, 'VENDA', 'Unidade', '[{\"nome\":\"IMP\",\"valor\":3641},{\"nome\":\"MP\",\"valor\":2419},{\"nome\":\"DEA\",\"valor\":1405}]', NULL, 1, 0.00),
(538, 165, 21, 'PÁ ADESIVA ADULTO DESCARTAVEL DEA / CARDIOMAX', 'PÁ ADESIVA ADULTO DESCARTÁVEL', 'INSTRAMED', 'ADULTO', 'https://frpe.app.br/crm/uploads/products/prod_691249bfe6282.png', 60, 499.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(539, 165, NULL, 'ROLO DE PAPEL TÉRMICO', 'Rolo de papel térmico para impressora Bixolon 58mmx15m.', 'BIXOLON', '', 'uploads/proposal_items/item_699ee1540dfcd.png', 60, 13.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(540, 135, NULL, 'Bateria Cardiomax', 'Uma bateria niquel e uma bateria litio', 'Instramed', 'Níquel e Litio', '', 2, 3524.54, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(543, 167, 46, 'PORTA AGULHA RYDER 18CM COM WIDEA CABO AZUL', '', 'CRAVMED', 'RYDER 18CM', '', 1, 578.33, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(544, 167, 47, 'TESOURA BOYD 18CM', '', 'CRAVMED', 'BOYD 18CM', '', 1, 189.20, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(545, 167, 50, 'TESOURA METZEMBAUM CURVA 18CM', '', 'CRAVMED', 'METZEMBAUM CURVA', '', 1, 84.04, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(546, 167, 49, 'TESOURA POTTS SMITT ANGULADO 125° DIREITA 18CM', '', 'CRAVMED', 'POTTS SMITT ANGULADO 125°', '', 1, 332.15, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(547, 167, 48, 'TESOURA POTTS SMITT ANGULADO 25° DIREITA 16CM', '', 'CRAVMED', 'POTTS SMITT ANGULADO 25° DIREITA', '', 1, 332.15, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(556, 168, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 6, 9500.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(557, 168, 13, 'GABINETE DEA', 'Gabinete metálico para desfibrilador externo automático (DEA), equipado com alarme sonoro.\n\n', 'INSTRAMED', 'DEA', 'https://frpe.app.br/crm/uploads/products/prod_690de965c8b36.webp', 6, 3022.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(558, 144, 40, 'VENTILADOR ', 'Ventilador beira leito, com suporte para ventilação invasiva e não invasiva, indicado para pacientes adultos, pediátricos e neonatais, adequado para transporte intra-hospitalar.', 'TECME ', 'TS+', 'uploads/products/prod_698614e2deb07.png', 3, 61900.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(559, 142, 39, 'VENTILADOR DE TRANSPORTE', 'Ventilador de Transporte de Emergência Multifuncional, Tela LCD 5\", Atende à norma EN1789, Nível IPX4 à prova d\'água, Alarmes sonoros e visuais.\nNÃO ACOMPANHA CILINDRO DE GÁS.', 'AEONMED', 'SHANGRILAR 510s', 'uploads/products/prod_69823148160d9.png', 3, 28000.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(562, 169, 62, 'Eletrodo interno ADU (Ø 77,20 mm)', 'Eletrodo interno adulto (Ø 77,20 mm). Compatível com os equipamentos CardioMax/DualMax/Apolus (Código 72532).\n  ', 'Instramed', 'Cardiomax / DualMax /Apolus', 'uploads/products/prod_69a87a2a3af80.png', 1, 361.82, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(564, 170, 43, 'CARDIOVERSOR', 'Básico (ECG, Resp, Desf, ASC, DEA/PMS, Li-ion 4 Ah)\n\n', 'INSTRAMED', 'CARDIOMAX', 'uploads/products/prod_698f6c73d66ff.png', 1, 32513.00, 'VENDA', 'Unidade', '[{\"nome\":\"SpO2\",\"valor\":4744},{\"nome\":\"Impressora\",\"valor\":4061},{\"nome\":\"Marcapasso\",\"valor\":2698}]', NULL, 1, 0.00),
(565, 171, 32, 'MÓDULO DE BATERIA (NiMH) ', 'Modulo de bateria recarregável para Cardiomax (NiMH)', 'INSTRAMED', 'CARDIOMAX ', 'https://frpe.app.br/crm/uploads/products/prod_695ff7e024858.jpg', 1, 4152.72, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(566, 172, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 9604.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(567, 173, 45, 'MÁQUINA DE ANESTESIA ', 'Equipamento compatível com pacientes pediátricos e adultos, com módulos opcionais para monitoramento de CO₂ e gases anestésicos. Possui sistema móvel com três gavetas, proteção contra mistura hipóxica, alarmes de diferentes prioridades e testes automáticos de vazamento e conformidade.', 'AEONMED', 'Aeon8600A', 'uploads/products/prod_69a5a3135ea4c.webp', 1, 170990.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(568, 173, 63, 'MÁQUINA DE ANESTESIA ', 'O equipamento oferece múltiplos modos de ventilação (VCV, PCV, SIMV, PS/CPAP, BIVENT e APRV), realiza monitoramento contínuo de parâmetros vitais como pressão das vias aéreas, possui bateria interna com autonomia de até 120 minutos em caso de falha de energia e suporta O₂, N₂O e ar medicinal, com fluxômetros eletrônicos para controle preciso da mistura de gases.', 'AEONMED', 'Aeon8800A', 'uploads/products/prod_69af0b25d62d1.webp', 1, 193990.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(569, 173, 27, 'MONITOR BLT', 'Configuração ECG, SPO2, PNI\nAdicionais: PI, ETCO2, KIT PI', 'INSTRAMED', 'M12', 'https://frpe.app.br/crm/uploads/products/prod_6931df2fb1be3.webp', 3, 20990.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(570, 173, 26, 'VENTILADOR BEIRA LEITO ', 'Ventilação invasiva e não invasiva \nBateria interna com autonomia de aproximadamente 4 horas \nNebulizador integrado \n', 'INSTRAMED', 'VG70', 'https://frpe.app.br/crm/uploads/products/prod_6931ddcc8f088.webp', 2, 51990.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(571, 173, 66, 'BOMBA DE SERINGA ', 'Bomba de seringa. \nImagem ilustrativa', 'HAWKMED ', 'HK 400', 'uploads/products/prod_69af10d625029.png', 15, 3990.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(572, 173, 67, 'BOMBA DE INFUSÃO ', 'Bomba de infusão. \nImagem ilustrativa ', 'HAWKMED ', 'HK 100', 'uploads/products/prod_69af11aca6f3c.png', 10, 4090.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(573, 173, 64, 'KIT EQUIPO CRISTAL ', 'Pacote contem 200 unidades ', '', '', '', 1, 1390.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(574, 173, 65, 'KIT SERINGA 20 ML', 'Pacote contem 30 unidades ', '', '', 'uploads/products/prod_69af1002dd1a7.webp', 1, 3590.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(591, 175, 69, 'Monitor de Coagulação Ativada', 'Equipamento portátil para medir o TCA (Tempo de Coagulação Ativada) à beira do leito, utilizando 1 mL de sangue com ativador Celite. Ideal para monitorar heparina em cirurgias cardíacas, hemodiálise e hemodinâmica, oferece resultados rápidos, precisos, alarmes sonoros/visuais e funciona em 110-220V ou bateria.', 'ADIB JATENE', 'MCA PLUS', 'uploads/products/prod_69b05c82e4886.jpg', 1, 609.00, 'LOCAÇÃO', 'Unidade', NULL, 6, 1, 0.00),
(599, 176, 63, 'MÁQUINA DE ANESTESIA ', 'O equipamento oferece múltiplos modos de ventilação (VCV, PCV, SIMV, PS/CPAP, BIVENT e APRV), realiza monitoramento contínuo de parâmetros vitais como pressão das vias aéreas, possui bateria interna com autonomia de até 120 minutos em caso de falha de energia e suporta O₂, N₂O e ar medicinal, com fluxômetros eletrônicos para controle preciso da mistura de gases.', 'AEONMED', 'Aeon8800A', 'uploads/products/prod_69af0b25d62d1.webp', 1, 11639.40, 'LOCAÇÃO', 'Unidade', NULL, 24, 1, 0.00),
(600, 176, 27, 'MONITOR BLT', 'Configuração ECG, SPO2, PNI\nAdicionais: PI, ETCO2, KIT PI', 'INSTRAMED', 'M12', 'https://frpe.app.br/crm/uploads/products/prod_6931df2fb1be3.webp', 4, 1259.40, 'LOCAÇÃO', 'Unidade', NULL, 24, 1, 0.00),
(601, 176, 26, 'VENTILADOR BEIRA LEITO ', 'Ventilação invasiva e não invasiva \nBateria interna com autonomia de aproximadamente 4 horas \nNebulizador integrado \n', 'INSTRAMED', 'VG70', 'https://frpe.app.br/crm/uploads/products/prod_6931ddcc8f088.webp', 2, 3119.40, 'LOCAÇÃO', 'Unidade', NULL, 24, 1, 0.00),
(602, 176, 66, 'BOMBA DE SERINGA ', 'Bomba de seringa. \nImagem ilustrativa', 'HAWKMED ', 'HK 400', 'uploads/products/prod_69af10d625029.png', 15, 239.40, 'LOCAÇÃO', 'Unidade', NULL, 24, 1, 0.00),
(603, 176, 67, 'BOMBA DE INFUSÃO ', 'Bomba de infusão. \nImagem ilustrativa ', 'HAWKMED ', 'HK 100', 'uploads/products/prod_69af11aca6f3c.png', 10, 245.40, 'LOCAÇÃO', 'Unidade', NULL, 24, 1, 0.00),
(604, 176, 70, 'ANALISADOR DE SANGUE ', 'Leve, portátil e fácil de utilizar, o analisador de sangue i-STAT  opera com a tecnologia avançada dos cartuchos de teste i-STAT. Em conjunto, criam o i-STAT System (Sistema i-STAT)  uma plataforma de teste rápido \"point-of-care\" que oferece aos profissionais de cuidados de saúde informações de diagnóstico quando e onde são necessárias.', 'ABBOTT', 'I STAT ', 'uploads/products/prod_69b1b7b221047.jpeg', 1, 800.00, 'LOCAÇÃO', 'Unidade', NULL, 24, 1, 0.00),
(605, 176, 71, 'CARRO DE PARADA PEDIÁTRICO ', 'Carro de parada pediátrico ', 'HEALTH ', 'LT 105', 'uploads/products/prod_69b1ba536ab93.png', 1, 300.00, 'LOCAÇÃO', 'Unidade', NULL, 24, 1, 0.00),
(625, 180, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 9604.00, 'VENDA', 'Unidade', NULL, NULL, 1, 30.00),
(626, 180, 21, 'PÁ ADESIVA ADULTO DESCARTAVEL DEA / CARDIOMAX', 'PÁ ADESIVA ADULTO DESCARTÁVEL', 'INSTRAMED', 'ADULTO', 'https://frpe.app.br/crm/uploads/products/prod_691249bfe6282.png', 1, 615.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(627, 180, 24, 'PLACA ESPAÇO CARDIOPROTEGIDO', '', 'FR - GRAFICA RECIFE', '', 'https://frpe.app.br/crm/uploads/products/prod_69302bd5e098a.png', 1, 80.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(628, 180, 25, 'PLACA PASSO A PASSO ', '', 'FR - GRAFICA RECIFE', '', 'https://frpe.app.br/crm/uploads/products/prod_69302dcc1a1e9.png', 1, 120.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(642, 138, 36, 'SISTEMA PARA ERGOMETRIA ERGO PC AIR', 'Eletrocardiógrafo digital sem fio de 3, 12 ou 13 derivações simultâneas para realização de teste de esforço.', 'MICROMED', 'ERGOPC AIR', 'uploads/products/prod_697ba726bed16.jpeg', 1, 28800.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(643, 138, 37, 'ESTERIRA ERGOMETRICA', 'Leve, resistente e moderna, feita em alumínio, ideal para uso médico em testes de esforço e cardiopulmonares. Suporta até 200 kg, com ampla área de caminhada, inclinação de 0 a 26% e velocidade máxima de 18 km/h. Possui saída USB nativa para controle automático digital, sistema de fricção reduzida que dispensa lubrificação e operação em 220V/60Hz. Compatível com Ergo PC, Ergo PC Air e Ergo PC Elite. Garantia de 1 ano para a esteira (já incluída a garantia legal) e 3 meses para acessórios (já incluída a garantia legal). Inclui cabo USB. Recomenda-se uso de Nobreak Onda Senoidal (5 KVA, 220V) e instalação em circuito elétrico isolado e aterrado', 'MICROMED', 'C300', 'uploads/products/prod_697ba85eb0a8e.jpeg', 1, 19200.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(662, 181, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 8710.00, 'VENDA', 'Unidade', NULL, NULL, 1, 20.00),
(671, 183, 73, 'GRAVADOR HOLTER NOMAD ', 'Uma solução completa para monitoramento contínuo da atividade elétrica do coração, amplamente utilizado em clínicas e hospitais para exames de 24 e 48 horas.', 'MICROMED', 'GRAVADOR HOLTER NOMAD ', 'uploads/products/prod_69bb06bd6081b.webp', 25, 8790.00, 'VENDA', 'Unidade', NULL, NULL, 1, 4.50),
(672, 183, 72, 'MINI MAPA', 'Menor modelo do mercado, com hardware compacto, leve e altamente resistente a quedas, ideal para a rotina clínica e para o conforto do paciente.\n', 'MICROMED', 'MINI MAPA', 'uploads/products/prod_69bb065589abf.webp', 18, 15490.00, 'VENDA', 'Unidade', NULL, NULL, 1, 18.40),
(673, 183, 37, 'ESTERIRA ERGOMETRICA', 'Leve, resistente e moderna, feita em alumínio, ideal para uso médico em testes de esforço e cardiopulmonares. Suporta até 200 kg, com ampla área de caminhada, inclinação de 0 a 26% e velocidade máxima de 18 km/h. Possui saída USB nativa para controle automático digital, sistema de fricção reduzida que dispensa lubrificação e operação em 220V/60Hz. Compatível com Ergo PC, Ergo PC Air e Ergo PC Elite. Garantia de 1 ano para a esteira (já incluída a garantia legal) e 3 meses para acessórios (já incluída a garantia legal). Inclui cabo USB. Recomenda-se uso de Nobreak Onda Senoidal (5 KVA, 220V) e instalação em circuito elétrico isolado e aterrado', 'MICROMED', 'C300', 'uploads/products/prod_697ba85eb0a8e.jpeg', 1, 49990.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(674, 183, 76, 'ERGOPC ELITE AIR', 'É um eletrocardiógrafo digital desenvolvido para a realização de teste ergométrico e teste cardiopulmonar, permitindo monitorização precisa da atividade elétrica do coração durante exames de esforço.', 'MICROMED', 'ERGOPC ELITE AIR', 'uploads/products/prod_69bb09a59c2e4.webp', 1, 37590.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(675, 183, 74, 'METALYZER® 3B Analisador de gás', 'É um analisador de gases respiratórios usado para teste de esforço cardiopulmonar e para medições de trocas de gases pulmonares durante exercícios em esteira ou cicloergômetro. Com tecnologia Breath-by-Breath, permite uma análise a cada ciclo respiratório, ou seja, o diagnóstico é obtido com base em registros feitos em tempo real, possibilitando maior precisão no resultado do exame.', 'CORTEX', 'METALYZER® 3B Analisador de gás', 'uploads/proposal_items/item_69bb0f05d31cc.webp', 1, 259000.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(676, 183, 75, 'KIT DE CALIBRAÇÃO PROFISSIONAL', 'Kit de Calibração Profissional - Sem Estojo de Transporte', 'CORTEX', 'KIT DE CALIBRAÇÃO PROFISSIONAL', 'uploads/products/prod_69bb08b8ad52e.webp', 1, 21990.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(677, 183, 77, 'KOSMOS', 'Ultrassom híbrido ultra portátil potente o suficiente para fornecer Doppler Contínuo e Pulsado PW/CW. Com poderosas ferramentas de IA que fornecem cálculos da função sistólica automatizadas. \nTORSO ONE, LEXSA E BRIDGE', 'BRASILMÉDICA', 'KOSMOS', 'uploads/products/prod_69bb0aaf300cf.png', 1, 120000.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(678, 183, 78, 'CARDIOVERSOR ', 'Básico (ECG, Resp, Desf, ASC, DEA/PMS, 2 Li-ion, Touchscreen, Pás smart)\n', 'INSTRAMED', 'DUALMAX', 'uploads/products/prod_69bb0bfd14171.webp', 1, 39353.00, 'VENDA', 'Unidade', '[{\"nome\":\"IMP\",\"valor\":4707},{\"nome\":\"MP\",\"valor\":4577}]', NULL, 1, 0.00),
(688, 185, 76, 'ERGOPC ELITE AIR', 'É um eletrocardiógrafo digital desenvolvido para a realização de teste ergométrico e teste cardiopulmonar, permitindo monitorização precisa da atividade elétrica do coração durante exames de esforço.', 'MICROMED', 'ERGOPC ELITE AIR', 'uploads/products/prod_69bb09a59c2e4.webp', 1, 37590.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(689, 185, 74, 'METALYZER® 3B Analisador de gás', 'É um analisador de gases respiratórios usado para teste de esforço cardiopulmonar e para medições de trocas de gases pulmonares durante exercícios em esteira ou cicloergômetro. Com tecnologia Breath-by-Breath, permite uma análise a cada ciclo respiratório, ou seja, o diagnóstico é obtido com base em registros feitos em tempo real, possibilitando maior precisão no resultado do exame.', 'CORTEX', 'METALYZER® 3B Analisador de gás', 'uploads/proposal_items/item_69bbfa3f3a5fd.webp', 1, 130420.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(690, 185, 75, 'KIT DE CALIBRAÇÃO PROFISSIONAL', 'Kit de Calibração Profissional - Sem Estojo de Transporte', 'CORTEX', 'KIT DE CALIBRAÇÃO PROFISSIONAL', 'uploads/products/prod_69bb08b8ad52e.webp', 1, 21990.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(709, 186, 73, 'GRAVADOR HOLTER NOMAD ', 'Uma solução completa para monitoramento contínuo da atividade elétrica do coração, amplamente utilizado em clínicas e hospitais para exames de 24 e 48 horas.', 'MICROMED', 'GRAVADOR HOLTER NOMAD ', 'uploads/products/prod_69bb06bd6081b.webp', 25, 8790.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(710, 186, 79, 'LICENÇA DE USO RHYTMOS STATION ', 'O Analisador de Holter Nomad é um software de análise projetado para emitir laudos com mais precisão e rapidez. Possui exclusivo índice de qualidade do sinal, mapeamento 3D, rápida detecção visual de apneia do sono e inversão de canal para análise.', 'MICROMED', 'LICENÇA DE USO RHYTMOS STATION ', 'uploads/products/prod_69bbfba18d1e3.webp', 1, 1.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(711, 186, 72, 'MINI MAPA', 'Menor modelo do mercado, com hardware compacto, leve e altamente resistente a quedas, ideal para a rotina clínica e para o conforto do paciente.\n', 'MICROMED', 'MINI MAPA', 'uploads/products/prod_69bb065589abf.webp', 18, 15490.00, 'VENDA', 'Unidade', NULL, NULL, 1, 18.30),
(712, 186, 37, 'ESTEIRA ERGOMETRICA', 'Leve, resistente e moderna, feita em alumínio, ideal para uso médico em testes de esforço e cardiopulmonares. Suporta até 200 kg, com ampla área de caminhada, inclinação de 0 a 26% e velocidade máxima de 18 km/h. Possui saída USB nativa para controle automático digital, sistema de fricção reduzida que dispensa lubrificação e operação em 220V/60Hz. Compatível com Ergo PC, Ergo PC Air e Ergo PC Elite. Garantia de 1 ano para a esteira (já incluída a garantia legal) e 3 meses para acessórios (já incluída a garantia legal). Inclui cabo USB. Recomenda-se uso de Nobreak Onda Senoidal (5 KVA, 220V) e instalação em circuito elétrico isolado e aterrado', 'MICROMED', 'C300', 'uploads/products/prod_697ba85eb0a8e.jpeg', 1, 49990.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(713, 186, 76, 'ERGOPC ELITE AIR', 'É um eletrocardiógrafo digital desenvolvido para a realização de teste ergométrico e teste cardiopulmonar, permitindo monitorização precisa da atividade elétrica do coração durante exames de esforço.', 'MICROMED', 'ERGOPC ELITE AIR', 'uploads/products/prod_69bb09a59c2e4.webp', 1, 37590.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(714, 186, 74, 'METALYZER® 3B Analisador de gás', 'É um analisador de gases respiratórios usado para teste de esforço cardiopulmonar e para medições de trocas de gases pulmonares durante exercícios em esteira ou cicloergômetro. Com tecnologia Breath-by-Breath, permite uma análise a cada ciclo respiratório, ou seja, o diagnóstico é obtido com base em registros feitos em tempo real, possibilitando maior precisão no resultado do exame.', 'CORTEX', 'METALYZER® 3B Analisador de gás', 'uploads/proposal_items/item_69bc091e75a51.webp', 1, 259000.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(715, 186, 75, 'KIT DE CALIBRAÇÃO PROFISSIONAL', 'Kit de Calibração Profissional - Sem Estojo de Transporte', 'CORTEX', 'KIT DE CALIBRAÇÃO PROFISSIONAL', 'uploads/products/prod_69bb08b8ad52e.webp', 1, 21990.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(716, 186, 77, 'KOSMOS', 'Ultrassom híbrido ultra portátil potente o suficiente para fornecer Doppler Contínuo e Pulsado PW/CW. Com poderosas ferramentas de IA que fornecem cálculos da função sistólica automatizadas. \nTORSO ONE, LEXSA E BRIDGE', 'BRASILMÉDICA', 'KOSMOS', 'uploads/products/prod_69bb0aaf300cf.png', 1, 120000.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(717, 186, 78, 'CARDIOVERSOR ', 'Básico (ECG, Resp, Desf, ASC, DEA/PMS, 2 Li-ion, Touchscreen, Pás smart)\n', 'INSTRAMED', 'DUALMAX', 'uploads/products/prod_69bb0bfd14171.webp', 1, 39353.00, 'VENDA', 'Unidade', '[{\"nome\":\"IMP\",\"valor\":4707},{\"nome\":\"MP\",\"valor\":4577}]', NULL, 1, 0.00),
(718, 186, 80, 'Sensor O2 para METALYZER® 3B / METALYZER® II', 'Sensor O2 para METALYZER® 3B / METALYZER® II - Celula de Oxigênio', 'MICROMED', 'Sensor O2 para METALYZER® 3B / METALYZER® II', 'uploads/products/prod_69bc1191d6035.webp', 1, 6990.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(719, 187, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, PMS, Li-ion 4Ah.\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 1, 26167.00, 'VENDA', 'Unidade', '[{\"nome\":\"IMP\",\"valor\":4707},{\"nome\":\"MP\",\"valor\":3127},{\"nome\":\"DEA\",\"valor\":1817}]', NULL, 1, 0.00),
(724, 177, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 8710.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(725, 177, 12, 'DESFIBRILADOR ', 'Principais funções concentradas em apenas um botão seletor. \nRápida inicialização carregamento de 360 J em menos de 6 segundos', 'INSTRAMED', 'APOLUS ', 'https://frpe.app.br/crm/uploads/products/prod_690a099525520.webp', 1, 13095.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(726, 177, 27, 'MONITOR BLT', 'Configuração ECG, SPO2, PNI', 'INSTRAMED', 'M10', 'https://frpe.app.br/crm/uploads/products/prod_6931df2fb1be3.webp', 1, 9233.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(727, 177, 28, 'CARRO DE PARADA ', 'ESTRUTURA INTERNA EM AÇO CARBONO, REVESTIDO EM POLÍMERO DE ALTO IMPACTO ABS COM NANO TECNOLOGIA ANTI-BACTERIANA.   ', 'HEALTH ', 'LT 103', 'https://frpe.app.br/crm/uploads/products/prod_69381c774ddf6.webp', 1, 7265.85, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(728, 178, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, PMS, Li-ion 4Ah.\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 1, 23732.00, 'VENDA', 'Unidade', '[{\"nome\":\"DEA\",\"valor\":1648}]', NULL, 1, 0.00),
(734, 189, 81, 'DESFIBRILADOR EXTERNO AUTOMÁTICO ', 'Operação simplificada por botão único\nInteligência artificial para diagnóstico preciso e uso seguro\nChoque bifásico de alta eficiência\nVersão PRO com ajuste de carga até 360 J\nBATERIA RECARREGÁVEL', 'INSTRAMED', 'I ON PRO ', 'uploads/products/prod_69bc58e86cf0f.webp', 1, 13362.00, 'VENDA', 'Unidade', NULL, NULL, 1, 20.00),
(735, 190, 81, 'DESFIBRILADOR EXTERNO AUTOMÁTICO ', 'Operação simplificada por botão único\nInteligência artificial para diagnóstico preciso e uso seguro\nChoque bifásico de alta eficiência\nVersão PRO com ajuste de carga até 360 J', 'INSTRAMED', 'I ON PRO ', 'uploads/products/prod_69bc58e86cf0f.webp', 1, 12118.00, 'VENDA', 'Unidade', NULL, NULL, 1, 20.00),
(737, 191, 67, 'BOMBA DE INFUSÃO ', 'Bomba de infusão. \nImagem ilustrativa ', 'HAWKMED ', 'HK 100', 'uploads/products/prod_69af11aca6f3c.png', 15, 4400.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(744, 174, 43, 'CARDIOVERSOR', 'ECG, Resp, Desf, ASC, DEA/PMS \n', 'INSTRAMED', 'CARDIOMAX', 'uploads/products/prod_698f6c73d66ff.png', 1, 29487.00, 'VENDA', 'Unidade', '[{\"nome\":\"SpO2\",\"valor\":4988},{\"nome\":\"IMP\",\"valor\":4269}]', NULL, 1, 20.00),
(748, 143, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, PMS, Li-ion 4Ah.\nParâmetros adicionais: MP + DEA + IMP\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 15, 16800.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(749, 143, 27, 'MONITOR BLT', 'Configuração ECG, SPO2, PNI', 'INSTRAMED', 'M10', 'https://frpe.app.br/crm/uploads/products/prod_6931df2fb1be3.webp', 15, 6000.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(750, 143, 39, 'VENTILADOR DE TRANSPORTE', 'Ventilador de Transporte de Emergência Multifuncional, Tela LCD 5\", Atende à norma EN1789, Nível IPX4 à prova d\'água, Alarmes sonoros e visuais.\nNÃO ACOMPANHA CILINDRO DE GÁS.', 'AEONMED', 'SHANGRILAR 510s', 'uploads/products/prod_69823148160d9.png', 15, 21990.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(753, 192, 83, 'MONITOR BLT P12', 'Parâmetros de Monitorização Modular\n• ECG \n• SpO2 (Nellcor)\n• PNI \n• RESP\n• TEMP\n• Tela e Interfaces: Display colorido (TFT LCD 12’’)\n• Interface: Navegação intuitiva\n• Alarmes: (alto, médio, baixo)\n• Operação: Teclas de atalho para funções rápidas\n• Armazenamento de dados históricos \n• Bateria interna\n• Modos de Paciente: Configurações específicas para Adulto, Pediátrico e Neonatal\n• Certificação da ANVISA', 'BLT', 'P12', 'uploads/products/prod_69c27a55ef1de.png', 13, 30990.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(754, 192, 84, 'MONITOR BLT Q5 12\"', 'Parâmetros de Monitorização:\n• ECG \n• SpO2 (Nellcor)\n• PNI \n• RESP\n• TEMP\n• Tela e Interfaces: Display colorido (TFT LCD 12’’)\n• Interface: Navegação intuitiva\n• Alarmes: (alto, médio, baixo)\n• Operação: Teclas de atalho para funções rápidas\n• Armazenamento de dados históricos \n• Bateria interna\n• Modos de Paciente: Configurações específicas para Adulto, Pediátrico e Neonatal\n• Certificação da ANVISA', 'BLT', 'Q5', 'uploads/products/prod_69c27cf3b4f27.png', 13, 19990.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(755, 193, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 500.00, 'LOCAÇÃO', 'Unidade', NULL, 1, 1, 0.00),
(756, 194, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 9604.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00);
INSERT INTO `proposta_itens` (`id`, `proposta_id`, `produto_id`, `descricao`, `descricao_detalhada`, `fabricante`, `modelo`, `imagem_url`, `quantidade`, `valor_unitario`, `status`, `unidade_medida`, `parametros`, `meses_locacao`, `meses`, `desconto_percent`) VALUES
(757, 194, 28, 'CARRO DE PARADA ', 'ESTRUTURA INTERNA EM AÇO CARBONO, REVESTIDO EM POLÍMERO DE ALTO IMPACTO ABS COM NANO TECNOLOGIA ANTI-BACTERIANA.   ', 'HEALTH ', 'LT 103', 'https://frpe.app.br/crm/uploads/products/prod_69381c774ddf6.webp', 1, 7265.85, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(765, 196, 28, 'CARRO DE PARADA ', 'ESTRUTURA INTERNA EM AÇO CARBONO, REVESTIDO EM POLÍMERO DE ALTO IMPACTO ABS COM NANO TECNOLOGIA ANTI-BACTERIANA.   ', 'HEALTH ', 'LT 103', 'https://frpe.app.br/crm/uploads/products/prod_69381c774ddf6.webp', 1, 7265.85, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(766, 196, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 9604.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(767, 195, 85, 'DESFIBRILADOR EXTERNO AUTOMÁTICO ', 'Operação simplificada com botão único, inteligência artificial para diagnóstico preciso e prevenção de uso acidental, choque bifásico e display LCD.\nBATERIA RECARREGÁVEL. ', 'INSTRAMED', 'I ON LCD', 'uploads/products/prod_69c4218b9498e.webp', 1, 9818.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(771, 132, 7, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, PMS, Li-ion 4Ah.\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 10, 23082.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(772, 132, 27, 'MONITOR BLT', 'Configuração ECG, SPO2, PNI', 'INSTRAMED', 'M10', 'https://frpe.app.br/crm/uploads/products/prod_6931df2fb1be3.webp', 30, 7720.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(773, 132, 26, 'VENTILADOR BEIRA LEITO ', 'Ventilação invasiva e não invasiva \nBateria interna com autonomia de aproximadamente 4 horas \nNebulizador integrado \n', 'INSTRAMED', 'VG70', 'https://frpe.app.br/crm/uploads/products/prod_6931ddcc8f088.webp', 30, 62900.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(774, 98, NULL, 'CARDIOVERSOR ', 'Configuração ECG, Resp, Desf, ASC, DEA/PMS\n', 'INSTRAMED', 'CARDIOMAX LITE ', 'https://frpe.app.br/crm/uploads/products/prod_6903595b83c0b.png', 1, 23082.00, 'VENDA', 'Unidade', '[{\"nome\":\"IMP\",\"valor\":4152}]', NULL, 1, 0.00),
(775, 87, 22, 'MODULO DE BATERIA CARDIOMAX LI-ON 14,4V 4AH 57,6WH', 'Modulo de bateria recarregável para carDiomax li-on 14,4V 4AH 57,6WH', 'INSTRAMED', 'CARDIOMAX', 'https://frpe.app.br/crm/uploads/products/prod_692f33e61ffc4.jpg', 2, 3420.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(776, 184, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 11009.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(777, 182, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nRECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 9984.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(778, 179, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nRECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 9984.00, 'VENDA', 'Unidade', NULL, NULL, 1, 20.00),
(779, 161, 12, 'DESFIBRILADOR ', 'Principais funções concentradas em apenas um botão seletor. \nRápida inicialização carregamento de 360 J em menos de 6 segundos', 'INSTRAMED', 'APOLUS ', 'https://frpe.app.br/crm/uploads/products/prod_690a099525520.webp', 1, 12569.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(780, 154, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 9500.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(781, 154, 38, 'CARRO DE EMERGÊNCIA COM NANOTECNOLOGIA ANTIBACTERIANA', '- 01 tábua para massagem cardíaca, 02 gavetas em monobloco de polímero com nanotecnologia antibacteriana, 01 gavetas em monobloco de polímero com nanotecnologia antibacteriana - 01 jogo de divisórias em polímero para 1ra. Gaveta, contendo 20 nichos;  01 braço móvel e bandeja em aço inox com movimento de rotação de 90°; 01 bandeja em aço inox com movimento de rotação de 180° para acomodar o desfibrilador, 02 cintas velcro para segurança do desfibrilador / cardioversor; 01 suporte de soro com haste em aço inox regulável em altura com dois ganchos em polímero;  01 suporte em aço inox para tubo de oxigênio; 01 cinta velcro para fixação de cilindro de oxigênio; 01 jogo de divisórias em polímero para compartimento superior tipo colmeia regulável e removível com 12 nichos; 01 dispositivo em acrílico 4mm para armazenar materiais, 01 cesto aramado para colocação de aspirador. Medidas: comprimento 1025 mm, largura: 570 mm, altura 910 mm aproximadamente.', 'HEALTH ', 'CARRO LIFE AID LA3-101 STANDARD', 'uploads/products/prod_697cfbebea61b.png', 1, 15800.00, 'VENDA', 'Unidade', NULL, NULL, 1, 5.00),
(782, 109, 21, 'PÁ ADESIVA ADULTO DESCARTAVEL DEA / CARDIOMAX', 'PÁ ADESIVA ADULTO DESCARTÁVEL', 'INSTRAMED', 'ADULTO', 'https://frpe.app.br/crm/uploads/products/prod_691249bfe6282.png', 1, 615.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(788, 197, 19, 'OXIMETRO ', 'Monitor portátil com SPO2, PR, PI, RRP', 'MASIMO ', 'RAD G SEM TEMPERATURA ', 'https://frpe.app.br/crm/uploads/products/prod_6911e01074fe3.png', 1, 8331.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(789, 197, 17, 'OXIMETRO', 'Monitor portátil com SPO2, PR, PI, RRP e módulo de temperatura integrado ', 'MASIMO', 'RAD G COM TEMPERATURA ', 'https://frpe.app.br/crm/uploads/products/prod_6911dd39c9342.png', 1, 9834.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(790, 198, 37, 'ESTEIRA ERGOMETRICA', 'Leve, resistente e moderna, feita em alumínio, ideal para uso médico em testes de esforço e cardiopulmonares. Suporta até 200 kg, com ampla área de caminhada, inclinação de 0 a 26% e velocidade máxima de 18 km/h. Possui saída USB nativa para controle automático digital, sistema de fricção reduzida que dispensa lubrificação e operação em 220V/60Hz. Compatível com Ergo PC, Ergo PC Air e Ergo PC Elite. Garantia de 1 ano para a esteira (já incluída a garantia legal) e 3 meses para acessórios (já incluída a garantia legal). Inclui cabo USB. Recomenda-se uso de Nobreak Onda Senoidal (5 KVA, 220V) e instalação em circuito elétrico isolado e aterrado', 'MICROMED', 'C300', 'uploads/products/prod_697ba85eb0a8e.jpeg', 1, 47500.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(791, 198, 86, 'ERGOPC USB ', 'ErgoPc é um sistema de eletrocardiografia de esforço desenvolvido para a realização de testes ergométricos com alta precisão e confiabilidade. O equipamento capta os sinais elétricos provenientes do coração, amplifica esses sinais e os converte em dados digitais, que são enviados para um computador por meio de conexão USB.', 'MICROMED', 'ERGOPC USB ', 'uploads/products/prod_69cc147f7b2a8.webp', 1, 24400.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(792, 199, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 9604.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(801, 201, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 2, 8285.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(804, 202, 30, 'VÁLVULA DE CONTROLE EXALATÓRIO ', 'Válvula de controle do fluxo exalatório compatível com o ventilador Shangrila 510S', 'AEONMED', '', 'uploads/products/prod_69d551432b478.png', 1, 1157.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(805, 202, 29, 'SENSOR DE FLUXO ', 'Sensor de fluxo para utilização no ventilador pulmonar Shangrila 510S\n', 'AEONMED', '', 'https://frpe.app.br/crm/uploads/products/prod_69383041db97a.webp', 1, 229.10, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(806, 203, 44, 'PROTESE VALVAR BIOLOGIA AORTICA ', 'A bioprótese pericárdica Dafodil é uma válvula de engenharia biomecânica tripla composta.\nEla combina os mais recentes avanços da engenharia com os benefícios do tecido pericárdico bovino.\nTamanhos disponiveis:\n19mm, 21mm, 23mm, 25mm, 27mm.', 'MERIL', 'DAFODIL', 'uploads/products/prod_699c3e054b507.jpeg', 1, 20250.00, 'VENDA', 'Unidade', NULL, NULL, 1, 20.00),
(807, 188, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 9604.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(808, 188, 28, 'CARRO DE PARADA ', 'ESTRUTURA INTERNA EM AÇO CARBONO, REVESTIDO EM POLÍMERO DE ALTO IMPACTO ABS COM NANO TECNOLOGIA ANTI-BACTERIANA.   ', 'HEALTH ', 'LT 103', 'https://frpe.app.br/crm/uploads/products/prod_69381c774ddf6.webp', 1, 7265.85, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(809, 188, 31, 'CILINDRO DE O2', 'Capacidade hidráulica 2.8L\nPressão  de serviço 139bar\nAltura 412.8mm\nDiâmetro 111.1mm\nRosca de entrada 3/4 \nPeso 2.3kg \nCILINDRO VAZIO', 'GASWIDE', 'GWA15', 'https://frpe.app.br/crm/uploads/products/prod_694ace6e98b05.webp', 1, 3688.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00),
(810, 204, 11, 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'Prático e eficiente, conta com leds indicativos e orientação por voz para acompanhamento das fases do tratamento.\nBATERIA NÃO RECARREGÁVEL\n', 'INSTRAMED', 'I.ON LED', 'https://frpe.app.br/crm/uploads/products/prod_69035d872b451.png', 1, 9604.00, 'VENDA', 'Unidade', NULL, NULL, 1, 0.00);

-- --------------------------------------------------------

--
-- Estrutura para tabela `suppliermonthlytargets`
--

CREATE TABLE `suppliermonthlytargets` (
  `id` int(11) NOT NULL,
  `fornecedornome` varchar(100) NOT NULL,
  `year` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `uf` varchar(5) NOT NULL,
  `metamensal` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `supplier_monthly_targets`
--

CREATE TABLE `supplier_monthly_targets` (
  `id` int(11) NOT NULL,
  `fornecedor_nome` varchar(100) NOT NULL,
  `year` year(4) NOT NULL,
  `month` tinyint(4) NOT NULL,
  `meta_mensal` decimal(15,2) DEFAULT 0.00,
  `uf` varchar(5) DEFAULT 'GERAL'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tabela_preco`
--

CREATE TABLE `tabela_preco` (
  `id` int(11) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `nome_tabela` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `tabela_preco`
--

INSERT INTO `tabela_preco` (`id`, `codigo`, `nome_tabela`, `created_at`, `updated_at`) VALUES
(1, '16', 'AGAMENON PROCESSO 1723/2024', '2026-03-11 16:46:25', '2026-03-11 16:46:25'),
(2, '107', 'HOSPITAL DAS CLINICAS - EBSERH - SRP Nº 90043/2025', '2026-03-12 10:30:13', '2026-03-12 10:30:13'),
(3, '46', 'PROCAPE NEO - 2869/2024', '2026-03-12 11:08:20', '2026-03-12 11:08:20'),
(4, '52', 'PROCAPE-2869/24-BAIXO PRIMER', '2026-03-12 11:13:11', '2026-03-12 11:13:11'),
(5, '53', 'PROCAPE-2869/24-PED', '2026-03-12 11:18:33', '2026-03-12 11:18:33');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tabela_preco_itens`
--

CREATE TABLE `tabela_preco_itens` (
  `id` int(11) NOT NULL,
  `tabela_preco_id` int(11) NOT NULL,
  `referencia` varchar(100) DEFAULT NULL,
  `descricao` varchar(500) NOT NULL,
  `valor_unitario` decimal(15,2) NOT NULL DEFAULT 0.00,
  `fabricante` varchar(255) DEFAULT NULL,
  `observacoes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `tabela_preco_itens`
--

INSERT INTO `tabela_preco_itens` (`id`, `tabela_preco_id`, `referencia`, `descricao`, `valor_unitario`, `fabricante`, `observacoes`) VALUES
(1, 1, 'CDK10', 'KIT CANULA ADULTO-NIPRO - 498569-9', 350.00, 'NIPRO', NULL),
(2, 1, 'EDO39P', 'OXIGENADOR MEMB. VITAL ADULTO - 498569-9', 1592.05, 'NIPRO', NULL),
(3, 1, '050715', 'OXIGENADOR MEMB. ADULTO BAIXO PESO 6F - 498569-9', 1592.05, 'LIVANOVA', NULL),
(4, 1, '050716', 'OXIGENADOR MEMB. ADULTO 8F', 1592.05, 'LIVANOVA', NULL),
(5, 1, 'ALC400', 'KIT CANULA ADULTO - 498569-9', 350.00, 'LIVANOVA', NULL),
(6, 1, 'ALC520', 'CONJUNTO DE TUBOS ADULTO S/FA CAVA DUPLA E BLISTER - 498569-9', 681.00, 'LIVANOVA', NULL),
(7, 1, 'ED2986', 'CONJUNTO DE TUBOS ADULTO C/FA CAVA DUPLA - 498569-9', 630.62, 'NIPRO', NULL),
(8, 1, 'ALC900', 'HEMOCONCENTRADOR ADULTO - 498569-9', 390.68, 'LIVANOVA', NULL),
(9, 1, 'BHC110', 'HEMOCONCENTRADOR ADULTO ALTO FLUXO - 498569-9', 418.30, 'NIPRO', NULL),
(10, 1, '050300700', 'BOMBA CENTRIFUGA REV PHISIO - 498569-9', 571.27, 'LIVANOVA', NULL),
(11, 1, 'ALC830', 'SISTEMA DE CARDIOPLEGIA CRISTALOIDE ADULTO C/BOLSA - 498569-9', 626.00, 'LIVANOVA', NULL),
(12, 1, 'CDR02', 'SISTEMA DE CARDIOPLEGIA CRISTALOIDE - 498569-9', 808.91, 'NIPRO', NULL),
(13, 1, 'ALC900', 'HEMOCONCENTRADOR ADULTO - 275071-6', 230.00, 'LIVANOVA', NULL),
(14, 1, '50716', 'OXIGENADOR MEMB. ADULTO 8F - 275071-6', 1392.31, 'LIVANOVA', NULL),
(15, 1, 'ALC520', 'CONJUNTO DE TUBOS ADULTO S/FA CAVA DUPLA E BLISTER - 275071-6', 821.00, 'LIVANOVA', NULL),
(16, 1, 'ALC400', 'KIT CANULA ADULTO - 275071-6', 390.00, 'LIVANOVA', NULL),
(17, 1, 'ALC830', 'SISTEMA DE CARDIOPLEGIA CRISTALOIDE ADULTO C/BOLSA - 275071-6', 525.00, 'LIVANOVA', NULL),
(18, 1, '50300700', 'BOMBA CENTRIFUGA REV PHISIO - 275071-6', 400.00, 'LIVANOVA', NULL),
(19, 2, '04254', 'KIT DE ASPIRAÇÃO E COLETA DE SANGUE/AUTOTRANSFUSÃO XTRA-55', 2849.51, 'LIVANOVA', NULL),
(20, 2, '04255', 'KIT DE ASPIRAÇÃO E COLETA DE SANGUE/AUTOTRANSFUSÃO XTRA-125', 2849.51, 'LIVANOVA', NULL),
(21, 2, '04257', 'KIT DE ASPIRAÇÃO E COLETA DE SANGUE/AUTOTRANSFUSÃO XTRA-225', 2849.51, 'LIVANOVA', NULL),
(22, 2, 'V122-28', 'CANULA VENOSA DUPLO ESTAGIO 28 FR - 3/8', 513.03, 'LIVANOVA', NULL),
(23, 2, '4026', 'SENSOR DESC. PULSE CO - OXIMETER ADULTO LIDCO SPHB, SPMET, SPO2, PR,PI,PR, PVI', 2200.00, 'MASIMO', NULL),
(24, 3, 'ALC542', 'CONJUNTO DE TUBOS INFANTIL C/FA CAVA DUPLA E BLISTER', 630.00, 'LIVANOVA', NULL),
(25, 3, 'ALC830', 'SISTEMA DE CARDIOPLEGIA CRISTALOIDE ADULTO C/BOLSA', 389.09, 'LIVANOVA', NULL),
(26, 3, 'ALC912', 'HEMOCONCENTRADOR INFANTIL', 418.30, 'LIVANOVA', NULL),
(27, 3, '050300700', 'BOMBA CENTRIFUGA REV PHISIO', 913.61, 'LIVANOVA', NULL),
(28, 3, '050531', 'OXIGENADOR MEMB. NEONATO KIDS D100', 2400.00, 'LIVANOVA', NULL),
(29, 3, '050596', 'OXIGENADOR MEMB. NEONATO LILLIPUT D901 C RESERV - SORIN', 2400.00, 'LIVANOVA', NULL),
(30, 4, 'ALC520', 'CONJUNTO DE TUBOS ADULTO S/FA CAVA DUPLA E BLISTER', 681.00, 'LIVANOVA', NULL),
(31, 4, 'ALC830', 'SISTEMA DE CARDIOPLEGIA CRISTALOIDE ADULTO C/BOLSA', 626.00, 'LIVANOVA', NULL),
(32, 4, 'ALC900', 'HEMOCONCENTRADOR ADULTO', 391.00, 'LIVANOVA', NULL),
(33, 4, 'BHC110', 'HEMOCONCENTRADOR ADULTO ALTO FLUXO', 391.00, 'NIPRO', NULL),
(34, 4, 'ED2986', 'CONJUNTO DE TUBOS ADULTO C/FA CAVA DUPLA', 681.00, 'NIPRO', NULL),
(35, 4, '050300700', 'BOMBA CENTRIFUGA REV PHISIO', 800.00, 'LIVANOVA', NULL),
(36, 4, '050714', 'OXIGENADOR MEMB. ADULTO 8', 1668.00, 'LIVANOVA', NULL),
(37, 4, '050715', 'OXIGENADOR MEMB. ADULTO BAIXO PESO 6F', 1668.00, 'LIVANOVA', NULL),
(38, 4, '050716', 'OXIGENADOR MEMB. ADULTO 8F', 1668.00, 'LIVANOVA', NULL),
(39, 5, 'ALC542', 'CONJUNTO DE TUBOS INFANTIL C/FA CAVA DUPLA E BLISTER', 681.00, 'LIVANOVA', NULL),
(40, 5, 'ALC830', 'SISTEMA DE CARDIOPLEGIA CRISTALOIDE ADULTO C/BOLSA', 626.00, 'LIVANOVA', NULL),
(41, 5, 'ALC912', 'HEMOCONCENTRADOR INFANTIL', 391.00, 'LIVANOVA', NULL),
(42, 5, '050300700', 'BOMBA CENTRIFUGA REV PHISIO', 800.00, 'LIVANOVA', NULL),
(43, 5, '050579', 'OXIGENADOR MEMB. PEDIATRICO LILLIPUT D902', 2179.00, 'LIVANOVA', NULL),
(44, 5, '050584', 'OXIGENADOR MEMB. PEDIATRICO KIDS D101.', 2179.00, 'LIVANOVA', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telefone` varchar(255) DEFAULT NULL,
  `senha` varchar(255) NOT NULL,
  `role` enum('Gestor','Comercial','Vendedor','Especialista','Analista','Representante','Marketing') NOT NULL,
  `cargo` varchar(255) DEFAULT NULL,
  `status` enum('Ativo','Inativo') NOT NULL DEFAULT 'Ativo',
  `deleted_at` datetime DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `email`, `telefone`, `senha`, `role`, `cargo`, `status`, `deleted_at`, `data_criacao`) VALUES
(1, 'Eduardo Cabral', 'licitacao@frpe.com.br', '(81) 99555-0880', '$2y$10$a21ayHXdyljbrRNtefpQ6.bfAmvG4jYrDeFc/Npap3j.Gr6/QDQmS', 'Analista', 'Analista', 'Ativo', NULL, '2025-09-22 17:47:11'),
(2, 'Laylla Costa', 'frpe@frpe.com.br', '8199181-2762', '$2y$10$bqCebYDYud5ruK2Gwo29U.FI8LBiYq45wsDq/CiNJ0DTEE2axzAK.', 'Comercial', 'Comercial/Vendas', 'Ativo', NULL, '2025-09-29 10:59:25'),
(3, 'Mateus Brito', 'mateusbrito@frpe.com.br', '81 99921-7832', '$2y$10$DCI6XFAVfguwFtllPYkNsetvQhl1JmcjxV/9GAjPJnLx8uMy.BzBC', 'Especialista', 'Especialista', 'Ativo', NULL, '2025-09-29 13:56:47'),
(4, 'Paulo Quintino', 'paulo@frpe.com.br', '81 99163-1034', '$2y$10$65Q5asKCHOsC00W9uihGZuuNGO6eLjZcy0eW.QuTxG7lWqYYhowzi', 'Vendedor', 'Executivo de Vendas', 'Ativo', NULL, '2025-09-29 13:57:22'),
(6, 'Gustavo Miguel', 'gustavo@frpe.com.br', '(81) 9996-70423', '$2y$10$9zfom.2Lg00kkUbSyACDBOfDJQVYLmdDKeKV6h3OBL3.eE1c3F1oi', 'Vendedor', 'Executivo de Vendas', 'Ativo', NULL, '2025-10-16 01:32:43'),
(7, 'Rubens Arantes Júnior', 'rubensjr@frpe.com.br', '81 9978-6252', '$2y$10$n16/G4GRJyjRVbjNVsey7.mQl4cHOiTmbM7VFxPXZNaxmZlZbJeum', 'Gestor', 'CEO', 'Ativo', NULL, '2025-10-17 12:17:54'),
(8, 'Sandra Remigio', 'sandra@frpe.com.br', '81 99290-9200', '$2y$10$.WjtoMgDh5Pdvx7U5LCon.K7Pl6kG50tZVMqMi9WYTwYBAMS03xSC', 'Gestor', 'Coordenadora Comercial', 'Ativo', NULL, '2025-11-10 20:58:55'),
(9, 'Dyara ', 'dyara@frpe.com.br', '84 98730-3243', '$2y$10$IoSBau78YoB/QzX1vNbTm.b1I9TWFA7zlJxNVoWOFdPfh3HoNEXVG', 'Vendedor', 'Executivo de Vendas', 'Inativo', '2026-04-05 02:27:45', '2026-01-09 14:52:48'),
(10, 'Betânia ', 'betania@frpe.com.br', '84 99407-3545', '$2y$10$Oc30.vk.MCYpNf0NJDZbnOGzmOT/BpCn5SlSXUHmo35riKbe607iu', 'Vendedor', 'Executivo de Vendas', 'Ativo', NULL, '2026-01-09 14:54:30'),
(12, 'Eduardo', 'frpe@frpe.app.br', '8199221570', '$2y$10$HrxDNOOH0QhHefY8xR4MUuSRw8gxH5XAgPveCoOFvtPCnzSpUnrBq', 'Vendedor', 'Suporte', 'Inativo', '2026-04-05 02:27:39', '2026-02-04 20:37:04');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios_financas`
--

CREATE TABLE `usuarios_financas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `valor_fixo` decimal(15,2) DEFAULT 0.00,
  `percentual_comissao` decimal(5,2) DEFAULT 1.00,
  `valor_trimestre` decimal(15,2) DEFAULT 0.00,
  `data_atualizacao` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuarios_financas`
--

INSERT INTO `usuarios_financas` (`id`, `usuario_id`, `valor_fixo`, `percentual_comissao`, `valor_trimestre`, `data_atualizacao`) VALUES
(1, 1, 2000.00, 1.00, 5000.00, '2026-04-01 19:51:05'),
(2, 2, 2000.00, 1.00, 5000.00, '2026-04-01 19:51:05'),
(3, 3, 2000.00, 1.00, 5000.00, '2026-04-01 19:51:05'),
(4, 4, 2000.00, 1.00, 5000.00, '2026-04-01 19:51:05'),
(5, 6, 2000.00, 1.00, 5000.00, '2026-04-01 19:51:05'),
(6, 7, 2000.00, 1.00, 5000.00, '2026-04-01 19:51:05'),
(7, 8, 2000.00, 1.00, 5000.00, '2026-04-01 19:51:05'),
(8, 10, 2000.00, 1.00, 5000.00, '2026-04-01 19:51:05');

-- --------------------------------------------------------

--
-- Estrutura para tabela `vendas_fornecedores`
--

CREATE TABLE `vendas_fornecedores` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `fornecedor_id` int(11) NOT NULL,
  `organizacao_id` int(11) DEFAULT NULL,
  `origem` varchar(255) DEFAULT NULL,
  `descricao_produto` text DEFAULT NULL,
  `fabricante_marca` varchar(255) DEFAULT NULL,
  `modelo` varchar(255) DEFAULT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 1,
  `valor_unitario` decimal(20,2) NOT NULL DEFAULT 0.00,
  `valor_total` decimal(20,2) NOT NULL DEFAULT 0.00,
  `notas` text DEFAULT NULL,
  `data_venda` date NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `proposta_ref_id` int(11) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `cliente_pf_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `vendas_fornecedores`
--

INSERT INTO `vendas_fornecedores` (`id`, `titulo`, `fornecedor_id`, `organizacao_id`, `origem`, `descricao_produto`, `fabricante_marca`, `modelo`, `quantidade`, `valor_unitario`, `valor_total`, `notas`, `data_venda`, `usuario_id`, `proposta_ref_id`, `data_criacao`, `cliente_pf_id`) VALUES
(13, 'Venda via Proposta #75 - DESFIBRILADOR EXTERNO AUTOMATICO  ', 1, NULL, 'Proposta Aprovada', 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'INSTRAMED', 'I.ON LED', 1, 7990.00, 7990.00, 'Gerado automaticamente a partir da Proposta ID 75.', '2025-11-24', 2, 75, '2025-11-24 20:28:39', 31),
(14, 'Venda via Proposta #96 - DESFIBRILADOR ', 1, 318, 'Proposta Aprovada', 'DESFIBRILADOR ', 'INSTRAMED', 'APOLUS ', 1, 10055.20, 10055.20, 'Gerado automaticamente a partir da Proposta ID 96.', '2025-12-16', 2, 96, '2025-12-16 14:57:54', NULL),
(15, 'Venda via Proposta #74 - DESFIBRILADOR EXTERNO AUTOMATICO  ', 1, 916, 'Proposta Aprovada', 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'INSTRAMED', 'I.ON LED', 1, 7990.00, 7990.00, 'Gerado automaticamente a partir da Proposta ID 74.', '2025-12-16', 8, 74, '2025-12-16 17:14:56', NULL),
(16, 'Venda via Proposta #73 - DESFIBRILADOR EXTERNO AUTOMATICO  ', 1, 591, 'Proposta Aprovada', 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'INSTRAMED', 'I.ON LED', 1, 7283.00, 7283.00, 'Gerado automaticamente a partir da Proposta ID 73.', '2026-01-12', 2, 73, '2026-01-12 18:37:05', NULL),
(17, 'Venda via Proposta #73 - DESFIBRILADOR EXTERNO AUTOMATICO  ', 1, 591, 'Proposta Aprovada', 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'INSTRAMED', 'I.ON LED', 1, 4369.80, 4369.80, 'Gerado automaticamente a partir da Proposta ID 73.', '2026-01-12', 2, 73, '2026-01-12 18:37:05', NULL),
(18, 'Venda via Proposta #72 - DESFIBRILADOR EXTERNO AUTOMATICO  ', 1, 591, 'Proposta Aprovada', 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'INSTRAMED', 'I.ON LED', 1, 7990.00, 7990.00, 'Gerado automaticamente a partir da Proposta ID 72.', '2026-01-12', 2, 72, '2026-01-12 18:37:28', NULL),
(20, 'Venda via Proposta #125 - CARDIOVERSOR ', 1, 761, 'Proposta Aprovada', 'CARDIOVERSOR ', 'INSTRAMED', 'CARDIOMAX LITE ', 2, 23082.00, 46164.00, 'Gerado automaticamente a partir da Proposta ID 125.', '2026-01-20', 11, NULL, '2026-01-20 17:56:19', NULL),
(21, 'Venda via Proposta #126 - CARDIOVERSOR ', 1, 57, 'Proposta Aprovada', 'CARDIOVERSOR ', 'INSTRAMED', 'CARDIOMAX LITE ', 1, 23082.00, 23082.00, 'Gerado automaticamente a partir da Proposta ID 126.', '2026-01-20', 11, NULL, '2026-01-20 18:01:48', NULL),
(22, 'Venda via Proposta #127 - OXIMETRO', 5, 764, 'Proposta Aprovada', 'OXIMETRO', 'MASIMO', 'RAD G COM TEMPERATURA ', 1, 8358.90, 8358.90, 'Gerado automaticamente a partir da Proposta ID 127.', '2026-01-20', 11, NULL, '2026-01-20 18:17:54', NULL),
(23, 'Venda via Proposta #128 - MONITOR DE PRESSÃO ARTERIAL DE BRAÇO PROFISSIONAL - MPA', 2, 332, 'Proposta Aprovada', 'MONITOR DE PRESSÃO ARTERIAL DE BRAÇO PROFISSIONAL - MPA', 'MICROMED', 'OMRON', 1, 1290.00, 1290.00, 'Gerado automaticamente a partir da Proposta ID 128.', '2026-01-20', 11, NULL, '2026-01-20 18:19:51', NULL),
(24, 'Venda via Proposta #97 - SUPORTE DE PAREDE EM ACRÍLICO ', 1, 916, 'Proposta Aprovada', 'SUPORTE DE PAREDE EM ACRÍLICO ', 'INSTRAMED', 'I ON ', 1, 635.00, 635.00, 'Gerado automaticamente a partir da Proposta ID 97.', '2026-01-26', 2, 97, '2026-01-26 15:46:21', NULL),
(25, 'Venda via Proposta #97 - GABINETE DEA', 1, 916, 'Proposta Aprovada', 'GABINETE DEA', 'INSTRAMED', 'DEA', 1, 1737.40, 1737.40, 'Gerado automaticamente a partir da Proposta ID 97.', '2026-01-26', 2, 97, '2026-01-26 15:46:21', NULL),
(26, 'Venda via Proposta #94 - DESFIBRILADOR EXTERNO AUTOMATICO  ', 1, 513, 'Proposta Aprovada', 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'INSTRAMED', 'I.ON LED', 1, 9711.00, 9711.00, 'Gerado automaticamente a partir da Proposta ID 94.', '2026-01-26', 2, 94, '2026-01-26 16:03:15', NULL),
(27, 'Venda via Proposta #94 - PÁ ADESIVA INFANTIL DESCARTAVEL DEA/CARDIOMAX', 1, 513, 'Proposta Aprovada', 'PÁ ADESIVA INFANTIL DESCARTAVEL DEA/CARDIOMAX', 'INSTRAMED', 'INFANTIL', 1, 615.00, 615.00, 'Gerado automaticamente a partir da Proposta ID 94.', '2026-01-26', 2, 94, '2026-01-26 16:03:15', NULL),
(28, 'Venda via Proposta #79 - DESFIBRILADOR EXTERNO AUTOMATICO  ', 1, 448, 'Proposta Aprovada', 'DESFIBRILADOR EXTERNO AUTOMATICO  ', 'INSTRAMED', 'I.ON LED', 1, 8471.00, 8471.00, 'Gerado automaticamente a partir da Proposta ID 79.', '2026-01-26', 8, 79, '2026-01-26 18:21:14', NULL),
(30, 'Venda via Proposta #133 - Bateria Cardiomax', 1, 359, 'Proposta Aprovada', 'Bateria Cardiomax', 'Instramed', 'Níquel', 2, 2900.00, 5800.00, 'Gerado automaticamente a partir da Proposta ID 133.', '2026-01-27', 4, 133, '2026-01-27 13:43:52', NULL),
(31, 'Venda via Proposta #133 - Módulo de bateria (NiMH) - CardioMax', 1, 359, 'Proposta Aprovada', 'Módulo de bateria (NiMH) - CardioMax', 'INSTRAMED', 'CARDIOMAX ', 0, 0.00, 0.00, 'Gerado automaticamente a partir da Proposta ID 133.', '2026-01-27', 4, 133, '2026-01-27 13:43:52', NULL),
(34, 'Venda via Proposta #135 - Bateria Cardiomax', 1, 227, 'Proposta Aprovada', 'Bateria Cardiomax', 'Instramed', 'Níquel e Litio', 2, 3524.54, 7049.08, 'Gerado automaticamente a partir da Proposta ID 135.', '2026-01-27', 4, 135, '2026-01-27 13:52:33', NULL),
(35, 'Venda via Proposta #136 - Bateria Cardiomax', 1, 227, 'Proposta Aprovada', 'Bateria Cardiomax', 'Instramed', 'Níquel', 2, 3349.09, 6698.18, 'Gerado automaticamente a partir da Proposta ID 136.', '2026-01-27', 4, 136, '2026-01-27 15:06:50', NULL),
(36, 'Venda via Proposta #166 - CONJUNTO DE EXTRACORNPOREA', 3, 275, 'Proposta Aprovada', 'CONJUNTO DE EXTRACORNPOREA', 'LIVANOVA', 'CEC', 1, 131338.00, 131338.00, 'Gerado automaticamente a partir da Proposta ID 166.', '2026-03-02', 1, 166, '2026-03-02 12:04:49', NULL),
(37, 'Venda via Proposta #138 - SISTEMA PARA ERGOMETRIA ERGO PC AIR', 2, 617, 'Proposta Aprovada', 'SISTEMA PARA ERGOMETRIA ERGO PC AIR', 'MICROMED', 'ERGOPC AIR', 1, 28800.00, 28800.00, 'Gerado automaticamente a partir da Proposta ID 138.', '2026-03-18', 7, 138, '2026-03-18 11:51:06', NULL),
(38, 'Venda via Proposta #138 - ESTERIRA ERGOMETRICA', 2, 617, 'Proposta Aprovada', 'ESTERIRA ERGOMETRICA', 'MICROMED', 'C300', 1, 19200.00, 19200.00, 'Gerado automaticamente a partir da Proposta ID 138.', '2026-03-18', 7, 138, '2026-03-18 11:51:06', NULL),
(39, 'Venda via Proposta #143 - CARDIOVERSOR ', 1, 336, 'Proposta Aprovada', 'CARDIOVERSOR ', 'INSTRAMED', 'CARDIOMAX LITE ', 15, 16800.00, 252000.00, 'Gerado automaticamente a partir da Proposta ID 143.', '2026-03-23', 2, 143, '2026-03-23 16:27:55', NULL),
(40, 'Venda via Proposta #143 - MONITOR BLT', 1, 336, 'Proposta Aprovada', 'MONITOR BLT', 'INSTRAMED', 'M10', 15, 6000.00, 90000.00, 'Gerado automaticamente a partir da Proposta ID 143.', '2026-03-23', 2, 143, '2026-03-23 16:27:55', NULL),
(41, 'Venda via Proposta #195 - DESFIBRILADOR EXTERNO AUTOMÁTICO ', 1, 965, 'Proposta Aprovada', 'DESFIBRILADOR EXTERNO AUTOMÁTICO ', 'INSTRAMED', 'I ON LCD', 1, 9818.00, 9818.00, 'Gerado automaticamente a partir da Proposta ID 195.', '2026-03-26', 2, 195, '2026-03-26 15:44:38', NULL),
(42, 'Venda via Proposta #87 - MODULO DE BATERIA CARDIOMAX LI-ON 14,4V 4AH 57,6WH', 1, 345, 'Proposta Aprovada', 'MODULO DE BATERIA CARDIOMAX LI-ON 14,4V 4AH 57,6WH', 'INSTRAMED', 'CARDIOMAX', 2, 3420.00, 6840.00, 'Gerado automaticamente a partir da Proposta ID 87.', '2026-03-27', 8, 87, '2026-03-27 17:12:07', NULL),
(43, 'Venda via Proposta #161 - DESFIBRILADOR ', 1, 918, 'Proposta Aprovada', 'DESFIBRILADOR ', 'INSTRAMED', 'APOLUS ', 1, 12569.00, 12569.00, 'Gerado automaticamente a partir da Proposta ID 161.', '2026-03-30', 2, 161, '2026-03-30 20:52:10', NULL),
(44, 'Venda via Proposta #109 - PÁ ADESIVA ADULTO DESCARTAVEL DEA / CARDIOMAX', 1, 238, 'Proposta Aprovada', 'PÁ ADESIVA ADULTO DESCARTAVEL DEA / CARDIOMAX', 'INSTRAMED', 'ADULTO', 1, 615.00, 615.00, 'Gerado automaticamente a partir da Proposta ID 109.', '2026-03-30', 2, 109, '2026-03-30 20:53:55', NULL),
(45, 'Venda via Proposta #198 - ESTEIRA ERGOMETRICA', 2, 53, 'Proposta Aprovada', 'ESTEIRA ERGOMETRICA', 'MICROMED', 'C300', 1, 47500.00, 47500.00, 'Gerado automaticamente a partir da Proposta ID 198.', '2026-03-31', 8, 198, '2026-03-31 18:41:36', NULL),
(46, 'Venda via Proposta #198 - ERGOPC USB ', 2, 53, 'Proposta Aprovada', 'ERGOPC USB ', 'MICROMED', 'ERGOPC USB ', 1, 24400.00, 24400.00, 'Gerado automaticamente a partir da Proposta ID 198.', '2026-03-31', 8, 198, '2026-03-31 18:41:36', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `vendas_objetivos`
--

CREATE TABLE `vendas_objetivos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `fornecedor_id` int(11) NOT NULL,
  `ano` int(11) NOT NULL,
  `mes` int(11) NOT NULL,
  `valor_meta` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Despejando dados para a tabela `vendas_objetivos`
--

INSERT INTO `vendas_objetivos` (`id`, `usuario_id`, `fornecedor_id`, `ano`, `mes`, `valor_meta`, `created_at`, `updated_at`) VALUES
(328, 2, 1, 2025, 1, 80500.00, '2026-02-09 14:22:26', '2026-02-09 14:38:42'),
(329, 2, 1, 2025, 2, 80500.00, '2026-02-09 14:22:26', '2026-02-09 14:38:42'),
(330, 2, 1, 2025, 3, 80500.00, '2026-02-09 14:22:26', '2026-02-09 14:38:42'),
(331, 2, 1, 2025, 4, 80500.00, '2026-02-09 14:22:26', '2026-02-09 14:38:42'),
(332, 2, 1, 2025, 5, 80500.00, '2026-02-09 14:22:26', '2026-02-09 14:38:42'),
(333, 2, 1, 2025, 6, 80500.00, '2026-02-09 14:22:26', '2026-02-09 14:38:42'),
(334, 2, 1, 2025, 7, 80500.00, '2026-02-09 14:22:26', '2026-02-09 14:38:42'),
(335, 2, 1, 2025, 8, 80500.00, '2026-02-09 14:22:26', '2026-02-09 14:38:42'),
(336, 2, 1, 2025, 9, 80500.00, '2026-02-09 14:22:26', '2026-02-09 14:38:42'),
(337, 2, 1, 2025, 10, 80500.00, '2026-02-09 14:22:26', '2026-02-09 14:38:42'),
(338, 2, 1, 2025, 11, 80500.00, '2026-02-09 14:22:26', '2026-02-09 14:38:42'),
(339, 2, 1, 2025, 12, 80500.00, '2026-02-09 14:22:26', '2026-02-09 14:38:42'),
(352, 1, 3, 2026, 1, 80000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(353, 1, 3, 2026, 2, 80000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(354, 1, 3, 2026, 3, 100000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(355, 1, 3, 2026, 4, 100000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(356, 1, 3, 2026, 5, 100000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(357, 1, 3, 2026, 6, 100000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(358, 1, 3, 2026, 7, 100000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(359, 1, 3, 2026, 8, 100000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(360, 1, 3, 2026, 9, 100000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(361, 1, 3, 2026, 10, 100000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(362, 1, 3, 2026, 11, 100000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(363, 1, 3, 2026, 12, 100000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(364, 6, 3, 2026, 6, 2500000000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(365, 6, 3, 2026, 11, 2500000000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(366, 7, 3, 2026, 1, 150000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(367, 7, 3, 2026, 2, 150000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(368, 7, 3, 2026, 3, 150000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(369, 7, 3, 2026, 4, 150000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(370, 7, 3, 2026, 5, 170000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(371, 7, 3, 2026, 6, 170000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(372, 7, 3, 2026, 7, 200000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(373, 7, 3, 2026, 8, 200000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(374, 7, 3, 2026, 9, 200000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(375, 7, 3, 2026, 10, 200000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(376, 7, 3, 2026, 11, 200000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(377, 7, 3, 2026, 12, 200000.00, '2026-03-02 11:41:13', '2026-03-23 19:40:04'),
(404, 4, 6, 2026, 1, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(405, 4, 6, 2026, 2, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(406, 4, 6, 2026, 3, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(407, 4, 6, 2026, 4, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(408, 4, 6, 2026, 5, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(409, 4, 6, 2026, 6, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(410, 4, 6, 2026, 7, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(411, 4, 6, 2026, 8, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(412, 4, 6, 2026, 9, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(413, 4, 6, 2026, 10, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(414, 4, 6, 2026, 11, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(415, 4, 6, 2026, 12, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(416, 6, 6, 2026, 1, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(417, 6, 6, 2026, 2, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(418, 6, 6, 2026, 3, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(419, 6, 6, 2026, 4, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(420, 6, 6, 2026, 5, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(421, 6, 6, 2026, 6, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(422, 6, 6, 2026, 7, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(423, 6, 6, 2026, 8, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(424, 6, 6, 2026, 9, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(425, 6, 6, 2026, 10, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(426, 6, 6, 2026, 11, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(427, 6, 6, 2026, 12, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(428, 9, 6, 2026, 1, 200000.00, '2026-03-03 22:07:38', '2026-03-23 19:38:59'),
(429, 9, 6, 2026, 2, 200000.00, '2026-03-03 22:07:38', '2026-03-23 19:38:59'),
(430, 9, 6, 2026, 3, 200000.00, '2026-03-03 22:07:38', '2026-03-23 19:38:59'),
(431, 9, 6, 2026, 4, 200000.00, '2026-03-03 22:07:38', '2026-03-23 19:38:59'),
(432, 9, 6, 2026, 5, 200000.00, '2026-03-03 22:07:38', '2026-03-23 19:38:59'),
(433, 9, 6, 2026, 6, 200000.00, '2026-03-03 22:07:38', '2026-03-23 19:38:59'),
(434, 9, 6, 2026, 7, 200000.00, '2026-03-03 22:07:38', '2026-03-23 19:38:59'),
(435, 9, 6, 2026, 8, 200000.00, '2026-03-03 22:07:38', '2026-03-23 19:38:59'),
(436, 9, 6, 2026, 9, 200000.00, '2026-03-03 22:07:38', '2026-03-23 19:38:59'),
(437, 9, 6, 2026, 10, 200000.00, '2026-03-03 22:07:38', '2026-03-23 19:38:59'),
(438, 9, 6, 2026, 11, 200000.00, '2026-03-03 22:07:38', '2026-03-23 19:38:59'),
(439, 9, 6, 2026, 12, 200000.00, '2026-03-03 22:07:38', '2026-03-23 19:38:59'),
(440, 10, 6, 2026, 1, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(441, 10, 6, 2026, 2, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(442, 10, 6, 2026, 3, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(443, 10, 6, 2026, 4, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(444, 10, 6, 2026, 5, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(445, 10, 6, 2026, 6, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(446, 10, 6, 2026, 7, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(447, 10, 6, 2026, 8, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(448, 10, 6, 2026, 9, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(449, 10, 6, 2026, 10, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(450, 10, 6, 2026, 11, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(451, 10, 6, 2026, 12, 200000.00, '2026-03-03 22:07:38', '2026-04-01 00:39:43'),
(452, 4, 7, 2026, 1, 15000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(453, 4, 7, 2026, 2, 15000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(454, 4, 7, 2026, 3, 15000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(455, 4, 7, 2026, 4, 15000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(456, 4, 7, 2026, 5, 15000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(457, 4, 7, 2026, 6, 15000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(458, 4, 7, 2026, 7, 15000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(459, 4, 7, 2026, 8, 15000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(460, 4, 7, 2026, 9, 15000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(461, 4, 7, 2026, 10, 15000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(462, 4, 7, 2026, 11, 15000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(463, 4, 7, 2026, 12, 15000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(464, 6, 7, 2026, 1, 12000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(465, 6, 7, 2026, 2, 12000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(466, 6, 7, 2026, 3, 12000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(467, 6, 7, 2026, 4, 12000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(468, 6, 7, 2026, 5, 12000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(469, 6, 7, 2026, 6, 12000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(470, 6, 7, 2026, 7, 12000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(471, 6, 7, 2026, 8, 12000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(472, 6, 7, 2026, 9, 12000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(473, 6, 7, 2026, 10, 12000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(474, 6, 7, 2026, 11, 12000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(475, 6, 7, 2026, 12, 12000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(476, 9, 7, 2026, 1, 200000.00, '2026-03-03 22:08:53', '2026-03-03 22:08:53'),
(477, 9, 7, 2026, 2, 200000.00, '2026-03-03 22:08:53', '2026-03-03 22:08:53'),
(478, 9, 7, 2026, 3, 200000.00, '2026-03-03 22:08:53', '2026-03-03 22:08:53'),
(479, 9, 7, 2026, 4, 200000.00, '2026-03-03 22:08:53', '2026-03-03 22:08:53'),
(480, 9, 7, 2026, 5, 200000.00, '2026-03-03 22:08:53', '2026-03-03 22:08:53'),
(481, 9, 7, 2026, 6, 200000.00, '2026-03-03 22:08:53', '2026-03-03 22:08:53'),
(482, 9, 7, 2026, 7, 200000.00, '2026-03-03 22:08:53', '2026-03-03 22:08:53'),
(483, 9, 7, 2026, 8, 200000.00, '2026-03-03 22:08:53', '2026-03-03 22:08:53'),
(484, 9, 7, 2026, 9, 200000.00, '2026-03-03 22:08:53', '2026-03-03 22:08:53'),
(485, 9, 7, 2026, 10, 200000.00, '2026-03-03 22:08:53', '2026-03-03 22:08:53'),
(486, 9, 7, 2026, 11, 200000.00, '2026-03-03 22:08:53', '2026-03-03 22:08:53'),
(487, 9, 7, 2026, 12, 200000.00, '2026-03-03 22:08:53', '2026-03-03 22:08:53'),
(488, 10, 7, 2026, 1, 200000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(489, 10, 7, 2026, 2, 200000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(490, 10, 7, 2026, 3, 200000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(491, 10, 7, 2026, 4, 200000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(492, 10, 7, 2026, 5, 200000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(493, 10, 7, 2026, 6, 200000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(494, 10, 7, 2026, 7, 200000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(495, 10, 7, 2026, 8, 200000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(496, 10, 7, 2026, 9, 200000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(497, 10, 7, 2026, 10, 200000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(498, 10, 7, 2026, 11, 200000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(499, 10, 7, 2026, 12, 200000.00, '2026-03-03 22:08:53', '2026-03-16 18:22:06'),
(500, 4, 1, 2026, 1, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(501, 4, 1, 2026, 2, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(502, 4, 1, 2026, 3, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(503, 4, 1, 2026, 4, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(504, 4, 1, 2026, 5, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(505, 4, 1, 2026, 6, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(506, 4, 1, 2026, 7, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(507, 4, 1, 2026, 8, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(508, 4, 1, 2026, 9, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(509, 4, 1, 2026, 10, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(510, 4, 1, 2026, 11, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(511, 4, 1, 2026, 12, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(512, 6, 1, 2026, 1, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(513, 6, 1, 2026, 2, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(514, 6, 1, 2026, 3, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(515, 6, 1, 2026, 4, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(516, 6, 1, 2026, 5, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(517, 6, 1, 2026, 6, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(518, 6, 1, 2026, 7, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(519, 6, 1, 2026, 8, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(520, 6, 1, 2026, 9, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(521, 6, 1, 2026, 10, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(522, 6, 1, 2026, 11, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(523, 6, 1, 2026, 12, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(524, 9, 1, 2026, 1, 200000.00, '2026-03-03 22:10:08', '2026-03-04 15:03:49'),
(525, 9, 1, 2026, 2, 200000.00, '2026-03-03 22:10:08', '2026-03-04 15:03:49'),
(526, 9, 1, 2026, 3, 200000.00, '2026-03-03 22:10:08', '2026-03-04 15:03:49'),
(527, 9, 1, 2026, 4, 200000.00, '2026-03-03 22:10:08', '2026-03-04 15:03:49'),
(528, 9, 1, 2026, 5, 200000.00, '2026-03-03 22:10:08', '2026-03-04 15:03:49'),
(529, 9, 1, 2026, 6, 200000.00, '2026-03-03 22:10:08', '2026-03-04 15:03:49'),
(530, 9, 1, 2026, 7, 200000.00, '2026-03-03 22:10:08', '2026-03-04 15:03:49'),
(531, 9, 1, 2026, 8, 200000.00, '2026-03-03 22:10:08', '2026-03-04 15:03:49'),
(532, 9, 1, 2026, 9, 200000.00, '2026-03-03 22:10:08', '2026-03-04 15:03:49'),
(533, 9, 1, 2026, 10, 200000.00, '2026-03-03 22:10:08', '2026-03-04 15:03:49'),
(534, 9, 1, 2026, 11, 200000.00, '2026-03-03 22:10:08', '2026-03-04 15:03:49'),
(535, 9, 1, 2026, 12, 200000.00, '2026-03-03 22:10:08', '2026-03-04 15:03:49'),
(536, 10, 1, 2026, 1, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(537, 10, 1, 2026, 2, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(538, 10, 1, 2026, 3, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(539, 10, 1, 2026, 4, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(540, 10, 1, 2026, 5, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(541, 10, 1, 2026, 6, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(542, 10, 1, 2026, 7, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(543, 10, 1, 2026, 8, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(544, 10, 1, 2026, 9, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(545, 10, 1, 2026, 10, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(546, 10, 1, 2026, 11, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(547, 10, 1, 2026, 12, 200000.00, '2026-03-03 22:10:08', '2026-03-23 19:39:40'),
(548, 4, 5, 2026, 1, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(549, 4, 5, 2026, 2, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(550, 4, 5, 2026, 3, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(551, 4, 5, 2026, 4, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(552, 4, 5, 2026, 5, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(553, 4, 5, 2026, 6, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(554, 4, 5, 2026, 7, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(555, 4, 5, 2026, 8, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(556, 4, 5, 2026, 9, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(557, 4, 5, 2026, 10, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(558, 4, 5, 2026, 11, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(559, 4, 5, 2026, 12, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(560, 6, 5, 2026, 1, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(561, 6, 5, 2026, 2, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(562, 6, 5, 2026, 3, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(563, 6, 5, 2026, 4, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(564, 6, 5, 2026, 5, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(565, 6, 5, 2026, 6, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(566, 6, 5, 2026, 7, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(567, 6, 5, 2026, 8, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(568, 6, 5, 2026, 9, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(569, 6, 5, 2026, 10, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(570, 6, 5, 2026, 11, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(571, 6, 5, 2026, 12, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(572, 9, 5, 2026, 1, 200000.00, '2026-03-03 22:11:48', '2026-03-03 22:11:48'),
(573, 9, 5, 2026, 2, 200000.00, '2026-03-03 22:11:48', '2026-03-03 22:11:48'),
(574, 9, 5, 2026, 3, 200000.00, '2026-03-03 22:11:48', '2026-03-03 22:11:48'),
(575, 9, 5, 2026, 4, 200000.00, '2026-03-03 22:11:48', '2026-03-03 22:11:48'),
(576, 9, 5, 2026, 5, 200000.00, '2026-03-03 22:11:48', '2026-03-03 22:11:48'),
(577, 9, 5, 2026, 6, 200000.00, '2026-03-03 22:11:48', '2026-03-03 22:11:48'),
(578, 9, 5, 2026, 7, 200000.00, '2026-03-03 22:11:48', '2026-03-03 22:11:48'),
(579, 9, 5, 2026, 8, 200000.00, '2026-03-03 22:11:48', '2026-03-03 22:11:48'),
(580, 9, 5, 2026, 9, 200000.00, '2026-03-03 22:11:48', '2026-03-03 22:11:48'),
(581, 9, 5, 2026, 10, 200000.00, '2026-03-03 22:11:48', '2026-03-03 22:11:48'),
(582, 9, 5, 2026, 11, 200000.00, '2026-03-03 22:11:48', '2026-03-03 22:11:48'),
(583, 9, 5, 2026, 12, 200000.00, '2026-03-03 22:11:48', '2026-03-03 22:11:48'),
(584, 10, 5, 2026, 1, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(585, 10, 5, 2026, 2, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(586, 10, 5, 2026, 3, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(587, 10, 5, 2026, 4, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(588, 10, 5, 2026, 5, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(589, 10, 5, 2026, 6, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(590, 10, 5, 2026, 7, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(591, 10, 5, 2026, 8, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(592, 10, 5, 2026, 9, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(593, 10, 5, 2026, 10, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(594, 10, 5, 2026, 11, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(595, 10, 5, 2026, 12, 200000.00, '2026-03-03 22:11:48', '2026-03-23 19:41:28'),
(596, 4, 2, 2026, 1, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(597, 4, 2, 2026, 2, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(598, 4, 2, 2026, 3, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(599, 4, 2, 2026, 4, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(600, 4, 2, 2026, 5, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(601, 4, 2, 2026, 6, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(602, 4, 2, 2026, 7, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(603, 4, 2, 2026, 8, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(604, 4, 2, 2026, 9, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(605, 4, 2, 2026, 10, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(606, 4, 2, 2026, 11, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(607, 4, 2, 2026, 12, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(608, 6, 2, 2026, 1, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(609, 6, 2, 2026, 2, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(610, 6, 2, 2026, 3, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(611, 6, 2, 2026, 4, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(612, 6, 2, 2026, 5, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(613, 6, 2, 2026, 6, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(614, 6, 2, 2026, 7, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(615, 6, 2, 2026, 8, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(616, 6, 2, 2026, 9, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(617, 6, 2, 2026, 10, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(618, 6, 2, 2026, 11, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(619, 6, 2, 2026, 12, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(620, 9, 2, 2026, 1, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(621, 9, 2, 2026, 2, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(622, 9, 2, 2026, 3, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(623, 9, 2, 2026, 4, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(624, 9, 2, 2026, 5, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(625, 9, 2, 2026, 6, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(626, 9, 2, 2026, 7, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(627, 9, 2, 2026, 8, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(628, 9, 2, 2026, 9, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(629, 9, 2, 2026, 10, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(630, 9, 2, 2026, 11, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(631, 9, 2, 2026, 12, 200000.00, '2026-03-03 22:13:08', '2026-03-03 22:13:08'),
(632, 10, 2, 2026, 1, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(633, 10, 2, 2026, 2, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(634, 10, 2, 2026, 3, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(635, 10, 2, 2026, 4, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(636, 10, 2, 2026, 5, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(637, 10, 2, 2026, 6, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(638, 10, 2, 2026, 7, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(639, 10, 2, 2026, 8, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(640, 10, 2, 2026, 9, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(641, 10, 2, 2026, 10, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(642, 10, 2, 2026, 11, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(643, 10, 2, 2026, 12, 200000.00, '2026-03-03 22:13:08', '2026-03-23 19:37:57'),
(644, 4, 4, 2026, 1, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(645, 4, 4, 2026, 2, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(646, 4, 4, 2026, 3, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(647, 4, 4, 2026, 4, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(648, 4, 4, 2026, 5, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(649, 4, 4, 2026, 6, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(650, 4, 4, 2026, 7, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(651, 4, 4, 2026, 8, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(652, 4, 4, 2026, 9, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(653, 4, 4, 2026, 10, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(654, 4, 4, 2026, 11, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(655, 4, 4, 2026, 12, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(656, 6, 4, 2026, 1, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(657, 6, 4, 2026, 2, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(658, 6, 4, 2026, 3, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(659, 6, 4, 2026, 4, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(660, 6, 4, 2026, 5, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(661, 6, 4, 2026, 6, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(662, 6, 4, 2026, 7, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(663, 6, 4, 2026, 8, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(664, 6, 4, 2026, 9, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(665, 6, 4, 2026, 10, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(666, 6, 4, 2026, 11, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(667, 6, 4, 2026, 12, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(668, 9, 4, 2026, 1, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(669, 9, 4, 2026, 2, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(670, 9, 4, 2026, 3, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(671, 9, 4, 2026, 4, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(672, 9, 4, 2026, 5, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(673, 9, 4, 2026, 6, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(674, 9, 4, 2026, 7, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(675, 9, 4, 2026, 8, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(676, 9, 4, 2026, 9, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(677, 9, 4, 2026, 10, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(678, 9, 4, 2026, 11, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(679, 9, 4, 2026, 12, 200000.00, '2026-03-03 22:14:20', '2026-03-23 17:35:19'),
(680, 10, 4, 2026, 1, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(681, 10, 4, 2026, 2, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(682, 10, 4, 2026, 3, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(683, 10, 4, 2026, 4, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(684, 10, 4, 2026, 5, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(685, 10, 4, 2026, 6, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(686, 10, 4, 2026, 7, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(687, 10, 4, 2026, 8, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(688, 10, 4, 2026, 9, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(689, 10, 4, 2026, 10, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(690, 10, 4, 2026, 11, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(691, 10, 4, 2026, 12, 200000.00, '2026-03-03 22:14:20', '2026-03-31 18:10:28'),
(788, 2, 7, 2026, 1, 5000.00, '2026-03-13 17:31:39', '2026-03-16 18:22:06'),
(789, 2, 7, 2026, 2, 5000.00, '2026-03-13 17:31:39', '2026-03-16 18:22:06'),
(790, 2, 7, 2026, 3, 5000.00, '2026-03-13 17:31:39', '2026-03-16 18:22:06'),
(791, 2, 7, 2026, 4, 5000.00, '2026-03-13 17:31:39', '2026-03-16 18:22:06'),
(792, 2, 7, 2026, 5, 5000.00, '2026-03-13 17:31:39', '2026-03-16 18:22:06'),
(793, 2, 7, 2026, 6, 5000.00, '2026-03-13 17:31:39', '2026-03-16 18:22:06'),
(794, 2, 7, 2026, 7, 5000.00, '2026-03-13 17:31:39', '2026-03-16 18:22:06'),
(795, 2, 7, 2026, 8, 5000.00, '2026-03-13 17:31:39', '2026-03-16 18:22:06'),
(796, 2, 7, 2026, 9, 5000.00, '2026-03-13 17:31:39', '2026-03-16 18:22:06'),
(797, 2, 7, 2026, 10, 5000.00, '2026-03-13 17:31:39', '2026-03-16 18:22:06'),
(798, 2, 7, 2026, 11, 5000.00, '2026-03-13 17:31:39', '2026-03-16 18:22:06'),
(799, 2, 7, 2026, 12, 5000.00, '2026-03-13 17:31:39', '2026-03-16 18:22:06'),
(1100, 6, 8, 2026, 1, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1101, 6, 8, 2026, 2, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1102, 6, 8, 2026, 3, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1103, 6, 8, 2026, 4, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1104, 6, 8, 2026, 5, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1105, 6, 8, 2026, 6, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1106, 6, 8, 2026, 7, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1107, 6, 8, 2026, 8, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1108, 6, 8, 2026, 9, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1109, 6, 8, 2026, 10, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1110, 6, 8, 2026, 11, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1111, 6, 8, 2026, 12, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1112, 7, 8, 2026, 1, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1113, 7, 8, 2026, 2, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1114, 7, 8, 2026, 3, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1115, 7, 8, 2026, 4, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1116, 7, 8, 2026, 5, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1117, 7, 8, 2026, 6, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1118, 7, 8, 2026, 7, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1119, 7, 8, 2026, 8, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1120, 7, 8, 2026, 9, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1121, 7, 8, 2026, 10, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1122, 7, 8, 2026, 11, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1123, 7, 8, 2026, 12, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1124, 10, 8, 2026, 1, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1125, 10, 8, 2026, 2, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1126, 10, 8, 2026, 3, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1127, 10, 8, 2026, 4, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1128, 10, 8, 2026, 5, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1129, 10, 8, 2026, 6, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1130, 10, 8, 2026, 7, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1131, 10, 8, 2026, 8, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1132, 10, 8, 2026, 9, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1133, 10, 8, 2026, 10, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1134, 10, 8, 2026, 11, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06'),
(1135, 10, 8, 2026, 12, 18000.00, '2026-03-23 17:37:06', '2026-03-23 17:37:06');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `agendamentos`
--
ALTER TABLE `agendamentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `criado_por_id` (`criado_por_id`),
  ADD KEY `oportunidade_id` (`oportunidade_id`);

--
-- Índices de tabela `agendamento_usuarios`
--
ALTER TABLE `agendamento_usuarios`
  ADD PRIMARY KEY (`agendamento_id`,`usuario_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Índices de tabela `clientes_pf`
--
ALTER TABLE `clientes_pf`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cpf` (`cpf`);

--
-- Índices de tabela `commissionconfig`
--
ALTER TABLE `commissionconfig`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_usuario` (`usuarioid`);

--
-- Índices de tabela `commission_config`
--
ALTER TABLE `commission_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_usuario` (`usuario_id`);

--
-- Índices de tabela `contatos`
--
ALTER TABLE `contatos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organizacao_id` (`organizacao_id`);

--
-- Índices de tabela `empenhos`
--
ALTER TABLE `empenhos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `etapas_funil`
--
ALTER TABLE `etapas_funil`
  ADD PRIMARY KEY (`id`),
  ADD KEY `funil_id` (`funil_id`);

--
-- Índices de tabela `fornecedores`
--
ALTER TABLE `fornecedores`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `fornecedor_metas`
--
ALTER TABLE `fornecedor_metas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_forn_ano` (`fornecedor_id`,`ano`);

--
-- Índices de tabela `fornecedor_metas_estados`
--
ALTER TABLE `fornecedor_metas_estados`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_forn_ano_est` (`fornecedor_id`,`ano`,`estado`);

--
-- Índices de tabela `funis`
--
ALTER TABLE `funis`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `historico_atribuicao`
--
ALTER TABLE `historico_atribuicao`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oportunidade_id` (`oportunidade_id`),
  ADD KEY `usuario_anterior_id` (`usuario_anterior_id`),
  ADD KEY `usuario_novo_id` (`usuario_novo_id`),
  ADD KEY `usuario_transferencia_id` (`usuario_transferencia_id`);

--
-- Índices de tabela `kits`
--
ALTER TABLE `kits`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `kit_itens`
--
ALTER TABLE `kit_itens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ki_kit` (`kit_id`),
  ADD KEY `fk_ki_item` (`tabela_preco_item_id`);

--
-- Índices de tabela `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `notas_fiscais`
--
ALTER TABLE `notas_fiscais`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `oportunidades`
--
ALTER TABLE `oportunidades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `etapa_id` (`etapa_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `organizacao_id` (`organizacao_id`),
  ADD KEY `contato_id` (`contato_id`),
  ADD KEY `cliente_pf_id` (`cliente_pf_id`),
  ADD KEY `fk_oportunidades_fornecedor` (`fornecedor_id`);

--
-- Índices de tabela `oportunidade_itens`
--
ALTER TABLE `oportunidade_itens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oportunidade_id` (`oportunidade_id`),
  ADD KEY `fk_opp_item_produto` (`produto_id`);

--
-- Índices de tabela `organizacoes`
--
ALTER TABLE `organizacoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cnpj` (`cnpj`);

--
-- Índices de tabela `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `propostas`
--
ALTER TABLE `propostas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organizacao_id` (`organizacao_id`),
  ADD KEY `contato_id` (`contato_id`),
  ADD KEY `cliente_pf_id` (`cliente_pf_id`),
  ADD KEY `oportunidade_id` (`oportunidade_id`),
  ADD KEY `fk_proposta_usuario` (`usuario_id`),
  ADD KEY `fk_propostas_atualizado_por` (`atualizado_por_id`);

--
-- Índices de tabela `proposta_itens`
--
ALTER TABLE `proposta_itens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proposta_id` (`proposta_id`),
  ADD KEY `fk_item_produto` (`produto_id`);

--
-- Índices de tabela `suppliermonthlytargets`
--
ALTER TABLE `suppliermonthlytargets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_forn_year_month_uf` (`fornecedornome`,`year`,`month`,`uf`);

--
-- Índices de tabela `supplier_monthly_targets`
--
ALTER TABLE `supplier_monthly_targets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_forn_year_month_uf` (`fornecedor_nome`,`year`,`month`,`uf`);

--
-- Índices de tabela `tabela_preco`
--
ALTER TABLE `tabela_preco`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tabela_preco_itens`
--
ALTER TABLE `tabela_preco_itens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tpi_tabela` (`tabela_preco_id`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Índices de tabela `usuarios_financas`
--
ALTER TABLE `usuarios_financas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_usuario` (`usuario_id`);

--
-- Índices de tabela `vendas_fornecedores`
--
ALTER TABLE `vendas_fornecedores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fornecedor_id` (`fornecedor_id`),
  ADD KEY `organizacao_id` (`organizacao_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `fk_venda_proposta_ref` (`proposta_ref_id`);

--
-- Índices de tabela `vendas_objetivos`
--
ALTER TABLE `vendas_objetivos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_meta` (`usuario_id`,`fornecedor_id`,`ano`,`mes`),
  ADD KEY `fornecedor_id` (`fornecedor_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `agendamentos`
--
ALTER TABLE `agendamentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de tabela `clientes_pf`
--
ALTER TABLE `clientes_pf`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=296;

--
-- AUTO_INCREMENT de tabela `commissionconfig`
--
ALTER TABLE `commissionconfig`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `commission_config`
--
ALTER TABLE `commission_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT de tabela `contatos`
--
ALTER TABLE `contatos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de tabela `empenhos`
--
ALTER TABLE `empenhos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de tabela `etapas_funil`
--
ALTER TABLE `etapas_funil`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de tabela `fornecedores`
--
ALTER TABLE `fornecedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de tabela `fornecedor_metas`
--
ALTER TABLE `fornecedor_metas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT de tabela `fornecedor_metas_estados`
--
ALTER TABLE `fornecedor_metas_estados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=152;

--
-- AUTO_INCREMENT de tabela `funis`
--
ALTER TABLE `funis`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `historico_atribuicao`
--
ALTER TABLE `historico_atribuicao`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `kits`
--
ALTER TABLE `kits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `kit_itens`
--
ALTER TABLE `kit_itens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT de tabela `leads`
--
ALTER TABLE `leads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=296;

--
-- AUTO_INCREMENT de tabela `notas_fiscais`
--
ALTER TABLE `notas_fiscais`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de tabela `oportunidades`
--
ALTER TABLE `oportunidades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=266;

--
-- AUTO_INCREMENT de tabela `oportunidade_itens`
--
ALTER TABLE `oportunidade_itens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=201;

--
-- AUTO_INCREMENT de tabela `organizacoes`
--
ALTER TABLE `organizacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=973;

--
-- AUTO_INCREMENT de tabela `produtos`
--
ALTER TABLE `produtos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT de tabela `propostas`
--
ALTER TABLE `propostas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=205;

--
-- AUTO_INCREMENT de tabela `proposta_itens`
--
ALTER TABLE `proposta_itens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=811;

--
-- AUTO_INCREMENT de tabela `suppliermonthlytargets`
--
ALTER TABLE `suppliermonthlytargets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `supplier_monthly_targets`
--
ALTER TABLE `supplier_monthly_targets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=109;

--
-- AUTO_INCREMENT de tabela `tabela_preco`
--
ALTER TABLE `tabela_preco`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `tabela_preco_itens`
--
ALTER TABLE `tabela_preco_itens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `usuarios_financas`
--
ALTER TABLE `usuarios_financas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de tabela `vendas_fornecedores`
--
ALTER TABLE `vendas_fornecedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT de tabela `vendas_objetivos`
--
ALTER TABLE `vendas_objetivos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1390;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `agendamentos`
--
ALTER TABLE `agendamentos`
  ADD CONSTRAINT `agendamentos_ibfk_2` FOREIGN KEY (`criado_por_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `agendamentos_ibfk_3` FOREIGN KEY (`oportunidade_id`) REFERENCES `oportunidades` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `agendamento_usuarios`
--
ALTER TABLE `agendamento_usuarios`
  ADD CONSTRAINT `agendamento_usuarios_ibfk_1` FOREIGN KEY (`agendamento_id`) REFERENCES `agendamentos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `agendamento_usuarios_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `contatos`
--
ALTER TABLE `contatos`
  ADD CONSTRAINT `contatos_ibfk_1` FOREIGN KEY (`organizacao_id`) REFERENCES `organizacoes` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `etapas_funil`
--
ALTER TABLE `etapas_funil`
  ADD CONSTRAINT `etapas_funil_ibfk_1` FOREIGN KEY (`funil_id`) REFERENCES `funis` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `historico_atribuicao`
--
ALTER TABLE `historico_atribuicao`
  ADD CONSTRAINT `historico_atribuicao_ibfk_1` FOREIGN KEY (`oportunidade_id`) REFERENCES `oportunidades` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `historico_atribuicao_ibfk_2` FOREIGN KEY (`usuario_anterior_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `historico_atribuicao_ibfk_3` FOREIGN KEY (`usuario_novo_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `historico_atribuicao_ibfk_4` FOREIGN KEY (`usuario_transferencia_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `kit_itens`
--
ALTER TABLE `kit_itens`
  ADD CONSTRAINT `fk_ki_item` FOREIGN KEY (`tabela_preco_item_id`) REFERENCES `tabela_preco_itens` (`id`),
  ADD CONSTRAINT `fk_ki_kit` FOREIGN KEY (`kit_id`) REFERENCES `kits` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `oportunidades`
--
ALTER TABLE `oportunidades`
  ADD CONSTRAINT `fk_oportunidades_fornecedor` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores` (`id`),
  ADD CONSTRAINT `oportunidades_ibfk_1` FOREIGN KEY (`etapa_id`) REFERENCES `etapas_funil` (`id`),
  ADD CONSTRAINT `oportunidades_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `oportunidades_ibfk_3` FOREIGN KEY (`organizacao_id`) REFERENCES `organizacoes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `oportunidades_ibfk_4` FOREIGN KEY (`contato_id`) REFERENCES `contatos` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `oportunidades_ibfk_5` FOREIGN KEY (`cliente_pf_id`) REFERENCES `clientes_pf` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `propostas`
--
ALTER TABLE `propostas`
  ADD CONSTRAINT `fk_propostas_atualizado_por` FOREIGN KEY (`atualizado_por_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `tabela_preco_itens`
--
ALTER TABLE `tabela_preco_itens`
  ADD CONSTRAINT `fk_tpi_tabela` FOREIGN KEY (`tabela_preco_id`) REFERENCES `tabela_preco` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `usuarios_financas`
--
ALTER TABLE `usuarios_financas`
  ADD CONSTRAINT `fk_usuario_financas` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `vendas_objetivos`
--
ALTER TABLE `vendas_objetivos`
  ADD CONSTRAINT `vendas_objetivos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `vendas_objetivos_ibfk_2` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
