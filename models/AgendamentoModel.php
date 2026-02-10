<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/IndisponibilidadeModel.php';
require_once __DIR__ . '/EscalaModel.php';

class AgendamentoModel
{
    /**
     * Converte duração do banco (TIME ou string) para segundos
     */
    private static function getDuracaoEmSegundos($duracao): int
    {
        if (empty($duracao)) {
            return 30 * 60; // 30 minutos padrão
        }

        // Caso venha como string 'HH:MM:SS' ou 'HH:MM'
        $duracao = trim((string)$duracao);
        if (preg_match('/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/', $duracao, $m)) {
            $h = (int)$m[1];
            $i = (int)$m[2];
            $s = isset($m[3]) ? (int)$m[3] : 0;
            return ($h * 3600) + ($i * 60) + $s;
        }

        // Último recurso: minutos inteiros
        if (is_numeric($duracao)) {
            return (int)$duracao * 60;
        }

        return 30 * 60; // fallback
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
                return ['success' => false, 'message' => 'Horário indisponível ou já ocupado'];
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
            return ['success' => false, 'message' => 'Erro ao salvar agendamento'];
        } catch (Exception $e) {
            $conn->rollback();
            error_log("Erro ao criar agendamento: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro interno no servidor'];
        }
    }

    /**
     * Verifica se o horário está realmente disponível (com lock)
     */
    private static function horarioEstaDisponivel($conn, array $data): bool
    {
        try {
            // Busca dados do serviço
            $stmt = $conn->prepare("SELECT id_profissional_fk, duracao FROM servicos WHERE id = ?");
            $stmt->bind_param("i", $data['id_servico_fk']);
            $stmt->execute();
            $servico = $stmt->get_result()->fetch_assoc();
            $stmt->close();

            if (!$servico) {
                return false;
            }

            $idProf = (int)$servico['id_profissional_fk'];
            $duracaoSeg = self::getDuracaoEmSegundos($servico['duracao']);

            $inicio = new DateTime($data['data_hora']);
            $fim    = (clone $inicio)->modify("+{$duracaoSeg} seconds");

            $inicioStr = $inicio->format('Y-m-d H:i:s');
            $fimStr    = $fim->format('Y-m-d H:i:s');
            $dia       = $inicio->format('Y-m-d');
            $horaInicio = $inicio->format('H:i:s');
            $diaSemana  = (int)$inicio->format('w');

            // Verifica escala
            $escala = EscalaModel::getEscalaDoProfissionalNoDia($idProf, $diaSemana);
            if (!$escala || empty($escala['inicio']) || empty($escala['fim'])) {
                return false;
            }

            $horaInicioEscala = (new DateTime($escala['inicio']))->format('H:i:s');
            $horaFimEscala    = (new DateTime($escala['fim']))->format('H:i:s');

            if ($horaInicio < $horaInicioEscala || $horaInicio >= $horaFimEscala) {
                return false;
            }

            if ((clone $fim)->format('H:i:s') > $horaFimEscala) {
                return false;
            }

            // Verifica conflito com outros agendamentos (com lock)
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
                return false;
            }

            // Verifica indisponibilidades
            if (IndisponibilidadeModel::temConflitoComLock(
                $conn,
                $idProf,
                $dia,
                $horaInicio,
                ceil($duracaoSeg / 60)
            )) {
                return false;
            }

            return true;
        } catch (Exception $e) {
            error_log("Erro na verificação de disponibilidade: " . $e->getMessage());
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

        if (!$servico) return [];

        $idProf = (int)$servico['id_profissional_fk'];
        $duracaoSeg = self::getDuracaoEmSegundos($servico['duracao']);

        $dataObj   = new DateTime($data);
        $diaSemana = (int)$dataObj->format('w');

        $escala = EscalaModel::getEscalaDoProfissionalNoDia($idProf, $diaSemana);
        if (!$escala || empty($escala['inicio']) || empty($escala['fim'])) {
            return [];
        }

        $inicioDia = new DateTime($data . ' ' . (new DateTime($escala['inicio']))->format('H:i:s'));
        $fimDia    = new DateTime($data . ' ' . (new DateTime($escala['fim']))->format('H:i:s'));

        // Ajuste para hoje: começa daqui +30min
        $agora = new DateTime();
        if ($dataObj->format('Y-m-d') === $agora->format('Y-m-d')) {
            $agora->modify('+30 minutes');
            if ($agora > $fimDia) return [];
            if ($agora > $inicioDia) $inicioDia = $agora;
        }

        $agendamentos     = self::carregarAgendamentosDoDia($conn, $idProf, $data);
        $indisponibilidades = self::carregarIndisponibilidadesDoDia($conn, $idProf, $data);

        $slots  = [];
        $cursor = clone $inicioDia;
        $step   = 15 * 60; // intervalo de 15 minutos (ajuste se quiser)

        while ($cursor < $fimDia) {
            $slotFim = (clone $cursor)->modify("+{$duracaoSeg} seconds");

            if ($slotFim > $fimDia) break;

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
            $agDur    = self::getDuracaoEmSegundos($ag['duracao']);
            $agFim    = $agInicio + $agDur;

            if ($inicioTs < $agFim && $fimTs > $agInicio) {
                return true;
            }
        }

        foreach ($indisponibilidades as $ind) {
            $indInicio = strtotime($ind['data'] . ' ' . $ind['hora_inicio']);
            $indFim    = $ind['hora_fim'] 
                ? strtotime($ind['data'] . ' ' . $ind['hora_fim']) 
                : strtotime($ind['data'] . ' 23:59:59');

            if ($inicioTs < $indFim && $fimTs > $indInicio) {
                return true;
            }
        }

        return false;
    }

    // Mantém as funções getById e getAll como estavam (ou atualize se quiser)
    // ...
}