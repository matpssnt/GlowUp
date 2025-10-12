<?php
require_once __DIR__ . '/../config/database.php';
class CategoriaModel
{
    public static function create($data)
    {
        global $conn;

        $sql = "INSERT INTO categorias (nome) VALUES (?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $data['nome']); 
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    public static function delete($id)
    {   
        global $conn;
        $sql = "DELETE FROM categorias WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id); 
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    public static function update($id, $data)
    {   
        global $conn;
        $sql = "UPDATE categorias SET nome = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $data['nome'], $id);
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    public static function getById($id)
    {
        global $conn;
        $sql = "SELECT * FROM categorias WHERE id = ?";
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
        $sql = "SELECT * FROM categorias";
        $result = $conn->query($sql);
        return $result->fetch_all(MYSQLI_ASSOC);
    }
}
?>
