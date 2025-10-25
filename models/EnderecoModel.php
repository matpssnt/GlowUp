<?php
require_once __DIR__ . '/../config/database.php';

class EnderecoModel
{
    public static function create($data){
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "INSERT INTO enderecos (rua, numero, cep, bairro, cidade, estado, complemento, id_profissional_fk) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "sssssssi",
            $data['rua'],
            $data['numero'],
            $data['cep'],
            $data['bairro'],
            $data['cidade'],
            $data['estado'],
            $data['complemento'],
            $data['id_profissional_fk']
        );

        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    public static function update($id, $data)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "UPDATE enderecos 
                SET rua = ?, numero = ?, cep = ?, bairro = ?, cidade = ?, estado = ?, complemento = ?, id_profissional_fk = ?
                WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "sssssssii",
            $data['rua'],
            $data['numero'],
            $data['cep'],
            $data['bairro'],
            $data['cidade'],
            $data['estado'],
            $data['complemento'],
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
        $sql = "DELETE FROM enderecos WHERE id = ?";
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
        $sql = "SELECT * FROM enderecos WHERE id = ?";
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
        $sql = "SELECT * FROM enderecos";
        $result = $conn->query($sql);
        return $result->fetch_all(MYSQLI_ASSOC);
    }
}
?>
