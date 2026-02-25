<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/EscalaModel.php';

class AgendamentoModel
{
    const STATUS_AGENDADO = 'Agendado';
    const STATUS_CANCELADO = 'Cancelado';
    const STATUS_CONCLUIDO = 'Concluido';

    /**
     * Gera lista de horários disponíveis para um serviço em uma data específica
     */
    public static function gerarHorariosDisponiveis(string $data, int $idServico): array
    {
        date_default_timezone_set('America/Sao_Paulo');
        $conn = Database::getInstancia()->pegarConexao();

        // Buscar dados do serviço
        $stmt = $conn->prepare("SELECT id_profissional_fk, duracao FROM servicos WHERE id = ?");
        $stmt->bind_param("i", $idServico);
        $stmt->execute();
        $servico = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$servico) {
            return self::respostaVaziaDisponibilidade();
        }

        $idProf = (int) $servico['id_profissional_fk'];
        $duracaoMin = self::parseDuracaoMinutos($servico['duracao']);

        $diaSemana = (int) (new DateTime($data))->format('w');

        // Períodos de trabalho (escalas)
        $escalas = EscalaModel::getEscalaDoProfissionalNoDia($idProf, $diaSemana);
        $trabalho = self::mergeIntervalos(
            array_map(fn($e) => [
                self::horaParaMinutos($e['inicio']),
                self::horaParaMinutos($e['fim'])
            ], $escalas)
        );

        if (empty($trabalho)) {
            return self::respostaVaziaDisponibilidade();
        }

        // Intervalos ocupados
        $ocupados = [];

        // Agendamentos confirmados
        foreach (self::getAgendamentosConfirmadosDoDia($conn, $idProf, $data) as $agd) {
            $inicio = self::horaParaMinutos((new DateTime($agd['data_hora']))->format('H:i:s'));
            $dur = self::parseDuracaoMinutos($agd['duracao']);
            // REGRA: Bloqueia do início até o fim + 30 minutos (buffer de limpeza)
            $ocupados[] = [$inicio, $inicio + $dur + 30];
        }

        // Indisponibilidades
        foreach (self::getIndisponibilidadesDoDia($conn, $idProf, $data) as $ind) {
            $ini = self::horaParaMinutos($ind['hora_inicio']);
            $fim = $ind['hora_fim'] ? self::horaParaMinutos($ind['hora_fim']) : 1440;
            // Buffer também aplicado a indisponibilidades para consistência
            $ocupados[] = [$ini, $fim + 30];
        }

        // Horário passado (margem de 60 minutos se for hoje)
        if (self::ehHoje($data)) {
            $agoraMin = self::horaParaMinutos(date('H:i:s'));
            $ocupados[] = [0, $agoraMin + 60];
        }

        $ocupados = self::mergeIntervalos($ocupados);

        // Períodos livres
        $livres = self::subtrairIntervalos($trabalho, $ocupados);

        // Gerar slots a cada 30 minutos
        $slots = [];
        $step = 30; 

        foreach ($livres as [$iniLivre, $fimLivre]) {
            // O serviço de duração duracaoMin deve CABER dentro do [iniLivre, fimLivre]
            for ($t = $iniLivre; $t + $duracaoMin <= $fimLivre; $t += $step) {
                $slots[] = $data . ' ' . self::minutosParaHora($t) . ':00';
            }
        }

        $slots = array_unique($slots);

        // Tempo total livre
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

    private static function respostaVaziaDisponibilidade(): array
    {
        return [
            'horarios' => [],
            'quantidade' => 0,
            'tempo_livre_total' => [
                'minutos_totais' => 0,
                'horas' => 0,
                'minutos' => 0,
                'formatado' => '0min livres'
            ]
        ];
    }

    private static function parseDuracaoMinutos($duracao): int
    {
        if (!$duracao) return 30;
        if (is_numeric($duracao)) return (int) $duracao;

        // Trata formatos HH:MM:SS ou HH:MM
        $parts = explode(':', $duracao);
        $h = isset($parts[0]) ? (int)$parts[0] : 0;
        $m = isset($parts[1]) ? (int)$parts[1] : 0;
        
        return ($h * 60) + $m;
    }

