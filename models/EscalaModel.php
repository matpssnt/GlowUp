<?php
require_once __DIR__ . '/../config/database.php';

class EscalaModel
{
    private static function normalizarHora(string $hora): string
    {
        $hora = trim($hora);
        return strlen($hora) === 5 ? $hora . ':00' : $hora;
    }

    public static function create(array $data): bool
    {
        $conn = Database::getInstancia()->pegarConexao();

        // Validação extra de sobreposição (simples)
        if (self::temSobreposicaoNoDia(
            $data['id_profissional_fk'],
            $data['dia_semana'],
            $data['hora_inicio'],
            $data['hora_fim']
        )) {
            throw new Exception("Já existe um bloco de horário sobreposto neste dia");
        }

        $sql = "INSERT INTO escalas (dia_semana, inicio, fim, id_profissional_fk) 
                VALUES (?, ?, ?, ?)";

        $inicio = self::normalizarHora($data['hora_inicio']);
        $fim    = self::normalizarHora($data['hora_fim']);

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("issi", $data['dia_semana'], $inicio, $fim, $data['id_profissional_fk']);
        $result = $stmt->execute();
        $stmt->close();

        return $result;
    }

    public static function update(array $data, int $id): bool
    {
        $conn = Database::getInstancia()->pegarConexao();

        // Busca dados atuais para validar
        $atual = self::getById($id);
        if (!$atual) return false;

        if (self::temSobreposicaoNoDia(
            $data['id_profissional_fk'],
            $data['dia_semana'],
            $data['hora_inicio'],
            $data['hora_fim'],
            $id // exclui o próprio registro
        )) {
            throw new Exception("Horário sobreposto com outro bloco");
        }

        $sql = "UPDATE escalas SET dia_semana = ?, inicio = ?, fim = ?, id_profissional_fk = ? 
                WHERE id = ?";

        $inicio = self::normalizarHora($data['hora_inicio']);
        $fim    = self::normalizarHora($data['hora_fim']);

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("issii", $data['dia_semana'], $inicio, $fim, $data['id_profissional_fk'], $id);
        $result = $stmt->execute();
        $stmt->close();

        return $result;
    }

    private static function temSobreposicaoNoDia(int $idProf, int $diaSemana, string $inicioNovo, string $fimNovo, int $excluirId = 0): bool
    {
        $conn = Database::getInstancia()->pegarConexao();

        $sql = "SELECT 1 FROM escalas 
                WHERE id_profissional_fk = ? 
                  AND dia_semana = ?
                  AND id != ?
                  AND NOT (fim <= ? OR inicio >= ?)";

        $inicio = self::normalizarHora($inicioNovo);
        $fim    = self::normalizarHora($fimNovo);

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iiiss", $idProf, $diaSemana, $excluirId, $inicio, $fim);
        $stmt->execute();
        $tem = $stmt->get_result()->num_rows > 0;
        $stmt->close();

        return $tem;
    }

    // getEscalaDoProfissionalNoDia → agora retorna TODOS os blocos do dia
    public static function getEscalaDoProfissionalNoDia(int $idProfissional, int $diaSemana): array
    {
        $conn = Database::getInstancia()->pegarConexao();

        $sql = "SELECT inicio, fim 
                FROM escalas 
                WHERE id_profissional_fk = ? AND dia_semana = ?
                ORDER BY inicio";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $idProfissional, $diaSemana);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $result; // array de blocos
    }

    public static function delete(int $id): bool
    {
        $conn = Database::getInstancia()->pegarConexao();

        $sql = "DELETE FROM escalas WHERE id = ?";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $result = $stmt->execute();
        $stmt->close();

        return $result;
    }

    public static function getById(int $id): ?array
    {
        $conn = Database::getInstancia()->pegarConexao();

        $sql = "
            SELECT 
                e.*,
                p.nome AS profissional_nome
            FROM escalas e
            JOIN profissionais p ON p.id = e.id_profissional_fk
            WHERE e.id = ?
        ";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $result ?: null;
    }

    public static function getAll(): array
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
            JOIN profissionais p ON p.id = e.id_profissional_fk
            ORDER BY p.nome, e.dia_semana, e.inicio
        ";

        $result = $conn->query($sql);
        return $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
    }
}