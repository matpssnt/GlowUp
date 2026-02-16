<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/IndisponibilidadeModel.php';
require_once __DIR__ . '/EscalaModel.php';

class AgendamentoModel
{
    /**
     * Gera lista de horários disponíveis considerando intervalos e duração variável
     */
    public static function gerarHorariosDisponiveis(string $data, int $idServico): array
    {
        $conn = Database::getInstancia()->pegarConexao();

        // 1. Busca duração do serviço solicitado
        $stmt = $conn->prepare("SELECT id_profissional_fk, duracao FROM servicos WHERE id = ?");
        $stmt->bind_param("i", $idServico);
        $stmt->execute();
        $servico = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$servico) return [];

        $idProf = (int) $servico['id_profissional_fk'];
        $duracaoServicoMin = self::getDuracaoEmMinutos($servico['duracao']);

        // 2. Busca escala do profissional no dia
        $diaSemana = (int) (new DateTime($data))->format('w');
        $escalas = EscalaModel::getEscalaDoProfissionalNoDia($idProf, $diaSemana);
        if (empty($escalas)) return [];

        // 3. Mapeia Intervalos Ocupados (Agendamentos + Indisponibilidades + Passado)
        $intervalosOcupados = [];

        // Agendamentos existentes
        $agendamentos = self::carregarAgendamentosDoDia($conn, $idProf, $data);
        foreach ($agendamentos as $agd) {
            $inicioMin = self::hmsToMinutes((new DateTime($agd['data_hora']))->format('H:i:s'));
            $duracaoMin = self::getDuracaoEmMinutos($agd['duracao']);
            $intervalosOcupados[] = ['inicio' => $inicioMin, 'fim' => $inicioMin + $duracaoMin];
        }

        // Indisponibilidades manuais
        $indisponibilidades = self::carregarIndisponibilidadesDoDia($conn, $idProf, $data);
        foreach ($indisponibilidades as $ind) {
            $inicioMin = self::hmsToMinutes($ind['hora_inicio']);
            $fimMin = $ind['hora_fim'] ? self::hmsToMinutes($ind['hora_fim']) : 1440; // Até o fim do dia
            $intervalosOcupados[] = ['inicio' => $inicioMin, 'fim' => $fimMin];
        }

        // Bloqueio de horário passado (se for hoje)
        $hoje = new DateTime();
        $dataTarget = new DateTime($data);
        if ($dataTarget->format('Y-m-d') === $hoje->format('Y-m-d')) {
            $agoraMin = self::hmsToMinutes($hoje->format('H:i:s'));
            $margemSeguranca = 30; // 30 min de margem mínima para agendar
            $intervalosOcupados[] = ['inicio' => 0, 'fim' => $agoraMin + $margemSeguranca];
        }

        // Ordena ocupações pelo início
        usort($intervalosOcupados, fn($a, $b) => $a['inicio'] <=> $b['inicio']);

        // Unifica intervalos sobrepostos ou adjacentes
        $ocupacoesUnificadas = [];
        if (!empty($intervalosOcupados)) {
            $atual = $intervalosOcupados[0];
            foreach ($intervalosOcupados as $prox) {
                if ($prox['inicio'] <= $atual['fim']) {
                    $atual['fim'] = max($atual['fim'], $prox['fim']);
                } else {
                    $ocupacoesUnificadas[] = $atual;
                    $atual = $prox;
                }
            }
            $ocupacoesUnificadas[] = $atual;
        }

        // 4. Gera Slots Disponíveis
        $disponiveis = [];
        $step = 10; // Intervalo de 10 minutos entre as opções (flexibilidade total)

        foreach ($escalas as $escala) {
            $escalaInicio = self::hmsToMinutes((new DateTime($escala['inicio']))->format('H:i:s'));
            $escalaFim = self::hmsToMinutes((new DateTime($escala['fim']))->format('H:i:s'));

            // Percorre a escala em passos de $step minutos
            for ($time = $escalaInicio; $time < $escalaFim; $time += $step) {
                $slotInicio = $time;
                $slotFim = $time + $duracaoServicoMin;

                // O serviço deve terminar antes ou no horário de fim da escala
                if ($slotFim > $escalaFim) continue;

                // Verifica colisão com ocupações unificadas
                $livre = true;
                foreach ($ocupacoesUnificadas as $oc) {
                    // Colisão: (slotInicio < ocFim) E (slotFim > ocInicio)
                    if ($slotInicio < $oc['fim'] && $slotFim > $oc['inicio']) {
                        $livre = false;
                        break;
                    }
                }

                if ($livre) {
                    $disponiveis[] = sprintf('%s %s', $data, self::minutesToHms($slotInicio));
                }
            }
        }

