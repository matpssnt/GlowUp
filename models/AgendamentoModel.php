<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/EscalaModel.php';

class AgendamentoModel
{
    const STATUS_AGENDADO = 'Agendado';
    const STATUS_CANCELADO = 'Cancelado';

    /**
     * Gera lista de horários disponíveis considerando intervalos e duração variável
     */

    public static function gerarHorariosDisponiveis(string $data, int $idServico): array
    {
        $conn = Database::getInstancia()->pegarConexao();

        // 1. Dados do serviço
        $stmt = $conn->prepare("SELECT s.id_profissional_fk, s.duracao FROM servicos s WHERE s.id = ?");
        $stmt->bind_param("i", $idServico);
        $stmt->execute();
        $servico = $stmt->get_result()->fetch_assoc() ?: null;
        $stmt->close();

        if (!$servico) {
            return ['horarios' => [], 'quantidade' => 0, 'tempo_livre_total' => ['minutos_totais' => 0, 'horas' => 0, 'minutos' => 0, 'formatado' => '0min livres']];
        }

        $idProf = (int) $servico['id_profissional_fk'];
        $duracaoMin = self::parseDuracaoMinutos($servico['duracao']);

        // 2. Dia da semana
        $diaSemana = (int) (new DateTime($data))->format('w');

        // 3. Períodos de trabalho (escalas)
        $escalas = EscalaModel::getEscalaDoProfissionalNoDia($idProf, $diaSemana);
        $trabalho = self::mergeIntervalos(array_map(fn($e) => [
            self::horaParaMinutos($e['inicio']),
            self::horaParaMinutos($e['fim'])
        ], $escalas));

        if (empty($trabalho)) {
            return ['horarios' => [], 'quantidade' => 0, 'tempo_livre_total' => ['minutos_totais' => 0, 'horas' => 0, 'minutos' => 0, 'formatado' => '0min livres']];
        }

        // 4. Intervalos ocupados
        $ocupados = [];

        // Agendamentos confirmados
        $agendamentos = self::getAgendamentosConfirmadosDoDia($conn, $idProf, $data);
        foreach ($agendamentos as $agd) {
            $inicio = self::horaParaMinutos((new DateTime($agd['data_hora']))->format('H:i:s'));
            $dur = self::parseDuracaoMinutos($agd['duracao']);
            $ocupados[] = [$inicio, $inicio + $dur];
        }

        // Indisponibilidades
        $indisponiveis = self::getIndisponibilidadesDoDia($conn, $idProf, $data);
        foreach ($indisponiveis as $ind) {
            $ini = self::horaParaMinutos($ind['hora_inicio']);
            $fim = $ind['hora_fim'] ? self::horaParaMinutos($ind['hora_fim']) : 1440;
            $ocupados[] = [$ini, $fim];
        }

        // Horário passado (hoje + margem 30 min)
        if (self::ehHoje($data)) {
            $agoraMin = self::horaParaMinutos(date('H:i:s'));
            $ocupados[] = [0, $agoraMin + 60];
        }

        $ocupados = self::mergeIntervalos($ocupados);

        // 5. Períodos livres
        $livres = self::subtrairIntervalos($trabalho, $ocupados);

        // 6. Gera slots
        $slots = [];
        $step = 30;

        foreach ($livres as [$iniLivre, $fimLivre]) {
            for ($t = $iniLivre; $t + $duracaoMin <= $fimLivre; $t += $step) {
                $slots[] = $data . ' ' . self::minutosParaHora($t) . ':00';
            }
        }
        $slots = array_unique($slots);

        // 7. Calcula tempo livre total restante (Glow Up principal!)
        $totalMinLivres = 0;
        foreach ($livres as [$ini, $fim]) {
            $totalMinLivres += ($fim - $ini);
        }

        $horas = floor($totalMinLivres / 60);
        $minutos = $totalMinLivres % 60;

        return [
            'horarios' => $slots,
            'quantidade' => count($slots),
            'tempo_livre_total' => [
                'minutos_totais' => $totalMinLivres,
                'horas' => $horas,
                'minutos' => $minutos,
                'formatado' => $horas > 0 ? "{$horas}h {$minutos}min livres" : "{$minutos}min livres"
            ]
        ];
    }


    private static function parseDuracaoMinutos($duracao): int
    {
        if (!$duracao)
            return 30;
        if (is_numeric($duracao))
            return (int) $duracao;

        $parts = explode(':', $duracao . ':00');
        return ((int) $parts[0] * 60) + (int) $parts[1];
    }

    private static function horaParaMinutos(string $time): int
    {
        [$h, $m] = explode(':', $time);
        return ((int) $h * 60) + (int) $m;
    }

    private static function minutosParaHora(int $minutes): string
    {
        $h = intdiv($minutes, 60);
        $m = $minutes % 60;
        return sprintf('%02d:%02d', $h, $m);
    }

    private static function mergeIntervalos(array $intervals): array
    {
        if (empty($intervals))
            return [];
        usort($intervals, fn($a, $b) => $a[0] <=> $b[0]);

        $merged = [$intervals[0]];
        foreach (array_slice($intervals, 1) as $current) {
            $last = &$merged[count($merged) - 1];
            if ($current[0] <= $last[1]) {
                $last[1] = max($last[1], $current[1]);
            } else {
                $merged[] = $current;
            }
        }
        return $merged;
    }

