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
                hora_inicio,
                hora_fim,
                id_profissional_fk,
                ativo
            ) VALUES (?, ?, ?, ?, 1)
        ";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "issi",
            $data['dia_semana'],
            $data['hora_inicio'],
            $data['hora_fim'],
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
                hora_inicio = ?,
                hora_fim = ?,
                id_profissional_fk = ?,
                ativo = ?
            WHERE id = ?
        ";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "issiii",
            $data['dia_semana'],
            $data['hora_inicio'],
            $data['hora_fim'],
            $data['id_profissional_fk'],
            $data['ativo'],
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

        // Soft delete (recomendado)
        $sql = "UPDATE escalas SET ativo = 0 WHERE id = ?";

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
                e.hora_inicio,
                e.hora_fim,
                e.ativo,
                p.id AS profissional_id,
                p.nome AS profissional_nome
            FROM escalas e
            JOIN profissionais p ON p.id = e.id_profissional_fk
            WHERE e.ativo = 1
            ORDER BY p.nome, e.dia_semana, e.hora_inicio
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
              AND ativo = 1
        ";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $idProfissional, $diaSemana);
        $stmt->execute();

        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $result;
    }
}
