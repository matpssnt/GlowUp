<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/IndisponibilidadeModel.php';
require_once __DIR__ . '/EscalaModel.php';

class AgendamentoModel
{
    private static function getDuracaoEmSegundos($duracao): int
    {
        if (empty($duracao)) {
            return 30 * 60; 
        }

        $duracao = trim((string) $duracao);
        if (preg_match('/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/', $duracao, $m)) {
            $h = (int) $m[1];
            $i = (int) $m[2];
            $s = isset($m[3]) ? (int) $m[3] : 0;
            return ($h * 3600) + ($i * 60) + $s;
        }

        if (is_numeric($duracao)) {
            return (int) $duracao * 60;
        }

        error_log("[WARNING] Duração inválida: '$duracao'. Usando fallback 30min");
        return 30 * 60;
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

        $stmt = $conn->prepare("SELECT id_profissional_fk, duracao FROM servicos WHERE id = ?");
        $stmt->bind_param("i", $idServico);
        $stmt->execute();
        $servico = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$servico)
            return [];

        $idProf = (int) $servico['id_profissional_fk'];
        $duracaoSeg = self::getDuracaoEmSegundos($servico['duracao']);

        $dataObj = new DateTime($data);
        $diaSemana = (int) $dataObj->format('w');

        $escala = EscalaModel::getEscalaDoProfissionalNoDia($idProf, $diaSemana);
        if (!$escala || empty($escala['inicio']) || empty($escala['fim'])) {
            return [];
        }

        $inicioDia = new DateTime($data . ' ' . (new DateTime($escala['inicio']))->format('H:i:s'));
        $fimDia = new DateTime($data . ' ' . (new DateTime($escala['fim']))->format('H:i:s'));

        // Ajuste para hoje: começa daqui +30min
        $agora = new DateTime();
        if ($dataObj->format('Y-m-d') === $agora->format('Y-m-d')) {
            $agora->modify('+30 minutes');
            if ($agora > $fimDia)
                return [];
            if ($agora > $inicioDia)
                $inicioDia = $agora;
        }

        $agendamentos = self::carregarAgendamentosDoDia($conn, $idProf, $data);
        $indisponibilidades = self::carregarIndisponibilidadesDoDia($conn, $idProf, $data);

        $slots = [];
        $cursor = clone $inicioDia;
        $step = 15 * 60; // intervalo de 15 minutos (ajuste se quiser)

        while ($cursor < $fimDia) {
            $slotFim = (clone $cursor)->modify("+{$duracaoSeg} seconds");

            if ($slotFim > $fimDia)
                break;

            if (!self::temConflito($cursor->getTimestamp(), $slotFim->getTimestamp(), $duracaoSeg, $agendamentos, $indisponibilidades)) {
                $slots[] = $cursor->format('Y-m-d H:i:s');
            }

            $cursor->modify("+{$step} seconds");
        }

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