<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/IndisponibilidadeModel.php';
require_once __DIR__ . '/EscalaModel.php';

class AgendamentoModel
{
    private static function getEscalaDoDiaOuNull($idProfissional, $diaSemana)
    {
        $escala = EscalaModel::getEscalaDoProfissionalNoDia($idProfissional, $diaSemana);
        if (!$escala || empty($escala['inicio']) || empty($escala['fim'])) {
            return null;
        }
        return $escala;
    }

    private static function duracaoServicoEmSegundos($valorDuracao)
    {
        if (empty($valorDuracao)) return 1800;
        
        $s = (string) $valorDuracao;
        if (strpos($s, ' ') !== false) {
            $parts = explode(' ', $s);
            $s = end($parts);
        }
        $s = trim(substr($s, 0, 8));
        if (strlen($s) === 5) $s .= ':00';

        $t = DateTime::createFromFormat('H:i:s', $s);
        if (!$t) return 1800;

        return ($t->format('H') * 3600) + ($t->format('i') * 60) + $t->format('s');
    }

    public static function create($data)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        // Inicia transação para evitar race condition
        $conn->begin_transaction();

        try {
            // 1. Verifica se o horário está disponível (com lock)
            if (!self::horarioDisponivelComLock($conn, $data['data_hora'], $data['id_servico_fk'])) {
                $conn->rollback();
                return ['success' => false, 'message' => 'Horário indisponível ou já agendado'];
            }

            // 2. Insere o agendamento
            $sql = "INSERT INTO agendamentos (data_hora, status, id_cliente_fk, id_servico_fk) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $status = 'Agendado';
            $stmt->bind_param("ssii", $data['data_hora'], $status, $data['id_cliente_fk'], $data['id_servico_fk']);

            $success = $stmt->execute();
            $stmt->close();

            if ($success) {
                $conn->commit();
                return ['success' => true, 'message' => 'Agendamento criado com sucesso'];
            } else {
                $conn->rollback();
                return ['success' => false, 'message' => 'Erro ao criar agendamento'];
            }
        } catch (Exception $e) {
            $conn->rollback();
            error_log("Erro no agendamento: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro interno no servidor'];
        }
    }

