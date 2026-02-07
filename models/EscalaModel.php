<?php
require_once __DIR__ . '/../config/database.php';

class EscalaModel
{
    public static function create($data)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "
            INSERT INTO escalas (
                dia_semana,
                inicio,
                fim,
                id_profissional_fk
            ) VALUES (?, ?, ?, ?)
        ";

        $inicio = strlen($data['hora_inicio']) === 5 ? $data['hora_inicio'] . ':00' : $data['hora_inicio'];
        $fim = strlen($data['hora_fim']) === 5 ? $data['hora_fim'] . ':00' : $data['hora_fim'];

        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "issi",
            $data['dia_semana'],
            $inicio,
            $fim,
            $data['id_profissional_fk']
        );

        $result = $stmt->execute();
        $stmt->close();

        return $result;
    }

    public static function update($data, $id)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "
            UPDATE escalas
            SET
                dia_semana = ?,
                inicio = ?,
                fim = ?,
                id_profissional_fk = ?
            WHERE id = ?
        ";

        $inicio = strlen($data['hora_inicio']) === 5 ? $data['hora_inicio'] . ':00' : $data['hora_inicio'];
        $fim = strlen($data['hora_fim']) === 5 ? $data['hora_fim'] . ':00' : $data['hora_fim'];

        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "issii",
            $data['dia_semana'],
            $inicio,
            $fim,
            $data['id_profissional_fk'],
            $id
        );

        $result = $stmt->execute();
        $stmt->close();

        return $result;
    }

    public static function delete($id)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "DELETE FROM escalas WHERE id = ?";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $result = $stmt->execute();
        $stmt->close();

        return $result;
    }

    public static function getById($id)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

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

        return $result;
    }

    public static function getAll()
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

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

        return $result->fetch_all(MYSQLI_ASSOC);
    }

    // 🔥 Comunicação direta para agendamento
    public static function getEscalaDoProfissionalNoDia($idProfissional, $diaSemana)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "
            SELECT *
            FROM escalas
            WHERE id_profissional_fk = ?
              AND dia_semana = ?
        ";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $idProfissional, $diaSemana);
        $stmt->execute();

        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $result;
    }
}
