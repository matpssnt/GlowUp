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
        if (empty($valorDuracao)) {
            return 1800; // 30min
        }

        $s = (string) $valorDuracao;
        // Pode vir como 'YYYY-MM-DD HH:MM:SS'
        if (strpos($s, ' ') !== false) {
            $parts = explode(' ', $s);
            $s = $parts[1] ?? $s;
        }
        // Espera HH:MM ou HH:MM:SS
        $s = substr($s, 0, 8);
        if (strlen($s) === 5) {
            $s .= ':00';
        }

        $t = DateTime::createFromFormat('H:i:s', $s);
        if (!$t) {
            return 1800;
        }

        return ((int) $t->format('H')) * 3600 + ((int) $t->format('i')) * 60 + ((int) $t->format('s'));
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

            // Verifica agendamentos existentes (simplificado)
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
            }

            return !$conflito;

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

    // Função para gerar horários disponíveis (mantida, mas pode ser otimizada com cache se necessário)
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

        if (!$servico) {
            return [];
        }

        $idProfissional = (int) $servico['id_profissional_fk'];
        $duracaoSegundos = self::duracaoServicoEmSegundos($servico['duracao'] ?? null);

        $diaSemana = (int) $dataObj->format('w');
        $escala = self::getEscalaDoDiaOuNull($idProfissional, $diaSemana);
        if (!$escala) {
            return [];
        }

        $inicioEscala = (new DateTime($escala['inicio']))->format('H:i:s');
        $fimEscala = (new DateTime($escala['fim']))->format('H:i:s');

        $inicioDia = new DateTime($dataObj->format('Y-m-d') . ' ' . $inicioEscala);
        $fimDia = new DateTime($dataObj->format('Y-m-d') . ' ' . $fimEscala);

        $slots = [];
        $cursor = clone $inicioDia;
        // Sugestões a cada 5 minutos para suportar durações como 28min
        $intervaloSegundos = 300;

        while (true) {
            $fimSlot = clone $cursor;
            $fimSlot->modify('+' . $duracaoSegundos . ' seconds');

            if ($fimSlot > $fimDia) {
                break;
            }

            $inicioStr = $cursor->format('Y-m-d H:i:s');
            $fimStr = $fimSlot->format('Y-m-d H:i:s');

            // Verifica conflitos de agendamento
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
                    LIMIT 1";

            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iss", $idProfissional, $fimStr, $inicioStr);
            $stmt->execute();
            $result = $stmt->get_result();
            $conflito = $result->num_rows > 0;
            $stmt->close();

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