        return array_unique($disponiveis);
    }

    // Helpers de Tempo (Minutos)
    private static function getDuracaoEmMinutos($duracao): int
    {
        if (empty($duracao)) return 30; // Fallback
        if (is_numeric($duracao)) return (int)$duracao; // Já está em minutos? (comum em alguns sistemas)
        
        $parts = explode(':', $duracao);
        $h = (int)($parts[0] ?? 0);
        $m = (int)($parts[1] ?? 0);
        return ($h * 60) + $m;
    }

    private static function hmsToMinutes(string $hms): int {
        $parts = explode(':', $hms);
        return ((int)($parts[0] ?? 0) * 60) + (int)($parts[1] ?? 0);
    }

    private static function minutesToHms(int $minutes): string {
        $h = floor($minutes / 60);
        $m = $minutes % 60;
        return sprintf('%02d:%02d:00', $h, $m);
    }

    private static function carregarAgendamentosDoDia($conn, int $idProf, string $data): array
    {
        $sql = "SELECT a.data_hora, s.duracao 
                FROM agendamentos a 
                JOIN servicos s ON a.id_servico_fk = s.id 
                WHERE s.id_profissional_fk = ? 
                  AND DATE(a.data_hora) = ? 
                  AND a.status = 'Agendado'";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("is", $idProf, $data);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $result;
    }

    private static function carregarIndisponibilidadesDoDia($conn, int $idProf, string $data): array
    {
        $sql = "SELECT hora_inicio, hora_fim 
                FROM indisponibilidades 
                WHERE id_profissional_fk = ? AND data = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("is", $idProf, $data);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $result;
    }

    // Mantido por compatibilidade com create(), mas não usado diretamente no gerarHorarios
    private static function temConflito(int $inicioTs, int $fimTs, int $duracaoSeg, array $agendamentos, array $indisponibilidades): bool
    {
        // Stub: mantido se outras partes do código chamarem, mas a lógica agora reside dentro de gerarHorariosDisponiveis
        return false; 
    }



    public static function update(int $id, array $data): bool
    {
        $conn = Database::getInstancia()->pegarConexao();

        // Campos permitidos para update (adicione mais se precisar)
        $allowedFields = ['status', 'data_hora'];
        $updates = [];
        $params = [];
        $types = '';

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $params[] = $data[$field];
                $types .= ($field === 'data_hora') ? 's' : 's'; // status e data_hora são string
            }
        }

        if (empty($updates)) {
            error_log("[WARNING] Nenhum campo válido para update no agendamento $id");
            return false;
        }

        $sql = "UPDATE agendamentos SET " . implode(', ', $updates) . " WHERE id = ?";
        $params[] = $id;
        $types .= 'i';

        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $result = $stmt->execute();
        $stmt->close();

        if (!$result) {
            error_log("[ERROR] Falha ao atualizar agendamento $id: " . $conn->error);
        }

        return $result;
    }

    /**
     * Cria um novo agendamento com verificação de disponibilidade
     */
    public static function create(array $data): array
    {
        $conn = Database::getInstancia()->pegarConexao();
        $conn->begin_transaction();

        try {
            if (!self::horarioEstaDisponivel($conn, $data)) {
                $conn->rollback();
                return [
                    'success' => false,
                    'message' => 'Horário indisponível, fora do expediente ou já ocupado'
                ];
            }

            $sql = "INSERT INTO agendamentos (data_hora, status, id_cliente_fk, id_servico_fk) 
                    VALUES (?, 'Agendado', ?, ?)";

            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sii", $data['data_hora'], $data['id_cliente_fk'], $data['id_servico_fk']);
            $success = $stmt->execute();
            $stmt->close();

            if ($success) {
                $conn->commit();
                return ['success' => true, 'message' => 'Agendamento criado com sucesso'];
            }

            $conn->rollback();
            error_log("[ERROR] Falha ao inserir agendamento: " . $conn->error);
            return ['success' => false, 'message' => 'Erro ao salvar agendamento no banco'];
        } catch (Exception $e) {
            $conn->rollback();
            error_log("Erro ao criar agendamento: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro interno no servidor'];
        }
    }



    public static function getAll(): array
    {
        $conn = Database::getInstancia()->pegarConexao();
        $result = $conn->query("SELECT * FROM agendamentos");
        return $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
    }
    /**
     * Verifica se o horário está realmente disponível (com lock)
     */
    private static function horarioEstaDisponivel($conn, array $data): bool
    {
        $logPrefix = "[DISPONIBILIDADE] ";

        try {
            error_log($logPrefix . "Verificando: " . json_encode($data));

            // 1. Busca serviço
            $stmt = $conn->prepare("SELECT id_profissional_fk, duracao FROM servicos WHERE id = ?");
            $stmt->bind_param("i", $data['id_servico_fk']);
            $stmt->execute();
            $servico = $stmt->get_result()->fetch_assoc();
            $stmt->close();

            if (!$servico) {
                error_log($logPrefix . "Serviço não encontrado: id = " . $data['id_servico_fk']);
                return false;
            }

            $idProf = (int) $servico['id_profissional_fk'];
            $duracaoSeg = self::getDuracaoEmSegundos($servico['duracao']);

            error_log($logPrefix . "Profissional ID: $idProf | Duração: {$duracaoSeg}s");

            // 2. Preparação de datas
            $inicio = new DateTime($data['data_hora']);
            $fim = (clone $inicio)->modify("+{$duracaoSeg} seconds");

            $inicioStr = $inicio->format('Y-m-d H:i:s');
            $fimStr = $fim->format('Y-m-d H:i:s');
            $dia = $inicio->format('Y-m-d');
            $horaInicio = $inicio->format('H:i:s');
            $diaSemana = (int) $inicio->format('w');

            error_log($logPrefix . "Dia da semana: $diaSemana | Horário: $horaInicio → $fimStr");

            // 3. Escala do profissional (agora trata múltiplos blocos)
            $escalas = EscalaModel::getEscalaDoProfissionalNoDia($idProf, $diaSemana);

            if (empty($escalas)) {
                error_log($logPrefix . "Sem nenhuma escala cadastrada para profissional $idProf no dia $diaSemana");
                return false;
            }

            // Verifica se o agendamento cabe inteiro em PELO MENOS UM bloco
            $encaixaEmAlgumBloco = false;

            foreach ($escalas as $escala) {
                $horaInicioEscala = (new DateTime($escala['inicio']))->format('H:i:s');
                $horaFimEscala = (new DateTime($escala['fim']))->format('H:i:s');

                error_log($logPrefix . "Verificando bloco: $horaInicioEscala até $horaFimEscala");

                // Verifica se início está dentro do bloco E o fim não ultrapassa
                if (
                    $horaInicio >= $horaInicioEscala && $horaInicio < $horaFimEscala &&
                    $fim->format('H:i:s') <= $horaFimEscala
                ) {
                    $encaixaEmAlgumBloco = true;
                    error_log($logPrefix . "Horário encaixa no bloco $horaInicioEscala - $horaFimEscala");
                    break;
                }
            }

            if (!$encaixaEmAlgumBloco) {
                error_log($logPrefix . "Horário não encaixa em nenhum bloco de escala do dia");
                return false;
            }

            // 4. Conflito com outros agendamentos
            $sql = "SELECT 1 FROM agendamentos a
                JOIN servicos s ON s.id = a.id_servico_fk
                WHERE s.id_profissional_fk = ?
                  AND a.status = 'Agendado'
                  AND a.data_hora < ?
                  AND DATE_ADD(a.data_hora, INTERVAL ? SECOND) > ?
                FOR UPDATE";

            $stmt = $conn->prepare($sql);
            $stmt->bind_param("isii", $idProf, $fimStr, $duracaoSeg, $inicioStr);
            $stmt->execute();
            $conflito = $stmt->get_result()->num_rows > 0;
            $stmt->close();

            if ($conflito) {
                error_log($logPrefix . "Conflito com agendamento existente");
                return false;
            }

            // 5. Indisponibilidades
            if (
                IndisponibilidadeModel::temConflitoComLock(
                    $conn,
                    $idProf,
                    $dia,
                    $horaInicio,
                    ceil($duracaoSeg / 60)
                )
            ) {
                error_log($logPrefix . "Conflito com período de indisponibilidade");
                return false;
            }

            error_log($logPrefix . "Horário LIBERADO");
            return true;

        } catch (Exception $e) {
            error_log($logPrefix . "EXCEÇÃO: " . $e->getMessage());
            return false;
        }
    }

    public static function cancelar(int $id): bool
    {
        $conn = Database::getInstancia()->pegarConexao();
        $stmt = $conn->prepare("UPDATE agendamentos SET status = 'Cancelado' WHERE id = ?");
        $stmt->bind_param("i", $id);
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    public static function getById(int $id): ?array
    {
        $conn = Database::getInstancia()->pegarConexao();
        $stmt = $conn->prepare("SELECT * FROM agendamentos WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return $result ?: null;
    }



    /**
     * Gera lista de horários disponíveis para um serviço em uma data
     * @return array de strings no formato 'Y-m-d H:i:s'
     */
    public static function gerarHorariosDisponiveis(string $data, int $idServico): array
    {
        $conn = Database::getInstancia()->pegarConexao();

        // 1. Busca serviço e duração
        $stmt = $conn->prepare("SELECT id_profissional_fk, duracao FROM servicos WHERE id = ?");
        $stmt->bind_param("i", $idServico);
        $stmt->execute();
        $servico = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$servico) return [];

        $idProf = (int) $servico['id_profissional_fk'];
        $duracaoSeg = self::getDuracaoEmSegundos($servico['duracao']);

        $dataObj = new DateTime($data);
        $diaSemana = (int) $dataObj->format('w');

        // 2. Busca escala do profissional (pode ter vários blocos como Manhã e Tarde)
        $blocosEscala = EscalaModel::getEscalaDoProfissionalNoDia($idProf, $diaSemana);
        if (empty($blocosEscala)) {
            return [];
        }

        // 3. Carrega compromissos do dia para checar conflitos
        $agendamentos = self::carregarAgendamentosDoDia($conn, $idProf, $data);
        $indisponibilidades = self::carregarIndisponibilidadesDoDia($conn, $idProf, $data);

        $slots = [];
        $agora = new DateTime();
        $step = 15 * 60; // Slots a cada 15 minutos

        // 4. Percorre cada bloco de horário de trabalho do profissional
        foreach ($blocosEscala as $escala) {
            if (empty($escala['inicio']) || empty($escala['fim'])) continue;

            $inicioDia = new DateTime($data . ' ' . (new DateTime($escala['inicio']))->format('H:i:s'));
            $fimDia = new DateTime($data . ' ' . (new DateTime($escala['fim']))->format('H:i:s'));

            // Ajuste para hoje: não permitir horários passados ou muito próximos (margem de 30min)
            if ($dataObj->format('Y-m-d') === $agora->format('Y-m-d')) {
                $margem = (clone $agora)->modify('+30 minutes');
                if ($margem > $inicioDia) {
                    $inicioDia = $margem;
                }
            }

            $cursor = clone $inicioDia;
            
            // Arredonda o cursor para o próximo múltiplo do step para ficar "bonito" (ex: 08:00, 08:15)
            $minutos = (int)$cursor->format('i');
            $resto = $minutos % 15;
            if ($resto > 0) {
                $cursor->modify('+' . (15 - $resto) . ' minutes')->setTime((int)$cursor->format('H'), (int)$cursor->format('i'), 0);
            }

            while ($cursor < $fimDia) {
                $slotFim = (clone $cursor)->modify("+{$duracaoSeg} seconds");

                // O serviço deve terminar dentro do bloco de escala atual
                if ($slotFim > $fimDia) break;

                // Verifica se não há conflito com agendamentos ou bloqueios manuais
                if (!self::temConflito($cursor->getTimestamp(), $slotFim->getTimestamp(), $duracaoSeg, $agendamentos, $indisponibilidades)) {
                    $slots[] = $cursor->format('Y-m-d H:i:s');
                }

                $cursor->modify("+{$step} seconds");
            }
        }

        // Remove duplicatas e ordena (caso blocos se sobreponham por erro de cadastro)
        $slots = array_unique($slots);
        sort($slots);

        return $slots;
    }

    private static function carregarAgendamentosDoDia($conn, int $idProf, string $data): array
    {
        $sql = "SELECT a.data_hora, s.duracao 
                FROM agendamentos a 
                JOIN servicos s ON a.id_servico_fk = s.id 
                WHERE s.id_profissional_fk = ? 
                  AND DATE(a.data_hora) = ? 
                  AND a.status = 'Agendado'";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("is", $idProf, $data);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $result;
    }

    private static function carregarIndisponibilidadesDoDia($conn, int $idProf, string $data): array
    {
        $sql = "SELECT hora_inicio, hora_fim 
                FROM indisponibilidades 
                WHERE id_profissional_fk = ? AND data = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("is", $idProf, $data);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $result;
    }

    private static function temConflito(int $inicioTs, int $fimTs, int $duracaoSeg, array $agendamentos, array $indisponibilidades): bool
    {
        foreach ($agendamentos as $ag) {
            $agInicio = strtotime($ag['data_hora']);
            $agDur = self::getDuracaoEmSegundos($ag['duracao']);
            $agFim = $agInicio + $agDur;

            if ($inicioTs < $agFim && $fimTs > $agInicio) {
                return true;
            }
        }

        foreach ($indisponibilidades as $ind) {
            $indInicio = strtotime($ind['data'] . ' ' . $ind['hora_inicio']);
            $indFim = $ind['hora_fim']
                ? strtotime($ind['data'] . ' ' . $ind['hora_fim'])
                : strtotime($ind['data'] . ' 23:59:59');

            if ($inicioTs < $indFim && $fimTs > $indInicio) {
                return true;
            }
        }

        return false;
    }
}