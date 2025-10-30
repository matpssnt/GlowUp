-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 08/10/2025 às 19:12
-- Versão do servidor: 10.4.28-MariaDB
-- Versão do PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `glowup`;

USE glowup;


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
  `id_servico_fk` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `agendamentos`
--

INSERT INTO `agendamentos` (`id`, `data_hora`, `status`, `id_cliente_fk`, `id_servico_fk`) VALUES
(1, '2025-10-10 14:00:00', 'Agendado', 1, 1),
(2, '2025-10-11 10:00:00', 'Agendado', 1, 2);

-- --------------------------------------------------------

--
-- Estrutura para tabela `cadastros`
--

CREATE TABLE `cadastros` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(50) NOT NULL,
  `isProfissional` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `cadastros`
--

INSERT INTO `cadastros` (`id`, `nome`, `email`, `senha`, `isProfissional`) VALUES
(1, 'João Silva', 'joao@email.com', 'senha123', 0),
(2, 'Maria Santos', 'maria@email.com', 'senha456', 1),
(3, 'Empresa Beauty', 'beauty@email.com', 'senha789', 1);

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
(3, 'Estética');

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
(1, 'João Silva', 1, 1);

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
(2, 'Avenida Principal', '456', '04567-890', 'Jardins', 'Rio de Janeiro', 'RJ', 'Loja 2', 2);

-- --------------------------------------------------------

--
-- Estrutura para tabela `escalas`
--

CREATE TABLE `escalas` (
  `id` int(11) NOT NULL,
  `inicio` timestamp NOT NULL DEFAULT current_timestamp(),
  `fim` timestamp NOT NULL DEFAULT current_timestamp(),
  `dia_semana` int(11) NOT NULL,
  `id_profissional_fk` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `escalas`
--

INSERT INTO `escalas` (`id`, `inicio`, `fim`, `dia_semana`, `id_profissional_fk`) VALUES
(1, '2025-10-08 11:00:00', '2025-10-08 20:00:00', 1, 1),
(2, '2025-10-08 12:00:00', '2025-10-08 21:00:00', 1, 2);

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
(1, '123.456.789-00', 1);

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
(1, '12.345.678/0001-90', 2);

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
(3, 'foto3.jpg', 2);

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
(2, 'Empresa Beauty', 'beauty@email.com', 'Salão de beleza completo', 1, 1, 3);

-- --------------------------------------------------------

--
-- Estrutura para tabela `servicos`
--

CREATE TABLE `servicos` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `duracao` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_profissional_fk` int(11) DEFAULT NULL,
  `id_categoria_fk` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `servicos`
--

INSERT INTO `servicos` (`id`, `nome`, `descricao`, `preco`, `duracao`, `id_profissional_fk`, `id_categoria_fk`) VALUES
(1, 'Corte Feminino', 'Corte e finalização', 50.00, '0000-00-00 00:00:00', 1, 1),
(2, 'Manicure', 'Manicure completa', 35.00, '0000-00-00 00:00:00', 2, 2),
(3, 'Limpeza de Pele', 'Limpeza facial profunda', 120.00, '0000-00-00 00:00:00', 2, 3);

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
(3, '31', '77777-7777');

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
(2, 3);

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `agendamentos`
--
ALTER TABLE `agendamentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_cliente_fk` (`id_cliente_fk`),
  ADD KEY `id_servico_fk` (`id_servico_fk`);

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
  ADD KEY `id_profissional_fk` (`id_profissional_fk`);

--
-- Índices de tabela `fisicos`
--
ALTER TABLE `fisicos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cpf` (`cpf`),
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `cadastros`
--
ALTER TABLE `cadastros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `enderecos`
--
ALTER TABLE `enderecos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `escalas`
--
ALTER TABLE `escalas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `fisicos`
--
ALTER TABLE `fisicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `juridicos`
--
ALTER TABLE `juridicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `portifolios`
--
ALTER TABLE `portifolios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `profissionais`
--
ALTER TABLE `profissionais`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `servicos`
--
ALTER TABLE `servicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `telefones`
--
ALTER TABLE `telefones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