    private static function horaParaMinutos(string $time): int
    {
        // Se vier DATETIME completo (ex: 2026-02-24 13:00:00), extraímos apenas HH:MM:SS
        if (strlen($time) > 8) {
            $time = substr($time, -8);
        }
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
        if (empty($intervals)) return [];
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
        if (empty($disponiveis)) return [];
        if (empty($ocupados)) return $disponiveis;

        $resultado = [];
        foreach ($disponiveis as $d) {
            $atuais = [$d];
            foreach ($ocupados as $o) {
                $proximos = [];
                foreach ($atuais as $a) {
                    [$dIni, $dFim] = $a;
                    [$oIni, $oFim] = $o;

                    if ($oIni >= $dFim || $oFim <= $dIni) {
                        $proximos[] = $a;
                    } else {
                        if ($oIni > $dIni) $proximos[] = [$dIni, $oIni];
                        if ($oFim < $dFim) $proximos[] = [$oFim, $dFim];
                    }
                }
                $atuais = $proximos;
            }
            $resultado = array_merge($resultado, $atuais);
        }
        return self::mergeIntervalos($resultado);
    }

    private static function ehHoje(string $data): bool
    {
        return $data === date('Y-m-d');
    }

    private static function getAgendamentosConfirmadosDoDia($conn, int $idProf, string $data): array
    {
        $status = self::STATUS_AGENDADO;  // ← crie uma variável!

        $stmt = $conn->prepare("
        SELECT a.data_hora, s.duracao
        FROM agendamentos a
        INNER JOIN servicos s ON a.id_servico_fk = s.id
        WHERE s.id_profissional_fk = ?
          AND DATE(a.data_hora) = ?
          AND a.status = ?
    ");
        $stmt->bind_param("iss", $idProf, $data, $status);  // ← agora $status é variável
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
              AND data = ?
        ");
        $stmt->bind_param("is", $idProf, $data);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $result;
    }

    /**
     * Cria um novo agendamento com verificação de disponibilidade
     */
    public static function create(array $data): array
    {
        $conn = Database::getInstancia()->pegarConexao();

        $dataHora = trim($data['data_hora'] ?? '');
        $idCliente = (int) ($data['id_cliente_fk'] ?? 0);
        $idServico = (int) ($data['id_servico_fk'] ?? 0);

        if (empty($dataHora) || $idCliente <= 0 || $idServico <= 0) {
            throw new Exception('Campos obrigatórios: data_hora, id_cliente_fk e id_servico_fk');
        }

        date_default_timezone_set('America/Sao_Paulo');
        $dt = DateTime::createFromFormat('Y-m-d H:i:s', $dataHora);
        if (!$dt) {
            throw new Exception('Formato de data/hora inválido. Use Y-m-d H:i:s');
        }
        if ($dt < new DateTime()) {
            throw new Exception('Não é permitido agendar para o passado');
        }

        self::validarCliente($idCliente, $conn);
        $servico = self::validarServico($idServico, $conn);
        $idProfissional = (int) ($servico['id_profissional_fk'] ?? 0);

        if ($idProfissional <= 0) {
            throw new Exception('Este serviço não está associado a nenhum profissional');
        }

        // Verificação GlowUp de disponibilidade
        $dataApenas = $dt->format('Y-m-d');
        $slotsDisponiveis = self::gerarHorariosDisponiveis($dataApenas, $idServico)['horarios'] ?? [];

        if (!in_array($dataHora, $slotsDisponiveis, true)) {
            throw new Exception('Horário indisponível (já ocupado, fora da escala ou sem tempo suficiente)');
        }

        $sql = "INSERT INTO agendamentos (data_hora, status, id_cliente_fk, id_servico_fk) 
                VALUES (?, ?, ?, ?)";

        $stmt = $conn->prepare($sql);
        $statusInicial = self::STATUS_AGENDADO;
        $stmt->bind_param("ssii", $dataHora, $statusInicial, $idCliente, $idServico);

        if (!$stmt->execute()) {
            throw new Exception('Falha ao salvar agendamento: ' . $stmt->error);
        }

        $idInserido = (int) $conn->insert_id;
        $stmt->close();

        return [
            'success' => true,
            'id' => $idInserido,
            'message' => 'Agendamento criado com sucesso',
            'data_hora' => $dataHora
        ];
    }

    /**
     * Atualiza campos de um agendamento
     */
    public static function update(int $id, array $data): bool
    {
        if (empty($data))
            return false;

        $conn = Database::getInstancia()->pegarConexao();

        $sql = "UPDATE agendamentos SET ";
        $params = [];
        $types = "";

        foreach ($data as $key => $value) {
            $sql .= "$key = ?, ";
            $params[] = $value;
            $types .= is_int($value) ? 'i' : 's';
        }

        $sql = rtrim($sql, ", ") . " WHERE id = ?";
        $params[] = $id;
        $types .= 'i';

        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $result = $stmt->execute();
        $stmt->close();

        return $result;
    }

    /**
     * Cancela um agendamento (altera status)
     */
    public static function cancelar(int $id): bool
    {
        return self::update($id, ['status' => self::STATUS_CANCELADO]);
    }

    /**
     * Marca um agendamento como concluído
     */
    public static function concluir(int $id): bool
    {
        $agendamento = self::getById($id);
        if (!$agendamento) {
            return false;
        }

        if ($agendamento['status'] === self::STATUS_CONCLUIDO) {
            return false; // já concluído
        }

        if ($agendamento['status'] === self::STATUS_CANCELADO) {
            return false; // cancelado não pode ser concluído
        }

        // Opcional: verificar se a data/hora já passou
        // $dataHora = new DateTime($agendamento['data_hora']);
        // if ($dataHora > new DateTime()) {
        //     return false; // ainda não chegou a hora (descomente se quiser bloquear)
        // }

        return self::update($id, ['status' => self::STATUS_CONCLUIDO]);
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

    public static function getAll(?int $idCliente = null, ?int $idProfissional = null): array
    {
        $conn = Database::getInstancia()->pegarConexao();

        $sql = "
            SELECT a.*, 
                   s.nome as servico_nome, 
                   s.duracao,
                   c.nome as cliente_nome, 
                   p.nome as profissional_nome
            FROM agendamentos a
            LEFT JOIN servicos s ON a.id_servico_fk = s.id
            LEFT JOIN clientes c ON a.id_cliente_fk = c.id
            LEFT JOIN profissionais p ON s.id_profissional_fk = p.id
        ";

        $types = "";
        $params = [];
        $whereClauses = [];

        if ($idCliente !== null) {
            $whereClauses[] = "a.id_cliente_fk = ?";
            $types .= "i";
            $params[] = $idCliente;
        }

        if ($idProfissional !== null) {
            $whereClauses[] = "s.id_profissional_fk = ?";
            $types .= "i";
            $params[] = $idProfissional;
        }

        if (!empty($whereClauses)) {
            $sql .= " WHERE " . implode(" AND ", $whereClauses);
        }

        $sql .= " ORDER BY a.data_hora DESC";

        $stmt = $conn->prepare($sql);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $result;
    }

    private static function validarCliente(int $id, $conn): void
    {
        $stmt = $conn->prepare("SELECT id FROM clientes WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        if (!$stmt->get_result()->fetch_assoc()) {
            throw new Exception('Cliente não encontrado');
        }
        $stmt->close();
    }

    public static function validarServico(int $id, $conn): array
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

    // Método auxiliar ainda mantido (caso esteja sendo usado em outros lugares)
    public static function getHorariosOcupados(int $idProfissional, string $data): array
    {
        $conn = Database::getInstancia()->pegarConexao();
        $stmt = $conn->prepare("
            SELECT a.data_hora
            FROM agendamentos a
            INNER JOIN servicos s ON a.id_servico_fk = s.id
            WHERE s.id_profissional_fk = ?
              AND DATE(a.data_hora) = ?
              AND a.status != ?
        ");
        $cancelado = self::STATUS_CANCELADO;
        $stmt->bind_param("iss", $idProfissional, $data, $cancelado);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $result;
    }
}