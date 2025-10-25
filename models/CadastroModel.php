<?php

require_once __DIR__ . '/../config/database.php';

class CadastroModel
{

    public static function create($data)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "INSERT INTO cadastros (nome, email, senha, isProfissional) 
        VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssi",
            $data["nome"],
            $data["email"],
            $data["senha"],
            $data["isProfissional"]
        ); 
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    public static function delete($id)
    {   
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "DELETE FROM cadastros WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id); 
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    public static function update($id, $data)
    {   
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "UPDATE cadastros SET nome = ?, email = ?, senha = ?, isProfissional = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssii", 
            $data["nome"],
            $data["email"],
            $data["senha"],
            $data["isProfissional"],
            $id
        );
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    public static function getById($id)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "SELECT * FROM cadastros WHERE id = ?";
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
        $sql = "SELECT * FROM cadastros";
        $result = $conn->query($sql);
        return $result->fetch_all(MYSQLI_ASSOC);
    }

}

?>