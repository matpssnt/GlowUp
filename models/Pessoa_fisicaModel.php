<?php
require_once __DIR__ . '/../config/database.php';
class Pessoa_FisicaModel
{
    public static function create($data)
    {
        global $conn;
        $sql = "INSERT INTO fisicos (cpf, id_profissional_fk) VALUES (?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $data['cpf'], $data['id_profissional_fk']);
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    public static function update($id, $data)
    {
        global $conn;
        $sql = "UPDATE fisicos SET cpf = ?, id_profissional = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sii", $data['cpf'], $data['id_profissional'], $id);
        $result = $stmt->execute();
        $stmt->close();

        return $result;
    }

    public static function delete($id)
    {
        global $conn;
        $sql = "DELETE FROM fisicos WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $result = $stmt->execute();
        $stmt->close();

        return $result;
    }

    public static function getById($id)
    {
        global $conn;
        $sql = "SELECT * FROM fisicos WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $result;
    }

    public static function getAll()
    {
        global $conn;
        $sql = "SELECT * FROM fisicos";
        $result = $conn->query($sql);
        return $result->fetch_all(MYSQLI_ASSOC);
    }
}
?>
