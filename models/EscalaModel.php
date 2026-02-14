<?php
require_once __DIR__ . '/../config/database.php';

class EscalaModel
{
    private static function normalizarHora(string $hora): string
    {
        $hora = trim($hora);
        // Garante formato HH:MM:SS
        if (strlen($hora) === 5) {
            $hora .= ':00';
        }
        if (strlen($hora) === 8 && substr($hora, -3) !== ':00') {
            $hora = substr($hora, 0, 5) . ':00';
        }
        return $hora;
    }

    public static function create(array $data): int
    {
        $conn = Database::getInstancia()->pegarConexao();

        // Validação de sobreposição
        if (
            self::temSobreposicaoNoDia(
                $data['id_profissional_fk'],
                $data['dia_semana'],
                $data['hora_inicio'],
                $data['hora_fim']
            )
        ) {
            throw new Exception("Já existe um bloco de horário sobreposto neste dia");
        }

        $sql = "INSERT INTO escalas (dia_semana, inicio, fim, id_profissional_fk) 
                VALUES (?, ?, ?, ?)";

        $inicio = self::normalizarHora($data['hora_inicio']);
        $fim = self::normalizarHora($data['hora_fim']);

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Erro ao preparar INSERT escala: " . $conn->error);
        }

        $stmt->bind_param("sssi", $data['dia_semana'], $inicio, $fim, $data['id_profissional_fk']);
        if (!$stmt->execute()) {
            throw new Exception("Erro ao criar escala: " . $stmt->error);
        }

        $idInserido = $conn->insert_id;
        $stmt->close();

