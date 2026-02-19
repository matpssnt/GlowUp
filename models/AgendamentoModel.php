<?php

require_once __DIR__ . '/../config/database.php';

class AgendamentoModel
{
    public const STATUS_AGENDADO  = 'Agendado';
    public const STATUS_CANCELADO = 'Cancelado';

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

        // Busca serviço
        $stmt = $conn->prepare("SELECT id_profissional_fk, duracao FROM servicos WHERE id = ?");
        $stmt->bind_param("i", $idServico);
        $stmt->execute();
        $servico = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$servico) {
            return [];
        }

        $idProf = (int)$servico['id_profissional_fk'];
        $duracaoMin = self::getDuracaoEmMinutos($servico['duracao']);

        // Busca escalas do dia
        $diaSemana = (int)(new DateTime($data))->format('w');
        $escalas = EscalaModel::getEscalaDoProfissionalNoDia($idProf, $diaSemana);

        if (empty($escalas)) {
            return [];
        }

        $intervalosOcupados = [];

        // Agendamentos
        foreach (self::carregarAgendamentosDoDia($conn, $idProf, $data) as $agd) {
            $inicioMin = self::hmsToMinutes((new DateTime($agd['data_hora']))->format('H:i:s'));
            $duracao   = self::getDuracaoEmMinutos($agd['duracao']);
            $intervalosOcupados[] = ['inicio' => $inicioMin, 'fim' => $inicioMin + $duracao];
        }

        // Indisponibilidades
        foreach (self::carregarIndisponibilidadesDoDia($conn, $idProf, $data) as $ind) {
            $inicio = self::hmsToMinutes($ind['hora_inicio']);
            $fim    = $ind['hora_fim'] ? self::hmsToMinutes($ind['hora_fim']) : 1440;
            $intervalosOcupados[] = ['inicio' => $inicio, 'fim' => $fim];
        }

        // Horários passados (hoje)
        $hoje = new DateTime();
        if ($data === $hoje->format('Y-m-d')) {
            $agoraMin = self::hmsToMinutes($hoje->format('H:i:s'));
            $intervalosOcupados[] = ['inicio' => 0, 'fim' => $agoraMin + 30];
        }

        // Ordena e unifica intervalos
        usort($intervalosOcupados, fn($a, $b) => $a['inicio'] <=> $b['inicio']);
        $ocupadosUnificados = self::unificarIntervalos($intervalosOcupados);

        // Gera slots
        $disponiveis = [];
        $step = 10;

        foreach ($escalas as $escala) {
            $inicioEsc = self::hmsToMinutes((new DateTime($escala['inicio']))->format('H:i:s'));
            $fimEsc    = self::hmsToMinutes((new DateTime($escala['fim']))->format('H:i:s'));

            for ($t = $inicioEsc; $t < $fimEsc; $t += $step) {
                $slotFim = $t + $duracaoMin;
                if ($slotFim > $fimEsc) {
                    continue;
                }

                $livre = true;
                foreach ($ocupadosUnificados as $oc) {
                    if ($t < $oc['fim'] && $slotFim > $oc['inicio']) {
                        $livre = false;
                        break;
                    }
                }

                if ($livre) {
                    $disponiveis[] = $data . ' ' . self::minutesToHms($t);
                }
            }
        }

        return array_unique($disponiveis);
    }

    /**
     * Atualiza um agendamento
     */
    public static function update(int $id, array $data): bool
    {
        if (empty($data)) {
            return false;
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

    private static function carregarAgendamentosDoDia(mysqli $conn, int $idProf, string $data): array
    {
        $sql = "
            SELECT a.data_hora, s.duracao 
            FROM agendamentos a 
            JOIN servicos s ON a.id_servico_fk = s.id 
            WHERE s.id_profissional_fk = ? 
              AND DATE(a.data_hora) = ? 
              AND a.status = ?
        ";

        $stmt = $conn->prepare($sql);
        $statusAgendado = self::STATUS_AGENDADO;
        $stmt->bind_param("iss", $idProf, $data, $statusAgendado);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $result;
    }

    private static function carregarIndisponibilidadesDoDia(mysqli $conn, int $idProf, string $data): array
    {
        $stmt = $conn->prepare("
            SELECT hora_inicio, hora_fim 
            FROM indisponibilidades 
            WHERE id_profissional_fk = ? AND data = ?
        ");
        $stmt->bind_param("is", $idProf, $data);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $result;
    }

    private static function getDuracaoEmMinutos($duracao): int
    {
        if (empty($duracao)) return 30;
        if (is_numeric($duracao)) return (int)$duracao;

        $parts = explode(':', (string)$duracao);
        $h = (int)($parts[0] ?? 0);
        $m = (int)($parts[1] ?? 0);

        return $h * 60 + $m;
    }

    private static function hmsToMinutes(string $hms): int
    {
        $parts = explode(':', $hms);
        return ((int)($parts[0] ?? 0) * 60) + (int)($parts[1] ?? 0);
    }

    private static function minutesToHms(int $minutes): string
    {
        $h = floor($minutes / 60);
        $m = $minutes % 60;
        return sprintf('%02d:%02d:00', $h, $m);
    }

        /**
     * Retorna todos os agendamentos com filtros opcionais
     *
     * @param int|null $idCliente   Filtrar apenas agendamentos de um cliente específico
     * @param string|null $status   Filtrar por status ('Agendado', 'Cancelado', 'Concluido')
     * @param int $limit            Quantidade máxima de registros (padrão 50)
     * @param int $offset           Registro inicial para paginação (padrão 0)
     * @return array Lista de agendamentos com dados relacionados
     */
    public static function getAll(?int $idCliente = null, ?string $status = null, int $limit = 50, int $offset = 0): array
    {
        $conn = Database::getInstancia()->pegarConexao();

        $sql = "
            SELECT 
                a.id,
                a.data_hora,
                a.status,
                a.id_cliente_fk,
                a.id_servico_fk,
                c.nome          AS nome_cliente,
                s.nome          AS nome_servico,
                s.duracao       AS duracao_servico,
                p.nome          AS nome_profissional,
                p.id            AS id_profissional
            FROM agendamentos a
            LEFT JOIN clientes c ON a.id_cliente_fk = c.id
            LEFT JOIN servicos s ON a.id_servico_fk = s.id
            LEFT JOIN profissionais p ON s.id_profissional_fk = p.id
            WHERE 1=1
        ";

        $params = [];
        $types  = "";

        // Filtro por cliente
        if ($idCliente !== null) {
            $sql .= " AND a.id_cliente_fk = ?";
            $params[] = $idCliente;
            $types .= "i";
        }

        // Filtro por status
        if ($status !== null && in_array($status, ['Agendado', 'Cancelado', 'Concluido'])) {
            $sql .= " AND a.status = ?";
            $params[] = $status;
            $types .= "s";
        }

        // Ordenação + paginação
        $sql .= " ORDER BY a.data_hora DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        $types   .= "ii";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            error_log("[ERRO prepare getAll Agendamentos] " . $conn->error);
            return [];
        }

        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $result;
    }

    private static function unificarIntervalos(array $intervalos): array
    {
        if (empty($intervalos)) return [];

        usort($intervalos, fn($a, $b) => $a['inicio'] <=> $b['inicio']);

        $unificados = [];
        $atual = $intervalos[0];

        foreach ($intervalos as $prox) {
            if ($prox['inicio'] <= $atual['fim']) {
                $atual['fim'] = max($atual['fim'], $prox['fim']);
            } else {
                $unificados[] = $atual;
                $atual = $prox;
            }
        }

        $unificados[] = $atual;
        return $unificados;
    }

}