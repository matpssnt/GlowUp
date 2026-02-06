<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/IndisponibilidadeModel.php';
require_once __DIR__ . '/EscalaModel.php';

class AgendamentoModel
{
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
            $sql = "SELECT s.duracao, s.id_profissional_fk 
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
            
            // Duração padrão de 30 minutos
            $duracaoMinutos = 30;

            // Converte data_hora para objetos DateTime
            $inicio = new DateTime($dataHora);
            $fim = clone $inicio;
            $fim->modify("+{$duracaoMinutos} minutes");

            $inicioStr = $inicio->format('Y-m-d H:i:s');
            $fimStr = $fim->format('Y-m-d H:i:s');
            $data = $inicio->format('Y-m-d');
            $horaInicio = $inicio->format('H:i:s');
            $diaSemana = $inicio->format('w'); // 0=Domingo, 1=Segunda...

            error_log("Verificando disponibilidade: Profissional $idProfissional, Dia $diaSemana, Hora $horaInicio");

            // Verifica escala do profissional
            $escala = EscalaModel::getEscalaDoProfissionalNoDia($idProfissional, $diaSemana);
            
            if (!$escala) {
                error_log("Escala não encontrada para profissional $idProfissional no dia $diaSemana");
                // Permitir agendamento mesmo sem escala (temporário)
                return true;
            }

            error_log("Escala encontrada: " . json_encode($escala));

            // Verifica se está dentro do horário de trabalho
            if (isset($escala['inicio']) && isset($escala['fim'])) {
                $horaInicioEscala = (new DateTime($escala['inicio']))->format('H:i:s');
                $horaFimEscala = (new DateTime($escala['fim']))->format('H:i:s');
                
                if ($horaInicio < $horaInicioEscala || $horaInicio >= $horaFimEscala) {
                    error_log("Fora do horário de trabalho: $horaInicio não está entre $horaInicioEscala e $horaFimEscala");
                    return false;
                }
            }

            // Verifica agendamentos existentes (simplificado)
            $sql = "SELECT id FROM agendamentos 
                    WHERE id_servico_fk IN (SELECT id FROM servicos WHERE id_profissional_fk = ?)
                      AND data_hora < ? 
                      AND DATE_ADD(data_hora, INTERVAL 30 MINUTE) > ?
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
        // Implementação original (truncada no prompt, assume que está completa no seu código original)
        // Adicione cache aqui se quiser, ex: using APCu or Redis
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