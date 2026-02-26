-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 19/02/2026 às 05:36
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `glowup`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `agendamentos`
--

CREATE TABLE `agendamentos` (
  `id` int(11) NOT NULL,
  `data_hora` datetime NOT NULL,
  `status` enum('Agendado','Cancelado','Concluido') NOT NULL,
  `id_cliente_fk` int(11) DEFAULT NULL,
  `id_servico_fk` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `agendamentos`
--

INSERT INTO `agendamentos` (`id`, `data_hora`, `status`, `id_cliente_fk`, `id_servico_fk`, `created_at`, `updated_at`) VALUES
(13, '2026-02-14 17:00:00', 'Cancelado', 1, 1, '2026-02-14 01:41:40', '2026-02-14 01:42:19'),
(14, '2026-02-14 17:00:00', 'Agendado', 1, 1, '2026-02-14 01:55:35', '2026-02-14 01:55:35'),
(15, '2026-02-15 17:00:00', 'Agendado', 1, 1, '2026-02-14 01:56:18', '2026-02-14 01:56:18'),
(16, '2026-02-16 17:00:00', 'Cancelado', 1, 1, '2026-02-14 01:56:30', '2026-02-14 01:58:11'),
(17, '2026-02-16 17:00:00', 'Agendado', 1, 1, '2026-02-14 01:58:29', '2026-02-14 01:58:29'),
(18, '2026-03-05 14:30:00', 'Agendado', 1, 1, '2026-02-19 00:48:33', '2026-02-19 00:48:33'),
(19, '2026-02-25 11:00:00', 'Cancelado', 4, 1, '2026-02-19 01:19:48', '2026-02-19 01:20:14'),
(20, '2026-02-25 11:00:00', 'Cancelado', 4, 1, '2026-02-19 01:20:42', '2026-02-19 01:21:24'),
(21, '2026-03-20 14:00:00', 'Agendado', 5, 4, '2026-02-19 04:32:51', '2026-02-19 04:32:51'),
(22, '2026-03-22 10:00:00', 'Agendado', 6, 1, '2026-02-19 04:32:51', '2026-02-19 04:32:51'),
(23, '2026-03-25 16:00:00', 'Agendado', 7, 3, '2026-02-19 04:32:51', '2026-02-19 04:32:51');

-- --------------------------------------------------------

--
-- Estrutura para tabela `cadastros`
--

CREATE TABLE `cadastros` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `isProfissional` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `cadastros`
--

INSERT INTO `cadastros` (`id`, `nome`, `email`, `senha`, `isProfissional`) VALUES
(1, 'João Silva', 'joao@email.com', 'senha123', 0),
(2, 'Maria Santos', 'maria@email.com', 'senha456', 1),
(3, 'Empresa Beauty', 'beauty@email.com', 'senha789', 1),
(4, 'Maria Santos2', 'maria2@email.com', '$2y$10$pVz1bXnsbzxxHVwj81NsneAT7ieDPvSgHS6LC.F7F3DeF392d0Mdy', 0),
(6, 'matheus', 'oi@gmail.com', '$2y$10$ub5Fh/p/vMx.u7VnzyqpV.vYMoIEnPCdeJ/hGXltxhKeDlMiWppSC', 0),
(7, 'matheus', 'o2i@gmail.com', '$2y$10$0jLSaWPrHuE2x3/GIdR.leEh3uREusAh.dbndvirUlFzpFfVjQ.Cm', 0),
(8, 'Matheus Cortes', 'oio@gmail.com', '$2y$10$LRzH/cFGUK9WAJHgEkETtuusPepJXsXSQ/UpRxL/RJ2vHIGfD4PC.', 1),
(9, 'Fernando Rodrigues', 'fernandinho@gmail.com', '$2y$10$089bgOU/Ej.g0gRBxIPC2OyCDTO1mEkx8NBEVrdeY.aj8/.pok7Tq', 0),
(10, 'Lucas Martines', 'lucasmr@gmail.com', '$2y$10$tBib1CyBPutnhEIG5kUTG.w0nEcL.bs61qVN.S4cqXSKdw.xAkYDe', 0),
(11, 'Thayson Francisco', 'thayson@gmail.com', '$2y$10$8979II3s4Lb.zskdoJhVbOoBhT5Mp8kmOOI3bYZoz4JRKE1QpjU3m', 0),
(12, 'Lucy Cortes e Estetica', 'lucycp@gmail.com', '$2y$10$dcNzrS8ih0vHwem/n9OFfuOS9JUxEMR9CilWlMnB6WIFesLkBOw.G', 1),
(13, 'Naomi Esteticas', 'naomi@gmail.com', '$2y$10$pGGftWXSK1R5W82g9Gl5Me7ma2lSH9OW4.hXhfV2uG4yzql.BSEP2', 1),
(14, 'Diego Cortes', 'diego@gmail.com', '$2y$10$WKZxXbi7/wCl0dMAFopi2uyun/q4BUQtj.kQ0MnkJ27rCa3Mb134K', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `categorias`
--

INSERT INTO `categorias` (`id`, `nome`) VALUES
(1, 'Cabelo'),
(2, 'Unhas'),
(3, 'Estética'),
(4, 'Corte Feminino'),
(5, 'Corte Masculino'),
(6, 'Coloração'),
(7, 'Manicure'),
(8, 'Maquiagem'),
(9, 'Sobrancelha'),
(10, 'Corte Feminino'),
(11, 'Corte Masculino'),
(12, 'Coloração'),
(13, 'Manicure'),
(14, 'Maquiagem'),
(15, 'Sobrancelha'),
(16, 'Barba'),
(17, 'Tratamento Capilar');

-- --------------------------------------------------------

--
-- Estrutura para tabela `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `id_cadastro_fk` int(11) DEFAULT NULL,
  `id_telefone_fk` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `clientes`
--

INSERT INTO `clientes` (`id`, `nome`, `id_cadastro_fk`, `id_telefone_fk`) VALUES
(1, 'João Silva', 1, 1),
(4, 'matheus', 7, NULL),
(5, 'Fernando Rodrigues', 9, NULL),
(6, 'Lucas Martines', 10, NULL),
(7, 'Thayson Francisco', 11, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `enderecos`
--

CREATE TABLE `enderecos` (
  `id` int(11) NOT NULL,
  `rua` varchar(255) NOT NULL,
  `numero` varchar(255) NOT NULL,
  `cep` varchar(255) NOT NULL,
  `bairro` varchar(255) NOT NULL,
  `cidade` varchar(255) NOT NULL,
  `estado` varchar(255) NOT NULL,
  `complemento` varchar(255) NOT NULL,
  `id_profissional_fk` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `enderecos`
--

INSERT INTO `enderecos` (`id`, `rua`, `numero`, `cep`, `bairro`, `cidade`, `estado`, `complemento`, `id_profissional_fk`) VALUES
(1, 'Rua das Flores', '123', '01234-567', 'Centro', 'São Paulo', 'SP', 'Sala 1', 1),
(2, 'Avenida Principal', '456', '04567-890', 'Jardins', 'Rio de Janeiro', 'RJ', 'Loja 2', 2),
(3, 'Rua Paschoal Franceschini', '100', '13106508', 'Vila Santa Rita (Sousas)', 'Campinas', 'SP', '12', 3),
(4, 'Rua Paschoal Franceschini', '22', '13106508', 'Vila Santa Rita (Sousas)', 'Campinas', 'SP', '12', 12),
(5, 'Rua Paschoal Franceschini', '11', '13106508', 'Vila Santa Rita (Sousas)', 'Campinas', 'SP', '11', 13),
(11, 'Rua Paschoal Franceschini', '11', '13106508', 'Vila Santa Rita (Sousas)', 'Campinas', 'SP', '34', 14);

-- --------------------------------------------------------

--
-- Estrutura para tabela `escalas`
--

CREATE TABLE `escalas` (
  `id` int(11) NOT NULL,
  `inicio` time NOT NULL,
  `fim` time NOT NULL,
  `dia_semana` int(11) NOT NULL,
  `id_profissional_fk` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `escalas`
--

INSERT INTO `escalas` (`id`, `inicio`, `fim`, `dia_semana`, `id_profissional_fk`) VALUES
(1, '08:00:00', '17:00:00', 1, 1),
(2, '09:00:00', '18:00:00', 1, 2),
(8, '08:00:00', '18:00:00', 3, 1),
(9, '08:00:00', '18:00:00', 4, 1),
(10, '09:00:00', '18:00:00', 3, 1),
(11, '09:00:00', '18:00:00', 4, 1),
(13, '09:00:00', '18:00:00', 5, 1),
(14, '08:00:00', '18:00:00', 2, 1),
(15, '08:00:00', '18:00:00', 3, 1),
(16, '09:00:00', '19:00:00', 2, 3),
(17, '09:00:00', '19:00:00', 3, 3),
(18, '10:00:00', '20:00:00', 2, 12);

-- --------------------------------------------------------

--
-- Estrutura para tabela `fisicos`
--

CREATE TABLE `fisicos` (
  `id` int(11) NOT NULL,
  `cpf` varchar(255) NOT NULL,
  `id_profissional_fk` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `fisicos`
--

INSERT INTO `fisicos` (`id`, `cpf`, `id_profissional_fk`) VALUES
(1, '123.456.789-00', 1),
(2, '22222222222', 3),
(3, '11111111111', 13),
(4, '33333333333', 14);

-- --------------------------------------------------------

--
-- Estrutura para tabela `indisponibilidades`
--

CREATE TABLE `indisponibilidades` (
  `id` int(11) NOT NULL,
  `id_profissional_fk` int(11) NOT NULL,
  `data` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fim` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `juridicos`
--

CREATE TABLE `juridicos` (
  `id` int(11) NOT NULL,
  `cnpj` varchar(255) NOT NULL,
  `id_profissional_fk` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `juridicos`
--

INSERT INTO `juridicos` (`id`, `cnpj`, `id_profissional_fk`) VALUES
(1, '12.345.678/0001-90', 2),
(2, '11111111111111', 12);

-- --------------------------------------------------------

--
-- Estrutura para tabela `portifolios`
--

CREATE TABLE `portifolios` (
  `id` int(11) NOT NULL,
  `imagens` varchar(255) NOT NULL,
  `id_profissional_fk` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `portifolios`
--

INSERT INTO `portifolios` (`id`, `imagens`, `id_profissional_fk`) VALUES
(1, 'foto1.jpg', 1),
(2, 'foto2.jpg', 1),
(3, 'foto3.jpg', 2),
(5, 'loiro_perfeito.jpg', 1),
(6, 'maquiagem_noiva.jpg', 12),
(7, 'sobrancelha_modelada.jpg', 13),
(8, 'barba_degrade.jpg', 3),
(9, 'salon_interno.jpg', 2);

-- --------------------------------------------------------

--
-- Estrutura para tabela `profissionais`
--

CREATE TABLE `profissionais` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `acessibilidade` tinyint(1) NOT NULL,
  `isJuridica` tinyint(1) NOT NULL,
  `id_cadastro_fk` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `profissionais`
--

INSERT INTO `profissionais` (`id`, `nome`, `email`, `descricao`, `acessibilidade`, `isJuridica`, `id_cadastro_fk`) VALUES
(1, 'Maria Santos', 'maria@email.com', 'Cabeleireira profissional com 10 anos de experiência', 1, 0, 2),
(2, 'Empresa Beauty', 'beauty@email.com', 'Salão de beleza completo', 1, 1, 3),
(3, 'Matheus Cortes', 'oio@gmail.com', 'Os melhores cortes', 0, 0, 8),
(12, 'Lucy Cortes e Estetica', 'lucycp@gmail.com', 'Melhores Cortes da região de Sorocaba', 0, 1, 12),
(13, 'Naomi Esteticas', 'naomi@gmail.com', 'A melhor maquiadora da região de sorocaba', 0, 0, 13),
(14, 'Diego Cortes', 'diego@gmail.com', 'Melhor corte da região', 0, 0, 14);

-- --------------------------------------------------------

--
-- Estrutura para tabela `servicos`
--

CREATE TABLE `servicos` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `duracao` time DEFAULT NULL,
  `id_profissional_fk` int(11) DEFAULT NULL,
  `id_categoria_fk` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `servicos`
--

INSERT INTO `servicos` (`id`, `nome`, `descricao`, `preco`, `duracao`, `id_profissional_fk`, `id_categoria_fk`) VALUES
(1, 'Corte Feminino', 'Corte e finalização', 50.00, '01:00:00', 1, 1),
(2, 'Manicure', 'Manicure completa', 35.00, '01:00:00', 2, 2),
(3, 'Limpeza de Pele', 'Limpeza facial profunda', 120.00, '01:00:00', 2, 3),
(4, 'Corte de cabelo', 'melhor corte da região', 35.00, '00:30:00', 3, 1),
(5, 'corte de cabelo 2', 'sla', 22.00, '22:00:00', 3, 3),
(6, 'Escova Progressiva', 'Alisamento térmico completo', 180.00, '02:00:00', 1, 6),
(7, 'Luzes', 'Luzes tradicionais no papel', 250.00, '03:00:00', 1, 6),
(8, 'Design de Sobrancelha', 'Modelagem com pinça', 40.00, '00:30:00', 13, 9),
(9, 'Maquiagem Profissional', 'Maquiagem para eventos', 200.00, '01:30:00', 12, 8),
(10, 'Barba Completa', 'Barba com toalha quente', 45.00, '00:40:00', 3, 5);

-- --------------------------------------------------------

--
-- Estrutura para tabela `telefones`
--

CREATE TABLE `telefones` (
  `id` int(11) NOT NULL,
  `ddd` varchar(255) NOT NULL,
  `digitos` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `telefones`
--

INSERT INTO `telefones` (`id`, `ddd`, `digitos`) VALUES
(1, '11', '99999-9999'),
(2, '21', '88888-8888'),
(3, '31', '77777-7777'),
(4, '15', '9999999999'),
(5, '15', '9999999'),
(6, '15', '1111111111'),
(7, '15', '98888-1111'),
(8, '15', '97777-2222'),
(9, '15', '5555555555');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tel_prof`
--

CREATE TABLE `tel_prof` (
  `id_profissional_fk` int(11) DEFAULT NULL,
  `id_telefone_fk` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `tel_prof`
--

INSERT INTO `tel_prof` (`id_profissional_fk`, `id_telefone_fk`) VALUES
(1, 2),
(2, 3),
(3, 4),
(12, 5),
(13, 6),
(1, 7),
(3, 8),
(14, 9);

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `agendamentos`
--
ALTER TABLE `agendamentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_cliente_fk` (`id_cliente_fk`),
  ADD KEY `id_servico_fk` (`id_servico_fk`),
  ADD KEY `idx_agendamentos_prof_data` (`id_servico_fk`,`data_hora`,`status`);

--
-- Índices de tabela `cadastros`
--
ALTER TABLE `cadastros`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Índices de tabela `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_cadastro_fk` (`id_cadastro_fk`),
  ADD KEY `id_telefone_fk` (`id_telefone_fk`);

--
-- Índices de tabela `enderecos`
--
ALTER TABLE `enderecos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_profissional_fk` (`id_profissional_fk`);

--
-- Índices de tabela `escalas`
--
ALTER TABLE `escalas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_profissional_fk` (`id_profissional_fk`),
  ADD KEY `idx_escala_prof_dia` (`id_profissional_fk`,`dia_semana`);

--
-- Índices de tabela `fisicos`
--
ALTER TABLE `fisicos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cpf` (`cpf`),
  ADD KEY `id_profissional_fk` (`id_profissional_fk`);

--
-- Índices de tabela `indisponibilidades`
--
ALTER TABLE `indisponibilidades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_profissional_fk` (`id_profissional_fk`);

--
-- Índices de tabela `juridicos`
--
ALTER TABLE `juridicos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cnpj` (`cnpj`),
  ADD KEY `id_profissional_fk` (`id_profissional_fk`);

--
-- Índices de tabela `portifolios`
--
ALTER TABLE `portifolios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_profissional_fk` (`id_profissional_fk`);

--
-- Índices de tabela `profissionais`
--
ALTER TABLE `profissionais`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_cadastro_fk` (`id_cadastro_fk`);

--
-- Índices de tabela `servicos`
--
ALTER TABLE `servicos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_profissional_fk` (`id_profissional_fk`),
  ADD KEY `id_categoria_fk` (`id_categoria_fk`);

--
-- Índices de tabela `telefones`
--
ALTER TABLE `telefones`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tel_prof`
--
ALTER TABLE `tel_prof`
  ADD KEY `id_profissional_fk` (`id_profissional_fk`),
  ADD KEY `id_telefone_fk` (`id_telefone_fk`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `agendamentos`
--
ALTER TABLE `agendamentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de tabela `cadastros`
--
ALTER TABLE `cadastros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de tabela `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `enderecos`
--
ALTER TABLE `enderecos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de tabela `escalas`
--
ALTER TABLE `escalas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de tabela `fisicos`
--
ALTER TABLE `fisicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `indisponibilidades`
--
ALTER TABLE `indisponibilidades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `juridicos`
--
ALTER TABLE `juridicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `portifolios`
--
ALTER TABLE `portifolios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `profissionais`
--
ALTER TABLE `profissionais`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `servicos`
--
ALTER TABLE `servicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `telefones`
--
ALTER TABLE `telefones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `agendamentos`
--
ALTER TABLE `agendamentos`
  ADD CONSTRAINT `agendamentos_ibfk_1` FOREIGN KEY (`id_cliente_fk`) REFERENCES `clientes` (`id`),
  ADD CONSTRAINT `agendamentos_ibfk_2` FOREIGN KEY (`id_servico_fk`) REFERENCES `servicos` (`id`);

--
-- Restrições para tabelas `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`id_cadastro_fk`) REFERENCES `cadastros` (`id`),
  ADD CONSTRAINT `clientes_ibfk_2` FOREIGN KEY (`id_telefone_fk`) REFERENCES `telefones` (`id`);

--
-- Restrições para tabelas `enderecos`
--
ALTER TABLE `enderecos`
  ADD CONSTRAINT `enderecos_ibfk_1` FOREIGN KEY (`id_profissional_fk`) REFERENCES `profissionais` (`id`);

--
-- Restrições para tabelas `escalas`
--
ALTER TABLE `escalas`
  ADD CONSTRAINT `escalas_ibfk_1` FOREIGN KEY (`id_profissional_fk`) REFERENCES `profissionais` (`id`);

--
-- Restrições para tabelas `fisicos`
--
ALTER TABLE `fisicos`
  ADD CONSTRAINT `fisicos_ibfk_1` FOREIGN KEY (`id_profissional_fk`) REFERENCES `profissionais` (`id`);

--
-- Restrições para tabelas `indisponibilidades`
--
ALTER TABLE `indisponibilidades`
  ADD CONSTRAINT `indisponibilidades_ibfk_1` FOREIGN KEY (`id_profissional_fk`) REFERENCES `profissionais` (`id`);

--
-- Restrições para tabelas `juridicos`
--
ALTER TABLE `juridicos`
  ADD CONSTRAINT `juridicos_ibfk_1` FOREIGN KEY (`id_profissional_fk`) REFERENCES `profissionais` (`id`);

--
-- Restrições para tabelas `portifolios`
--
ALTER TABLE `portifolios`
  ADD CONSTRAINT `portifolios_ibfk_1` FOREIGN KEY (`id_profissional_fk`) REFERENCES `profissionais` (`id`);

--
-- Restrições para tabelas `profissionais`
--
ALTER TABLE `profissionais`
  ADD CONSTRAINT `profissionais_ibfk_1` FOREIGN KEY (`id_cadastro_fk`) REFERENCES `cadastros` (`id`);

--
-- Restrições para tabelas `servicos`
--
ALTER TABLE `servicos`
  ADD CONSTRAINT `servicos_ibfk_1` FOREIGN KEY (`id_profissional_fk`) REFERENCES `profissionais` (`id`),
  ADD CONSTRAINT `servicos_ibfk_2` FOREIGN KEY (`id_categoria_fk`) REFERENCES `categorias` (`id`);

--
-- Restrições para tabelas `tel_prof`
--
ALTER TABLE `tel_prof`
  ADD CONSTRAINT `tel_prof_ibfk_1` FOREIGN KEY (`id_profissional_fk`) REFERENCES `profissionais` (`id`),
  ADD CONSTRAINT `tel_prof_ibfk_2` FOREIGN KEY (`id_telefone_fk`) REFERENCES `telefones` (`id`);
COMMIT;

ALTER TABLE profissionais ADD COLUMN foto_perfil VARCHAR(255) NULL;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
