<?php
require_once __DIR__ . '/../config/database.php';

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

        // 2. Valida formato e data futura
        date_default_timezone_set('America/Sao_Paulo');
        if (!DateTime::createFromFormat('Y-m-d H:i:s', $dataHora)) {
            throw new Exception('Formato de data/hora inválido (use Y-m-d H:i:s)');
        }
        if (strtotime($dataHora) < time()) {
            throw new Exception('Não é permitido agendar para o passado');
        }

        // 3. Valida cliente
        self::validarCliente($idCliente, $conn);

        // 4. Valida serviço e pega o id_profissional_fk (só pra checar conflitos)
        $servico = self::validarServico($idServico, $conn);
        $idProfissional = (int) ($servico['id_profissional_fk'] ?? 0);

        if ($idProfissional <= 0) {
            throw new Exception('Este serviço não está associado a nenhum profissional');
        }

        // 5. Checa conflitos usando o profissional do serviço
        $conflitos = self::checagemConflitos($idProfissional, $dataHora, $conn);
        if ($conflitos > 0) {
            throw new Exception('Horário indisponível: profissional já tem agendamento próximo');
        }

        // 6. INSERT (sem id_profissional_fk na tabela!)
        $sql = "INSERT INTO agendamentos 
            (data_hora, status, id_cliente_fk, id_servico_fk) 
            VALUES (?, ?, ?, ?)";

        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            error_log("[ERRO prepare INSERT] " . $conn->error);
            throw new Exception('Erro interno ao preparar agendamento');
        }

        $statusInicial = self::STATUS_AGENDADO;
        $stmt->bind_param("ssii", $dataHora, $statusInicial, $idCliente, $idServico);

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
            'id' => $idInserido,
            'message' => 'Agendamento criado com sucesso'
        ];
    }
    /**
     * Atualiza agendamento (ex: status, data)
     * @param int $id
     * @param array $data
     * @return bool
     */
    public static function update($id, $data)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        if (empty($data)) {
            return false;
        }

        $sql = "UPDATE agendamentos SET ";
        $params = [];
        $types = "";

        foreach ($data as $key => $value) {
            $sql .= "$key = ?, ";
            $params[] = $value;
            $types .= "s";
        }
        $sql = rtrim($sql, ", ") . " WHERE id = ?";
        $params[] = $id;
        $types .= "i";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);

        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    /**
     * Cancela agendamento (soft-delete: atualiza status)
     * @param int $id
     * @return bool
     */
    public static function cancelar($id)
    {
        $data = ['status' => strtolower(self::STATUS_CANCELADO)];
        $sucesso = self::update($id, $data);
        if ($sucesso) {
            error_log("[CANCEL OK] ID $id -> status = 'cancelado'");
        } else {
            error_log("[CANCEL FALHA] ID $id não mudou");
        }
        return self::update($id, $data);
    }

    /**
     * Busca por ID
     * @param int $id
     * @return array|false
     */
    public static function getById($id)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "SELECT * FROM agendamentos WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return $result ?: false;
    }

    /**
     * Busca todos (com filtro opcional por cliente para privacidade)
     * @param int|null $idCliente
     * @return array
     */
    public static function getAll($idCliente = null)
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

    /**
     * Valida se cliente existe
     * @throws Exception se não
     */
    private static function validarCliente($id, $conn)
    {
        $sql = "SELECT id FROM clientes WHERE id = ?";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            error_log("[ERRO prepare validarCliente] SQL: $sql | MySQL Error: " . $conn->error);
            throw new Exception('Erro interno ao validar cliente: ' . $conn->error);
        }
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$result) {
            throw new Exception('Cliente não encontrado');
        }
        return $result;
    }

    /**
     * Valida se serviço existe e retorna dados (inclui prof)
     * @throws Exception se não
     */
    public static function validarServico($id, $conn)
    {
        $sql = "SELECT * FROM servicos WHERE id = ?";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            error_log("[ERRO prepare validarServico] SQL: $sql | MySQL Error: " . $conn->error);
            throw new Exception('Erro interno ao validar serviço: ' . $conn->error);
        }
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$result) {
            throw new Exception('Serviço não encontrado');
        }
        return $result;
    }
    /**
     * Checa conflitos de horário (janela de 1h) usando JOIN com servicos
     * @return int COUNT de conflitos
     */
    private static function checagemConflitos($idProfissional, $dataHoraCompleta, $conn)
    {
        $dia = date('Y-m-d', strtotime($dataHoraCompleta));
        $inicio = date('Y-m-d H:i:s', strtotime($dataHoraCompleta . ' -30 minutes'));
        $fim = date('Y-m-d H:i:s', strtotime($dataHoraCompleta . ' +30 minutes'));

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
        if ($stmt === false) {
            throw new Exception('Erro ao preparar checagem: ' . $conn->error);
        }

        $cancelado = self::STATUS_CANCELADO;  // 'cancelado' ou 'Cancelado' conforme seu ENUM
        $stmt->bind_param("issss", $idProfissional, $dia, $inicio, $fim, $cancelado);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        $count = (int) $row['count'];
        error_log("[CONFLITOS] Prof $idProfissional | Dia $dia | Count: $count");

        return $count;
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