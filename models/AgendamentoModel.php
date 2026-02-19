<?php

require_once __DIR__ . '/../config/database.php';

class AgendamentoModel
{
    const STATUS_AGENDADO = 'Agendado';
    const STATUS_CANCELADO = 'cancelado';

    /**
     * Cria um novo agendamento após todas as validações
     *
     * @param string $dataHora     Formato: 'YYYY-MM-DD HH:MM:SS'
     * @param int    $idCliente
     * @param int    $idServico
     * @return array ['success' => bool, 'id' => int, 'message' => string]
     * @throws Exception
     */
    
        public static function create(array $dados): array
    {
        // Extrai e valida campos
        $dataHora = trim($dados['data_hora'] ?? '');
        if (empty($dataHora)) {
            throw new Exception('data_hora é obrigatório');
        }

        $idCliente = (int)($dados['id_cliente_fk'] ?? 0);
        $idServico = (int)($dados['id_servico_fk'] ?? 0);  // ← corrigido aqui!

        if ($idCliente <= 0 || $idServico <= 0) {
            throw new Exception('IDs de cliente e serviço são obrigatórios e devem ser maiores que zero');
        }

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

    /**
     * Cria um novo agendamento
     */
    public static function create($data)
    {
        $conn = Database::getInstancia()->pegarConexao();
        
        $dataHora = $data['data_hora'];
        $idCliente = $data['id_cliente_fk'];
        $idServico = $data['id_servico_fk'];

        // 2. Valida formato e data futura
        date_default_timezone_set('America/Sao_Paulo');

        $dt = DateTime::createFromFormat('Y-m-d H:i:s', $dataHora);
        if ($dt === false) {
            throw new Exception('Formato de data/hora inválido. Use exatamente: Y-m-d H:i:s');
        }

        if ($dt->getTimestamp() < time()) {
            throw new Exception('Não é permitido agendar para o passado');
        }

        self::validarCliente($idCliente, $conn);

        $servico = self::validarServico($idServico, $conn);
        $idProfissional = (int) ($servico['id_profissional_fk'] ?? 0);

        if ($idProfissional <= 0) {
            throw new Exception('Este serviço não está associado a nenhum profissional');
        }

        $conflitos = self::checagemConflitos($idProfissional, $dataHora, $conn);
        if ($conflitos > 0) {
            throw new Exception('Horário indisponível: profissional já tem agendamento próximo nesse período');
        }

        // INSERT
        $sql = "INSERT INTO agendamentos 
                (data_hora, status, id_cliente_fk, id_servico_fk) 
                VALUES (?, ?, ?, ?)";

        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            error_log("[ERRO prepare INSERT] " . $conn->error);
            throw new Exception('Erro interno ao preparar agendamento');
        }

        $status = self::STATUS_AGENDADO;
        $stmt->bind_param("ssii", $dataHora, $status, $idCliente, $idServico);

        if (!$stmt->execute()) {
            $erro = $stmt->error;
            $stmt->close();
            throw new Exception('Falha ao salvar agendamento: ' . $erro);
        }

        $idInserido = (int) $conn->insert_id;
        $stmt->close();

        error_log("[SUCESSO] Agendamento ID $idInserido criado para cliente $idCliente, serviço $idServico");

        return [
            'success' => true,
            'id'      => $idInserido,
            'message' => 'Agendamento criado com sucesso'
        ];
    }

    /**
     * Gera lista de horários disponíveis para um serviço em uma data específica
     *
     * @param string $data      Formato: YYYY-MM-DD
     * @param int    $idServico
     * @return array Lista de strings no formato 'YYYY-MM-DD HH:MM:SS'
     */
    public static function gerarHorariosDisponiveis(string $data, int $idServico): array
    {
        $conn = Database::getInstancia()->pegarConexao();
        
        $sql = "SELECT a.*, s.nome as servico_nome, c.nome as cliente_nome, p.nome as profissional_nome
                FROM agendamentos a
                LEFT JOIN servicos s ON a.id_servico_fk = s.id
                LEFT JOIN clientes c ON a.id_cliente_fk = c.id
                LEFT JOIN profissionais p ON s.id_profissional_fk = p.id";
        
        if ($idCliente) {
            $sql .= " WHERE a.id_cliente_fk = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $idCliente);
        } else {
            $stmt = $conn->prepare($sql);
        }
        
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        
        return $result;
    }