        return $idInserido;
    }

    public static function update(array $data, int $id): bool
    {
        $conn = Database::getInstancia()->pegarConexao();

        // Busca os dados atuais da escala (agora com método existente)
        $atual = self::getById($id);
        if (!$atual) {
            error_log("[UPDATE ESCALA FALHA] ID $id não encontrado");
            return false;
        }

        // Usa valores enviados ou mantém os atuais (pra updates parciais)
        $diaSemana = $data['dia_semana'] ?? $atual['dia_semana'];
        $inicioNovo = $data['hora_inicio'] ?? $atual['inicio'];
        $fimNovo = $data['hora_fim'] ?? $atual['fim'];
        $idProf = $data['id_profissional_fk'] ?? $atual['id_profissional_fk'];

        // Valida se vai sobrepor outro bloco (exclui o próprio)
        if (
            self::temSobreposicaoNoDia(
                $idProf,
                $diaSemana,
                $inicioNovo,
                $fimNovo,
                $id
            )
        ) {
            throw new Exception("Horário sobreposto com outro bloco existente");
        }

        // Normaliza horas
        $inicio = self::normalizarHora($inicioNovo);
        $fim = self::normalizarHora($fimNovo);

        // SQL de update
        $sql = "UPDATE escalas 
            SET dia_semana = ?, inicio = ?, fim = ?, id_profissional_fk = ? 
            WHERE id = ?";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            error_log("[ERRO prepare UPDATE escala ID $id] " . $conn->error);
            return false;
        }

        $stmt->bind_param("sssii", $diaSemana, $inicio, $fim, $idProf, $id);

        $executou = $stmt->execute();
        if (!$executou) {
            error_log("[ERRO execute UPDATE escala ID $id] " . $stmt->error);
        }

        $stmt->close();

        return $executou;
    }

    private static function temSobreposicaoNoDia(int $idProf, string $diaSemana, string $inicioNovo, string $fimNovo, int $excluirId = 0): bool
    {
        $conn = Database::getInstancia()->pegarConexao();

        $sql = "SELECT 1 FROM escalas 
                WHERE id_profissional_fk = ? 
                  AND dia_semana = ?
                  AND id != ?
                  AND NOT (fim <= ? OR inicio >= ?)";

        $inicio = self::normalizarHora($inicioNovo);
        $fim = self::normalizarHora($fimNovo);

        $stmt = $conn->prepare($sql);
        if (!$stmt)
            return false; // ou throw

        $stmt->bind_param("iisss", $idProf, $diaSemana, $excluirId, $inicio, $fim);
        $stmt->execute();
        $tem = $stmt->get_result()->num_rows > 0;
        $stmt->close();

        return $tem;
    }

    public static function getEscalaDoProfissionalNoDia(int $idProfissional, int $diaSemana): array
    {
        $conn = Database::getInstancia()->pegarConexao();

        $sql = "SELECT inicio, fim 
                FROM escalas 
                WHERE id_profissional_fk = ? AND dia_semana = ?
                ORDER BY inicio";

        $stmt = $conn->prepare($sql);
        if (!$stmt)
            return [];

        $stmt->bind_param("ii", $idProfissional, $diaSemana);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $result; // array de ['inicio' => '09:00:00', 'fim' => '12:00:00'], etc.
    }

    public static function getById(int $id): ?array
    {
        $conn = Database::getInstancia()->pegarConexao();

        $sql = "
        SELECT 
            e.id,
            e.dia_semana,
            e.inicio,
            e.fim,
            e.id_profissional_fk,
            p.nome AS profissional_nome
        FROM escalas e
        LEFT JOIN profissionais p ON p.id = e.id_profissional_fk
        WHERE e.id = ?
    ";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            error_log("[ERRO prepare getById escala] " . $conn->error);
            return null;
        }

        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $result ?: null;
    }

    /**
     * Gera horários disponíveis para um dia específico
     * @param string $data YYYY-MM-DD
     * @param int $idServico
     * @return array ['horarios' => [...], 'disponivel' => bool, 'mensagem' => string]
     */
    public static function gerarHorariosDisponiveis(string $data, int $idServico): array
    {
        $conn = Database::getInstancia()->pegarConexao();

        // 1. Pega profissional do serviço
        $sqlServ = "SELECT id_profissional_fk FROM servicos WHERE id = ?";
        $stmt = $conn->prepare($sqlServ);
        $stmt->bind_param("i", $idServico);
        $stmt->execute();
        $serv = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$serv || $serv['id_profissional_fk'] <= 0) {
            return ['horarios' => [], 'disponivel' => false, 'mensagem' => 'Serviço sem profissional'];
        }

        $idProf = $serv['id_profissional_fk'];

        // 2. Dia da semana
        $diaNum = date('w', strtotime($data)); // 0=dom, 6=sab
        $dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        $diaSemana = $dias[$diaNum];

        // 3. Pega TODOS os blocos de escala do dia
        $escalas = self::getEscalaDoProfissionalNoDia($idProf, $diaSemana);

        if (empty($escalas)) {
            return ['horarios' => [], 'disponivel' => false, 'mensagem' => 'Sem escala neste dia'];
        }

        // 4. Gera slots de 30min em todos os blocos
        $slots = [];
        foreach ($escalas as $bloco) {
            $inicio = strtotime($data . ' ' . $bloco['inicio']);
            $fim = strtotime($data . ' ' . $bloco['fim']);

            while ($inicio < $fim) {
                $slots[] = date('H:i', $inicio);
                $inicio += 30 * 60; // 30 minutos
            }
        }

        // 5. Pega ocupados
        $ocupados = self::getHorariosOcupados($idProf, $data);

        // 6. Filtra livres
        $livres = array_filter($slots, function ($hora) use ($ocupados) {
            foreach ($ocupados as $o) {
                if (date('H:i', strtotime($o['data_hora'])) === $hora) {
                    return false;
                }
            }
            return true;
        });

        return [
            'horarios' => array_values($livres),
            'disponivel' => !empty($livres),
            'mensagem' => empty($livres) ? 'Nenhum horário disponível' : 'Horários encontrados',
            'data' => $data,
            'dia_semana' => $diaSemana
        ];
    }

    /**
     * Horários ocupados no dia (status não cancelado)
     */
    private static function getHorariosOcupados(int $idProf, string $data): array
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
        if (!$stmt)
            return [];

        $stmt->bind_param("is", $idProf, $data);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $result;
    }

    // Outros métodos (delete, getById, getAll) permanecem como estavam...
}