    private static function subtrairIntervalos(array $disponiveis, array $ocupados): array
    {
        $resultado = [];
        foreach ($disponiveis as [$iniDisp, $fimDisp]) {
            $cursor = $iniDisp;
            foreach ($ocupados as [$iniOcup, $fimOcup]) {
                if ($fimOcup <= $cursor)
                    continue;
                if ($iniOcup >= $fimDisp)
                    break;

                if ($cursor < $iniOcup) {
                    $resultado[] = [$cursor, $iniOcup];
                }
                $cursor = max($cursor, $fimOcup);
            }
            if ($cursor < $fimDisp) {
                $resultado[] = [$cursor, $fimDisp];
            }
        }
        return $resultado;
    }

    private static function ehHoje(string $data): bool
    {
        return $data === date('Y-m-d');
    }

    private static function getAgendamentosConfirmadosDoDia($conn, int $idProf, string $data): array
    {
        $stmt = $conn->prepare("
            SELECT a.data_hora, s.duracao
            FROM agendamentos a
            INNER JOIN servicos s ON a.id_servico_fk = s.id
            WHERE s.id_profissional_fk = ?
              AND DATE(a.data_hora) = ?
              AND a.status = 'Agendado'
        ");
        $stmt->bind_param("is", $idProf, $data);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $result;
    }

    private static function getIndisponibilidadesDoDia($conn, int $idProf, string $data): array
    {
        $stmt = $conn->prepare("
            SELECT hora_inicio, hora_fim
            FROM indisponibilidades
            WHERE id_profissional_fk = ?
              AND DATE(hora_inicio) = ?
        ");
        $stmt->bind_param("is", $idProf, $data);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $result;
    }



    // Helpers de Tempo (Minutos)
    private static function getDuracaoEmMinutos($duracao): int
    {
        if (empty($duracao))
            return 30; // Fallback
        if (is_numeric($duracao))
            return (int) $duracao; // Já está em minutos? (comum em alguns sistemas)

        $parts = explode(':', $duracao);
        $h = (int) ($parts[0] ?? 0);
        $m = (int) ($parts[1] ?? 0);
        return ($h * 60) + $m;
    }

    private static function hmsToMinutes(string $hms): int
    {
        $parts = explode(':', $hms);
        return ((int) ($parts[0] ?? 0) * 60) + (int) ($parts[1] ?? 0);
    }

    private static function minutesToHms(int $minutes): string
    {
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
    /**
     * Cria um novo agendamento com verificação real de disponibilidade
     * @param array $data ['data_hora', 'id_cliente_fk', 'id_servico_fk']
     * @return array ['success' => bool, 'id' => int, 'message' => string]
     * @throws Exception em caso de erro de validação ou indisponibilidade
     */
    public static function create($data)
    {
        $conn = Database::getInstancia()->pegarConexao();

        // Extrai e valida campos obrigatórios
        $dataHora = trim($data['data_hora'] ?? '');
        $idCliente = (int) ($data['id_cliente_fk'] ?? 0);
        $idServico = (int) ($data['id_servico_fk'] ?? 0);

        if (empty($dataHora) || $idCliente <= 0 || $idServico <= 0) {
            throw new Exception('Campos obrigatórios: data_hora, id_cliente_fk e id_servico_fk');
        }

        // Validação de formato e data futura
        date_default_timezone_set('America/Sao_Paulo');
        $dt = DateTime::createFromFormat('Y-m-d H:i:s', $dataHora);
        if (!$dt) {
            throw new Exception('Formato de data/hora inválido. Use Y-m-d H:i:s');
        }
        if ($dt < new DateTime()) {
            throw new Exception('Não é permitido agendar para o passado');
        }

        // Validações de existência
        self::validarCliente($idCliente, $conn);

        $servico = self::validarServico($idServico, $conn);
        $idProfissional = (int) ($servico['id_profissional_fk'] ?? 0);

        if ($idProfissional <= 0) {
            throw new Exception('Este serviço não está associado a nenhum profissional');
        }

        // CHECAGEM REAL DE DISPONIBILIDADE (Glow Up principal)
        $dataApenas = $dt->format('Y-m-d');
        $slotsDisponiveis = self::gerarHorariosDisponiveis($dataApenas, $idServico);

        if (!in_array($dataHora, $slotsDisponiveis, true)) {
            throw new Exception(
                'Horário indisponível no momento atual do sistema ' .
                '(já ocupado, fora da escala, sem tempo suficiente ou passou o prazo de segurança)'
            );
        }

        // Tudo ok → prossegue com o INSERT
        $sql = "INSERT INTO agendamentos 
            (data_hora, status, id_cliente_fk, id_servico_fk) 
            VALUES (?, ?, ?, ?)";

        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            error_log("[ERRO prepare INSERT agendamento] " . $conn->error);
            throw new Exception('Erro interno ao preparar agendamento');
        }

        $statusInicial = self::STATUS_AGENDADO;
        $stmt->bind_param("ssii", $dataHora, $statusInicial, $idCliente, $idServico);

        if (!$stmt->execute()) {
            $erro = $stmt->error;
            $stmt->close();
            error_log("[ERRO execute INSERT agendamento] " . $erro);
            throw new Exception('Falha ao salvar agendamento: ' . $erro);
        }

        $idInserido = (int) $conn->insert_id;
        $stmt->close();

        error_log("[SUCESSO] Agendamento ID $idInserido criado | Cliente $idCliente | Serviço $idServico | $dataHora");

        return [
            'success' => true,
            'id' => $idInserido,
            'message' => 'Agendamento criado com sucesso',
            'data_hora' => $dataHora
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
     * Valida se cliente existe
     * @throws Exception se não
     */
    private static function validarCliente($id, $conn)
    {
        // Valida se o ID existe na tabela de clientes (necessário pois a FK em agendamentos referencia clientes)
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