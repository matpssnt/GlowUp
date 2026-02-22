<?php
require_once __DIR__ . '/../config/database.php';

class EscalaModel
{
    private static function normalizarHora(string $hora): string
    {
        $hora = trim($hora);
        if (strlen($hora) === 5)
            $hora .= ':00';
        if (strlen($hora) === 8 && substr($hora, -3) !== ':00') {
            $hora = substr($hora, 0, 5) . ':00';
        }
        return $hora;
    }

    public static function create(array $data): int
    {
        $conn = Database::getInstancia()->pegarConexao();

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
        $stmt->bind_param("sssi", $data['dia_semana'], $inicio, $fim, $data['id_profissional_fk']);
        $stmt->execute();

        $id = $conn->insert_id;
        $stmt->close();

        return $id;
    }

    public static function update(array $data, int $id): bool
    {
        $conn = Database::getInstancia()->pegarConexao();

        $atual = self::getById($id);
        if (!$atual)
            return false;

        $diaSemana = $data['dia_semana'] ?? $atual['dia_semana'];
        $inicio = self::normalizarHora($data['hora_inicio'] ?? $atual['inicio']);
        $fim = self::normalizarHora($data['hora_fim'] ?? $atual['fim']);
        $idProf = $data['id_profissional_fk'] ?? $atual['id_profissional_fk'];

        if (self::temSobreposicaoNoDia($idProf, $diaSemana, $inicio, $fim, $id)) {
            throw new Exception("Horário sobreposto com outro bloco existente");
        }

        $sql = "UPDATE escalas 
                SET dia_semana = ?, inicio = ?, fim = ?, id_profissional_fk = ? 
                WHERE id = ?";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssii", $diaSemana, $inicio, $fim, $idProf, $id);
        $ok = $stmt->execute();
        $stmt->close();

        return $ok;
    }

    private static function temSobreposicaoNoDia(int $idProf, string $dia, string $ini, string $fim, int $excluirId = 0): bool
    {
        $conn = Database::getInstancia()->pegarConexao();

        $sql = "SELECT 1 FROM escalas 
                WHERE id_profissional_fk = ? 
                  AND dia_semana = ?
                  AND id != ?
                  AND NOT (fim <= ? OR inicio >= ?)";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iisss", $idProf, $dia, $excluirId, $ini, $fim);
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
                WHERE id_profissional_fk = ? 
                  AND dia_semana = ?
                ORDER BY inicio";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $idProfissional, $diaSemana);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $result;
    }

    public static function getById(int $id): ?array
    {
        $conn = Database::getInstancia()->pegarConexao();

        $sql = "SELECT e.*, p.nome AS profissional_nome 
                FROM escalas e
                LEFT JOIN profissionais p ON p.id = e.id_profissional_fk
                WHERE e.id = ?";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $result ?: null;
    }
}