    /**
     * Atualiza um agendamento
     */
    public static function update(int $id, array $data): bool
    {
        // Valida se o ID existe na tabela de clientes (necessário pois a FK em agendamentos referencia clientes)
        $sql = "SELECT id FROM clientes WHERE id = ?";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            error_log("[ERRO prepare validarCliente] SQL: $sql | MySQL Error: " . $conn->error);
            throw new Exception('Erro interno ao validar cliente: ' . $conn->error);
        }

        $conn = Database::getInstancia()->pegarConexao();

        $sets = [];
        $params = [];
        $types = '';

        foreach ($data as $campo => $valor) {
            $sets[] = "$campo = ?";
            $params[] = $valor;
            $types .= 's';
        }

        $sql = "UPDATE agendamentos SET " . implode(', ', $sets) . " WHERE id = ?";
        $params[] = $id;
        $types .= 'i';

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            return false;
        }

        $stmt->bind_param($types, ...$params);
        $result = $stmt->execute();
        $stmt->close();

        return $result;
    }

    /**
     * Cancela agendamento (soft delete via status)
     */
    public static function cancelar(int $id): bool
    {
        return self::update($id, ['status' => self::STATUS_CANCELADO]);
    }

    /**
     * Busca agendamento por ID
     */
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
     * Retorna horários ocupados de um profissional em determinada data
     */
    public static function getHorariosOcupados(int $idProfissional, string $data): array
    {
        $conn = Database::getInstancia()->pegarConexao();

        $sql = "
            SELECT a.data_hora
            FROM agendamentos a
            INNER JOIN servicos s ON a.id_servico_fk = s.id
            WHERE s.id_profissional_fk = ?
              AND DATE(a.data_hora) = ?
              AND a.status != ?
        ";

        $stmt = $conn->prepare($sql);
        $statusCancelado = self::STATUS_CANCELADO;
        $stmt->bind_param("iss", $idProfissional, $data, $statusCancelado);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return array_column($result, 'data_hora');
    }

    // ────────────────────────────────────────────────
    //               MÉTODOS PRIVADOS / HELPERS
    // ────────────────────────────────────────────────

    private static function validarCliente(int $id, mysqli $conn): array
    {
        $stmt = $conn->prepare("SELECT id FROM clientes WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$result) {
            throw new Exception('Cliente não encontrado');
        }

        return $result;
    }

    private static function validarServico(int $id, mysqli $conn): array
    {
        $stmt = $conn->prepare("SELECT * FROM servicos WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$result) {
            throw new Exception('Serviço não encontrado');
        }

        return $result;
    }

    private static function checagemConflitos(int $idProf, string $dataHora, mysqli $conn): int
    {
        $dia = substr($dataHora, 0, 10);
        $inicio = date('Y-m-d H:i:s', strtotime($dataHora . ' -30 minutes'));
        $fim    = date('Y-m-d H:i:s', strtotime($dataHora . ' +30 minutes'));

        $sql = "
            SELECT COUNT(*) as count 
            FROM agendamentos a
            INNER JOIN servicos s ON a.id_servico_fk = s.id
            WHERE s.id_profissional_fk = ?
              AND DATE(a.data_hora) = ?
              AND a.data_hora BETWEEN ? AND ?
              AND a.status != ?
        ";

        $stmt = $conn->prepare($sql);
        $statusCancelado = self::STATUS_CANCELADO;
        $stmt->bind_param("issss", $idProf, $dia, $inicio, $fim, $statusCancelado);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return (int)($row['count'] ?? 0);
    }

    public static function getHorariosOcupados($idProfissional, $data)
{
    $conn = Database::getInstancia()->pegarConexao();
    $sql = "
        SELECT a.data_hora
        FROM agendamentos a
        INNER JOIN servicos s ON a.id_servico_fk = s.id
        WHERE s.id_profissional_fk = ?
          AND DATE(a.data_hora) = ?
          AND a.status != 'cancelado'
    ";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $idProfissional, $data);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    return $result;
}
}
?>