    private static function horarioDisponivelComLock($conn, $dataHora, $idServico)
    {
        try {
            // Busca serviço com duração e profissional
            $sql = "SELECT s.id_profissional_fk, s.duracao 
                    FROM servicos s 
                    WHERE s.id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $idServico);
            $stmt->execute();
            $result = $stmt->get_result();
            $servico = $result->fetch_assoc();
            $stmt->close();

            if (!$servico) {
                error_log("Serviço não encontrado: ID $idServico");
                return false;
            }

            $idProfissional = $servico['id_profissional_fk'];

            $duracaoSegundos = self::duracaoServicoEmSegundos($servico['duracao'] ?? null);

            // Converte data_hora para objetos DateTime
            $inicio = new DateTime($dataHora);
            $fim = clone $inicio;
            $fim->modify("+{$duracaoSegundos} seconds");

            $inicioStr = $inicio->format('Y-m-d H:i:s');
            $fimStr = $fim->format('Y-m-d H:i:s');
            $data = $inicio->format('Y-m-d');
            $horaInicio = $inicio->format('H:i:s');
            $diaSemana = $inicio->format('w'); // 0=Domingo, 1=Segunda...

            error_log("Verificando disponibilidade: Profissional $idProfissional, Dia $diaSemana, Hora $horaInicio");

            // Verifica escala do profissional. Sem escala = fechado.
            $escala = self::getEscalaDoDiaOuNull($idProfissional, (int) $diaSemana);
            if (!$escala) {
                error_log("Fechado: sem escala para profissional $idProfissional no dia $diaSemana");
                return false;
            }

            // Verifica se está dentro do horário de trabalho
            $horaInicioEscala = (new DateTime($escala['inicio']))->format('H:i:s');
            $horaFimEscala = (new DateTime($escala['fim']))->format('H:i:s');
            if ($horaInicio < $horaInicioEscala || $horaInicio >= $horaFimEscala) {
                error_log("Fora do horário de trabalho: $horaInicio não está entre $horaInicioEscala e $horaFimEscala");
                return false;
            }

            // Também garante que o serviço termina dentro do horário de trabalho
            $horaFim = $fim->format('H:i:s');
            if ($horaFim > $horaFimEscala) {
                error_log("Serviço termina após o fechamento: $horaFim > $horaFimEscala");
                return false;
            }

            // Verifica agendamentos existentes (ajustado para prevenir sobreposição exata)
            $sql = "SELECT a.id
                    FROM agendamentos a
                    JOIN servicos se ON se.id = a.id_servico_fk
                    WHERE se.id_profissional_fk = ?
                      AND a.status = 'Agendado'
                      AND a.data_hora < ?
                      AND DATE_ADD(
                            a.data_hora,
                            INTERVAL GREATEST(IFNULL(TIME_TO_SEC(TIME(se.duracao)), 0), 1800) SECOND
                          ) > ?
                    FOR UPDATE";

            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iss", $idProfissional, $fimStr, $inicioStr);
            $stmt->execute();
            $result = $stmt->get_result();
            $conflito = $result->num_rows > 0;
            $stmt->close();

            if ($conflito) {
                error_log("Conflito de horário encontrado");
                return false;
            }

            // Verifica indisponibilidades (bloqueios manuais)
            require_once __DIR__ . '/IndisponibilidadeModel.php';
            $duracaoMinutos = ceil($duracaoSegundos / 60);
            if (IndisponibilidadeModel::temConflitoComLock($conn, $idProfissional, $data, $horaInicio, $duracaoMinutos)) {
                error_log("Horário bloqueado por indisponibilidade manual");
                return false;
            }

            return true;

        } catch (Exception $e) {
            error_log("Erro em horarioDisponivelComLock: " . $e->getMessage());
            return false;
        }
    }

    public static function cancelar($id)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "UPDATE agendamentos SET status = 'Cancelado' WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $result = $stmt->execute();
        $stmt->close();

        return $result;
    }

    public static function gerarHorariosDisponiveis($data, $idServico)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        try {
            $dataObj = new DateTime($data);
        } catch (Exception $e) {
            return [];
        }

        $sql = "SELECT id_profissional_fk, duracao FROM servicos WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $idServico);
        $stmt->execute();
        $servico = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$servico) return [];

        $idProfissional = (int) $servico['id_profissional_fk'];
        $duracaoSegundos = self::duracaoServicoEmSegundos($servico['duracao'] ?? null);

        $diaSemana = (int) $dataObj->format('w');
        $escala = self::getEscalaDoDiaOuNull($idProfissional, $diaSemana);
        if (!$escala) return [];

        $inicioEscala = (new DateTime($escala['inicio']))->format('H:i:s');
        $fimEscala = (new DateTime($escala['fim']))->format('H:i:s');
        $inicioDia = new DateTime($dataObj->format('Y-m-d') . ' ' . $inicioEscala);
        $fimDia = new DateTime($dataObj->format('Y-m-d') . ' ' . $fimEscala);

        // --- Otimização: Busca todos os agendamentos do dia de uma vez ---
        $sqlAgnd = "SELECT a.data_hora, se.duracao 
                    FROM agendamentos a 
                    JOIN servicos se ON se.id = a.id_servico_fk 
                    WHERE se.id_profissional_fk = ? AND a.status = 'Agendado' AND DATE(a.data_hora) = ?";
        $stmtAgnd = $conn->prepare($sqlAgnd);
        $stmtAgnd->bind_param("is", $idProfissional, $data);
        $stmtAgnd->execute();
        $agendamentos = $stmtAgnd->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmtAgnd->close();

        // --- Otimização: Busca todas as indisponibilidades do dia ---
        $sqlIndisp = "SELECT hora_inicio, hora_fim FROM indisponibilidades WHERE id_profissional_fk = ? AND data = ?";
        $stmtIndisp = $conn->prepare($sqlIndisp);
        $stmtIndisp->bind_param("is", $idProfissional, $data);
        $stmtIndisp->execute();
        $indisponibilidades = $stmtIndisp->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmtIndisp->close();

        $slots = [];
        $cursor = clone $inicioDia;
        
        // Se a data for hoje, começa a partir do horário atual (+30 min de folga)
        $hoje = new DateTime();
        if ($dataObj->format('Y-m-d') === $hoje->format('Y-m-d')) {
            $agoraFolga = clone $hoje;
            $agoraFolga->modify('+30 minutes');
            if ($cursor < $agoraFolga) {
                $cursor = $agoraFolga;
            }
        }

        $intervaloSegundos = 300; // 5 min de intervalo para maior flexibilidade

        while (true) {
            $fimSlot = clone $cursor;
            $fimSlot->modify('+' . $duracaoSegundos . ' seconds');

            if ($fimSlot > $fimDia) break;

            $inicioSlotTS = $cursor->getTimestamp();
            $fimSlotTS = $fimSlot->getTimestamp();
            $conflito = false;

            // 1. Verifica conflitos com agendamentos em memória
            foreach ($agendamentos as $ag) {
                $agInicioTS = strtotime($ag['data_hora']);
                $agDurSec = self::duracaoServicoEmSegundos($ag['duracao']);
                $agFimTS = $agInicioTS + $agDurSec;
                
                // Conflito se o slot começa antes do fim do agendamento E termina após o início
                if ($inicioSlotTS < $agFimTS && $fimSlotTS > $agInicioTS) {
                    $conflito = true;
                    break;
                }
            }

            if ($conflito) {
                $cursor->modify('+' . $intervaloSegundos . ' seconds');
                continue;
            }

            // 2. Verifica conflitos com indisponibilidades em memória
            foreach ($indisponibilidades as $ind) {
                if ($ind['hora_inicio'] === null) { // Bloqueio o dia todo
                    $conflito = true;
                    break;
                }
                $indInicioTS = strtotime($data . ' ' . $ind['hora_inicio']);
                $indFimTS = $ind['hora_fim'] ? strtotime($data . ' ' . $ind['hora_fim']) : strtotime($data . ' 23:59:59');

                if ($inicioSlotTS < $indFimTS && $fimSlotTS > $indInicioTS) {
                    $conflito = true;
                    break;
                }
            }

            if (!$conflito) {
                $slots[] = $cursor->format('H:i');
            }

            $cursor->modify('+' . $intervaloSegundos . ' seconds');
        }

        return $slots;
    }

    public static function getById($id)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "
            SELECT 
                a.id,
                a.data_hora,
                a.status,
                a.id_cliente_fk,
                a.id_servico_fk,
                s.nome AS nome_servico,
                s.preco,
                s.duracao,
                p.nome AS nome_profissional,
                c.nome AS nome_cliente
            FROM agendamentos a
            JOIN servicos s ON s.id = a.id_servico_fk
            JOIN profissionais p ON p.id = s.id_profissional_fk
            JOIN clientes c ON c.id = a.id_cliente_fk
            WHERE a.id = ?
        ";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $agendamento = $result->fetch_assoc();
        $stmt->close();

        return $agendamento ?: false;
    }

    public static function getAll()
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "
            SELECT 
                a.id,
                a.data_hora,
                a.status,
                a.id_cliente_fk,
                a.id_servico_fk,
                s.id_profissional_fk,
                s.nome AS nome_servico,
                s.preco,
                s.duracao,
                p.nome AS nome_profissional,
                c.nome AS nome_cliente
            FROM agendamentos a
            JOIN servicos s ON s.id = a.id_servico_fk
            JOIN profissionais p ON p.id = s.id_profissional_fk
            JOIN clientes c ON c.id = a.id_cliente_fk
            ORDER BY a.data_hora ASC
        ";

        $result = $conn->query($sql);

        if ($result && $result->num_rows > 0) {
            return $result->fetch_all(MYSQLI_ASSOC);
        }

        return [];
    }

    // Outras funções truncadas no prompt original permanecem as mesmas
}
?>