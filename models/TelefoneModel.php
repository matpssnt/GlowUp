<?php
require_once __DIR__ . '/../config/database.php';
class TelefoneModel
{
    public static function create($data)
    {
        global $conn;
        $sql = "INSERT INTO telefones (ddd, digitos) VALUES (?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $data['ddd'], $data['digitos']);
        $result = $stmt->execute();
        $stmt->close();

        return $result;
    }

    public static function update($id, $data)
    {
        global $conn;
        $sql = "UPDATE telefones SET ddd = ?, digitos = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssi", $data['ddd'], $data['digitos'], $id);
        $result = $stmt->execute();
        $stmt->close();

        return $result;
    }

    public static function delete($id)
    {
        global $conn;
        $sql = "DELETE FROM telefones WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $result = $stmt->execute();
        $stmt->close();

        return $result;
    }

    public static function getById($id)
    {
        global $conn;
        $sql = "SELECT * FROM telefones WHERE id = ?";
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
        $sql = "SELECT * FROM telefones";
        $result = $conn->query($sql);
        return $result->fetch_all(MYSQLI_ASSOC);
    }
}
?>
